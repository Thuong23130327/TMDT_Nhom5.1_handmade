package com.example.Handmade.repository;

import com.example.Handmade.model.AssociationRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssociationRuleRepository extends JpaRepository<AssociationRule, Long> {

    @Query("SELECT ar FROM AssociationRule ar " +
           "WHERE ar.antecedentProductId = :productId " +
           "ORDER BY ar.confidenceValue DESC, ar.liftValue DESC, ar.supportValue DESC")
    List<AssociationRule> findByAntecedentProductIdOrderByScore(@Param("productId") Long productId);

    @Query("SELECT ar FROM AssociationRule ar " +
           "WHERE ar.antecedentProductId IN :productIds " +
           "ORDER BY ar.confidenceValue DESC, ar.liftValue DESC")
    List<AssociationRule> findByAntecedentProductIdIn(@Param("productIds") List<Long> productIds);

    Optional<AssociationRule> findByAntecedentProductIdAndConsequentProductId(
            Long antecedentProductId, Long consequentProductId);

    void deleteAllByAntecedentProductId(Long antecedentProductId);
}
