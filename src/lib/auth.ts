import { randomBytes, randomInt, createHash } from 'crypto'
import bcrypt from 'bcryptjs'

/** Generates a random hex string — replaces PHP's func::createString(). */
export function generateToken(length = 32): string {
  return randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length)
}

/** Generates a cryptographically secure 6-digit email verification code. */
export function generateVerificationCode(): string {
  return String(randomInt(100000, 1000000))
}

/**
 * Generates a password reset token pair.
 * Returns the raw token (sent to the user via email) and its SHA-256 hash (stored in DB).
 */
export function generatePasswordResetToken(): { raw: string; hash: string } {
  const raw = randomBytes(32).toString('hex')
  const hash = createHash('sha256').update(raw).digest('hex')
  return { raw, hash }
}

/** Hashes a raw password reset token for DB lookup. */
export function hashResetToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex')
}

/**
 * Hashes a password with bcrypt (cost 12).
 * Compatible with PHP's password_hash($pass, PASSWORD_DEFAULT) — both use bcrypt.
 * Existing user passwords from the PHP app will verify correctly.
 */
export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12)
}

/** Verifies a plain password against a bcrypt hash. */
export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}

/** Validates password strength: min 8 chars, at least 1 uppercase, 1 lowercase. */
export function isValidPassword(password: string): boolean {
  return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password)
}
