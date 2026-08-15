package com.infy.ekart.customer.security;

import java.io.IOException;
import java.util.List;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Trusts the identity EkartGateway already established by validating the caller's JWT.
 * Populates the SecurityContext from X-Auth-User/X-Auth-Role so @PreAuthorize works
 * normally on controller methods. See GatewaySecretFilter for why trusting these headers
 * is safe: only the Gateway can reach this service with a valid shared secret.
 */
@Component
public class HeaderAuthenticationFilter extends OncePerRequestFilter {

	public static final String USER_HEADER = "X-Auth-User";
	public static final String ROLE_HEADER = "X-Auth-Role";

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		String user = request.getHeader(USER_HEADER);
		String role = request.getHeader(ROLE_HEADER);

		if (user != null && role != null) {
			UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
					user, null, List.of(new SimpleGrantedAuthority("ROLE_" + role)));
			SecurityContextHolder.getContext().setAuthentication(authentication);
		}

		filterChain.doFilter(request, response);
	}

}
