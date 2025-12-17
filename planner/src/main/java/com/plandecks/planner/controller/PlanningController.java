package com.plandecks.planner.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.plandecks.planner.model.entity.GeneratedScheduleEntity;
import com.plandecks.planner.model.entity.UserEntity;
import com.plandecks.planner.model.request.GenerateRequest;
import com.plandecks.planner.model.request.SaveScheduleRequest;
import com.plandecks.planner.model.response.ScheduleResponse;
import com.plandecks.planner.repository.GeneratedScheduleRepository;
import com.plandecks.planner.repository.UserRepository;
import com.plandecks.planner.service.ScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/planning")
@RequiredArgsConstructor
@CrossOrigin
public class PlanningController {

    private final ScheduleService scheduleService;
    private final GeneratedScheduleRepository scheduleRepo;
    private final UserRepository userRepo;
    private final ObjectMapper objectMapper;

    private UserEntity getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepo.findByUsername(username).orElseThrow();
    }

    // 1. Sadece Hesapla (DB'ye Kaydetmez)
    @PostMapping("/generate")
    public ResponseEntity<ScheduleResponse> generateOnly(@RequestBody GenerateRequest request) {
        // activeDays listesini servise gönderiyoruz
        return ResponseEntity.ok(scheduleService.generateWithoutSave(request.globalAvailability(), request.strategy()));
    }

    // 2. Hesaplanmış ve Düzenlenmiş Veriyi Kaydet
    @PostMapping("/save")
    public ResponseEntity<Void> saveSchedule(@RequestBody SaveScheduleRequest request) {
        String jsonResult = objectMapper.writeValueAsString(request.scheduleData());

        GeneratedScheduleEntity entity = GeneratedScheduleEntity.builder()
                .scheduleName(request.name())
                .createdAt(LocalDateTime.now())
                .scheduleJsonData(jsonResult)
                .user(getCurrentUser())
                .build();

        scheduleRepo.save(entity);
        return ResponseEntity.ok().build();
    }

    // 3. Mevcut Planı Güncelle
    @PutMapping("/{id}")
    public ResponseEntity<Void> updateSchedule(@PathVariable Long id, @RequestBody ScheduleResponse updatedData) {
        GeneratedScheduleEntity plan = scheduleRepo.findById(id).orElseThrow();

        // Güvenlik kontrolü
        if (!plan.getUser().getId().equals(getCurrentUser().getId())) {
            return ResponseEntity.status(403).build();
        }

        String jsonResult = objectMapper.writeValueAsString(updatedData);
        plan.setScheduleJsonData(jsonResult);
        // Tarihi güncellemek istersen: plan.setCreatedAt(LocalDateTime.now());
        scheduleRepo.save(plan);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePlan(@PathVariable Long id) {
        // 1. Planı bul
        GeneratedScheduleEntity schedule = scheduleRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Plan bulunamadı"));

        // 2. Güvenlik Kontrolü: Silmeye çalışan kişi, planın sahibi mi?
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!schedule.getUser().getUsername().equals(currentUsername)) {
            return ResponseEntity.status(403).body(Map.of("message", "Bu planı silmeye yetkiniz yok."));
        }

        // 3. Sil
        scheduleRepo.delete(schedule);

        return ResponseEntity.ok(Map.of("message", "Plan başarıyla silindi."));
    }
}