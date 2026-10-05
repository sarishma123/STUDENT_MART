export const PASSWORD_REQUIREMENTS =
  'Password must be at least 9 characters and include uppercase, lowercase, a number, and a symbol.';

export function isStrongPassword(password) {
  return (
    typeof password === 'string' &&
    password.length >= 9 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}
