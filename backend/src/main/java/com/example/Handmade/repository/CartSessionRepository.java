package com.example.Handmade.repository;

import com.example.Handmade.model.CartSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CartSessionRepository extends JpaRepository<CartSession, Long> {

    Optional<CartSession> findByUser_IdAndStatus(Long userId, CartSession.CartSessionStatus status);

    @Query("SELECT cs FROM CartSession cs JOIN FETCH cs.items csi " +
           "WHERE cs.status = 'ABANDONED'")
    List<CartSession> findAllAbandonedWithItems();

    @Query("SELECT cs FROM CartSession cs " +
           "WHERE cs.status = 'ACTIVE' AND cs.lastActivityAt < :cutoff")
    List<CartSession> findStaleActiveSessions(@Param("cutoff") LocalDateTime cutoff);
}
