export function readRequiredText(formData: FormData, field: string): string {
  const value = formData.get(field);

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Le champ ${field} est obligatoire.`);
  }

  return value.trim();
}

export function readOptionalText(formData: FormData, field: string): string | null {
  const value = formData.get(field);

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function readRequiredEmail(formData: FormData, field: string): string {
  const value = readRequiredText(formData, field);

  if (!isEmail(value)) {
    throw new Error(`Le champ ${field} doit etre un email valide.`);
  }

  return value;
}

export function readOptionalEmail(formData: FormData, field: string): string | null {
  const value = readOptionalText(formData, field);

  if (value && !isEmail(value)) {
    throw new Error(`Le champ ${field} doit etre un email valide.`);
  }

  return value;
}

export function readRequiredPositiveInteger(formData: FormData, field: string): number {
  const rawValue = readRequiredText(formData, field);
  const value = Number(rawValue);

  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`Le champ ${field} doit etre un entier positif.`);
  }

  return value;
}

export function readRequiredDate(formData: FormData, field: string): Date {
  const value = readRequiredText(formData, field);
  const date = new Date(`${value}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Le champ ${field} doit etre une date valide.`);
  }

  return date;
}
