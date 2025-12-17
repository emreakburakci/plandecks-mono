package com.plandecks.planner.config;

import com.plandecks.planner.model.entity.*;
import com.plandecks.planner.model.request.Course;
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
        // Kullanıcı adı: "admin_v2" (Karışıklık olmaması için yeni kullanıcı)
        if (userRepo.findByUsername("admin_v2").isEmpty()) {
            System.out.println("🔥 FAZ-5: AYRIŞTIRILMIŞ DERS İSİMLERİ İLE SENARYO Yükleniyor...");

            UserEntity user = UserEntity.builder()
                    .username("admin_v2")
                    .password(passwordEncoder.encode("12345"))
                    .email("admin2@school.com")
                    .enabled(true)
                    .build();
            userRepo.save(user);

            // Tam Müsaitlik Matrisi (7x24 açık)
            boolean[][] fullOpen = new boolean[7][24];
            for (boolean[] row : fullOpen) Arrays.fill(row, true);
            String fullJson = objectMapper.writeValueAsString(fullOpen);

            createDistinctCourseScenario(user, fullJson);

            System.out.println("✅ FAZ-5 VERİLERİ HAZIR! Giriş: admin_v2 / 12345");
        }
    }

    private void createDistinctCourseScenario(UserEntity user, String fullJson) {
        // --- 1. ODALAR (12 Adet) ---
        List<RoomEntity> rooms = new ArrayList<>();
        // Genel Derslikler (101-110)
        for (int i = 1; i <= 10; i++) {
            rooms.add(roomRepo.save(new RoomEntity(null, "Derslik 10" + (i == 10 ? "0" : i), "Classroom", 30, new ArrayList<>(), user)));
        }
        // Özel Odalar
        RoomEntity lab = roomRepo.save(new RoomEntity(null, "Bilim Laboratuvarı", "Lab", 40, List.of("LabEquipment"), user));
        RoomEntity gym = roomRepo.save(new RoomEntity(null, "Kapalı Spor Salonu", "Gym", 100, List.of("Sport"), user));
        rooms.add(lab);
        rooms.add(gym);

        // --- 2. ÖĞRETMENLER (18 Adet - Branşlarına Göre) ---
        // Matematik Zümresi
        TeacherEntity tMat1 = createTeacher(user, "Ahmet Hoca (Mat-9/12)", List.of("Matematik"), fullJson);
        TeacherEntity tMat2 = createTeacher(user, "Berna Hoca (Mat-10)", List.of("Matematik", "Geometri"), fullJson);
        TeacherEntity tMat3 = createTeacher(user, "Cemal Hoca (Mat-11)", List.of("Matematik", "İleri Matematik"), fullJson);

        // Fen Zümresi
        TeacherEntity tFiz = createTeacher(user, "Derya Hoca (Fizik)", List.of("Fizik"), fullJson);
        TeacherEntity tKim = createTeacher(user, "Emre Hoca (Kimya)", List.of("Kimya"), fullJson);
        TeacherEntity tBiyo = createTeacher(user, "Fatma Hoca (Biyo)", List.of("Biyoloji"), fullJson);

        // Dil & Edebiyat Zümresi
        TeacherEntity tEdeb1 = createTeacher(user, "Gökhan Hoca (Edeb)", List.of("Edebiyat"), fullJson);
        TeacherEntity tEdeb2 = createTeacher(user, "Hale Hoca (Edeb)", List.of("Edebiyat"), fullJson);
        TeacherEntity tIng1 = createTeacher(user, "Mr. John (Ing)", List.of("İngilizce"), fullJson);
        TeacherEntity tIng2 = createTeacher(user, "Ms. Jane (Ing)", List.of("İngilizce"), fullJson);
        TeacherEntity tAlm = createTeacher(user, "Klaus Hoca (Alm)", List.of("Almanca"), fullJson);

        // Sosyal & Kültür Zümresi
        TeacherEntity tTar = createTeacher(user, "Leyla Hoca (Tarih)", List.of("Tarih"), fullJson);
        TeacherEntity tCog = createTeacher(user, "Mehmet Hoca (Cog)", List.of("Coğrafya"), fullJson);
        TeacherEntity tFel = createTeacher(user, "Nur Hoca (Felsefe)", List.of("Felsefe"), fullJson);
        TeacherEntity tDin = createTeacher(user, "Orhan Hoca (Din)", List.of("Din Kültürü"), fullJson);

        // Yetenek & Teknoloji
        TeacherEntity tBed = createTeacher(user, "Pınar Hoca (Spor)", List.of("Beden Eğitimi"), fullJson);
        TeacherEntity tMuz = createTeacher(user, "Rıza Hoca (Müzik)", List.of("Müzik"), fullJson);
        TeacherEntity tBil = createTeacher(user, "Selin Hoca (Bilg)", List.of("Bilgisayar"), fullJson);


        // --- 3. DERSLER (22 Farklı Ders - İsimleri Benzersiz) ---

        // 9. Sınıf Müfredatı
        CourseEntity c_Mat9 = createCourse(user, "9. Sınıf Matematik", 6, tMat1, null);
        CourseEntity c_Fiz9 = createCourse(user, "9. Sınıf Fizik", 2, tFiz, null);
        CourseEntity c_Kim9 = createCourse(user, "9. Sınıf Kimya", 2, tKim, null);
        CourseEntity c_Biyo9 = createCourse(user, "9. Sınıf Biyoloji", 2, tBiyo, null);
        CourseEntity c_Edeb9 = createCourse(user, "9. Sınıf Edebiyat", 5, tEdeb1, null);
        CourseEntity c_Ing9 = createCourse(user, "9. Sınıf İngilizce", 4, tIng1, null);
        CourseEntity c_Bed9 = createCourse(user, "9. Sınıf Beden Eğt.", 2, tBed, List.of("Sport"));
        CourseEntity c_BilGiris = createCourse(user, "Bilişime Giriş", 2, tBil, null); // 9'lar için ortak

        // 10. Sınıf Müfredatı
        CourseEntity c_Mat10 = createCourse(user, "10. Sınıf Matematik", 6, tMat2, null);
        CourseEntity c_Tar10 = createCourse(user, "10. Sınıf Tarih", 2, tTar, null);
        CourseEntity c_Cog10 = createCourse(user, "10. Sınıf Coğrafya", 2, tCog, null);
        CourseEntity c_Fel10 = createCourse(user, "10. Sınıf Felsefe", 2, tFel, null);
        CourseEntity c_Ing10 = createCourse(user, "10. Sınıf İngilizce", 4, tIng2, null);
        CourseEntity c_Proje = createCourse(user, "Proje Tasarımı", 2, tBil, null); // 10'lar için ortak

        // 11. Sınıf Müfredatı (Sayısal Ağırlıklı)
        CourseEntity c_Mat11_Ileri = createCourse(user, "11. İleri Matematik", 6, tMat3, null);
        CourseEntity c_Fiz11_Ileri = createCourse(user, "11. İleri Fizik", 4, tFiz, List.of("LabEquipment")); // Lab Şartı
        CourseEntity c_Kim11_Ileri = createCourse(user, "11. İleri Kimya", 4, tKim, List.of("LabEquipment")); // Lab Şartı
        CourseEntity c_Edeb11 = createCourse(user, "11. Sınıf Edebiyat", 5, tEdeb2, null);
        CourseEntity c_Alm11 = createCourse(user, "11. Sınıf Almanca", 2, tAlm, null);

        // 12. Sınıf Müfredatı (Sözel/EA Ağırlıklı)
        CourseEntity c_Mat12_Temel = createCourse(user, "12. Temel Matematik", 2, tMat1, null);
        CourseEntity c_Edeb12_Ileri = createCourse(user, "12. İleri Edebiyat", 5, tEdeb2, null);
        CourseEntity c_Muz12 = createCourse(user, "12. Sınıf Müzik", 2, tMuz, null);
        CourseEntity c_Din12 = createCourse(user, "Din Kültürü ve Ahlak", 1, tDin, null);
        CourseEntity c_Trafik = createCourse(user, "Trafik ve İlkyardım", 1, tBiyo, null); // Biyolojici giriyor


        // --- 4. GRUPLAR (10 Sınıf) ---

        // 9. Sınıflar (3 Şube - Toplam 25 Saat)
        List<CourseEntity> curr9 = List.of(c_Mat9, c_Fiz9, c_Kim9, c_Biyo9, c_Edeb9, c_Ing9, c_Bed9, c_BilGiris);
        createGroup(user, "9-A", 30, curr9);
        createGroup(user, "9-B", 30, curr9);
        createGroup(user, "9-C", 30, curr9);

        // 10. Sınıflar (3 Şube - Toplam ~25 Saat)
        // Not: 10. sınıflar 9. sınıf Edebiyat ve Kimya derslerini tekrar alıyor gibi (Test amaçlı karmaşa)
        List<CourseEntity> curr10 = List.of(c_Mat10, c_Tar10, c_Cog10, c_Fel10, c_Ing10, c_Proje, c_Bed9); // c_Bed9'u ortak kullanıyorlar (Spor salonu çakışması testi için)
        createGroup(user, "10-A", 30, curr10);
        createGroup(user, "10-B", 30, curr10);
        createGroup(user, "10-C", 30, curr10);

        // 11. Sınıflar (2 Şube - Toplam ~21 Saat)
        List<CourseEntity> curr11 = List.of(c_Mat11_Ileri, c_Fiz11_Ileri, c_Kim11_Ileri, c_Edeb11, c_Alm11);
        createGroup(user, "11-A (Sayısal)", 25, curr11);
        createGroup(user, "11-B (Sayısal)", 25, curr11);

        // 12. Sınıflar (2 Şube - Toplam ~20 Saat)
        List<CourseEntity> curr12 = List.of(c_Mat12_Temel, c_Edeb12_Ileri, c_Muz12, c_Din12, c_Trafik, c_Ing10); // İngilizce 10'u tekrar alıyorlar
        createGroup(user, "12-A (Sözel)", 25, curr12);
        createGroup(user, "12-B (EA)", 25, curr12);
    }

    // --- YARDIMCI METODLAR ---

    private TeacherEntity createTeacher(UserEntity user, String name, List<String> subjects, String availability) {
        return teacherRepo.save(new TeacherEntity(null, name, subjects, availability, user, null));
    }

    private CourseEntity createCourse(UserEntity user, String name, int hours, TeacherEntity teacher, List<String> requirements) {
        CourseEntity course = new CourseEntity(null, name, hours, new ArrayList<>(), user);

        if (requirements != null) {
            course.setRequiredEquipment(requirements);
        }

        // Dersi veren öğretmenin ilk branşını derse ata (OptimizationEngine eşleşmesi için)
        course.setSubject(teacher.getSubjects().get(0));

        return courseRepo.save(course);
    }

    private void createGroup(UserEntity user, String name, int size, List<CourseEntity> courses) {
        StudentGroupEntity group = new StudentGroupEntity(null, name, size, user, new ArrayList<>());
        group.setCourses(courses);
        groupRepo.save(group);

    }
}