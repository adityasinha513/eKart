package com.infy.ekart.cart.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Cart/wishlist endpoints are reached both directly by an authenticated end user (through
 * the Gateway, carrying X-Auth-User/Role) and via CustomerMS's cart-proxy inter-service call
 * (which doesn't forward end-user identity headers) — so authorization here is currently just
 * "did this request carry the gateway secret" (enforced by GatewaySecretFilter). The
 * customerEmailId-in-path-matches-caller ownership check is added as a dedicated hardening
 * pass once all the customer-scoped endpoints across services exist.
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
				.anyRequest().permitAll()
			)
			.addFilterBefore(gatewaySecretFilter, UsernamePasswordAuthenticationFilter.class)
			.addFilterAfter(headerAuthenticationFilter, GatewaySecretFilter.class);

		return http.build();
	}

}
