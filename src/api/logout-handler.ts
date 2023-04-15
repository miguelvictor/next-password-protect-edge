import type { NextRequest } from "next/server"
import { serialize } from "cookie"
import { simple } from "./responses"

interface PasswordProtectHandlerOptions {
  cookieName?: string
  cookieSameSite?: boolean | "lax" | "none" | "strict"
  cookieSecure?: boolean
}

export const logoutHandler =
  (options?: PasswordProtectHandlerOptions) => async (req: NextRequest) => {
    if (req.method !== "POST") return simple(405)

    const cookieName = options?.cookieName || "next-password-protect-edge"
    const sameSite = options?.cookieSameSite || false
    const secure =
      options?.cookieSecure !== undefined
        ? options?.cookieSecure
        : process.env.NODE_ENV === "production"

    return simple(200, {
      "Set-Cookie": serialize(cookieName, "", {
        httpOnly: true,
        sameSite,
        secure,
        path: "/",
        maxAge: 0,
      }),
    })
  }
