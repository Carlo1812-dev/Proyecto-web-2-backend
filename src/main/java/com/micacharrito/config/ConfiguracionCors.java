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

	@Value("${app.cors.origins:http://localhost:4200}")
	private String orignesPermitidos;

	@Override
	public void addCorsMappings(CorsRegistry registro) {
		// allowedOriginPatterns admite "*" y tambien origenes literales,
		// asi el frontend funciona sin importar en que puerto se levante
		// (4200, 65282, GitHub Pages, etc).
		String[] orignes = java.util.Arrays.stream(this.orignesPermitidos.split(","))
				.map(String::trim)
				.filter(origen -> !origen.isEmpty())
				.toArray(String[]::new);
		if (orignes.length == 0) {
			orignes = new String[] { "*" };
		}
		registro.addMapping("/**")
				.allowedOriginPatterns(orignes)
				.allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
				.allowedHeaders("*");
	}
}
