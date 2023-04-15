export function simple(status = 204, headers?: HeadersInit): Response {
  return new Response(null, { status, headers })
}

export function json(
  status: number,
  object: Record<string, any>,
  headers?: HeadersInit
): Response {
  return new Response(JSON.stringify(object), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  })
}
