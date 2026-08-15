package com.infy.ekart.gateway.ekartgateway.security;

import java.security.Key;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

/**
 * Validates JWTs issued by CustomerMS at login. This is the edge of trust for the whole
 * system: once a request passes here, downstream services trust the X-Auth-User/X-Auth-Role
 * headers this Gateway injects instead of re-validating the token themselves.
 */
@Component
public class JwtValidator {

	@Value("${jwt.secret}")
	private String secret;

	private Key signingKey;

	@PostConstruct
	private void init() {
		this.signingKey = Keys.hmacShaKeyFor(secret.getBytes());
	}

	/**
	 * @return the validated claims, or empty if the token is missing/expired/malformed/tampered.
	 */
	public java.util.Optional<Claims> validate(String token) {
		try {
			Claims claims = Jwts.parserBuilder()
					.setSigningKey(signingKey)
					.build()
					.parseClaimsJws(token)
					.getBody();
			return java.util.Optional.of(claims);
		} catch (JwtException | IllegalArgumentException e) {
			return java.util.Optional.empty();
		}
	}

}
