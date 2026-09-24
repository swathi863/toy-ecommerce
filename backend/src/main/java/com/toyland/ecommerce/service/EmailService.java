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

@Service
public class EmailService {

    private static final Logger logger =
            LoggerFactory.getLogger(EmailService.class);

    @Value("${spring.mail.username:${SPRING_MAIL_USERNAME:desaswathi@gmail.com}}")
    private String fromEmail;

    @Value("${brevo.api.key:${BREVO_API_KEY:}}")
    private String brevoApiKey;

    public boolean sendPasswordResetEmail(
            String toEmail,
            String userName,
            String resetLink) {

        String subject = "🔑 Toyland - Reset Your Password";

        String displayName =
                (userName != null && !userName.trim().isEmpty())
                        ? userName.trim()
                        : "Valued Customer";

        String textBody = String.format(
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

        String htmlBody = String.format(
                "<div style=\"font-family:Arial,sans-serif;max-width:600px;" +
                "margin:0 auto;padding:24px;border:1px solid #e2e8f0;" +
                "border-radius:12px;background-color:#ffffff;\">" +

                "<div style=\"text-align:center;margin-bottom:20px;\">" +
                "<h1 style=\"color:#4f46e5;margin:0;font-size:24px;\">" +
                "🧸 Toyland</h1>" +
                "</div>" +

                "<h2 style=\"color:#1e293b;font-size:20px;margin-top:0;\">" +
                "Reset Your Password</h2>" +

                "<p style=\"color:#475569;font-size:15px;line-height:1.6;\">" +
                "Hi <strong>%s</strong>,</p>" +

                "<p style=\"color:#475569;font-size:15px;line-height:1.6;\">" +
                "We received a request to reset the password for your Toyland account." +
                "</p>" +

                "<div style=\"text-align:center;margin:30px 0;\">" +
                "<a href=\"%s\" " +
                "style=\"background-color:#4f46e5;color:#ffffff;" +
                "padding:14px 28px;text-decoration:none;border-radius:8px;" +
                "font-weight:bold;font-size:16px;display:inline-block;\">" +
                "Reset Password</a>" +
                "</div>" +

                "<p style=\"color:#64748b;font-size:14px;line-height:1.5;\">" +
                "Or copy and paste this link into your browser:<br/>" +
                "<a href=\"%s\" style=\"color:#4f46e5;word-break:break-all;\">" +
                "%s</a></p>" +

                "<p style=\"color:#64748b;font-size:13px;line-height:1.5;" +
                "margin-top:20px;\">" +
                "⏱️ This link will expire in <strong>15 minutes</strong> " +
                "for security reasons.</p>" +

                "<p style=\"color:#94a3b8;font-size:13px;line-height:1.5;\">" +
                "If you did not request a password reset, please ignore this email. " +
                "Your password will remain unchanged.</p>" +

                "<hr style=\"border:none;border-top:1px solid #f1f5f9;" +
                "margin:24px 0;\" />" +

                "<p style=\"color:#94a3b8;font-size:12px;text-align:center;" +
                "margin:0;\">" +
                "Regards,<br/><strong>The Toyland Team</strong></p>" +

                "</div>",

                displayName,
                resetLink,
                resetLink,
                resetLink
        );

        System.out.println("============================================================");
        System.out.println("🔑 PASSWORD RESET EMAIL");
        System.out.println("📧 TO: " + toEmail);
        System.out.println("🔗 RESET LINK: " + resetLink);
        System.out.println("============================================================");

        logger.info(
                "Password reset email requested for {}",
                toEmail
        );

        /*
         * Brevo API is the ONLY email delivery method.
         *
         * No SMTP fallback is used.
         *
         * This prevents a second email from being sent when
         * the Brevo request has already been accepted but the
         * response is delayed/lost.
         */

        if (brevoApiKey == null || brevoApiKey.trim().isEmpty()) {

            logger.error("BREVO_API_KEY is not configured.");

            System.err.println(
                    "❌ BREVO_API_KEY is missing."
            );

            return false;
        }

        String senderEmail =
                (fromEmail != null && !fromEmail.trim().isEmpty())
                        ? fromEmail.trim()
                        : "desaswathi@gmail.com";

        return sendViaBrevoHttpApi(
                brevoApiKey.trim(),
                senderEmail,
                toEmail.trim(),
                displayName,
                subject,
                textBody,
                htmlBody
        );
    }

    private boolean sendViaBrevoHttpApi(
            String apiKey,
            String from,
            String to,
            String recipientName,
            String subject,
            String textBody,
            String htmlBody) {

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
                    .uri(URI.create(
                            "https://api.brevo.com/v3/smtp/email"
                    ))
                    .header("accept", "application/json")
                    .header("api-key", apiKey)
                    .header("content-type", "application/json")
                    .POST(
                            HttpRequest.BodyPublishers
                                    .ofString(jsonPayload)
                    )
                    .build();

            HttpResponse<String> response =
                    client.send(
                            request,
                            HttpResponse.BodyHandlers.ofString()
                    );

            int statusCode = response.statusCode();

            if (statusCode >= 200 && statusCode < 300) {

                System.out.println(
                        "✅ Password reset email sent via Brevo to "
                                + to
                );

                logger.info(
                        "Password reset email successfully sent via Brevo to {}",
                        to
                );

                return true;
            }

            System.err.println(
                    "❌ Brevo API Error: HTTP "
                            + statusCode
                            + " - "
                            + response.body()
            );

            logger.error(
                    "Brevo API Error: HTTP {} - {}",
                    statusCode,
                    response.body()
            );

            return false;

        } catch (Exception e) {

            System.err.println(
                    "❌ Brevo API Exception: "
                            + e.getMessage()
            );

            logger.error(
                    "Brevo API Exception while sending email",
                    e
            );

            return false;
        }
    }

    private String escapeJsonString(String input) {

        if (input == null) {
            return "";
        }

        StringBuilder sb = new StringBuilder();

        for (int i = 0; i < input.length(); i++) {

            char ch = input.charAt(i);

            switch (ch) {

                case '"':
                    sb.append("\\\"");
                    break;

                case '\\':
                    sb.append("\\\\");
                    break;

                case '\b':
                    sb.append("\\b");
                    break;

                case '\f':
                    sb.append("\\f");
                    break;

                case '\n':
                    sb.append("\\n");
                    break;

                case '\r':
                    sb.append("\\r");
                    break;

                case '\t':
                    sb.append("\\t");
                    break;

                default:

                    if (ch <= 0x1F) {
                        sb.append(
                                String.format(
                                        "\\u%04x",
                                        (int) ch
                                )
                        );
                    } else {
                        sb.append(ch);
                    }
            }
        }

        return sb.toString();
    }
}