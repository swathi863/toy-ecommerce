package com.toyland.ecommerce.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    public boolean sendPasswordResetEmail(String toEmail, String userName, String resetLink) {
        String subject = "🔑 Toyland - Reset Your Password";

        String displayName = (userName != null && !userName.trim().isEmpty()) ? userName.trim() : "Valued Customer";
        String body = String.format(

                "Hi %s,\n\n" +
                "We received a request to reset the password for your Toyland account.\n\n" +
                "Click the button below to reset your password:\n\n" +
                "Reset Password: %s\n\n" +
                "This link will expire in 15 minutes for security reasons.\n\n" +
                "If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.\n\n" +
                "If you have any questions, please contact Toyland Support.\n\n" +
                "Regards,\n" +
                "Toyland Team",
                displayName,
                resetLink
        );


        System.out.println("================================================================================");
        System.out.println("🔑 PASSWORD RESET EMAIL GENERATED FOR: " + toEmail);
        System.out.println("🔗 RESET LINK: " + resetLink);
        System.out.println("================================================================================");

        if (fromEmail == null || fromEmail.trim().isEmpty()) {
            System.err.println("⚠️ SMTP WARNING: MAIL_USERNAME environment variable is NOT set on Render. Email cannot be sent to inbox via SMTP.");
            logger.warn("⚠️ SMTP WARNING: spring.mail.username (MAIL_USERNAME) is not set. Cannot dispatch email via SMTP.");
            return false;
        }

        if (mailSender == null) {
            System.err.println("⚠️ SMTP WARNING: JavaMailSender is not initialized. Cannot dispatch email via SMTP.");
            logger.warn("⚠️ SMTP WARNING: JavaMailSender is not initialized. Cannot dispatch email via SMTP.");
            return false;
        }

        // Asynchronous email dispatch to prevent blocking the user's HTTP request thread
        CompletableFuture.runAsync(() -> {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromEmail.trim());
                message.setTo(toEmail.trim());
                message.setSubject(subject);
                message.setText(body);
                mailSender.send(message);
                System.out.println("✅ Successfully dispatched SMTP password reset email to " + toEmail);
                logger.info("✅ Successfully dispatched SMTP password reset email to {}", toEmail);
            } catch (Exception e) {
                System.err.println("❌ SMTP ERROR: Failed to send password reset email to " + toEmail + ". Error: " + e.getMessage());
                logger.error("❌ SMTP ERROR: Failed to send password reset email to {}. Error: {}", toEmail, e.getMessage(), e);
            }
        });

        return true;
    }
}



