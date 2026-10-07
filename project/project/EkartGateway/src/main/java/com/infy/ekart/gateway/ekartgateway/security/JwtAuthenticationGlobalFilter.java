package com.infy.ekart.gateway.ekartgateway.security;

import java.nio.charset.StandardCharsets;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

import io.jsonwebtoken.Claims;
import reactor.core.publisher.Mono;

/**
 * The single point where every request that isn't allow-listed must carry a valid JWT.
 * On success, injects X-Auth-User/X-Auth-Role so downstream services don't need to
 * re-validate the token themselves (see JwtValidator and each service's
 * HeaderAuthenticationFilter/GatewaySecretFilter for the trust model this depends on).
 */
@Component
public class JwtAuthenticationGlobalFilter implements GlobalFilter, Ordered {

	public static final String AUTH_USER_HEADER = "X-Auth-User";
	public static final String AUTH_ROLE_HEADER = "X-Auth-Role";
	public static final String GATEWAY_SECRET_HEADER = "X-Gateway-Secret";

	private final JwtValidator jwtValidator;
	private final PublicRouteMatcher publicRouteMatcher;

	@Value("${gateway.shared-secret}")
	private String gatewaySharedSecret;

	public JwtAuthenticationGlobalFilter(JwtValidator jwtValidator, PublicRouteMatcher publicRouteMatcher) {
		this.jwtValidator = jwtValidator;
		this.publicRouteMatcher = publicRouteMatcher;
	}

	@Override
	public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
		ServerHttpRequest request = exchange.getRequest();
		String path = request.getURI().getPath();
		// Reservation APIs are internal CustomerMS→ProductMS calls and must never be
		// reachable through the public catalog route.
		if (path.startsWith("/api/products/orders/")) return forbidden(exchange, "Internal inventory API.");

		if (publicRouteMatcher.isPublic(request)) {
			return chain.filter(withGatewaySecret(exchange, request));
		}

		String authorizationHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
		if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
			return unauthorized(exchange, "Missing bearer token.");
		}

		String token = authorizationHeader.substring("Bearer ".length());
		Optional<Claims> claims = jwtValidator.validate(token);
		if (claims.isEmpty()) {
			return unauthorized(exchange, "Token is invalid or expired, please log in again.");
		}

		String emailId = claims.get().getSubject();
		String role = claims.get().get("role", String.class);
		if ((path.startsWith("/api/admin/") || path.startsWith("/api/products/update/")) && !"ADMIN".equals(role)) {
			return forbidden(exchange, "Admin access is required.");
		}

		ServerHttpRequest mutatedRequest = request.mutate()
				.headers(headers -> {
					headers.remove(AUTH_USER_HEADER);
					headers.remove(AUTH_ROLE_HEADER);
				headers.remove(GATEWAY_SECRET_HEADER);
				headers.remove("X-Internal-Service");
					headers.set(AUTH_USER_HEADER, emailId);
					headers.set(AUTH_ROLE_HEADER, role);
					headers.set(GATEWAY_SECRET_HEADER, gatewaySharedSecret);
				})
				.build();

		return chain.filter(exchange.mutate().request(mutatedRequest).build());
	}

	private ServerWebExchange withGatewaySecret(ServerWebExchange exchange, ServerHttpRequest request) {
		ServerHttpRequest mutatedRequest = request.mutate()
				.headers(headers -> headers.remove("X-Internal-Service"))
				.header(GATEWAY_SECRET_HEADER, gatewaySharedSecret)
				.build();
		return exchange.mutate().request(mutatedRequest).build();
	}

	private Mono<Void> unauthorized(ServerWebExchange exchange, String message) {
		ServerHttpResponse response = exchange.getResponse();
		response.setStatusCode(HttpStatus.UNAUTHORIZED);
		response.getHeaders().add(HttpHeaders.CONTENT_TYPE, "application/json");
		String body = "{\"message\":\"" + message + "\"}";
		DataBuffer buffer = response.bufferFactory().wrap(body.getBytes(StandardCharsets.UTF_8));
		return response.writeWith(Mono.just(buffer));
	}

	private Mono<Void> forbidden(ServerWebExchange exchange, String message) {
		ServerHttpResponse response = exchange.getResponse();
		response.setStatusCode(HttpStatus.FORBIDDEN);
		response.getHeaders().add(HttpHeaders.CONTENT_TYPE, "application/json");
		DataBuffer buffer = response.bufferFactory().wrap(("{\"message\":\"" + message + "\"}").getBytes(StandardCharsets.UTF_8));
		return response.writeWith(Mono.just(buffer));
	}

	@Override
	public int getOrder() {
		return Ordered.HIGHEST_PRECEDENCE;
	}

}
