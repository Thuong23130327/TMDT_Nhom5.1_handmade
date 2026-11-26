package com.example.Handmade.model;

import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cart_sessions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CartSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private CartSessionStatus status = CartSessionStatus.ACTIVE;

    @Column(name = "order_id")
    private Long orderId;

    @Column(name = "last_activity_at")
    private LocalDateTime lastActivityAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "cartSession", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<CartSessionItem> items = new ArrayList<>();

    public enum CartSessionStatus {
        ACTIVE, CONVERTED_TO_ORDER, ABANDONED
    }
}
