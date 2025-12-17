package com.plandecks.planner.service;

import com.plandecks.planner.model.dto.AuthenticationRequest;
import com.plandecks.planner.model.dto.AuthenticationResponse;
import com.plandecks.planner.model.entity.UserEntity;
import com.plandecks.planner.repository.UserRepository;
import com.plandecks.planner.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepo;
    private final JavaMailSender mailSender;

    @Value("${app.frontend.url}")
    private String frontendUrlValue;

    public void register(String username, String email, String password) {
        // Kullanıcı adı kontrolü
        if(userRepo.findByUsername(username).isPresent()) {
            throw new RuntimeException("Bu kullanıcı adı zaten alınmış.");
        }

        // Email Kontrolü (İsteğinize özel mantık)
        Optional<UserEntity> existingUserByEmail = userRepo.findByEmail(email);
        if (existingUserByEmail.isPresent()) {
            // Kullanıcıya zaten kayıtlı olduğuna dair bilgi maili at
            sendAccountExistsEmail(existingUserByEmail.get());
            // Frontend'e hata dön ki kullanıcı mailini kontrol etsin
            throw new RuntimeException("Bu e-posta adresi ile kayıtlı bir kullanıcı zaten var. Bilgileriniz e-posta adresinize gönderildi.");
        }

        UserEntity user = new UserEntity();
        user.setUsername(username);
        user.setEmail(email); // UserEntity'de email alanı yoksa ekleyin!
        user.setPassword(passwordEncoder.encode(password));
        user.setVerificationCode(UUID.randomUUID().toString());
        user.setEnabled(false); // Mail onayı lazım

        userRepo.save(user);

        sendVerificationEmail(user);
    }

    // --- YENİ: HESAP VAR BİLGİLENDİRME MAİLİ ---
    private void sendAccountExistsEmail(UserEntity user) {
        String subject = "PlanDecks - Kayıt Denemesi Hakkında";
        String content = "Merhaba,\n\n"
                + "E-posta adresinizle yeni bir kayıt işlemi denendi.\n"
                + "Bu e-posta adresi sistemimizde zaten kayıtlıdır.\n\n"
                + "Kullanıcı Adınız: " + user.getUsername() + "\n\n"
                + "Eğer şifrenizi unuttuysanız giriş sayfasından şifremi unuttum butonuna tıklayabilirsiniz.\n";
        sendEmail(user.getEmail(), subject, content);
    }

    // --- YENİ: ŞİFRE SIFIRLAMA İSTEĞİ (LİNK GÖNDERME) ---
    public void forgotPassword(String email) {
        UserEntity user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı."));

        // Token oluştur ve kaydet
        String token = UUID.randomUUID().toString();
        user.setResetPasswordToken(token);
        userRepo.save(user);

        String frontendUrl = "frontendUrlValue"; // frontendUrlValue

        // Mail gönder
        String link = frontendUrl + "/reset-password?token=" + token;
        System.out.println(link);
        String subject = "PlanDecks - Şifre Sıfırlama İsteği";
        String content = "Merhaba " + user.getUsername() + ",\n\n"
                + "Şifrenizi sıfırlamak için aşağıdaki linke tıklayın:\n"
                + link + "\n\n"
                + "Bu işlemi siz yapmadıysanız bu maili görmezden gelin.";

        sendEmail(user.getEmail(), subject, content);
    }

    // --- YENİ: ŞİFREYİ GÜNCELLEME ---
    public void resetPassword(String token, String newPassword) {
        UserEntity user = userRepo.findByResetPasswordToken(token)
                .orElseThrow(() -> new RuntimeException("Geçersiz veya süresi dolmuş bağlantı."));

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetPasswordToken(null); // Token'ı kullanıldı olarak işaretle (sil)
        userRepo.save(user);
    }

    // Yardımcı Mail Metodu (Kod tekrarını önlemek için)
    private void sendEmail(String to, String subject, String content) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("senin.mailin@gmail.com");
            message.setTo(to);
            message.setSubject(subject);
            message.setText(content);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Mail hatası: " + e.getMessage());
        }
    }

    private void sendVerificationEmail(UserEntity user) {
        String link = frontendUrlValue + "/verify?code=" + user.getVerificationCode();
        System.out.println("🔗 Aktivasyon Linki: " + link); // Konsola da yazdır
        String toAddress = user.getEmail(); // UserEntity'de email alanı olduğundan emin olun
        String subject = "PlanDecks - Hesap Aktivasyonu";
        String content = "Merhaba " + user.getUsername() + ",\n\n"
                + "Hesabınızı aktif etmek için lütfen aşağıdaki linke tıklayın:\n"
                + link + "\n\n"
                + "Teşekkürler,\nPlanDecks Ekibi";

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("plandecks@gmail.com"); // Gönderen (Zorunlu değil ama iyi olur)
            message.setTo(toAddress);
            message.setSubject(subject);
            message.setText(content);

            mailSender.send(message);

            System.out.println("✅ Mail başarıyla gönderildi: " + toAddress);
        } catch (Exception e) {
            System.err.println("❌ Mail gönderilirken hata oluştu: " + e.getMessage());
            // İsterseniz burada exception fırlatıp kullanıcıya "Mail gönderilemedi" diyebilirsiniz.
        }
    }

    public void resendVerificationCode(String username) {
        UserEntity user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı."));

        if (user.isEnabled()) {
            throw new RuntimeException("Bu hesap zaten aktif.");
        }

        // Yeni kod üret (Eskisini geçersiz kılmak güvenlik için iyidir)
        user.setVerificationCode(UUID.randomUUID().toString());
        userRepo.save(user);

        sendVerificationEmail(user);
    }

    public String verifyUser(String code) {
        UserEntity user = userRepo.findByVerificationCode(code)
                .orElseThrow(() -> new RuntimeException("Geçersiz kod"));

        if (user.isEnabled()) return null; // Zaten aktif

        user.setEnabled(true);
        user.setVerificationCode(null);
        userRepo.save(user);

        // Otomatik Login için Token üret
        return jwtService.generateToken(user.getUsername());
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        // Spring Security'nin kendi authentication mekanizmasını tetikle
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );
        
        // Eğer hata fırlatmazsa giriş başarılıdır
        var user = repository.findByUsername(request.getUsername())
                .orElseThrow();
        
        var jwtToken = jwtService.generateToken(user.getUsername());
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .build();
    }
}