package com.plandecks.planner.engine;

import com.google.ortools.sat.*;
import com.google.ortools.util.Domain;
import com.plandecks.planner.model.request.*;
import com.plandecks.planner.model.response.*;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Component
public class OptimizationEngine {

    private record LessonVar(int id, StudentGroup group, Course course, IntVar startVar, IntVar teacherVar, IntVar roomVar) {}
    private record ScheduleItem(String group, String course, String teacher, String room, int dayIndex, int hour) {}

    static final int SLOTS_PER_DAY = 24;
    static final int DAYS_PER_WEEK = 7;
    static final int TOTAL_SLOTS = DAYS_PER_WEEK * SLOTS_PER_DAY; // 168 Slot

    public ScheduleResponse optimize(OptimizationRequest request) {
        long startTime = System.currentTimeMillis();

        // --- 0. DOĞRULAMA ADIMI (VALIDATION) ---
        // Çözücüye girmeden önce matematiksel imkansızlıkları kontrol et
        List<String> validationErrors = validateRequest(request);

        if (!validationErrors.isEmpty()) {
            return new ScheduleResponse("INFEASIBLE", 0, new ArrayList<>(), validationErrors);
        }

        CpModel model = new CpModel();

        List<StudentGroup> groups = request.groups();
        List<Teacher> teachers = request.teachers();
        List<Room> rooms = request.rooms();

        // --- 1. GLOBAL MÜSAİTLİK ALANI (DOMAIN) ---
        List<Long> allowedSlots = new ArrayList<>();
        boolean[][] globalMatrix = request.globalAvailability();

        if (globalMatrix == null) {
            // Matris yoksa her yer açık
            for (int d = 0; d < DAYS_PER_WEEK; d++) for (int h = 0; h < SLOTS_PER_DAY; h++) allowedSlots.add((long)(d * SLOTS_PER_DAY + h));
        } else {
            // Kullanıcının açtığı saatleri topla
            for (int d = 0; d < DAYS_PER_WEEK; d++) {
                for (int h = 0; h < SLOTS_PER_DAY; h++) {
                    // Güvenli Erişim
                    boolean isDayOpen = (d < globalMatrix.length);
                    boolean isHourOpen = isDayOpen && (h < globalMatrix[d].length) && globalMatrix[d][h];

                    if (isHourOpen) {
                        allowedSlots.add((long)(d * SLOTS_PER_DAY + h));
                    }
                }
            }
        }

        if (allowedSlots.isEmpty()) return new ScheduleResponse("NO_SLOTS_AVAILABLE", 0, new ArrayList<>(),new ArrayList<>());
        Domain globalDomain = Domain.fromValues(allowedSlots.stream().mapToLong(l->l).toArray());

        List<LessonVar> allLessons = new ArrayList<>();
        int lessonIdCounter = 0;

        // --- 2. DEĞİŞKENLERİ OLUŞTUR ---
        for (StudentGroup group : groups) {
            for (Course course : group.courses()) {

                // ADIM 1: ÖĞRETMENİ DERS BAZINDA SABİTLE (Döngü Dışına Alındı)
                // ----------------------------------------------------------------
                List<Integer> validTeacherIds = teachers.stream()
                        .filter(t -> t.subjects().contains(course.subject()))
                        .map(Teacher::id).toList();

                if(validTeacherIds.isEmpty()) {
                    System.out.println("UYARI: " + group.name() + " grubunun " + course.subject() + " dersi için uygun öğretmen bulunamadı!");
                    continue;
                }

                // Bu dersin tüm saatleri için TEK bir öğretmen seçilecek
                IntVar commonTeacherVar = model.newIntVarFromDomain(
                        Domain.fromValues(validTeacherIds.stream().mapToLong(Integer::longValue).toArray()),
                        "teacher_course_" + course.id() + "_group_" + group.id()
                );


                // ADIM 2: DERSLİĞİ DERS BAZINDA SABİTLE (Opsiyonel - İsterseniz döngü içinde bırakabilirsiniz)
                // ----------------------------------------------------------------
                List<String> requiredFeatures = course.requiredEquipment();
                List<Integer> validRoomIds = rooms.stream()
                        .filter(r -> r.capacity() >= group.size())
                        .filter(r -> {
                            if (requiredFeatures == null || requiredFeatures.isEmpty()) return true;
                            if (r.features() == null) return false;
                            return new HashSet<>(r.features()).containsAll(requiredFeatures);
                        })
                        .map(Room::id).toList();

                if(validRoomIds.isEmpty()) {
                    System.out.println("UYARI: " + group.name() + " grubunun " + course.subject() + " dersi için uygun oda bulunamadı!");
                    continue;
                }

                // Bu dersin tüm saatleri için TEK bir oda seçilecek
                IntVar commonRoomVar = model.newIntVarFromDomain(
                        Domain.fromValues(validRoomIds.stream().mapToLong(Integer::longValue).toArray()),
                        "room_course_" + course.id() + "_group_" + group.id()
                );


                // ADIM 3: SAATLERİ OLUŞTUR (Döngü Sadece Saatler İçin Dönecek)
                // ----------------------------------------------------------------
                for (int i = 0; i < course.weeklyCount(); i++) {

                    // Ders Zamanı (Her ders saati farklı zamanda olmalı)
                    IntVar startVar = model.newIntVarFromDomain(globalDomain, "time_" + lessonIdCounter);

                    // --- KISITLAMALAR ---

                    // 1. Seçilen "Ortak Öğretmen" o saatte müsait olmalı
                    List<long[]> validTeacherTimePairs = new ArrayList<>();
                    for (Integer tId : validTeacherIds) {
                        Teacher t = teachers.stream().filter(x -> x.id() == tId).findFirst().get();
                        for (Long slot : allowedSlots) {
                            int s = slot.intValue();
                            if (isAvailable(t.availability(), s)) {
                                validTeacherTimePairs.add(new long[]{tId, s});
                            }
                        }
                    }
                    if (!validTeacherTimePairs.isEmpty()) {
                        TableConstraint tc = model.addAllowedAssignments(Arrays.asList(commonTeacherVar, startVar));
                        for(long[] pair : validTeacherTimePairs) tc.addTuple(pair);
                    }

                    // 2. Seçilen "Ortak Oda" o saatte müsait olmalı
                    List<long[]> validRoomTimePairs = new ArrayList<>();
                    for (Integer rId : validRoomIds) {
                        Room r = rooms.stream().filter(x -> x.id() == rId).findFirst().get();
                        for (Long slot : allowedSlots) {
                            int s = slot.intValue();
                            if (isAvailable(r.availability(), s)) {
                                validRoomTimePairs.add(new long[]{rId, s});
                            }
                        }
                    }
                    if (!validRoomTimePairs.isEmpty()) {
                        TableConstraint rc = model.addAllowedAssignments(Arrays.asList(commonRoomVar, startVar));
                        for(long[] pair : validRoomTimePairs) rc.addTuple(pair);
                    }

                    // Listeye eklerken artık "common" değişkenleri kullanıyoruz
                    allLessons.add(new LessonVar(lessonIdCounter++, group, course, startVar, commonTeacherVar, commonRoomVar));
                }
            }
        }

        // --- 3. ÇAKIŞMA KONTROLLERİ ---
        // Öğretmen aynı anda 1 yerde olabilir
        for (Teacher t : teachers) {
            List<IntervalVar> intervals = new ArrayList<>();
            for (LessonVar lesson : allLessons) {
                BoolVar isTeaching = model.newBoolVar("teaching_" + t.id() + "_" + lesson.id);
                model.addEquality(lesson.teacherVar, t.id()).onlyEnforceIf(isTeaching);
                model.addDifferent(lesson.teacherVar, t.id()).onlyEnforceIf(isTeaching.not());
                intervals.add(model.newOptionalFixedSizeIntervalVar(lesson.startVar, 1, isTeaching, ""));
            }
            model.addNoOverlap(intervals);
        }

        // Oda aynı anda 1 derse ev sahipliği yapabilir
        for (Room r : rooms) {
            List<IntervalVar> intervals = new ArrayList<>();
            for (LessonVar lesson : allLessons) {
                BoolVar isHosted = model.newBoolVar("hosted_" + r.id() + "_" + lesson.id);
                model.addEquality(lesson.roomVar, r.id()).onlyEnforceIf(isHosted);
                model.addDifferent(lesson.roomVar, r.id()).onlyEnforceIf(isHosted.not());
                intervals.add(model.newOptionalFixedSizeIntervalVar(lesson.startVar, 1, isHosted, ""));
            }
            model.addNoOverlap(intervals);
        }

        // Sınıf aynı anda 1 derste olabilir
        for (StudentGroup g : groups) {
            List<IntervalVar> intervals = new ArrayList<>();
            for (LessonVar lesson : allLessons) {
                if (lesson.group.id() == g.id()) {
                    intervals.add(model.newFixedSizeIntervalVar(lesson.startVar, 1, ""));
                }
            }
            model.addNoOverlap(intervals);
        }

        // --- 4. OPTİMİZASYON HEDEFLERİ (Soft Constraints) ---


        String strategy = request.strategy();
        if (strategy == null) strategy = "DISTRIBUTED";

        if ("COMPRESSED".equalsIgnoreCase(strategy)) {
            // SIKIŞTIRILMIŞ MOD: Start zamanlarını minimize et (Erkene çek)
            List<LinearArgument> penalties = new ArrayList<>();
            for (LessonVar lesson : allLessons) {
                penalties.add(lesson.startVar);
            }
            if(!penalties.isEmpty()){
                model.minimize(LinearExpr.sum(penalties.toArray(new LinearArgument[0])));
            }
        }else if ("DISTRIBUTED".equalsIgnoreCase(strategy)) {
            // DAĞITILMIŞ MOD: GÜNLÜK YÜK DENGELEME (LOAD BALANCING)
            // Hedef: En yoğun gün ile en boş gün arasındaki farkı kapatmak için
            // "Maksimum Günlük Ders Sayısını" minimize ediyoruz.

            List<IntVar> dailyLoads = new ArrayList<>();
            int maxPossibleLessons = allLessons.size(); // Teorik üst sınır

            for (int d = 0; d < DAYS_PER_WEEK; d++) {
                // O günün slot aralığı (Örn: Pzt 0-23)
                long startSlot = d * SLOTS_PER_DAY;
                long endSlot = (d + 1) * SLOTS_PER_DAY - 1;
                Domain dayDomain = new Domain(startSlot, endSlot);

                List<BoolVar> lessonsInThisDay = new ArrayList<>();

                for (LessonVar lesson : allLessons) {
                    // "Bu ders, bu günün sınırları içinde mi?" sorusunun cevabı (Boolean Değişken)
                    BoolVar isPresent = model.newBoolVar("is_lesson_" + lesson.id + "_on_day_" + d);

                    // Eğer dersin saati bu günün aralığındaysa isPresent=1 olsun
                    model.addLinearExpressionInDomain(lesson.startVar, dayDomain).onlyEnforceIf(isPresent);
                    // Değilse isPresent=0 olsun
                    model.addLinearExpressionInDomain(lesson.startVar, dayDomain.complement()).onlyEnforceIf(isPresent.not());

                    lessonsInThisDay.add(isPresent);
                }

                // Bu gündeki toplam ders sayısı (Load)
                IntVar dayLoad = model.newIntVar(0, maxPossibleLessons, "load_day_" + d);
                model.addEquality(dayLoad, LinearExpr.sum(lessonsInThisDay.toArray(new BoolVar[0])));
                dailyLoads.add(dayLoad);
            }

            // MİNİMAX HEDEFİ:
            // Tüm günler arasındaki "En Yüksek Ders Sayısını" (MaxLoad) bul...
            IntVar maxDailyLoad = model.newIntVar(0, maxPossibleLessons, "max_daily_load");
            model.addMaxEquality(maxDailyLoad, dailyLoads.toArray(new IntVar[0]));

            // ...ve bu sayıyı MİNİMİZE et.
            // Bu işlem, tepe noktalarını tıraşlayıp dersleri mecburen diğer günlere kaydırır.
            model.minimize(maxDailyLoad);
        }

        // --- 5. ÇÖZÜM ---
        CpSolver solver = new CpSolver();

        if ("DISTRIBUTED".equalsIgnoreCase(strategy)) {
            // Distributed modda rastgeleliği de açık tutuyoruz ki farklı varyasyonlar deneyebilsin
            solver.getParameters().setRandomizeSearch(true);
        }
        solver.getParameters().setMaxTimeInSeconds(60);
        solver.getParameters().setLogSearchProgress(true);
        CpSolverStatus status = solver.solve(model);
        long endTime = System.currentTimeMillis();

        List<ClassSchedule> classSchedules = new ArrayList<>();
        List<String> finalErrors = new ArrayList<>(); // Hata listesi

        if (status == CpSolverStatus.OPTIMAL || status == CpSolverStatus.FEASIBLE) {
            List<ScheduleItem> rawItems = new ArrayList<>();
            for (LessonVar lesson : allLessons) {
                int startVal = (int) solver.value(lesson.startVar);
                int tId = (int) solver.value(lesson.teacherVar);
                int rId = (int) solver.value(lesson.roomVar);

                String tName = teachers.stream().filter(t -> t.id() == tId).findFirst().get().name();
                String rName = rooms.stream().filter(r -> r.id() == rId).findFirst().get().name();

                rawItems.add(new ScheduleItem(
                        lesson.group.name(), lesson.course.subject(), tName, rName,
                        startVal / SLOTS_PER_DAY,
                        startVal % SLOTS_PER_DAY
                ));
            }

            Map<String, List<ScheduleItem>> byGroup = rawItems.stream().collect(Collectors.groupingBy(ScheduleItem::group));
            String[] dayNames = {"Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"};

            for (String groupName : byGroup.keySet()) {
                List<ScheduleItem> groupItems = byGroup.get(groupName);
                List<DailySchedule> days = new ArrayList<>();

                // 7 Günü dön
                for (int d = 0; d < DAYS_PER_WEEK; d++) {
                    int currentDay = d;
                    List<LessonSlot> lessons = groupItems.stream()
                            .filter(item -> item.dayIndex() == currentDay)
                            .sorted(Comparator.comparingInt(ScheduleItem::hour))
                            .map(item -> new LessonSlot(
                                    item.hour(),
                                    String.format("%02d:00", item.hour()), // Saat formatı düzeltildi
                                    item.course(), item.teacher(), item.room()
                            )).toList();

                    // Boş günleri de ekleyelim ki takvimde sütun kaymasın
                    if (!lessons.isEmpty()) {
                        days.add(new DailySchedule(dayNames[d], lessons));
                    }
                }
                classSchedules.add(new ClassSchedule(groupName, days));
            }
            classSchedules.sort(Comparator.comparing(ClassSchedule::className));
        }else if (status == CpSolverStatus.INFEASIBLE) {
            // ⭐ DÜZELTME BURADA: Eğer çözücü başarısızsa boş dönme, genel sebepleri ekle
            finalErrors.add("KRİTİK ÇAKIŞMA: Ön kontrollerden geçildi ancak matematiksel çözüm bulunamadı.");
            finalErrors.add("OLASI NEDEN 1: Bir öğretmen veya oda, aynı anda birden fazla yerde olmak zorunda kalıyor.");
            finalErrors.add("OLASI NEDEN 2: Kısıtlı saatlerde (Örn: Sadece Pzt sabahı) çok fazla ders yığılmış.");
            finalErrors.add("OLASI NEDEN 3: Öğretmenlerin veya odaların müsaitlikleri, ders yükünü karşılamıyor.");
            finalErrors.add("ÇÖZÜM: Öğretmen müsaitliklerini genişletin veya farklı odalar ekleyin.");
        } else {
            finalErrors.add("ZAMAN AŞIMI: Çözüm 30 saniye içinde bulunamadı. Daha fazla süre tanıyın veya kısıtlamaları azaltın.");
        }

        return new ScheduleResponse(status.toString(), (endTime - startTime), classSchedules, finalErrors);
    }

