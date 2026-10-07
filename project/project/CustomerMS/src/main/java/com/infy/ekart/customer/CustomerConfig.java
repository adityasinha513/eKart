package com.infy.ekart.customer;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class CustomerConfig {

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
			request.getHeaders().set("X-Internal-Service", "CustomerMS");
			org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
			if (authentication != null && !(authentication instanceof org.springframework.security.authentication.AnonymousAuthenticationToken)
					&& !"anonymousUser".equals(authentication.getPrincipal()) && authentication.getPrincipal() instanceof String) {
				request.getHeaders().set("X-Auth-User", String.valueOf(authentication.getPrincipal()));
				authentication.getAuthorities().stream().findFirst().ifPresent(role -> request.getHeaders().set("X-Auth-Role", role.getAuthority().replaceFirst("^ROLE_", "")));
			}
			return execution.execute(request, body);
		});
		return template;
	}

}
