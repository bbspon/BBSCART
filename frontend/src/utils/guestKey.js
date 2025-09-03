function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = crypto.getRandomValues(new Uint32Array(1))[0] % 16 | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function ensureGuestKey() {
  if (!getGuestKey()) {
    const gk = uuid();
    localStorage.setItem("guestKey", gk);
    document.cookie = `guestKey=${gk}; path=/; max-age=31536000; SameSite=Lax`;
  }
}

export function getGuestKey() {
  return localStorage.getItem("guestKey");
}
