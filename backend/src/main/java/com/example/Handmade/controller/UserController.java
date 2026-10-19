package com.example.Handmade.controller;

import com.example.Handmade.model.User;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RequestMapping("/api/users")
@RestController
public class UserController {
    private List<User> users = new ArrayList<>();
    private long currentId = 1L;

    @GetMapping
    public List<User> getUsers() {
        return users;
    }

    @GetMapping("/{id}")
    public User getUser(@PathVariable Long id) {
        for (User u : users) {
            if (u.getId().equals(id)) return u;
        }
        return null;
    }

    @PostMapping
    public User addUser(@RequestBody User newUser) {
        newUser.setId(currentId++);
        users.add(newUser);
        return newUser;
    }

    @DeleteMapping("/{id}")
    public boolean deleteUser(@PathVariable Long id) {
        return users.removeIf(u -> u.getId().equals(id));
    }

    @PutMapping("/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody User userMoi) {
        for (User u : users) {
            if (u.getId().equals(id)) {
                if (userMoi.getFullName() != null) {
                    u.setFullName(userMoi.getFullName());
                }
                if (userMoi.getEmail() != null) {
                    u.setEmail(userMoi.getEmail());
                }
                return u;
            }
        }
        return null;
    }
}
