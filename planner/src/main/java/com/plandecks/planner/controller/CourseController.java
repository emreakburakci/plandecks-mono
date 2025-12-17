package com.plandecks.planner.controller;

import com.plandecks.planner.model.entity.CourseEntity;
import com.plandecks.planner.model.entity.StudentGroupEntity;
import com.plandecks.planner.model.entity.UserEntity;
import com.plandecks.planner.repository.CourseRepository;
import com.plandecks.planner.repository.StudentGroupRepository;
import com.plandecks.planner.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/courses")
@RequiredArgsConstructor
@CrossOrigin
public class CourseController {

    private final CourseRepository courseRepo;
    private final UserRepository userRepo;
    private final StudentGroupRepository groupRepo;

    private UserEntity getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepo.findByUsername(username).orElseThrow();
    }

    @GetMapping
    public ResponseEntity<List<CourseEntity>> getAll() {
        return ResponseEntity.ok(courseRepo.findAllByUserId(getCurrentUser().getId()));
    }

    @PostMapping
    public ResponseEntity<CourseEntity> create(@RequestBody CourseEntity course) {
        course.setUser(getCurrentUser());
        course.setId(null);
        return ResponseEntity.ok(courseRepo.save(course));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        // 1. Bu dersi kullanan grupları bul
        List<String> usedByGroups = groupRepo.findAll().stream()
                .filter(g -> g.getCourses().stream().anyMatch(c -> c.getId().equals(id)))
                .map(StudentGroupEntity::getName) // Sadece isimleri al
                .toList();

        // 2. Eğer liste doluysa, silme! 409 Conflict döndür ve listeyi yolla.
        if (!usedByGroups.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "message", "Bu ders bazı sınıflar tarafından kullanılıyor.",
                            "dependencies", usedByGroups
                    ));
        }

        // 3. Sorun yoksa sil
        courseRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
    
    // Update metodu TeacherController ile benzer mantıkta eklenebilir.
}