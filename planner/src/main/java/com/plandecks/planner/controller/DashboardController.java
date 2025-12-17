package com.plandecks.planner.controller;

import com.plandecks.planner.model.entity.*;
import com.plandecks.planner.model.response.DashboardStats;
import com.plandecks.planner.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@CrossOrigin
public class DashboardController {

    private final TeacherRepository teacherRepo;
    private final StudentGroupRepository groupRepo;
    private final CourseRepository courseRepo;
    private final RoomRepository roomRepo;
    private final GeneratedScheduleRepository scheduleRepo;
    private final UserRepository userRepo;

    private Integer getCurrentUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepo.findByUsername(username).orElseThrow().getId();
    }

    // 1. İstatistikleri Getir (Kartlar için)
    @GetMapping("/stats")
    public ResponseEntity<DashboardStats> getStats() {
        Integer userId = getCurrentUserId();
        return ResponseEntity.ok(new DashboardStats(
            teacherRepo.findAllByUserId(userId).size(),
            groupRepo.findAllByUserId(userId).size(),
            courseRepo.findAllByUserId(userId).size(),
            roomRepo.findAllByUserId(userId).size(),
            scheduleRepo.findAllByUserId(userId).size()
        ));
    }

    // 2. Kayıtlı Planları Listele
    @GetMapping("/plans")
    public ResponseEntity<List<GeneratedScheduleEntity>> getPlans() {
        // Not: Performans için normalde JSON datasını burada null döndürmek daha iyidir
        // ama şimdilik hızlı çözüm için tüm entity'i dönüyoruz.
        return ResponseEntity.ok(scheduleRepo.findAllByUserId(getCurrentUserId()));
    }

    // 3. Tek Bir Planın Detayını Getir (Takvim için)
    @GetMapping("/plans/{id}")
    public ResponseEntity<GeneratedScheduleEntity> getPlanDetail(@PathVariable Long id) {
        GeneratedScheduleEntity plan = scheduleRepo.findById(id).orElseThrow();
        // Güvenlik: Başkasının planını göremez
        if (!plan.getUser().getId().equals(getCurrentUserId())) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(plan);
    }
}