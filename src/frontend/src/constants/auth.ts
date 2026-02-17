/**
 * Authentication and credential validation constants.
 * These values must match the backend validation rules.
 */

/**
 * Minimum password length enforced by backend setCredentials.
 * Backend rule: password.size() < 10 triggers "Password too short" error.
 */
export const MIN_PASSWORD_LENGTH = 10;

/**
 * Minimum username length for client-side validation.
 */
export const MIN_USERNAME_LENGTH = 3;
