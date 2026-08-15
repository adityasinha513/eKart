package com.infy.ekart.product.security;

import java.io.IOException;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Rejects any request that doesn't carry the shared secret EkartGateway attaches to every
 * request it proxies (and that sibling services attach to their own inter-service calls,
 * see each service's *Config RestTemplate bean). This is what stops a caller from reaching
 * this service directly, bypassing the Gateway's JWT check, in a local/dev environment
 * where network isolation between services isn't enforced yet.
 */
@Component
public class GatewaySecretFilter extends OncePerRequestFilter {

	public static final String HEADER_NAME = "X-Gateway-Secret";

	@Value("${gateway.shared-secret}")
	private String expectedSecret;

	@Override
	protected boolean shouldNotFilter(HttpServletRequest request) {
		return request.getRequestURI().startsWith("/Ekart/actuator");
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		String provided = request.getHeader(HEADER_NAME);
		if (provided == null || !provided.equals(expectedSecret)) {
			response.setStatus(HttpServletResponse.SC_FORBIDDEN);
			response.setContentType("application/json");
			response.getWriter().write("{\"message\":\"Direct access to this service is not permitted, use the API gateway.\"}");
			return;
		}
		filterChain.doFilter(request, response);
	}

}
