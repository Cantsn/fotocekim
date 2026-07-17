/** Form alan doğrulama (istemci + sunucu) */

export function normalizePhone(raw: string): string {
  // Sadece rakam ve baştaki +
  const trimmed = raw.trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  return hasPlus ? `+${digits}` : digits;
}

/** TR / uluslararası: 10–15 rakam; 05xx veya 5xx veya +90... */
export function isValidPhone(raw: string): boolean {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) return false;
  // En az 10 rakam, hepsi sayı (zaten)
  if (!/^\d+$/.test(digits)) return false;
  // TR cep: 05xxxxxxxxx (11) veya 5xxxxxxxxx (10) veya 905xxxxxxxxx (12)
  if (digits.startsWith("0") && digits.length === 11) {
    return /^05\d{9}$/.test(digits);
  }
  if (digits.startsWith("5") && digits.length === 10) {
    return /^5\d{9}$/.test(digits);
  }
  if (digits.startsWith("90") && digits.length === 12) {
    return /^905\d{9}$/.test(digits);
  }
  // Diğer uluslararası: + ve 10–15 digit, harf yok
  if (digits.length >= 10 && digits.length <= 15) {
    // Tamamen harf içeren orijinal metni reddet
    if (/[a-zA-ZğüşıöçĞÜŞİÖÇ]/.test(raw)) return false;
    return true;
  }
  return false;
}

export function isValidEmail(raw: string): boolean {
  const v = raw.trim();
  if (!v) return true; // opsiyonel alan
  // Basit ama sıkı e-posta
  if (v.length > 254) return false;
  if (/\s/.test(v)) return false;
  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/.test(
    v,
  );
}

/** Ad soyad: harf, boşluk, tire, apostrof; en az 2 harf; rakam yok */
export function isValidPersonName(raw: string): boolean {
  const v = raw.trim().replace(/\s+/g, " ");
  if (v.length < 2 || v.length > 80) return false;
  // En az bir harf
  if (!/[a-zA-ZğüşıöçĞÜŞİÖÇ]/.test(v)) return false;
  // Rakam yok
  if (/\d/.test(v)) return false;
  // Sadece harf, boşluk, tire, nokta (kısaltma), apostrof
  if (!/^[a-zA-ZğüşıöçĞÜŞİÖÇ.'’\- ]+$/.test(v)) return false;
  // En az 2 karakter harf toplamı
  const letters = v.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ]/g, "");
  if (letters.length < 2) return false;
  return true;
}

export function validateContactFields(input: {
  name: string;
  phone: string;
  email?: string;
}): string | null {
  if (!isValidPersonName(input.name)) {
    return "Lütfen geçerli bir ad soyad girin (sadece harf, rakam olamaz).";
  }
  if (!isValidPhone(input.phone)) {
    return "Lütfen geçerli bir telefon girin (örn. 05XX XXX XX XX). Harf kabul edilmez.";
  }
  if (input.email && !isValidEmail(input.email)) {
    return "Lütfen geçerli bir e-posta adresi girin (örn. ornek@mail.com).";
  }
  return null;
}

/** Telefon inputunda sadece rakam, boşluk, +, -, ( ) */
export function sanitizePhoneInput(value: string): string {
  return value.replace(/[^\d+\s().-]/g, "");
}

/** İsim inputunda rakam ve geçersiz sembolleri temizle */
export function sanitizeNameInput(value: string): string {
  return value.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ.'’\- ]/g, "");
}
