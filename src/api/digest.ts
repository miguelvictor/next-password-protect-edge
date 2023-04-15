export async function sha256(password: string): Promise<string> {
  const encoded = new TextEncoder().encode(password)
  const digest = await crypto.subtle.digest("SHA-256", encoded)
  const hash = Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("")

  return hash
}
