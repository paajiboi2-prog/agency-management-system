import type { Request, Response, NextFunction } from "express";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = header.slice(7);
  if (!token.startsWith("mock-jwt-")) {
    return res.status(401).json({ error: "Invalid token" });
  }
  const parts = token.split("-");
  const userId = parts[2];
  if (!userId) {
    return res.status(401).json({ error: "Invalid token" });
  }
  (req as Request & { userId: string }).userId = userId;
  return next();
}
