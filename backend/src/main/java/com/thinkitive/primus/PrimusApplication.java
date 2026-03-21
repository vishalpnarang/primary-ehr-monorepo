package com.thinkitive.primus;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing(auditorAwareRef = "auditorAwareService")
public class PrimusApplication {

    public static void main(String[] args) {
        SpringApplication.run(PrimusApplication.class, args);
    }
}
