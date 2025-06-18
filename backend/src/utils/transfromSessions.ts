import { Request, Response } from "express";
import { UAParser } from "ua-parser-js";
import { format } from "date-fns";
import { logger } from "../configs/logger";

interface SessionWithUserAgent {
  id: string;
  updatedAt: Date;
  userAgent: string | null;
  ipAddress: string | null;
  expiresAt: Date;
  current: boolean;
}

interface TransformedSession {
  id: string;
  device: string;
  location: string;
  ip: string;
  lastActive: string;
  status: "expired" | "active";
  current: boolean;
}

export const transformSessions = async (sessions: SessionWithUserAgent[]) => {
  const transformed: TransformedSession[] = [];

  for (const session of sessions) {
    const parser = UAParser(session.userAgent!);
    const browser = parser.browser.name || "Unknown";
    const deviceType = parser.device.type || "Desktop";
    const device = `${deviceType} - ${browser}`;
    const location = await getLocationFromIP(session.ipAddress!);
    const lastActive = format(new Date(session.updatedAt), "d/M/yyyy, h:mm:ss a");
    const status = getSessionStatus(session.expiresAt);

    transformed.push({
      id: session.id,
      device,
      location,
      ip: session.ipAddress!,
      lastActive,
      current: session.current,
      status,
    });
  }

  return transformed;
};

const getLocationFromIP = async (ip: string): Promise<string> => {
  if (ip === "::1" || ip === "127.0.0.1") return "Localhost";

  try {
    const token = process.env.IPINFO_TOKEN;
    const res = await fetch(`https://ipinfo.io/${ip}?token=${token}`);
    const data = (await res.json()) as { city?: string; country?: string };

    const location =
      data.city && data.country
        ? `${data.city}, ${data.country}`
        : data.country || "Unknown Location";

    return location;
  } catch (err) {
    logger.error("Error fetching IP info", err);
    return "Unknown Location";
  }
};

const getSessionStatus = (expiresAt: Date) => {
  return new Date() < new Date(expiresAt) ? "active" : "expired";
};
