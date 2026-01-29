package com.chun.backend_spring.feature.helloworld;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HellorController {
    @GetMapping("/api/hello")
    public String getHello() {
        return "Hellor World from Spring Boot";
    }
}