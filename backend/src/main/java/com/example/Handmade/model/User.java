package com.example.Handmade.model;

public class User {

    private int id;
    private String ten;

    public User(int id, String ten) {
        this.id = id;
        this.ten = ten;
    }

    public User() {
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getTen() {
        return ten;
    }

    public void setTen(String ten) {
        this.ten = ten;
    }
}
