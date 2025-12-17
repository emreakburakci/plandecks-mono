package com.plandecks.planner.controller;

import com.plandecks.planner.model.entity.CourseEntity;
import com.plandecks.planner.model.entity.StudentGroupEntity;
import com.plandecks.planner.model.entity.UserEntity;
import com.plandecks.planner.model.request.StudentGroupRequest;
import com.plandecks.planner.repository.CourseRepository;
import com.plandecks.planner.repository.StudentGroupRepository;
import com.plandecks.planner.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/groups")
@RequiredArgsConstructor
@CrossOrigin
public class GroupController {

    private final StudentGroupRepository groupRepo;
    private final UserRepository userRepo;
    private final CourseRepository courseRepo;

    private UserEntity getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepo.findByUsername(username).orElseThrow();
    }

    @GetMapping
    public ResponseEntity<List<StudentGroupEntity>> getAll() {
        return ResponseEntity.ok(groupRepo.findAllByUserId(getCurrentUser().getId()));
    }

    @PostMapping
    public ResponseEntity<StudentGroupEntity> create(@RequestBody StudentGroupRequest request) { // DTO kullanmak daha temiz
        // Basitlik için RequestBody'i Map veya özel bir DTO alabilirsin.
        // Biz burada manuel mapping örneği yapalım:

        StudentGroupEntity group = new StudentGroupEntity();
        group.setName(request.name());
        group.setSize(request.size());
        group.setUser(getCurrentUser());

        // Gelen Ders ID'lerini bul ve ekle
        if (request.courseIds() != null && !request.courseIds().isEmpty()) {
            List<CourseEntity> selectedCourses = courseRepo.findAllById(request.courseIds());
            group.setCourses(selectedCourses);
        }

        return ResponseEntity.ok(groupRepo.save(group));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudentGroupEntity> update(@PathVariable Integer id, @RequestBody StudentGroupRequest request) {
        StudentGroupEntity existing = groupRepo.findById(id).orElseThrow();
        if (!existing.getUser().getId().equals(getCurrentUser().getId())) return ResponseEntity.status(403).build();

        existing.setName(request.name());
        existing.setSize(request.size());

        // Gelen Ders ID'lerini bul ve güncelle
        if (request.courseIds() != null) {
            List<CourseEntity> selectedCourses = courseRepo.findAllById(request.courseIds());
            existing.setCourses(selectedCourses);
        } else {
            existing.getCourses().clear();
        }

        return ResponseEntity.ok(groupRepo.save(existing));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        StudentGroupEntity existing = groupRepo.findById(id).orElseThrow();
        if (!existing.getUser().getId().equals(getCurrentUser().getId())) return ResponseEntity.status(403).build();
        groupRepo.delete(existing);
        return ResponseEntity.ok().build();
    }
}