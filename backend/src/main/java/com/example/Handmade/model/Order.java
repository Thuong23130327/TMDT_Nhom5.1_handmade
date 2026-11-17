package com.example.Handmade.model;

import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_code", nullable = false, unique = true, length = 50)
    private String orderCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id", nullable = false)
    private User buyer;

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "recipient_name", nullable = false, length = 100)
    private String recipientName;

    @Column(name = "recipient_phone", nullable = false, length = 20)
    private String recipientPhone;

    @Column(name = "shipping_address", nullable = false, columnDefinition = "TEXT")
    private String shippingAddress;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false)
    @Builder.Default
    private PaymentMethod paymentMethod = PaymentMethod.COD;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.UNPAID;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    public enum PaymentMethod { COD, VNPAY, MOMO, BANKING }
    public enum PaymentStatus { UNPAID, PAID, REFUNDED }
    public enum OrderStatus { PENDING, CRAFTING, SHIPPING, COMPLETED, CANCELLED }
}
