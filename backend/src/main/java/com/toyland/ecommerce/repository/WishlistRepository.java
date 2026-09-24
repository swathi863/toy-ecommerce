package com.toyland.ecommerce.repository;

import com.toyland.ecommerce.model.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<WishlistItem, Long> {

    List<WishlistItem> findByUserUserIdOrderByCreatedAtDesc(Long userId);

    Optional<WishlistItem> findByUserUserIdAndProductProductId(Long userId, Long productId);

    boolean existsByUserUserIdAndProductProductId(Long userId, Long productId);

    void deleteByUserUserIdAndProductProductId(Long userId, Long productId);
}
