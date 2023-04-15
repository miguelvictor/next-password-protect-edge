import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"
import compare from "safe-compare"
import { serialize } from "cookie"
import { simple } from "./responses"

interface PasswordProtectHandlerOptions {
  cookieMaxAge?: number
  /* @default next-password-protect */
  cookieName?: string
  cookieSameSite?: boolean | "lax" | "none" | "strict"
  cookieSecure?: boolean
  domain?: string
}

export const loginHandler =
  (password: string, options?: PasswordProtectHandlerOptions) =>
  async (req: NextRequest) => {
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

    /* NOTE: It's not usual to use the password as JWT secret, but since you already
     * have access to the environment when you know the password, in this specific
     * use case it doesn't add any value for an intruder if the secret is known.
     */
    return simple(200, {
      "Set-Cookie": serialize(cookieName, jwt.sign({}, password), {
        domain: options?.domain,
        httpOnly: true,
        sameSite,
        secure,
        path: "/",
        ...(options?.cookieMaxAge ? { maxAge: options?.cookieMaxAge } : {}),
      }),
    })
  }
