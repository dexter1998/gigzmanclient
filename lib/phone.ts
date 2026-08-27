/**
 * Indian mobile number handling.
 *
 * A subscriber number is exactly 10 digits and begins 6-9. Callers commonly type
 * it with a country code, a leading zero, spaces or hyphens, so input is
 * normalised to the bare 10 digits before being validated or stored.
 */

export interface PhoneCheck {
  valid: boolean;
  /** Bare 10-digit subscriber number, present only when valid. */
  normalised?: string;
  error?: string;
}

export function normalisePhone(input: string): string {
  const digits = input.replace(/\D/g, "");

  // Strip a country code or trunk prefix so what remains is the subscriber number.
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  if (digits.length === 13 && digits.startsWith("091")) return digits.slice(3);

  return digits;
}

export function checkPhone(input: string): PhoneCheck {
  const raw = input.trim();
  if (!raw) return { valid: false, error: "Enter a phone number." };

  const digits = normalisePhone(raw);

  if (digits.length !== 10) {
    return {
      valid: false,
      error:
        digits.length < 10
          ? `Enter all 10 digits — ${digits.length} entered.`
          : `A mobile number is 10 digits — ${digits.length} entered.`,
    };
  }

  if (!/^[6-9]/.test(digits)) {
    return { valid: false, error: "An Indian mobile number starts with 6, 7, 8 or 9." };
  }

  return { valid: true, normalised: digits };
}

/** Display form used in the dashboard and on stored records. */
export function formatPhone(digits: string): string {
  const n = normalisePhone(digits);
  return n.length === 10 ? `${n.slice(0, 5)} ${n.slice(5)}` : digits;
}
