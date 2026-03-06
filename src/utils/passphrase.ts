/** Hash a passphrase using SHA-256 via Web Crypto API (no salt — casual access control) */
export async function hashPassphrase(passphrase: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(passphrase);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Verify a passphrase against a stored hash */
export async function verifyPassphrase(passphrase: string, hash: string): Promise<boolean> {
  const computed = await hashPassphrase(passphrase);
  return computed === hash;
}
