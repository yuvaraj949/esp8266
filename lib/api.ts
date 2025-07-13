const BASE_URL = "https://zghimexugkubkyvglqmr.supabase.co/functions/v1"

// In production, you would get this from environment variables or authentication
const SUPABASE_JWT = process.env.NEXT_PUBLIC_SUPABASE_JWT || ""

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${BASE_URL}${endpoint}`

  const headers: { [key: string]: string } = {
    "Content-Type": "application/json",
    "apikey": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    ...options.headers as { [key: string]: string },
  }

  // Add authorization header in production
  if (SUPABASE_JWT) {
    headers["Authorization"] = `Bearer ${SUPABASE_JWT}`;
  }

  // Force GET for /api-data-latest
  let fetchOptions: RequestInit = { ...options, headers, mode: "cors" as RequestMode };
  if (endpoint === "/api-data-latest") {
    fetchOptions = { ...fetchOptions, method: "GET" };
  }

  const response = await fetch(url, fetchOptions)

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`)
  }

  return response.json()
}
