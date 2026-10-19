package com.example.Handmade.model;

import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity // 1. Khai báo đây là một Bảng CSDL
@Table(name = "users") // 2. Đặt tên bảng trong MySQL là "users"
@Getter // 3. Tự sinh toàn bộ getter
@Setter // 4. Tự sinh toàn bộ setter
@NoArgsConstructor // 5. Tự sinh constructor không tham số
@AllArgsConstructor // 6. Tự sinh constructor đủ tham số
@Builder // 7. Cho phép tạo object bằng cú pháp .builder()
public class User {

    @Id // 8. Khóa chính
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 9. Tự tăng (Auto Increment: 1, 2, 3...)
    private Long id; // Dùng Long (64-bit) để lưu trữ được lượng ID cực lớn

    @Column(nullable = false, unique = true, length = 100)
    private String email;
    // nullable = false -> Cột NOT NULL
    // unique = true -> Cấm trùng email giữa các tài khoản
    // length = 100 -> VARCHAR(100)

    @Column(nullable = false)
    private String password; // Lưu mật khẩu (sau này sẽ lưu chuỗi đã mã hóa)

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName; // Trong Java dùng camelCase, trong CSDL sẽ là snake_case (full_name)

    @Column(length = 20)
    private String phone;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Enumerated(EnumType.STRING) // 10. Lưu chữ ("BUYER", "ARTISAN") thay vì số 0, 1
    @Column(nullable = false)
    private Role role; // Vai trò người dùng

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserStatus status; // Trạng thái tài khoản

    @Column(columnDefinition = "TEXT") // 11. Ép kiểu cột thành TEXT để lưu được bài giới thiệu dài
    private String introduction;

    @Column(name = "portfolio_url")
    private String portfolioUrl;

    @CreationTimestamp // 12. Tự động điền ngày giờ hiện tại khi INSERT vào DB
    @Column(name = "created_at", updatable = false) // updatable = false: Không bị đổi giờ khi UPDATE thông tin
    private LocalDateTime createdAt;

    // 13. Khai báo danh sách các giá trị cố định (Enum)
    public enum Role {
        BUYER, ARTISAN, ADMIN,
        ROLE_BUYER, ROLE_ARTISAN, ROLE_ADMIN
    }

    public enum UserStatus {
        ACTIVE, PENDING, SUSPENDED
    }
}