package com.example.Handmade.repository;

import com.example.Handmade.model.UserRefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRefreshTokenRepository extends JpaRepository<UserRefreshToken, Long> {
    Optional<UserRefreshToken> findByTokenHash(String tokenHash);

    void deleteAllByUser_Id(Long userId);

    void deleteByTokenHash(String tokenHash);
}
