package com.example.Handmade.controller;

import com.example.Handmade.dto.ApiResponse;
import com.example.Handmade.model.User;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RequestMapping("/api/users")
@RestController
public class UserController {
    private final List<User> users = new ArrayList<>();
    private long currentId = 1L;

    @GetMapping
    public ApiResponse<List<UserView>> getUsers() {
        return ApiResponse.ok(users.stream().map(UserView::from).collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ApiResponse<UserView> getUser(@PathVariable Long id) {
        return ApiResponse.ok(users.stream()
                .filter(user -> user.getId().equals(id))
                .findFirst()
                .map(UserView::from)
                .orElse(null));
    }

    @PostMapping
    public ApiResponse<UserView> addUser(@RequestBody User newUser) {
        newUser.setId(currentId++);
        users.add(newUser);
        return ApiResponse.ok("Tạo người dùng thành công", UserView.from(newUser));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Boolean> deleteUser(@PathVariable Long id) {
        return ApiResponse.ok(users.removeIf(user -> user.getId().equals(id)));
    }

    @PutMapping("/{id}")
    public ApiResponse<UserView> updateUser(@PathVariable Long id, @RequestBody User userUpdate) {
        for (User user : users) {
            if (user.getId().equals(id)) {
                if (userUpdate.getFullName() != null) {
                    user.setFullName(userUpdate.getFullName());
                }
                if (userUpdate.getEmail() != null) {
                    user.setEmail(userUpdate.getEmail());
                }
                return ApiResponse.ok(UserView.from(user));
            }
        }
        return ApiResponse.ok(null);
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class UserView {
        private Long id;
        private String username;
        private String email;
        private String fullName;

        private static UserView from(User user) {
            UserView view = new UserView();
            view.setId(user.getId());
            view.setUsername(user.getUsername());
            view.setEmail(user.getEmail());
            view.setFullName(user.getFullName());
            return view;
        }
    }
}
