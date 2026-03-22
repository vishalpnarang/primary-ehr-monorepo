package com.thinkitive.primus.shared.security;

/**
 * Keycloak realm role constants used with {@code @PreAuthorize} annotations.
 *
 * <p>Usage: {@code @PreAuthorize("hasAnyRole('" + Roles.PROVIDER + "', '" + Roles.NURSE + "')")}
 *
 * <p>These must match the realm role names defined in the Keycloak primus realm
 * (see {@code infra/keycloak/primus-realm.json}).
 */
public final class Roles {

    private Roles() {}

    public static final String SUPER_ADMIN = "super_admin";
    public static final String TENANT_ADMIN = "tenant_admin";
    public static final String PRACTICE_ADMIN = "practice_admin";
    public static final String PROVIDER = "provider";
    public static final String NURSE = "nurse";
    public static final String FRONT_DESK = "front_desk";
    public static final String BILLING = "billing";
    public static final String PATIENT = "patient";

    // -----------------------------------------------------------------
    // SpEL expressions for common role groups — use in @PreAuthorize
    // -----------------------------------------------------------------

    /** All staff roles (excludes patient). */
    public static final String HAS_ANY_STAFF_ROLE =
            "hasAnyRole('super_admin','tenant_admin','practice_admin','provider','nurse','front_desk','billing')";

    /** Clinical roles that can access patient charts. */
    public static final String HAS_CLINICAL_ROLE =
            "hasAnyRole('super_admin','tenant_admin','practice_admin','provider','nurse')";

    /** Admin roles that can manage tenant settings. */
    public static final String HAS_ADMIN_ROLE =
            "hasAnyRole('super_admin','tenant_admin','practice_admin')";

    /** Only super admin and tenant admin. */
    public static final String HAS_TENANT_MGMT_ROLE =
            "hasAnyRole('super_admin','tenant_admin')";

    /** Super admin only — platform-wide operations. */
    public static final String HAS_SUPER_ADMIN_ROLE =
            "hasRole('super_admin')";

    /** Billing-related access. */
    public static final String HAS_BILLING_ROLE =
            "hasAnyRole('super_admin','tenant_admin','practice_admin','billing')";

    /** Scheduling access — all staff who interact with appointments. */
    public static final String HAS_SCHEDULING_ROLE =
            "hasAnyRole('super_admin','tenant_admin','practice_admin','provider','nurse','front_desk')";

    /** Prescribing — providers only. */
    public static final String HAS_PRESCRIBING_ROLE =
            "hasAnyRole('super_admin','tenant_admin','provider')";

    /** Orders (labs, imaging, referrals). */
    public static final String HAS_ORDERING_ROLE =
            "hasAnyRole('super_admin','tenant_admin','provider','nurse')";
}
