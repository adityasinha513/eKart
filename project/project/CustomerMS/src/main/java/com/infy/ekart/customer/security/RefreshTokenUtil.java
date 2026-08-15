package com.infy.ekart.customer.security;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;

import org.springframework.stereotype.Component;

/**
 * Generates opaque, server-side-tracked refresh tokens and hashes them for storage
 * (EK_REFRESH_TOKEN stores only the hash, so a DB leak doesn't expose usable tokens).
 */
@Component
public class RefreshTokenUtil {

	private final SecureRandom secureRandom = new SecureRandom();

	public String generateRawToken() {
		byte[] bytes = new byte[48];
		secureRandom.nextBytes(bytes);
		return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
	}

	public String hash(String rawToken) {
		try {
			MessageDigest digest = MessageDigest.getInstance("SHA-256");
			byte[] hashed = digest.digest(rawToken.getBytes());
			return Base64.getUrlEncoder().withoutPadding().encodeToString(hashed);
		} catch (NoSuchAlgorithmException e) {
			throw new IllegalStateException("SHA-256 not available", e);
		}
	}

}
