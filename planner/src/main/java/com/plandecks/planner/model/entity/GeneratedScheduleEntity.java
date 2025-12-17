package com.plandecks.planner.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GeneratedScheduleEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String scheduleName; // Örn: "2025 Güz Dönemi Taslak 1"
    
    private LocalDateTime createdAt;

    // @Lob // Büyük metin (Large Object)
    // @Column(length = 100000) // JSON büyük olabilir
    @Column(name = "schedule_json_data", columnDefinition = "TEXT", nullable = false)
    private String scheduleJsonData; // Oluşan JSON sonucunu string olarak saklarız

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;
}