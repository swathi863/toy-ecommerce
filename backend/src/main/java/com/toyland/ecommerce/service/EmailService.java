```java
package com.toyland.ecommerce.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.concurrent.CompletableFuture;

@Service
public class EmailService {

    private static final Logger logger =
            LoggerFactory.getLogger(EmailService.class);

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Value("${brevo.api.key:}")
    private String brevoApiKey;


    public boolean sendPasswordResetEmail(
            String toEmail,
            String userName,
            String resetLink) {

        String subject = "Toyland - Reset Your Password";

        String displayName =
                (userName != null && !userName.trim().isEmpty())
                        ? userName.trim()
                        : "Valued Customer";

        String body = String.format(
                "Hi %s,\n\n" +
                "We received a request to reset the password for your Toyland account.\n\n" +
                "Click the link below to reset your password:\n\n" +
                "Reset Password: %s\n\n" +
                "This link will expire in 15 minutes for security reasons.\n\n" +
                "If you did not request a password reset, you can safely ignore this email. " +
                "Your password will remain unchanged.\n\n" +
                "If you have any questions, please contact Toyland Support.\n\n" +
                "Regards,\n" +
                "Toyland Team",
                displayName,
                resetLink
        );

        System.out.println("============================================================");
        System.out.println("PASSWORD RESET EMAIL");
        System.out.println("To: " + toEmail);
        System.out.println("============================================================");

        if (brevoApiKey == null || brevoApiKey.trim().isEmpty()) {
            System.err.println("❌ BREVO_API_KEY is not configured.");
            logger.error("BREVO_API_KEY is not configured.");
            return false;
        }

        if (fromEmail == null || fromEmail.trim().isEmpty()) {
            System.err.println("❌ MAIL_USERNAME is not configured.");
            logger.error("MAIL_USERNAME is not configured.");
            return false;
        }

        CompletableFuture.runAsync(() -> {

            boolean success = sendViaBrevoHttpApi(
                    brevoApiKey.trim(),
                    fromEmail.trim(),
                    toEmail.trim(),
                    displayName,
                    subject,
                    body
            );

            if (success) {
                System.out.println(
                        "✅ Password reset email sent successfully."
                );
            } else {
                System.err.println(
                        "❌ Password reset email could not be sent."
                );
            }
        });

        return true;
    }


    private boolean sendViaBrevoHttpApi(
            String apiKey,
            String from,
            String to,
            String recipientName,
            String subject,
            String bodyText) {

        try {

            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(10))
                    .build();

            String jsonPayload = String.format(
                    "{\"sender\":{\"name\":\"Toyland\",\"email\":\"%s\"}," +
                    "\"to\":[{\"email\":\"%s\",\"name\":\"%s\"}]," +
                    "\"subject\":\"%s\",\"textContent\":\"%s\"}",
                    escapeJson(from),
                    escapeJson(to),
                    escapeJson(recipientName),
                    escapeJson(subject),
                    escapeJson(bodyText)
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(
                            "https://api.brevo.com/v3/smtp/email"
                    ))
                    .timeout(Duration.ofSeconds(20))
                    .header("accept", "application/json")
                    .header("api-key", apiKey)
                    .header("content-type", "application/json")
                    .POST(
                            HttpRequest.BodyPublishers.ofString(
                                    jsonPayload
                            )
                    )
                    .build();

            HttpResponse<String> response =
                    client.send(
                            request,
                            HttpResponse.BodyHandlers.ofString()
                    );

            if (response.statusCode() >= 200
                    && response.statusCode() < 300) {

                System.out.println(
                        "✅ Successfully dispatched email via Brevo HTTPS API to "
                                + to
                );

                logger.info(
                        "Successfully dispatched email via Brevo HTTPS API to {}",
                        to
                );

                return true;
            }

            System.err.println(
                    "❌ Brevo HTTPS API Error Status ("
                            + response.statusCode()
                            + "): "
                            + response.body()
            );

            logger.error(
                    "Brevo HTTPS API Error Status ({}): {}",
                    response.statusCode(),
                    response.body()
            );

            return false;

        } catch (Exception e) {

            System.err.println(
                    "❌ Brevo HTTPS API Exception: "
                            + e.getMessage()
            );

            logger.error(
                    "Brevo HTTPS API Exception",
                    e
            );

            return false;
        }
    }


    private String escapeJson(String value) {

        if (value == null) {
            return "";
        }

        return value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }
}
```
