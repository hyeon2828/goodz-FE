export function genUid() {
  return Math.random().toString(36).slice(2);
}

export function fmtPrice(p: number) {
  return p.toLocaleString() + "원";
}

export function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}
