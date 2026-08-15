package com.infy.ekart.gateway.ekartgateway.security;

import java.util.List;

import org.springframework.http.HttpMethod;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;

/**
 * Public surface of the API: unauthenticated browsing (products/categories/offers reads)
 * plus the auth endpoints that necessarily precede having a token at all.
 */
@Component
public class PublicRouteMatcher {

	private final AntPathMatcher pathMatcher = new AntPathMatcher();

	private final List<PublicRoute> publicRoutes = List.of(
			new PublicRoute(HttpMethod.GET, "/api/products/**"),
			new PublicRoute(HttpMethod.GET, "/api/categories/**"),
			new PublicRoute(HttpMethod.GET, "/api/offers/**"),
			new PublicRoute(HttpMethod.GET, "/api/reviews/**"),
			new PublicRoute(HttpMethod.POST, "/api/auth/login"),
			new PublicRoute(HttpMethod.POST, "/api/auth/register"),
			new PublicRoute(HttpMethod.POST, "/api/auth/refresh-token")
	);

	public boolean isPublic(ServerHttpRequest request) {
		String path = request.getURI().getPath();
		HttpMethod method = request.getMethod();
		return publicRoutes.stream()
				.anyMatch(route -> route.getMethod().equals(method) && pathMatcher.match(route.getAntPattern(), path));
	}

}
