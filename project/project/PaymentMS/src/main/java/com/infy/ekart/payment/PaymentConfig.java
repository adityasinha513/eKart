package com.infy.ekart.payment;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class PaymentConfig {

	private RestTemplate template = new RestTemplate();

	@Value("${gateway.shared-secret}")
	private String gatewaySharedSecret;

	@Bean
	public RestTemplate restTemplate() {
		// Every outgoing inter-service call carries the shared secret too, since these calls
		// bypass EkartGateway entirely (service-to-service traffic is direct, not proxied) and
		// would otherwise be rejected by the receiving service's GatewaySecretFilter.
		template.getInterceptors().add((request, body, execution) -> {
			request.getHeaders().add("X-Gateway-Secret", gatewaySharedSecret);
			return execution.execute(request, body);
		});
		return template;
	}
}