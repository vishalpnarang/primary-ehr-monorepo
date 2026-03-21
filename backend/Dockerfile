# ---------------------------------------------------------------------------
# Dockerfile — Primus EHR Spring Boot backend
#
# Build this after running: mvn package -DskipTests
# The fat JAR ends up at target/*.jar and is copied into the image.
#
# Layered JAR approach (Spring Boot 2.3+):
#   Instead of copying the whole fat JAR, we unpack it into layers so that
#   Docker can cache dependencies separately from application code.
#   On code-only changes, only the top ~5MB layer re-uploads to ECR.
#
# Base image: eclipse-temurin:21-jre-alpine
#   - eclipse-temurin: OpenJDK builds from Adoptium (most trusted free JDK)
#   - 21: Java 21 LTS (as specified in tech-stack.md)
#   - jre: runtime only — no compiler, smaller image
#   - alpine: minimal Linux base — image is ~200MB vs ~400MB for debian
#
# Cost impact: smaller image = faster ECR push/pull = less Fargate cold start.
# ---------------------------------------------------------------------------

# ---------------------------------------------------------------------------
# Stage 1: Unpack the fat JAR into layers
# This runs during `docker build` only — not at runtime.
# ---------------------------------------------------------------------------
FROM eclipse-temurin:21-jre-alpine AS builder

WORKDIR /build

# Copy the fat JAR produced by `mvn package` or `gradle bootJar`
COPY target/*.jar app.jar

# Unpack into Spring Boot layer directories:
#   dependencies/          — 3rd-party JARs (changes rarely)
#   spring-boot-loader/    — Spring Boot launcher (changes rarely)
#   snapshot-dependencies/ — SNAPSHOT JARs (changes occasionally)
#   application/           — compiled application classes (changes every build)
RUN java -Djarmode=layertools -jar app.jar extract --destination /build/extracted

# ---------------------------------------------------------------------------
# Stage 2: Final runtime image
# Only the unpacked layers land here — no build tools, no fat JAR.
# ---------------------------------------------------------------------------
FROM eclipse-temurin:21-jre-alpine

# Non-root user for security — never run containers as root in production
RUN addgroup -S primus && adduser -S primus -G primus

WORKDIR /app

# Copy layers from builder in dependency order (least-to-most-frequently changing).
# Docker caches each COPY as a separate layer, so unchanged layers are not re-pushed.
COPY --from=builder /build/extracted/dependencies          ./
COPY --from=builder /build/extracted/spring-boot-loader   ./
COPY --from=builder /build/extracted/snapshot-dependencies ./
COPY --from=builder /build/extracted/application          ./

# Switch to non-root user
USER primus

# Expose Spring Boot default port
EXPOSE 8080

# JVM tuning for Fargate containers:
#   -XX:+UseContainerSupport       : respect container CPU/memory limits (default on Java 11+)
#   -XX:MaxRAMPercentage=75.0      : use up to 75% of container RAM for JVM heap
#   -XX:+OptimizeStringConcat      : minor string performance improvement
#   -Djava.security.egd=...        : faster SecureRandom initialization (important for Keycloak JWT)
#   -Dspring.jmx.enabled=false     : disable JMX (not needed, saves memory)
ENV JAVA_OPTS="-XX:+UseContainerSupport \
  -XX:MaxRAMPercentage=75.0 \
  -XX:+OptimizeStringConcat \
  -Djava.security.egd=file:/dev/./urandom \
  -Dspring.jmx.enabled=false"

# Use exec form (no shell wrapper) so signals (SIGTERM from ECS) reach the JVM directly.
# This enables graceful shutdown — Spring Boot will drain requests before exiting.
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-Dspring.jmx.enabled=false", \
  "org.springframework.boot.loader.launch.JarLauncher"]

# Health check — matches the ALB health check path in alb.tf
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget -q --spider http://localhost:8080/actuator/health || exit 1
