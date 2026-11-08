package com.pharmacy.security;

import com.pharmacy.entity.Account;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

@Slf4j
@Component
public class JwtTokenProvider {

    @Value("${jwt.access-token.secret:${jwt.secret:5367566B59703373367639792F423F4528482B4D6251655468576D5A71347437}}")
    private String accessTokenSecret;

    @Value("${jwt.access-token.expiration:900000}")
    private long accessTokenExpirationInMs; // 15 minutes (900,000 ms)

    @Value("${jwt.refresh-token.secret:6B59703373367639792F423F4528482B4D6251655468576D5A7134743777217A}")
    private String refreshTokenSecret;

    @Value("${jwt.refresh-token.expiration:28800000}")
    private long refreshTokenExpirationInMs; // 8 hours (28,800,000 ms)

    private SecretKey getSigningKey(String secret) {
        byte[] keyBytes;
        try {
            keyBytes = Decoders.BASE64.decode(secret);
            if (keyBytes.length < 32) {
                keyBytes = secret.getBytes(StandardCharsets.UTF_8);
            }
        } catch (Exception e) {
            keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private SecretKey getAccessSigningKey() {
        return getSigningKey(accessTokenSecret);
    }

    private SecretKey getRefreshSigningKey() {
        return getSigningKey(refreshTokenSecret);
    }

    public String generateAccessToken(Account account) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + accessTokenExpirationInMs);

        String roleCode = "USER";
        if (account.getRole() != null && account.getRole().getCode() != null) {
            roleCode = account.getRole().getCode();
        }
        if (!roleCode.startsWith("ROLE_")) {
            roleCode = "ROLE_" + roleCode;
        }

        String fullName = account.getUsername();
        if (account.getAccountInformation() != null && account.getAccountInformation().getFullName() != null) {
            fullName = account.getAccountInformation().getFullName();
        }

        return Jwts.builder()
                .subject(String.valueOf(account.getId()))
                .claim("username", account.getUsername())
                .claim("email", account.getEmail())
                .claim("role", roleCode)
                .claim("fullName", fullName)
                .claim("accountId", account.getId())
                .claim("type", "ACCESS")
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getAccessSigningKey(), Jwts.SIG.HS256)
                .compact();
    }

    public String generateToken(Account account) {
        return generateAccessToken(account);
    }

    public String generateRefreshToken(Account account) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + refreshTokenExpirationInMs);

        return Jwts.builder()
                .subject(String.valueOf(account.getId()))
                .claim("username", account.getUsername())
                .claim("accountId", account.getId())
                .claim("type", "REFRESH")
                .claim("jti", UUID.randomUUID().toString())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getRefreshSigningKey(), Jwts.SIG.HS256)
                .compact();
    }

    public Long getAccountIdFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        String subject = claims.getSubject();
        if (subject != null) {
            try {
                return Long.parseLong(subject);
            } catch (NumberFormatException ignored) {}
        }
        Object accountId = claims.get("accountId");
        if (accountId instanceof Number number) {
            return number.longValue();
        }
        return null;
    }

    public Long getAccountIdFromRefreshToken(String token) {
        Claims claims = getClaimsFromRefreshToken(token);
        String subject = claims.getSubject();
        if (subject != null) {
            try {
                return Long.parseLong(subject);
            } catch (NumberFormatException ignored) {}
        }
        Object accountId = claims.get("accountId");
        if (accountId instanceof Number number) {
            return number.longValue();
        }
        return null;
    }

    public String getUsernameFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        String username = claims.get("username", String.class);
        if (username != null) {
            return username;
        }
        return claims.getSubject();
    }

    public Claims getClaimsFromToken(String token) {
        return Jwts.parser()
                .verifyWith(getAccessSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public Claims getClaimsFromRefreshToken(String token) {
        return Jwts.parser()
                .verifyWith(getRefreshSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean validateToken(String authToken) {
        try {
            Jwts.parser()
                    .verifyWith(getAccessSigningKey())
                    .build()
                    .parseSignedClaims(authToken);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            log.error("Invalid JWT access token: {}", ex.getMessage());
        }
        return false;
    }

    public boolean validateRefreshToken(String refreshToken) {
        try {
            Jwts.parser()
                    .verifyWith(getRefreshSigningKey())
                    .build()
                    .parseSignedClaims(refreshToken);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            log.error("Invalid JWT refresh token: {}", ex.getMessage());
        }
        return false;
    }

    public long getExpirationInSeconds() {
        return accessTokenExpirationInMs / 1000;
    }

    public long getRefreshTokenExpirationInSeconds() {
        return refreshTokenExpirationInMs / 1000;
    }
}
