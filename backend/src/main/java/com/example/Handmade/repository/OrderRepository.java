package com.example.Handmade.repository;

import com.example.Handmade.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    @Query("SELECT o FROM Order o JOIN FETCH o.items i LEFT JOIN FETCH i.product WHERE o.buyer.id = :buyerId ORDER BY o.createdAt DESC")
    List<Order> findAllByBuyer_IdWithItems(@Param("buyerId") Long buyerId);

    @Query("SELECT o FROM Order o JOIN FETCH o.items i LEFT JOIN FETCH i.product WHERE o.orderCode = :code")
    Optional<Order> findByOrderCodeWithItems(@Param("code") String code);
}
