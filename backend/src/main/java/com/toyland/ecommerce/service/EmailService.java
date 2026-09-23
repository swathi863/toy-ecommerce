package com.toyland.ecommerce.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    public boolean sendPasswordResetEmail(String toEmail, String userName, String resetLink) {
        String subject = "🔑 Toyland - Reset Your Password";
        String body = String.format(
                "Hello %s,\n\n" +
                "You requested a password reset for your Toyland account.\n\n" +
                "Click the link below to reset your password:\n" +
                "%s\n\n" +
                "This reset link is valid for 30 minutes.\n" +
                "If you did not request a password reset, please ignore this email.\n\n" +
                "Best regards,\n" +
                "The Toyland Team",
                userName != null ? userName : "Valued Customer",
                resetLink
        );

        logger.info("================================================================================");
        logger.info("🔑 PASSWORD RESET EMAIL GENERATED FOR: {}", toEmail);
        logger.info("🔗 RESET LINK: {}", resetLink);
        logger.info("================================================================================");

        if (fromEmail == null || fromEmail.trim().isEmpty()) {
            logger.warn("⚠️ SMTP WARNING: spring.mail.username (MAIL_USERNAME) is not set. Cannot dispatch email via SMTP.");
            return false;
        }

        if (mailSender == null) {
            logger.warn("⚠️ SMTP WARNING: JavaMailSender is not initialized. Cannot dispatch email via SMTP.");
            return false;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail.trim());
            message.setTo(toEmail.trim());
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            logger.info("✅ Successfully dispatched SMTP password reset email to {}", toEmail);
            return true;
        } catch (Exception e) {
            logger.error("❌ SMTP ERROR: Failed to send password reset email to {}. Error: {}", toEmail, e.getMessage(), e);
            return false;
        }
    }
}

