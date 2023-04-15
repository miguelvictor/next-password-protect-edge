import type { NextRequest } from "next/server"

import { simple } from "./responses"
import { sha256 } from "./digest"

interface PasswordProtectHandlerOptions {
  cookieName?: string
}

const headers = {
  "Content-Type": "application/json",
  "Cache-Control": "no-cache, no-store, must-revalidate", // HTTP 1.1.
  Pragma: "no-cache", // HTTP 1.0.
  Expires: "0", // Proxies.
}

export function passwordCheckHandler(
  password: string,
  options?: PasswordProtectHandlerOptions
) {
  // check password validity
  if (typeof password !== "string" || password.length === 0)
    throw new Error(`[next-password-protect-edge] Invalid password`)

  return async (req: NextRequest) => {
    // only accept GET requests
    if (req.method !== "GET") return simple(405, headers)

    // extract the token from the cookies
    const cookieName = options?.cookieName || "next-password-protect-edge"
    const token = req.cookies.get(cookieName)?.value
    const hash = await sha256(password)

    // token is invalid or missing
    if (typeof token !== "string" || hash !== token) return simple(401, headers)

    // token is valid
    return simple(200, headers)
  }
}
