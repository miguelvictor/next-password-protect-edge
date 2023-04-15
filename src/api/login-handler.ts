import type { NextRequest } from "next/server"
import compare from "safe-compare"
import { serialize } from "cookie"

import { simple } from "./responses"
import { sha256 } from "./digest"

interface PasswordProtectHandlerOptions {
  cookieMaxAge?: number
  cookieName?: string
  cookieSameSite?: boolean | "lax" | "none" | "strict"
  cookieSecure?: boolean
  domain?: string
}

export function loginHandler(
  password: any,
  options?: PasswordProtectHandlerOptions
) {
  // check password validity
  if (typeof password !== "string" || password.length === 0)
    throw new Error(`[next-password-protect-edge] Invalid password`)

  return async (req: NextRequest) => {
    // only accept POST requests
    if (req.method !== "POST") return simple(405)

    // extract password from the request body (as json)
    if (req.headers.get("Content-Type") !== "application/json")
      return simple(400)

    // parse the body as json
    let body: any
    try {
      body = await req.json()
    } catch (_) {
      return simple(400)
    }

    // check password existence
    if (typeof body.password !== "string" || !compare(body.password, password))
      return simple(400)

    // build cookie options
    const cookieName = options?.cookieName || "next-password-protect-edge"
    const sameSite = options?.cookieSameSite || false
    const secure =
      options?.cookieSecure !== undefined
        ? options?.cookieSecure
        : process.env.NODE_ENV === "production"

    // just return the sha-256 hash of the password for simplicity
    return simple(200, {
      "Set-Cookie": serialize(cookieName, await sha256(password), {
        domain: options?.domain,
        httpOnly: true,
        sameSite,
        secure,
        path: "/",
        ...(options?.cookieMaxAge ? { maxAge: options?.cookieMaxAge } : {}),
      }),
    })
  }
}
