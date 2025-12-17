package com.plandecks.planner.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data // Getter-Setter-ToString otomatiği (Lombok yoksa elle yaz)
@NoArgsConstructor
@AllArgsConstructor
public class StudentGroupEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String name;
    private int size;
    // YENİ EKLENEN KISIM: SAHİPLİK İLİŞKİSİ
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore // JSON'a çevirirken user detayını basmasın, sonsuz döngü olmasın
    private UserEntity user;

    // --- YENİ İLİŞKİ: Bu grubun aldığı dersler ---
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "group_courses",
            joinColumns = @JoinColumn(name = "group_id"),
            inverseJoinColumns = @JoinColumn(name = "course_id")
    )
    private List<CourseEntity> courses = new ArrayList<>();
}