package com.infy.ekart.gateway.ekartgateway.security;

import org.springframework.http.HttpMethod;

/**
 * One allow-listed (method, path pattern) pair that may be called without a JWT.
 * Everything else requires a valid Authorization: Bearer token.
 */
public class PublicRoute {

	private final HttpMethod method;
	private final String antPattern;

	public PublicRoute(HttpMethod method, String antPattern) {
		this.method = method;
		this.antPattern = antPattern;
	}

	public HttpMethod getMethod() {
		return method;
	}

	public String getAntPattern() {
		return antPattern;
	}

}
