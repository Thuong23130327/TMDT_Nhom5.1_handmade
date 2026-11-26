package com.example.Handmade.repository;

import com.example.Handmade.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findAllByStatus(Product.ProductStatus status);
}
