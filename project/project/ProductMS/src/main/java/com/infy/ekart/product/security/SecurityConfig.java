package com.infy.ekart.product.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Public catalog browsing (products/categories/offers reads) and internal inter-service
 * calls (stock decrement from CustomerMS during order placement, neither carrying end-user
 * identity) stay open, gated only by "did this request carry the gateway secret" (enforced
 * by GatewaySecretFilter). Admin catalog management under /admin-api/** is only ever called
 * by an end user through the Gateway (never inter-service), so it's safe to require the
 * ADMIN role there.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

	@Autowired
	private GatewaySecretFilter gatewaySecretFilter;

	@Autowired
	private HeaderAuthenticationFilter headerAuthenticationFilter;

	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
		http.csrf().disable()
			.httpBasic().disable()
			.formLogin().disable()
			.sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
			.authorizeRequests(authorize -> authorize
				.antMatchers("/admin-api/**").hasRole("ADMIN")
				.anyRequest().permitAll()
			)
			.addFilterBefore(gatewaySecretFilter, UsernamePasswordAuthenticationFilter.class)
			.addFilterAfter(headerAuthenticationFilter, GatewaySecretFilter.class);

		return http.build();
	}

}
