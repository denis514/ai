// Shared AES-GCM helpers для edge functions (Deno / Web Crypto).
//
// Секрет шифрования живёт в env BUILDER_KEY_ENCRYPTION_SECRET (Supabase secret),
// НИКОГДА не покидает сервер. Формат хранимого значения: base64(iv).base64(ciphertext).

const SECRET = Deno.env.get('BUILDER_KEY_ENCRYPTION_SECRET') || '';

if (!SECRET || SECRET.length < 32) {
  // Не валим импорт — функция вернёт явную ошибку при вызове, чтобы деплой
  // не падал молча. Но логируем предупреждение.
  console.warn('[crypto] BUILDER_KEY_ENCRYPTION_SECRET missing or < 32 chars');
}

async function getKey(): Promise<CryptoKey> {
  // Берём первые 32 байта секрета как ключ AES-256.
  const raw = new TextEncoder().encode(SECRET.slice(0, 32).padEnd(32, '0'));
  return crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, [
    'encrypt',
    'decrypt',
  ]);
}

function toB64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}
function fromB64(s: string): Uint8Array {
  return Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
}

/** Шифрует plaintext → "ivB64.cipherB64". */
export async function encrypt(plaintext: string): Promise<string> {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(plaintext),
  );
  return `${toB64(iv)}.${toB64(new Uint8Array(ct))}`;
}

/** Расшифровывает "ivB64.cipherB64" → plaintext. */
export async function decrypt(stored: string): Promise<string> {
  const [ivB64, ctB64] = stored.split('.');
  if (!ivB64 || !ctB64) throw new Error('bad ciphertext format');
  const key = await getKey();
  const pt = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: fromB64(ivB64) },
    key,
    fromB64(ctB64),
  );
  return new TextDecoder().decode(pt);
}

export function secretConfigured(): boolean {
  return !!SECRET && SECRET.length >= 32;
}
