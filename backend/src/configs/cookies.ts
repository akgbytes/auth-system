import ms, { StringValue } from "ms";
import { env } from "./env";

interface CookieOptionsArgs {
  rememberMe?: boolean;
}

export function generateCookieOptions({ rememberMe = false }: CookieOptionsArgs = {}) {
  const expiry = rememberMe ? env.REFRESH_TOKEN_EXPIRY_REMEMBER_ME : env.REFRESH_TOKEN_EXPIRY;
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: ms(expiry as StringValue),
  };
}
