package com.plandecks.planner.controller;

import com.plandecks.planner.model.dto.AuthenticationRequest;
import com.plandecks.planner.model.dto.AuthenticationResponse;
import com.plandecks.planner.model.dto.RegisterRequest;
import com.plandecks.planner.model.response.AuthResponse;
import com.plandecks.planner.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;


// AuthController.java
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService service;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        service.register(request.getUsername(), request.getEmail(), request.getPassword());
        return ResponseEntity.ok("Kayıt başarılı! Lütfen mailinizi kontrol edin.");
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verify(@RequestParam String code) {
        String token = service.verifyUser(code);
        return ResponseEntity.ok(new AuthResponse(token)); // Token'ı Frontend'e dönüyoruz
    }

    @PostMapping("/authenticate")
    public ResponseEntity<?> authenticate(@RequestBody AuthenticationRequest request) {
        try {
            return ResponseEntity.ok(service.authenticate(request));
        } catch (DisabledException e) {
            // HESAP AKTİF DEĞİLSE BURAYA DÜŞER
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Hesabınız henüz aktif edilmemiş. Lütfen e-postanızı kontrol edin."));
        } catch (BadCredentialsException e) {
            // ŞİFRE YANLIŞSA BURAYA DÜŞER
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Kullanıcı adı veya şifre hatalı."));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Giriş yapılırken bir hata oluştu."));
        }
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerification(@RequestParam String username) {
        service.resendVerificationCode(username);
        return ResponseEntity.ok(Map.of("message", "Aktivasyon linki tekrar gönderildi. Lütfen e-postanızı (veya konsolu) kontrol edin."));
    }


    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam String email) {
        service.forgotPassword(email);
        return ResponseEntity.ok(Map.of("message", "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        String newPassword = body.get("password");
        service.resetPassword(token, newPassword);
        return ResponseEntity.ok(Map.of("message", "Şifreniz başarıyla güncellendi. Giriş yapabilirsiniz."));
    }
}

