export function withAlpha(hex: string, ratio: number): string {
  const clamped = Math.max(0, Math.min(1, ratio));
  const byte = Math.round(clamped * 255)
    .toString(16)
    .padStart(2, '0');
  return hex + byte;
}
