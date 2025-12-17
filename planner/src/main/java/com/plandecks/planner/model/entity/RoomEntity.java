package com.plandecks.planner.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String name;
    private String type;
    private int capacity;
    // Odanın sahip olduğu özellikler (Örn: "Projector", "Lab", "Whiteboard")
    @ElementCollection(fetch = FetchType.EAGER)
    private List<String> features;
    // YENİ EKLENEN KISIM: SAHİPLİK İLİŞKİSİ
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore // JSON'a çevirirken user detayını basmasın, sonsuz döngü olmasın
    private UserEntity user;
}