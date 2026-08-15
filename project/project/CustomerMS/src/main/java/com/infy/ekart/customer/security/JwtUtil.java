package com.infy.ekart.customer.security;

import java.security.Key;
import java.util.Date;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.infy.ekart.customer.entity.Role;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

/**
 * Issues and validates the short-lived JWT access token handed to clients at login.
 * The signing secret must match the value EkartGateway uses to validate incoming tokens.
 */
@Component
public class JwtUtil {

	@Value("${jwt.secret}")
	private String secret;

	@Value("${jwt.access-token-expiry-minutes}")
	private long accessTokenExpiryMinutes;

	private Key signingKey;

	@PostConstruct
	private void init() {
		this.signingKey = Keys.hmacShaKeyFor(secret.getBytes());
	}

	public String generateAccessToken(String emailId, Role role) {
		Date now = new Date();
		Date expiry = new Date(now.getTime() + accessTokenExpiryMinutes * 60 * 1000);
		return Jwts.builder()
				.setSubject(emailId)
				.claim("role", role.name())
				.setIssuedAt(now)
				.setExpiration(expiry)
				.signWith(signingKey, SignatureAlgorithm.HS256)
				.compact();
	}

	public Claims parseAndValidate(String token) throws JwtException {
		return Jwts.parserBuilder()
				.setSigningKey(signingKey)
				.build()
				.parseClaimsJws(token)
				.getBody();
	}

}
