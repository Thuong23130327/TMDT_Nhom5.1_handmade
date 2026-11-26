package com.example.Handmade.controller;

import com.example.Handmade.dto.ApiResponse;
import com.example.Handmade.dto.OrderDto;
import com.example.Handmade.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping({"/api/orders", "/api/v1/orders"})
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<OrderDto.OrderResponse> createOrder(@Valid @RequestBody OrderDto.CreateOrderRequest request) {
        return ApiResponse.ok("Đặt hàng thành công", orderService.createOrder(request));
    }

    @GetMapping
    public ApiResponse<List<OrderDto.OrderResponse>> getMyOrders() {
        return ApiResponse.ok("Lấy danh sách đơn hàng thành công", orderService.getMyOrders());
    }

    @GetMapping({"/my-orders", "/buyer/{buyerId}"})
    public ApiResponse<List<OrderDto.OrderResponse>> getBuyerOrders(
            @RequestParam(required = false) Long userId,
            @PathVariable(required = false) Long buyerId) {
        Long targetId = userId != null ? userId : buyerId;
        return ApiResponse.ok("Lấy lịch sử mua hàng thành công", orderService.getOrdersByBuyerId(targetId));
    }

    @GetMapping("/{orderCode}")
    public ApiResponse<OrderDto.OrderResponse> getOrderByCode(@PathVariable String orderCode) {
        return ApiResponse.ok("Lấy thông tin đơn hàng thành công", orderService.getOrderByCode(orderCode));
    }
}
