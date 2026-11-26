package com.example.Handmade.model;

import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "association_rules",
        indexes = {
                @Index(name = "idx_ar_antecedent", columnList = "antecedent_product_id"),
                @Index(name = "idx_ar_consequent", columnList = "consequent_product_id")
        })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AssociationRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "antecedent_product_id", nullable = false)
    private Long antecedentProductId;

    @Column(name = "consequent_product_id", nullable = false)
    private Long consequentProductId;

    @Column(name = "support_value", nullable = false)
    private Double supportValue;

    @Column(name = "confidence_value", nullable = false)
    private Double confidenceValue;

    @Column(name = "lift_value", nullable = false)
    private Double liftValue;

    @Column(name = "rule_explanation", length = 500)
    private String ruleExplanation;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
