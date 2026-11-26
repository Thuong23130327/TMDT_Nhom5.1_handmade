package com.example.Handmade.repository;

import com.example.Handmade.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    @Query("SELECT o FROM Order o JOIN FETCH o.items i LEFT JOIN FETCH i.product WHERE o.buyer.id = :buyerId ORDER BY o.createdAt DESC")
    List<Order> findAllByBuyer_IdWithItems(@Param("buyerId") Long buyerId);

    @Query("SELECT o FROM Order o JOIN FETCH o.items i LEFT JOIN FETCH i.product WHERE o.orderCode = :code")
    Optional<Order> findByOrderCodeWithItems(@Param("code") String code);

    Optional<Order> findByOrderCode(String orderCode);

    List<Order> findByCreatedAtBetweenOrderByCreatedAtAsc(LocalDateTime start, LocalDateTime end);


    @Query("SELECT o FROM Order o JOIN FETCH o.items i LEFT JOIN FETCH i.product " +
           "WHERE o.paymentStatus = 'PAID' AND o.status != 'CANCELLED'")
    List<Order> findAllPaidAndNotCancelled();

    @Query(value = "SELECT COALESCE(c.name, 'Thủ công khác') AS cat_name, " +

            "COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS total_revenue " +
            "FROM orders o " +
            "JOIN order_items oi ON oi.order_id = o.id " +
            "LEFT JOIN products p ON p.id = oi.product_id " +
            "LEFT JOIN categories c ON c.id = p.category_id " +
            "GROUP BY c.id, c.name", nativeQuery = true)
    List<Object[]> getRevenueByCategory();
}
