package com.example.Handmade.controller;

import com.example.Handmade.model.User;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RequestMapping("/api/users")
@RestController
public class UserController {
    private List<User> users = new ArrayList<>();
    private int currentId = 1;


    @GetMapping
    public List<User> getUsers() {
        return users;
    }

    @GetMapping("/{id}")
    public User getUser(@PathVariable int id) {
        for (User u : users)
            if (u.getId() == id) return u;
        return null;
    }

    @PostMapping
    public User addUser(@RequestBody User newUser) {
        newUser.setId(currentId);
        currentId++;
        users.add(newUser);
        return newUser;
    }

    @DeleteMapping("/{id}")
    public boolean deleteUser(@PathVariable int id) {
        return users.removeIf(u -> u.getId() == id);
    }

    @PutMapping("/{id}")
    public User updateUser(@PathVariable int id, @RequestBody User userMoi) {
        for (User u : users)
            if (u.getId() == id) {
                u.setTen(userMoi.getTen());
                return u;
            }
        return null;
    }

}
