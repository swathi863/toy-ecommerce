package com.toyland.ecommerce.repository;

import com.toyland.ecommerce.model.JwtToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface JwtTokenRepository extends JpaRepository<JwtToken, Long> {

    Optional<JwtToken> findByToken(String token);

    Optional<JwtToken> findByUserUserId(Long userId);

    void deleteByUserUserId(Long userId);
}