    // --- YENİ: HATA ANALİZ METODU ---
    private List<String> validateRequest(OptimizationRequest request) {
        List<String> errors = new ArrayList<>();

        // 1. Matris Kontrolü
        List<Long> allowedSlots = new ArrayList<>();
        boolean[][] globalMatrix = request.globalAvailability();
        if (globalMatrix != null) {
            for (int d = 0; d < DAYS_PER_WEEK; d++) {
                for (int h = 0; h < SLOTS_PER_DAY; h++) {
                    if (d < globalMatrix.length && h < globalMatrix[d].length && globalMatrix[d][h]) {
                        allowedSlots.add((long)(d * SLOTS_PER_DAY + h));
                    }
                }
            }
        } else {
            // Null ise hepsi açık varsayılır, sorun yok
            return errors;
        }

        int totalOpenSlots = allowedSlots.size();
        if (totalOpenSlots == 0) {
            errors.add("GLOBAL HATA: Takvimde hiç açık saat bırakmadınız. Lütfen 'Zaman Ayarları'nı kontrol edin.");
            return errors;
        }

        // 2. Öğretmen Kapasite Kontrolü
        for (Teacher t : request.teachers()) {
            // Öğretmenin vermesi gereken toplam ders saati
            int requiredHours = 0;
            for (StudentGroup g : request.groups()) {
                for (Course c : g.courses()) {
                    // Bu dersi bu hoca mı veriyor? (Basit kontrol: İsim eşleşmesi veya Subject eşleşmesi)
                    // Not: Sizin yapınızda Group->Course içinde Teacher bilgisi yok,
                    // Ancak Engine içinde "ValidTeacherIds" filtresi yapıyorsunuz.
                    // Burada yaklaşık bir kontrol yapacağız:
                    if (t.subjects().contains(c.subject())) {
                        // DİKKAT: Burada birden fazla hoca aynı dersi verebiliyorsa yük dağılımını bilemeyiz.
                        // Ama tek hoca zorunluluğu varsa kontrol edebiliriz.
                        // Şimdilik daha net bir kontrol olan "Kendi Müsaitliği"ne bakalım.
                    }
                }
            }

            // Öğretmenin Müsait Olduğu (Ve Global Takvimle Kesişen) Saat Sayısı
            int teacherAvailableHours = 0;
            for (Long slotIdx : allowedSlots) {
                if (isAvailable(t.availability(), slotIdx.intValue())) {
                    teacherAvailableHours++;
                }
            }

            // Eğer öğretmenin hiç müsait saati yoksa
            if (teacherAvailableHours == 0) {
                errors.add("ÖĞRETMEN HATASI: " + t.name() + " için takvimde hiç uygun saat yok.");
            }
        }

        // 3. Grup Ders Yükü Kontrolü
        for (StudentGroup g : request.groups()) {
            int totalLessonHours = g.courses().stream().mapToInt(Course::weeklyCount).sum();

            if (totalLessonHours > totalOpenSlots) {
                errors.add("GRUP HATASI: " + g.name() + " sınıfının " + totalLessonHours + " saat dersi var, ancak takvimde sadece " + totalOpenSlots + " saat açık.");
            }
        }

        // 4. Oda Kapasite Kontrolü (Ders bazlı)
        for(StudentGroup g : request.groups()) {
            for(Course c : g.courses()) {
                boolean hasSuitableRoom = false;
                for(Room r : request.rooms()) {
                    // Kapasite yetiyor mu?
                    boolean capOk = r.capacity() >= g.size();
                    // Özellik yetiyor mu?
                    boolean featOk = true;
                    if(c.requiredEquipment() != null && !c.requiredEquipment().isEmpty()) {
                        if(r.features() == null || !new HashSet<>(r.features()).containsAll(c.requiredEquipment())) {
                            featOk = false;
                        }
                    }

                    if(capOk && featOk) {
                        hasSuitableRoom = true;
                        break;
                    }
                }
                if(!hasSuitableRoom) {
                    errors.add("ODA HATASI: " + g.name() + " grubunun '" + c.subject() + "' dersi için uygun kapasiteye veya özelliğe (" + c.requiredEquipment() + ") sahip oda bulunamadı.");
                }
            }
        }

        return errors;
    }

    private boolean isAvailable(boolean[][] matrix, int slot) {
        if (matrix == null) return true;
        int d = slot / SLOTS_PER_DAY;
        int h = slot % SLOTS_PER_DAY;
        if (d >= matrix.length) return false;
        if (h >= matrix[d].length) return false;
        return matrix[d][h];
    }
}