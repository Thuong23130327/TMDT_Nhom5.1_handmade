package com.example.Handmade.controller;

import com.example.Handmade.model.Product;
import com.example.Handmade.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class ProductViewController {

    private final ProductRepository productRepository;

    @GetMapping("/products")
    public String showProducts(Model model) {
        List<Product> products = productRepository.findAll();
        model.addAttribute("productList", products);
        model.addAttribute("totalCount", products.size());
        return "products"; // Trả về templates/products.html
    }
}