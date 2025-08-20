import { Express, Request, Response, NextFunction } from "express";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

const scryptAsync = promisify(scrypt);
const JWT_SECRET = process.env.JWT_SECRET || "dev-jwt-secret-key-change-me";
const JWT_ACCESS_EXPIRES = "15m";
const JWT_REFRESH_EXPIRES = "7d";
const REFRESH_COOKIE_NAME = "refreshToken";

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  if (hashedBuf.length !== suppliedBuf.length) {
    return false;
  }
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

function signAccessToken(user: SelectUser) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role, department: user.department },
    JWT_SECRET,
    { expiresIn: JWT_ACCESS_EXPIRES }
  );
}

function signRefreshToken(user: SelectUser) {
  return jwt.sign(
    { id: user.id },
    JWT_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES }
  );
}

export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.sendStatus(401);
  }
  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    req.user = payload;
    next();
  } catch {
    return res.sendStatus(401);
  }
}

export function setupAuth(app: Express) {
  // Register (for Citizens)
  app.post("/api/register", async (req, res) => {
    const existingUser = await storage.getUserByUsername(req.body.username);
    if (existingUser) {
      return res.status(400).send("Username already exists");
    }
    const user = await storage.createUser({
      ...req.body,
      password: await hashPassword(req.body.password),
    });
    // Issue tokens
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(201).json({ user, accessToken });
  });

  // --- NEW: Route for Official Registration Requests ---
  app.post("/api/auth/register/official-request", async (req, res) => {
    try {
        const { username, password, role, department, contact } = req.body;

        const existingUser = await storage.getUserByUsername(username);
        if (existingUser) {
            return res.status(409).json({ message: "Username already exists" });
        }

        const hashedPassword = await hashPassword(password);

        // Create user with a 'pending' status. Assumes storage.createUser can handle this.
        await storage.createUser({
            username,
            password: hashedPassword,
            role,
            department,
            phone: contact,
            status: "pending", // Key difference: user is not active yet
        } as any);

        res.status(201).json({ message: "Official account request has been submitted for approval." });
    } catch (error) {
        console.error("Error in official registration request:", error);
        res.status(500).json({ message: "Server error during registration request." });
    }
  });


  // Login
  app.post("/api/login", async (req, res) => {
    const user = await storage.getUserByUsername(req.body.username);
    if (!user || !(await comparePasswords(req.body.password, user.password))) {
      return res.status(401).send("Invalid credentials");
    }
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ user, accessToken });
  });

  // Logout
  app.post("/api/logout", (req, res) => {
    res.clearCookie(REFRESH_COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.sendStatus(200);
  });

  // Refresh
  app.post("/api/refresh", (req, res) => {
    const token = req.cookies[REFRESH_COOKIE_NAME];
    if (!token) return res.sendStatus(401);
    try {
      const payload = jwt.verify(token, JWT_SECRET) as any;
      storage.getUser(payload.id).then((user) => {
        if (!user) return res.sendStatus(401);
        const accessToken = signAccessToken(user);
        res.status(200).json({ accessToken });
      });
    } catch {
      return res.sendStatus(401);
    }
  });

  // Get current user
  app.get("/api/user", authenticateJWT, async (req, res) => {
    if (!req.user) {
      return res.sendStatus(401);
    }
    const user = await storage.getUser(req.user.id);
    if (!user) return res.sendStatus(401);
    res.json(user);
  });
}
