package com.thinkitive.primus.shared.integration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.ses.SesClient;
import software.amazon.awssdk.services.sns.SnsClient;

/**
 * AWS SDK v2 client beans for SES, SNS, and S3.
 *
 * <p>Each client is conditional on its own enable flag so the application
 * starts cleanly in local development without real AWS credentials.
 *
 * <p>Credentials are resolved via the {@link DefaultCredentialsProvider} chain:
 * <ol>
 *   <li>Environment variables ({@code AWS_ACCESS_KEY_ID} / {@code AWS_SECRET_ACCESS_KEY})</li>
 *   <li>Java system properties</li>
 *   <li>AWS shared credentials file ({@code ~/.aws/credentials})</li>
 *   <li>ECS / EKS task role (recommended for production on AWS)</li>
 *   <li>EC2 instance profile</li>
 * </ol>
 *
 * <p>In production, run on ECS with a task IAM role that has the minimum required
 * permissions — do not use long-lived access keys.
 */
@Configuration
public class AwsConfig {

    private static final Logger log = LoggerFactory.getLogger(AwsConfig.class);

    @Value("${cloud.aws.region.static:us-east-1}")
    private String awsRegion;

    // -------------------------------------------------------------------------
    // SES — Simple Email Service (transactional email)
    // -------------------------------------------------------------------------

    /**
     * Amazon SES client for sending transactional emails (appointment reminders,
     * password resets, clinical result notifications).
     *
     * <p>Activated when {@code primus.integrations.aws.ses.enabled=true}.
     */
    @Bean
    @ConditionalOnProperty(name = "primus.integrations.aws.ses.enabled", havingValue = "true")
    public SesClient sesClient() {
        SesClient client = SesClient.builder()
                .region(Region.of(awsRegion))
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();
        log.info("AWS SES client initialised (region={}).", awsRegion);
        return client;
    }

    // -------------------------------------------------------------------------
    // SNS — Simple Notification Service (SMS + fan-out)
    // -------------------------------------------------------------------------

    /**
     * Amazon SNS client for publishing appointment reminder SMS messages and
     * fan-out notification dispatches via SNS topics.
     *
     * <p>Activated when {@code primus.integrations.aws.sns.enabled=true}.
     */
    @Bean
    @ConditionalOnProperty(name = "primus.integrations.aws.sns.enabled", havingValue = "true")
    public SnsClient snsClient() {
        SnsClient client = SnsClient.builder()
                .region(Region.of(awsRegion))
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();
        log.info("AWS SNS client initialised (region={}).", awsRegion);
        return client;
    }

    // -------------------------------------------------------------------------
    // S3 — Simple Storage Service (document / attachment storage)
    // -------------------------------------------------------------------------

    /**
     * Amazon S3 client for storing patient documents, lab attachments, and
     * other clinical file uploads.
     *
     * <p>Activated when {@code primus.integrations.aws.s3.enabled=true}.
     */
    @Bean
    @ConditionalOnProperty(name = "primus.integrations.aws.s3.enabled", havingValue = "true")
    public S3Client s3Client() {
        S3Client client = S3Client.builder()
                .region(Region.of(awsRegion))
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();
        log.info("AWS S3 client initialised (region={}).", awsRegion);
        return client;
    }
}
