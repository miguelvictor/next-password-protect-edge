import React, { ElementType, useEffect, useState } from "react"
import type { AppProps } from "next/app"
import { useAmp } from "next/amp"

import { NextRouter, useRouter } from "next/router"
import {
  LoginComponent as DefaultLoginComponent,
  LoginComponentProps,
} from "./login"
import { API_PASSWORD_CHECK } from "../defaults"

interface PasswordProtectHOCOptions {
  checkApiUrl?: string
  loginApiUrl?: string
  loginComponent?: ElementType
  loginComponentProps?: Omit<LoginComponentProps, "apiUrl">
  bypassProtection?: (route: NextRouter) => boolean
}

/// TODO: improve App typing
export const withPasswordProtect = (
  App: any,
  options?: PasswordProtectHOCOptions
) => {
  const ProtectedApp = ({ Component, pageProps, ...props }: AppProps) => {
    const isAmp = useAmp()
    const router = useRouter()
    const [isAuthenticated, setAuthenticated] = useState<undefined | boolean>(
      undefined
    )

    const checkIfLoggedIn = async () => {
      try {
        const res = await fetch(options?.checkApiUrl || API_PASSWORD_CHECK, {
          credentials: "include",
        })

        setAuthenticated(res.ok)
      } catch (_) {
        setAuthenticated(false)
      }
    }

    useEffect(() => {
      checkIfLoggedIn()
    }, [])

    if (isAuthenticated === undefined) {
      return null
    }

    const bypassProtection = options?.bypassProtection?.(router) ?? false
    if (isAuthenticated || bypassProtection) {
      return <App Component={Component} pageProps={pageProps} {...props} />
    }

    // AMP is not yet supported
    if (isAmp) return null

    const LoginComponent: ElementType =
      options?.loginComponent || DefaultLoginComponent

    return (
      <LoginComponent
        apiUrl={options?.loginApiUrl}
        {...(options?.loginComponentProps || {})}
      />
    )
  }

  return ProtectedApp
}
