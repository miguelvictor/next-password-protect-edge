import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"
import { simple } from "./responses"

interface PasswordProtectHandlerOptions {
  /* @default next-password-protect-edge */
  cookieName?: string
}

const headers = {
  "Content-Type": "application/json",
  "Cache-Control": "no-cache, no-store, must-revalidate", // HTTP 1.1.
  Pragma: "no-cache", // HTTP 1.0.
  Expires: "0", // Proxies.
}

export const passwordCheckHandler =
  (password: string, options?: PasswordProtectHandlerOptions) =>
  async (req: NextRequest) => {
    // only accept GET requests
    if (req.method !== "GET") return simple(405, headers)

    // extract the token from the cookies
    const cookieName = options?.cookieName || "next-password-protect-edge"
    const token = req.cookies.get(cookieName)?.value

    // only verify the token if it's a string and not empty
    if (typeof token === "string" && token.length > 0) {
      /* NOTE: It's not usual to use the password as JWT secret, but since you already
       * have access to the environment when you know the password, in this specific
       * use case it doesn't add any value for an intruder if the secret is known.
       */
      try {
        jwt.verify(token, password)
        return simple(200, headers)
      } catch (_) {}
    }

    // token is invalid or missing
    return simple(401, headers)
  }
