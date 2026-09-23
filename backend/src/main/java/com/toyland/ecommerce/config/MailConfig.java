package com.toyland.ecommerce.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

@Configuration
public class MailConfig {

    @Value("${spring.mail.host:${SPRING_MAIL_HOST:${MAIL_HOST:smtp-relay.brevo.com}}}")
    private String host;

    @Value("${spring.mail.port:${SPRING_MAIL_PORT:${MAIL_PORT:587}}}")
    private int port;

    @Value("${spring.mail.username:${SPRING_MAIL_USERNAME:${MAIL_USERNAME:}}}")
    private String username;

    @Value("${spring.mail.password:${SPRING_MAIL_PASSWORD:${MAIL_PASSWORD:}}}")
    private String password;


    @Bean
    public JavaMailSender javaMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost(host);
        mailSender.setPort(port);

        if (username != null && !username.trim().isEmpty()) {
            mailSender.setUsername(username.trim());
        }
        if (password != null && !password.trim().isEmpty()) {
            mailSender.setPassword(password.trim());
        }

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.smtp.auth", "true");
        
        if (port == 465) {
            props.put("mail.smtp.ssl.enable", "true");
            props.put("mail.smtp.socketFactory.port", "465");
            props.put("mail.smtp.socketFactory.class", "javax.net.ssl.SSLSocketFactory");
        } else {
            props.put("mail.smtp.starttls.enable", "true");
            props.put("mail.smtp.starttls.required", "true");
        }

        props.put("mail.smtp.connectiontimeout", "5000");
        props.put("mail.smtp.timeout", "5000");
        props.put("mail.smtp.writetimeout", "5000");

        return mailSender;
    }

}
