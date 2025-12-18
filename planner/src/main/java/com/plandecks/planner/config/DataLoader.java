package com.plandecks.planner.config;

import com.plandecks.planner.model.entity.*;
import com.plandecks.planner.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final StudentGroupRepository groupRepo;
    private final TeacherRepository teacherRepo;
    private final RoomRepository roomRepo;
    private final CourseRepository courseRepo;
    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;

    @Override
    public void run(String... args) throws Exception {
        // Kullanıcı: "admin_single_course"
        if (userRepo.findByUsername("admin_single_course").isEmpty()) {
            System.out.println("🔥 FAZ-10: TEK MÜFREDAT - ÇOKLU GRUP SENARYOSU YÜKLENİYOR...");

            UserEntity user = UserEntity.builder()
                    .username("admin_single_course")
                    .password(passwordEncoder.encode("12345"))
                    .email("admin_single@school.com")
                    .enabled(true)
                    .build();
            userRepo.save(user);

            boolean[][] fullOpen = new boolean[7][24];
            for (boolean[] row : fullOpen) Arrays.fill(row, true);
            String fullJson = objectMapper.writeValueAsString(fullOpen);

            createSingleCourseScenario(user, fullJson);
            System.out.println("✅ FAZ-10 TAMAMLANDI! (Dersler Unique) Giriş: admin_single_course / 12345");
        }
    }

    private void createSingleCourseScenario(UserEntity user, String fullJson) {
        // --- 1. ODALAR ---
        List<RoomEntity> rooms = new ArrayList<>();
        for (int i = 1; i <= 10; i++) rooms.add(roomRepo.save(new RoomEntity(null, "Derslik 10" + (i == 10 ? "0" : i), "Classroom", 30, new ArrayList<>(), user)));
        RoomEntity lab = roomRepo.save(new RoomEntity(null, "Lab", "Lab", 40, List.of("Lab"), user));
        RoomEntity gym = roomRepo.save(new RoomEntity(null, "Spor Salonu", "Gym", 100, List.of("Spor"), user));
        rooms.add(lab);
        rooms.add(gym);


        // --- 2. ÖĞRETMENLER ---
        createTeacher(user, "Ahmet Hoca (9-12)", List.of("MAT-9", "MAT-12"), fullJson);
        createTeacher(user, "Berna Hoca (10)",   List.of("MAT-10"), fullJson);
        createTeacher(user, "Cemal Hoca (11)",   List.of("MAT-11"), fullJson);
        createTeacher(user, "Derya Hoca (Fiz)",  List.of("FIZ-9", "FIZ-10", "FIZ-11"), fullJson);
        createTeacher(user, "Emre Hoca (Kim)",   List.of("KIM-9", "KIM-10", "KIM-11"), fullJson);
        createTeacher(user, "Fatma Hoca (Biyo)", List.of("BIY-9", "BIY-10", "BIY-12"), fullJson);
        createTeacher(user, "Gökhan Hoca (Edeb)", List.of("EDB-9", "EDB-11"), fullJson);
        createTeacher(user, "Hale Hoca (Edeb)",   List.of("EDB-10", "EDB-12"), fullJson);
        createTeacher(user, "Mr. John (Ing)",     List.of("ING-9", "ING-10"), fullJson);
        createTeacher(user, "Ms. Jane (Ing)",     List.of("ING-11", "ING-12"), fullJson);
        createTeacher(user, "Klaus Hoca (Alm)",   List.of("ALM-11"), fullJson);
        createTeacher(user, "Leyla Hoca (Trh)",   List.of("TAR-10", "TAR-12"), fullJson);
        createTeacher(user, "Mehmet Hoca (Cog)",  List.of("COG-10", "COG-12"), fullJson);
        createTeacher(user, "Nur Hoca (Fel)",     List.of("FEL-10"), fullJson);
        createTeacher(user, "Orhan Hoca (Din)",   List.of("DIN-12"), fullJson);
        createTeacher(user, "Pınar Hoca (Spor)",  List.of("BED-9", "BED-10"), fullJson);
        createTeacher(user, "Selin Hoca (Bilg)",  List.of("BIL-9"), fullJson);


        // --- 3. MÜFREDAT TANIMLARI (Her dersten SADECE 1 TANE oluşturuyoruz) ---

        // 9. Sınıf Müfredatı (Tekil Nesneler)
        CourseEntity mat9 = createCourse(user, 6, "MAT-9", null);
        CourseEntity fiz9 = createCourse(user, 2, "FIZ-9", null);
        CourseEntity kim9 = createCourse(user, 2, "KIM-9", List.of("Lab"));
        CourseEntity biy9 = createCourse(user, 2, "BIY-9", null);
        CourseEntity edb9 = createCourse(user, 5, "EDB-9", null);
        CourseEntity ing9 = createCourse(user, 4, "ING-9", null);
        CourseEntity bed9 = createCourse(user, 2, "BED-9", List.of("Spor"));
        CourseEntity bil9 = createCourse(user, 2, "BIL-9", null);
        // Bu listeyi 9. sınıflara dağıtacağız
        List<CourseEntity> curriculum9 = List.of(mat9, fiz9, kim9, biy9, edb9, ing9, bed9, bil9);

        // 10. Sınıf Müfredatı
        CourseEntity mat10 = createCourse(user, 6, "MAT-10", null);
        CourseEntity fiz10 = createCourse(user, 2, "FIZ-10", null);
        CourseEntity kim10 = createCourse(user, 2, "KIM-10", null);
        CourseEntity biy10 = createCourse(user, 2, "BIY-10", null);
        CourseEntity edb10 = createCourse(user, 5, "EDB-10", null);
        CourseEntity ing10 = createCourse(user, 4, "ING-10", null);
        CourseEntity tar10 = createCourse(user, 2, "TAR-10", null);
        CourseEntity cog10 = createCourse(user, 2, "COG-10", null);
        CourseEntity fel10 = createCourse(user, 2, "FEL-10", null);
        CourseEntity bed10 = createCourse(user, 2, "BED-10", List.of("Spor"));
        List<CourseEntity> curriculum10 = List.of(mat10, fiz10, kim10, biy10, edb10, ing10, tar10, cog10, fel10, bed10);

        // 11. Sınıf Müfredatı
        CourseEntity mat11 = createCourse(user, 6, "MAT-11", null);
        CourseEntity fiz11 = createCourse(user, 4, "FIZ-11", List.of("Lab"));
        CourseEntity kim11 = createCourse(user, 4, "KIM-11", List.of("Lab"));
        CourseEntity edb11 = createCourse(user, 5, "EDB-11", null);
        CourseEntity ing11 = createCourse(user, 4, "ING-11", null);
        CourseEntity alm11 = createCourse(user, 2, "ALM-11", null);
        List<CourseEntity> curriculum11 = List.of(mat11, fiz11, kim11, edb11, ing11, alm11);

        // 12. Sınıf Müfredatı
        CourseEntity mat12 = createCourse(user, 4, "MAT-12", null);
        CourseEntity edb12 = createCourse(user, 5, "EDB-12", null);
        CourseEntity ing12 = createCourse(user, 4, "ING-12", null);
        CourseEntity tar12 = createCourse(user, 2, "TAR-12", null);
        CourseEntity cog12 = createCourse(user, 2, "COG-12", null);
        CourseEntity din12 = createCourse(user, 1, "DIN-12", null);
        CourseEntity biy12 = createCourse(user, 1, "BIY-12", null);
        List<CourseEntity> curriculum12 = List.of(mat12, edb12, ing12, tar12, cog12, din12, biy12);


        // --- 4. GRUPLARA MÜFREDAT ATAMA ---
        // Artık dersleri kopyalamıyoruz, var olan ders nesnelerini listeye ekliyoruz.
        // Veritabanında: 9-A ve 9-B aynı "MAT-9 (ID:1)" satırına refere edecek.

        createGroup(user, "9-A", 30, curriculum9);
        createGroup(user, "9-B", 30, curriculum9);
        createGroup(user, "9-C", 30, curriculum9);

        createGroup(user, "10-A", 30, curriculum10);
        createGroup(user, "10-B", 30, curriculum10);
        createGroup(user, "10-C", 30, curriculum10);

        createGroup(user, "11-A (Sayısal)", 25, curriculum11);
        createGroup(user, "11-B (Sayısal)", 25, curriculum11);

        createGroup(user, "12-A (Sözel)", 25, curriculum12);
        createGroup(user, "12-B (EA)", 25, curriculum12);
    }

    // --- YARDIMCI METODLAR ---

    private TeacherEntity createTeacher(UserEntity user, String name, List<String> subjects, String availability) {
        return teacherRepo.save(new TeacherEntity(null, name, subjects, availability, user, null));
    }

    // Ders nesnesi oluşturur ve KAYDEDER (ID'si oluşur)
    private CourseEntity createCourse(UserEntity user, int hours, String subject, List<String> requirements) {
        CourseEntity course = new CourseEntity();
        course.setSubject(subject);
        course.setWeeklyCount(hours);
        course.setUser(user);


        if (requirements != null) course.setRequiredEquipment(requirements);

        return courseRepo.save(course);
    }

    private void createGroup(UserEntity user, String name, int size, List<CourseEntity> courses) {
        StudentGroupEntity group = new StudentGroupEntity(null, name, size, user, new ArrayList<>());

        // Gruba mevcut dersleri ata
        group.setCourses(courses);
        groupRepo.save(group);


    }
}