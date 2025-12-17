package com.plandecks.planner.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.plandecks.planner.model.entity.TeacherEntity;
import com.plandecks.planner.model.entity.UserEntity;
import com.plandecks.planner.repository.TeacherRepository;
import com.plandecks.planner.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import tools.jackson.databind.ObjectMapper;

import java.util.List;

@RestController
@RequestMapping("/api/v1/teachers")
@RequiredArgsConstructor
@CrossOrigin
public class TeacherController {

    private final TeacherRepository teacherRepo;
    private final UserRepository userRepo;
    private final ObjectMapper objectMapper;

    // Helper: Giriş yapmış kullanıcıyı bul
    private UserEntity getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // LISTELE (Sadece kendi öğretmenleri)
    @GetMapping
    public ResponseEntity<List<TeacherEntity>> getAll() {
        return ResponseEntity.ok(teacherRepo.findAllByUserId(getCurrentUser().getId()));
    }

    @PostMapping
    public ResponseEntity<TeacherEntity> create(@RequestBody TeacherEntity teacher) {
        teacher.setUser(getCurrentUser());
        teacher.setId(null);

        // Matrix geldiyse JSON String'e çevirip kaydet
        if (teacher.getAvailabilityMatrix() != null) {
            String json = objectMapper.writeValueAsString(teacher.getAvailabilityMatrix());
            teacher.setAvailabilityJson(json);
        }

        return ResponseEntity.ok(teacherRepo.save(teacher));
    }

    // 1. TEK ÖĞRETMEN GETİR (Detay Sayfası İçin)
    @GetMapping("/{id}")
    public ResponseEntity<TeacherEntity> getTeacherById(@PathVariable Integer id) {
        TeacherEntity teacher = teacherRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Öğretmen bulunamadı"));

        // Güvenlik: Sadece kendi kullanıcısının öğretmenini görebilir
        if (!teacher.getUser().getId().equals(getCurrentUser().getId())) {
            return ResponseEntity.status(403).build();
        }

        // DB'deki JSON String'i -> Boolean Matris'e çevirip gönderelim
        if (teacher.getAvailabilityJson() != null) {
            boolean[][] matrix = objectMapper.readValue(teacher.getAvailabilityJson(), boolean[][].class);
            teacher.setAvailabilityMatrix(matrix); // Transient alana set et
        }

        return ResponseEntity.ok(teacher);
    }

    // 2. ÖĞRETMEN GÜNCELLE
    @PutMapping("/{id}")
    public ResponseEntity<TeacherEntity> updateTeacher(@PathVariable Integer id, @RequestBody TeacherEntity request) {
        TeacherEntity teacher = teacherRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Öğretmen bulunamadı"));

        if (!teacher.getUser().getId().equals(getCurrentUser().getId())) {
            return ResponseEntity.status(403).build();
        }

        // Bilgileri güncelle
        teacher.setName(request.getName());
        teacher.setSubjects(request.getSubjects());

        // Matris geldiyse JSON'a çevirip kaydet
        if (request.getAvailabilityMatrix() != null) {
            String json = objectMapper.writeValueAsString(request.getAvailabilityMatrix());
            teacher.setAvailabilityJson(json);
        }

        return ResponseEntity.ok(teacherRepo.save(teacher));
    }

    // SİL
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        UserEntity currentUser = getCurrentUser();
        TeacherEntity existing = teacherRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Kayıt bulunamadı"));

        // GÜVENLİK KONTROLÜ
        if (!existing.getUser().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(403).build();
        }

        teacherRepo.delete(existing);
        return ResponseEntity.ok().build();
    }
}