import { env } from "../configs/env";
import { OAuth2Client } from "google-auth-library";
import { CustomError } from "./CustomError";

const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

export const verifyGoogleToken = async (credential: string) => {
  if (!credential) {
    throw new CustomError(400, "Google credential is required");
  }

  let payload;
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (error) {
    throw new CustomError(401, "Invalid Google token");
  }

  if (!payload) {
    throw new CustomError(401, "Google token verification failed, No payload received");
  }

  return payload;
};
