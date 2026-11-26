package com.example.Handmade;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class HandmadeApplication {

	public static void main(String[] args) {
		SpringApplication.run(HandmadeApplication.class, args);
	}

}
