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

    @Value("${spring.mail.username:${SPRING_MAIL_USERNAME:${MAIL_USERNAME:desaswathi@gmail.com}}}")
    private String fromEmail;

    @Value("${spring.mail.password:${SPRING_MAIL_PASSWORD:${MAIL_PASSWORD:}}}")
    private String mailPassword;

    @Value("${brevo.api.key:${BREVO_API_KEY:}}")
    private String brevoApiKey;

    public boolean sendPasswordResetEmail(String toEmail, String userName, String resetLink) {
        String subject = "🔑 Toyland - Reset Your Password";
        String displayName = (userName != null && !userName.trim().isEmpty()) ? userName.trim() : "Valued Customer";

        String textBody = String.format(
                "Hi %s,\n\n" +
                "We received a request to reset the password for your Toyland account.\n\n" +
                "Click the link below to reset your password:\n\n" +
                "Reset Password: %s\n\n" +
                "This link will expire in 15 minutes for security reasons.\n\n" +
                "If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.\n\n" +
                "If you have any questions, please contact Toyland Support.\n\n" +
                "Regards,\n" +
                "Toyland Team",
                displayName,
                resetLink
        );

        String htmlBody = String.format(
                "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;\">" +
                "  <div style=\"text-align: center; margin-bottom: 20px;\">" +
                "    <h1 style=\"color: #4f46e5; margin: 0; font-size: 24px;\">🧸 Toyland</h1>" +
                "  </div>" +
                "  <h2 style=\"color: #1e293b; font-size: 20px; margin-top: 0;\">Reset Your Password</h2>" +
                "  <p style=\"color: #475569; font-size: 15px; line-height: 1.6;\">Hi <strong>%s</strong>,</p>" +
                "  <p style=\"color: #475569; font-size: 15px; line-height: 1.6;\">We received a request to reset the password for your Toyland account.</p>" +
                "  <div style=\"text-align: center; margin: 30px 0;\">" +
                "    <a href=\"%s\" style=\"background-color: #4f46e5; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);\">Reset Password</a>" +
                "  </div>" +
                "  <p style=\"color: #64748b; font-size: 14px; line-height: 1.5;\">Or copy and paste this link into your browser:<br/><a href=\"%s\" style=\"color: #4f46e5; word-break: break-all;\">%s</a></p>" +
                "  <p style=\"color: #64748b; font-size: 13px; line-height: 1.5; margin-top: 20px;\">⏱️ This link will expire in <strong>15 minutes</strong> for security reasons.</p>" +
                "  <p style=\"color: #94a3b8; font-size: 13px; line-height: 1.5;\">If you did not request a password reset, please ignore this email. Your password will remain unchanged.</p>" +
                "  <hr style=\"border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;\" />" +
                "  <p style=\"color: #94a3b8; font-size: 12px; text-align: center; margin: 0;\">Regards,<br/><strong>The Toyland Team</strong></p>" +
                "</div>",
                displayName,
                resetLink,
                resetLink,
                resetLink
        );

        System.out.println("================================================================================");
        System.out.println("🔑 PASSWORD RESET EMAIL GENERATED FOR: " + toEmail);
        System.out.println("🔗 RESET LINK: " + resetLink);
        System.out.println("================================================================================");
        logger.info("🔑 PASSWORD RESET EMAIL GENERATED FOR: {}", toEmail);

        // Determine active Brevo API Key
        String activeApiKey = "";
        if (brevoApiKey != null && !brevoApiKey.trim().isEmpty()) {
            activeApiKey = brevoApiKey.trim();
        } else if (mailPassword != null && !mailPassword.trim().isEmpty()) {
            String cleanPass = mailPassword.trim();
            if (cleanPass.startsWith("xkeysib") || cleanPass.startsWith("xsmtpsib") || cleanPass.length() > 25) {
                activeApiKey = cleanPass;
            }
        }

        String senderEmail = (fromEmail != null && !fromEmail.trim().isEmpty()) ? fromEmail.trim() : "desaswathi@gmail.com";
        final String finalApiKey = activeApiKey;

        // Execute email dispatch asynchronously
        CompletableFuture.runAsync(() -> {
            boolean dispatched = false;

            // Priority 1: Brevo REST API via HTTPS (Port 443 - 100% Reliable on Render)
            if (!finalApiKey.isEmpty()) {
                dispatched = sendViaBrevoHttpApi(finalApiKey, senderEmail, toEmail.trim(), displayName, subject, textBody, htmlBody);
            }

            // Priority 2: JavaMailSender / Brevo SMTP Relay Fallback
            if (!dispatched && mailSender != null) {
                try {
                    SimpleMailMessage message = new SimpleMailMessage();
                    message.setFrom(senderEmail);
                    message.setTo(toEmail.trim());
                    message.setSubject(subject);
                    message.setText(textBody);
                    mailSender.send(message);
                    System.out.println("✅ Successfully dispatched email via SMTP to " + toEmail);
                    logger.info("✅ Successfully dispatched email via SMTP to {}", toEmail);
                    dispatched = true;
                } catch (Exception e) {
                    System.err.println("❌ SMTP Dispatch Error for " + toEmail + ": " + e.getMessage());
                    logger.error("❌ SMTP Dispatch Error for {}: {}", toEmail, e.getMessage(), e);
                }
            }

            if (!dispatched && finalApiKey.isEmpty()) {
                System.err.println("⚠️ EMAIL WARNING: Neither BREVO_API_KEY nor JavaMailSender SMTP succeeded. Reset link logged above.");
            }
        });

        return true;
    }

    private boolean sendViaBrevoHttpApi(String apiKey, String from, String to, String recipientName, String subject, String textBody, String htmlBody) {
        try {
            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(10))
                    .build();

            String jsonPayload = String.format(
                "{\"sender\":{\"name\":\"Toyland\",\"email\":\"%s\"}," +
                "\"to\":[{\"email\":\"%s\",\"name\":\"%s\"}]," +
                "\"subject\":\"%s\"," +
                "\"textContent\":\"%s\"," +
                "\"htmlContent\":\"%s\"}",
                escapeJsonString(from),
                escapeJsonString(to),
                escapeJsonString(recipientName),
                escapeJsonString(subject),
                escapeJsonString(textBody),
                escapeJsonString(htmlBody)
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
                System.err.println("❌ Brevo HTTPS API Error (" + response.statusCode() + "): " + response.body());
                logger.error("❌ Brevo HTTPS API Error ({}): {}", response.statusCode(), response.body());
                return false;
            }
        } catch (Exception e) {
            System.err.println("❌ Brevo HTTPS API Exception: " + e.getMessage());
            logger.error("❌ Brevo HTTPS API Exception: {}", e.getMessage(), e);
            return false;
        }
    }

    private String escapeJsonString(String input) {
        if (input == null) return "";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < input.length(); i++) {
            char ch = input.charAt(i);
            switch (ch) {
                case '"': sb.append("\\\""); break;
                case '\\': sb.append("\\\\"); break;
                case '\b': sb.append("\\b"); break;
                case '\f': sb.append("\\f"); break;
                case '\n': sb.append("\\n"); break;
                case '\r': sb.append("\\r"); break;
                case '\t': sb.append("\\t"); break;
                default:
                    if (ch <= 0x1F) {
                        sb.append(String.format("\\u%04x", (int) ch));
                    } else {
                        sb.append(ch);
                    }
            }
        }
        return sb.toString();
    }
}