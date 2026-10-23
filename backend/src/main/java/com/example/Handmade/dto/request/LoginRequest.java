package com.example.Handmade.dto.request;

import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.NotBlank;

@Getter
@Setter
public class LoginRequest {
    @NotBlank(message = "Vui lòng nhập tên đăng nhập hoặc email")
    private String usernameOrEmail;

    @NotBlank(message = "Vui lòng nhập mật khẩu")
    private String password;
}
