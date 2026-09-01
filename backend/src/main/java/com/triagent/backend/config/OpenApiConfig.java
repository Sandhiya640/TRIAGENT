package com.triagent.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("TRIAGENT Cyber Incident Prioritization Engine API")
                        .version("1.0.0")
                        .description("REST API documentation for TRIAGENT, an explainable cyber incident prioritization engine. Provides incident persistence, normalization, 6-factor weighted scoring, 8-level tie-breaking, triage queue management, and deterministic incident comparisons.")
                        .contact(new Contact()
                                .name("TRIAGENT Team")
                                .email("secops@triagent.io"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://www.apache.org/licenses/LICENSE-2.0")));
    }
}
