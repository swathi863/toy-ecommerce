package com.toyland.ecommerce.repository;

import com.toyland.ecommerce.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    List<CartItem> findByUserUserId(Long userId);

    Optional<CartItem> findByUserUserIdAndProductProductId(Long userId, Long productId);

    void deleteByUserUserId(Long userId);
}
