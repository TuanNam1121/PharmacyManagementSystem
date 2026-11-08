package com.pharmacy.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
@ConfigurationProperties(prefix = "payos")
@Getter
@Setter
public class PayOSConfig {

    private String clientId;
    private String apiKey;
    private String checksumKey;
    private String endpoint = "https://api-merchant.payos.vn";

    @Bean
    public RestTemplate payOsRestTemplate() {
        return new RestTemplate();
    }
}

