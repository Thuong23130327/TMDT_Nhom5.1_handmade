package com.example.Handmade.repository;

import com.example.Handmade.model.CartSessionItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CartSessionItemRepository extends JpaRepository<CartSessionItem, Long> {
    void deleteAllByCartSession_Id(Long cartSessionId);
}
