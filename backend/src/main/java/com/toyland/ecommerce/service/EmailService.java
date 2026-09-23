package com.toyland.ecommerce.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.concurrent.CompletableFuture;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:${SPRING_MAIL_USERNAME:${MAIL_USERNAME:}}}")
    private String fromEmail;

    @Value("${spring.mail.password:${SPRING_MAIL_PASSWORD:${MAIL_PASSWORD:}}}")
    private String mailPassword;

    @Value("${brevo.api.key:${BREVO_API_KEY:}}")
    private String brevoApiKey;


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

        String activeApiKey = (brevoApiKey != null && !brevoApiKey.trim().isEmpty()) 
                ? brevoApiKey.trim() 
                : (mailPassword != null && (mailPassword.startsWith("xkeysib") || mailPassword.startsWith("xsmtpsib")) ? mailPassword.trim() : "");

        if (fromEmail == null || fromEmail.trim().isEmpty()) {
            System.err.println("⚠️ EMAIL WARNING: MAIL_USERNAME environment variable is NOT set on Render. Cannot dispatch email.");
            logger.warn("⚠️ EMAIL WARNING: MAIL_USERNAME is not set.");
            return false;
        }

        // Asynchronous email dispatch to prevent blocking the user's HTTP request thread
        CompletableFuture.runAsync(() -> {
            // Priority 1: Brevo REST API (HTTPS Port 443 - 100% Reliable on Render)
            if (!activeApiKey.isEmpty()) {
                boolean apiSuccess = sendViaBrevoHttpApi(activeApiKey, fromEmail.trim(), toEmail.trim(), displayName, subject, body);
                if (apiSuccess) return;
                System.out.println("⚠️ Brevo HTTP API dispatch failed. Attempting SMTP relay fallback...");
            }

            // Priority 2: Brevo / JavaMailSender SMTP Relay
            if (mailSender != null) {
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
            } else {
                System.err.println("⚠️ SMTP WARNING: JavaMailSender is not initialized.");
            }
        });

        return true;
    }

    private boolean sendViaBrevoHttpApi(String apiKey, String from, String to, String recipientName, String subject, String bodyText) {
        try {
            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(10))
                    .build();

            // Sanitize JSON text content
            String sanitizedBody = bodyText.replace("\\", "\\\\")
                    .replace("\"", "\\\"")
                    .replace("\n", "\\n")
                    .replace("\r", "\\r")
                    .replace("\t", "\\t");

            String jsonPayload = String.format(
                "{\"sender\":{\"name\":\"Toyland\",\"email\":\"%s\"},\"to\":[{\"email\":\"%s\",\"name\":\"%s\"}],\"subject\":\"%s\",\"textContent\":\"%s\"}",
                from,
                to,
                recipientName.replace("\"", "\\\""),
                subject.replace("\"", "\\\""),
                sanitizedBody
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                    .header("accept", "application/json")
                    .header("api-key", apiKey)
                    .header("content-type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                System.out.println("✅ Successfully dispatched email via Brevo HTTPS API to " + to);
                logger.info("✅ Successfully dispatched email via Brevo HTTPS API to {}", to);
                return true;
            } else {
                System.err.println("❌ Brevo HTTPS API Error Status (" + response.statusCode() + "): " + response.body());
                logger.error("❌ Brevo HTTPS API Error Status ({}): {}", response.statusCode(), response.body());
                return false;
            }
        } catch (Exception e) {
            System.err.println("❌ Brevo HTTPS API Exception: " + e.getMessage());
            logger.error("❌ Brevo HTTPS API Exception: {}", e.getMessage(), e);
            return false;
        }
    }
}
