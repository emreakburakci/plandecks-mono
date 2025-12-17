package com.plandecks.planner.controller;

import com.plandecks.planner.model.entity.RoomEntity;
import com.plandecks.planner.model.entity.UserEntity;
import com.plandecks.planner.repository.RoomRepository;
import com.plandecks.planner.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/rooms")
@RequiredArgsConstructor
@CrossOrigin
public class RoomController {

    private final RoomRepository roomRepo;
    private final UserRepository userRepo;

    private UserEntity getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepo.findByUsername(username).orElseThrow();
    }

    @GetMapping
    public ResponseEntity<List<RoomEntity>> getAll() {
        return ResponseEntity.ok(roomRepo.findAllByUserId(getCurrentUser().getId()));
    }

    @PostMapping
    public ResponseEntity<RoomEntity> create(@RequestBody RoomEntity room) {
        room.setUser(getCurrentUser());
        room.setId(null);
        return ResponseEntity.ok(roomRepo.save(room));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        RoomEntity existing = roomRepo.findById(id).orElseThrow();
        if (!existing.getUser().getId().equals(getCurrentUser().getId())) return ResponseEntity.status(403).build();
        roomRepo.delete(existing);
        return ResponseEntity.ok().build();
    }
}