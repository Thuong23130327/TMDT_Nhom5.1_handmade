package com.example.Handmade.service;

import com.example.Handmade.dto.OrderDto;
import java.util.List;

public interface OrderService {
    OrderDto.OrderResponse createOrder(OrderDto.CreateOrderRequest request);
    List<OrderDto.OrderResponse> getMyOrders();
    OrderDto.OrderResponse getOrderByCode(String orderCode);
}
