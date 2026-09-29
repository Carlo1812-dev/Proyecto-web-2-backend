package com.micacharrito.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Permite que el frontend Angular (otro puerto/origen) consuma la API.
 * Los origenes se leen de la propiedad app.cors.origins para poder
 * agregar la URL de GitHub Pages en produccion sin tocar codigo.
 */
@Configuration
public class ConfiguracionCors implements WebMvcConfigurer {

	@Value("${app.cors.origins}")
	private String orignesPermitidos;

	@Override
	public void addCorsMappings(CorsRegistry registro) {
		registro.addMapping("/**")
				.allowedOrigins(this.orignesPermitidos.split(","))
				.allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
				.allowedHeaders("*");
	}
}
