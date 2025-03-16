import { sendSuccess } from "@/lib/utils/responseHandler";

export default async function handler(req, res) {
  // This endpoint has no protection and should always be accessible
  return sendSuccess(res, "Open access endpoint", {
    message: "This endpoint is accessible without authentication",
    cookies: req.cookies || {},
    hasToken: !!req.cookies?.token,
    method: req.method,
    query: req.query
  });
} 