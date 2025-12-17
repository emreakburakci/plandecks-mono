package com.plandecks.planner.config;

import com.google.ortools.Loader;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct; // Spring Boot 3+ için (javax.annotation yerine)

@Configuration
public class OrToolsConfig {

    @PostConstruct
    public void init() {
        // Native kütüphaneleri JVM'e yükle
        Loader.loadNativeLibraries();
        System.out.println("✅ Google OR-Tools Native Libraries Loaded Successfully.");
    }
}