package com.thinkitive.primus.shared.config;

import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component("auditorAwareService")
public class AuditorAwareService implements AuditorAware<String> {

    private static final String SYSTEM_USER = "system";
    private static final String PREFERRED_USERNAME_CLAIM = "preferred_username";
    private static final String SUB_CLAIM = "sub";

    @Override
    public Optional<String> getCurrentAuditor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.of(SYSTEM_USER);
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof Jwt jwt) {
            String username = jwt.getClaimAsString(PREFERRED_USERNAME_CLAIM);
            if (username != null && !username.isBlank()) {
                return Optional.of(username);
            }
            String sub = jwt.getClaimAsString(SUB_CLAIM);
            if (sub != null && !sub.isBlank()) {
                return Optional.of(sub);
            }
        }

        String name = authentication.getName();
        if (name != null && !name.isBlank() && !"anonymousUser".equals(name)) {
            return Optional.of(name);
        }

        return Optional.of(SYSTEM_USER);
    }
}
