package com.plandecks.planner.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserEntity implements UserDetails { // Spring Security UserDetails implementasyonu
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password; // Hashlenmiş şifre

    @Column(name = "verification_code", length = 64)
    private String verificationCode;

    @Column(unique = true, nullable = false)
    private String email;

    private boolean enabled = false;

    @Column(name = "reset_password_token", length = 64)
    private String resetPasswordToken;

    // UserDetails Metodları
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() { return List.of(); } // Rol şimdilik boş

}