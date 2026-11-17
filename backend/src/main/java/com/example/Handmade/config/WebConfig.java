package com.example.Handmade.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .exposedHeaders("Authorization");
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        File currentDir = new File(".").getAbsoluteFile();
        File frontendDir = new File(currentDir, "frontend");
        if (!frontendDir.exists() && currentDir.getParentFile() != null) {
            frontendDir = new File(currentDir.getParentFile(), "frontend");
        }
        String frontendLocation = frontendDir.exists()
                ? frontendDir.toURI().toString()
                : "file:d:/TMDT 5.1/TMDT_Nhom5.1_handmade/frontend/";

        registry.addResourceHandler("/frontend/**")
                .addResourceLocations(frontendLocation, "file:frontend/", "file:../frontend/");
    }
}
