const PAISE_PER_RUPEE = 100;

export function rupeesToPaise(rupees: string): number | null {
  const trimmed = rupees.trim();
  if (!trimmed) return null;
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return null;
  const paise = Math.round(parseFloat(trimmed) * PAISE_PER_RUPEE);
  return paise > 0 ? paise : null;
}
