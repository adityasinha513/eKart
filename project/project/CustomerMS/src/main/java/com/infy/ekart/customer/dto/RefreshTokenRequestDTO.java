package com.infy.ekart.customer.dto;

import javax.validation.constraints.NotNull;

public class RefreshTokenRequestDTO {

	@NotNull(message = "{refreshtoken.absent}")
	private String refreshToken;

	public String getRefreshToken() {
		return refreshToken;
	}

	public void setRefreshToken(String refreshToken) {
		this.refreshToken = refreshToken;
	}

}
