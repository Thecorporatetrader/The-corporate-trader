export const passwordHelp = 'Use 9–14 characters, including uppercase, lowercase, a number and a special character.';
export function validName(value: string) { return /^[\p{L}\p{M}]+(?: +[\p{L}\p{M}]+)*$/u.test(value.trim()) && value.trim().length <= 80; }
export function validEmail(value: string) {
  const [local = ''] = value.split('@');
  return value.length <= 254 && !local.startsWith('.') && !local.endsWith('.') && !local.includes('..')
    && /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9](?:[A-Za-z0-9\-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9\-]{0,61}[A-Za-z0-9])?)+$/.test(value);
}
export function validPassword(value: string) { return value.length >= 9 && value.length <= 14 && /[A-Z]/.test(value) && /[a-z]/.test(value) && /[0-9]/.test(value) && /[^A-Za-z0-9\s]/.test(value); }
export function validMobile(value: string) { return /^[0-9]{8,15}$/.test(value); }
export function identityError(name: string, email: string, country: string, mobile: string) {
  if (!validName(name)) return 'Name must contain letters only (spaces between names are allowed).';
  if (!validEmail(email)) return 'Enter a valid email address, such as name@domain.com.';
  if (!/^\+[1-9][0-9]{0,3}$/.test(country) || !validMobile(mobile)) return 'Choose a country code and enter 8–15 digits for your mobile number.';
  return '';
}
