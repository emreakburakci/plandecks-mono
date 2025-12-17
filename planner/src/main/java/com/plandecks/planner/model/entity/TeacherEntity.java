package com.plandecks.planner.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeacherEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String name;


    @ElementCollection(fetch = FetchType.EAGER)
    private List<String> subjects;

    // YENİ ALAN: Veritabanında String (JSON) olarak duracak
    @Column(columnDefinition = "TEXT") // Uzun metin olabilir
    private String availabilityJson;

    // YENİ EKLENEN KISIM: SAHİPLİK İLİŞKİSİ
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore // JSON'a çevirirken user detayını basmasın, sonsuz döngü olmasın
    private UserEntity user;

    // Frontend'den gelen boolean[][] verisini geçici olarak tutmak için (DB'ye kaydedilmez)
    @Transient
    private boolean[][] availabilityMatrix;
}