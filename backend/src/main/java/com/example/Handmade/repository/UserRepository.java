package com.example.Handmade.repository;

import com.example.Handmade.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    long countByRoleIn(List<User.Role> roles);

    long countByRoleInAndStatus(List<User.Role> roles, User.UserStatus status);

    long countByStatus(User.UserStatus status);

    @Query("SELECT u FROM User u WHERE " +
           "(:roles IS NULL OR u.role IN :roles) AND " +
           "(:status IS NULL OR u.status = :status) AND " +
           "(:keyword IS NULL OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           " OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "ORDER BY u.createdAt DESC")
    List<User> searchUsers(@Param("roles") List<User.Role> roles,
                           @Param("status") User.UserStatus status,
                           @Param("keyword") String keyword);
}
