package com.plandecks.planner.service;

import com.plandecks.planner.engine.OptimizationEngine;
import com.plandecks.planner.model.entity.*;
import com.plandecks.planner.model.request.*;
import com.plandecks.planner.model.response.ScheduleResponse;
import com.plandecks.planner.repository.*;
import com.fasterxml.jackson.core.JsonProcessingException;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ScheduleService {

    private final OptimizationEngine optimizationEngine;
    private final TeacherRepository teacherRepo;
    private final RoomRepository roomRepo;
    private final StudentGroupRepository groupRepo;
    private final CourseRepository courseRepo; // Buna gerek kalmayabilir çünkü gruplardan çekiyoruz ama yedek dursun
    private final UserRepository userRepo;
    private final ObjectMapper objectMapper;

    // Yardımcı: Şu anki kullanıcıyı bul
    private Integer getCurrentUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepo.findByUsername(username).orElseThrow().getId();
    }

    // --- ANA METOD: KAYDETMEDEN HESAPLA ---
    public ScheduleResponse generateWithoutSave(boolean[][] globalAvailability, String strategy) {

        Integer userId = getCurrentUserId();

        // 1. ÖĞRETMENLERİ ÇEK VE DÖNÜŞTÜR
        List<Teacher> teachers = teacherRepo.findAllByUserId(userId).stream()
                .map(e -> {
                    boolean[][] availability;
                    if (e.getAvailabilityJson() != null) {
                        availability = objectMapper.readValue(e.getAvailabilityJson(), boolean[][].class);
                    } else {
                        // Varsayılan: 7 Gün x 8 Saat Müsait
                        availability = new boolean[7][8];
                        for(int i=0; i<7; i++) for(int j=0; j<8; j++) availability[i][j] = true;
                    }
                    return new Teacher(e.getId(), e.getName(), e.getSubjects(), availability);
                })
                .toList();

        // 2. ODALARI ÇEK VE DÖNÜŞTÜR
        List<Room> rooms = roomRepo.findAllByUserId(userId).stream()
                .map(e -> new Room(
                        e.getId(),
                        e.getName(),
                        e.getType(),
                        e.getCapacity(),
                        e.getFeatures(),
                        null // Odalar şimdilik 7/24 müsait varsayılıyor (Availability eklemediysek)
                ))
                .toList();

        // 3. GRUPLARI VE DERSLERİNİ ÇEK VE DÖNÜŞTÜR
        // DİKKAT: Artık dersleri group.getCourses() üzerinden alıyoruz
        List<StudentGroup> groups = groupRepo.findAllByUserId(userId).stream()
                .map(e -> {
                    // Grubun seçili derslerini DTO'ya çevir
                    List<Course> groupCourses = e.getCourses().stream()
                            .map(c -> new Course(
                                    c.getId(),
                                    c.getSubject(),
                                    c.getWeeklyCount(),
                                    c.getRequiredEquipment()
                            ))
                            .toList();

                    return new StudentGroup(e.getId(), e.getName(), e.getSize(), groupCourses);
                })
                .toList();

        // 4. DERSLER LİSTESİ (Engine eski yapıda isterse diye boş göndermiyoruz, tüm unique dersleri topluyoruz)
        // Ancak yeni yapıda Engine, StudentGroup içindeki dersleri kullandığı için burası boş olsa da çalışır.
        List<Course> allCourses = new ArrayList<>();

        OptimizationRequest request = new OptimizationRequest(
                groups, teachers, rooms, allCourses,
                globalAvailability,strategy
        );

        return optimizationEngine.optimize(request);
    }
}