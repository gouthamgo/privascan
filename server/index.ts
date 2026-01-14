import express, { Request, Response, NextFunction } from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Security headers middleware
 * Implements essential security headers to protect against common web vulnerabilities
 */
function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  // Prevent clickjacking attacks
  res.setHeader("X-Frame-Options", "DENY");

  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Enable XSS filter in older browsers
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Control referrer information - use strict policy for privacy
  res.setHeader("Referrer-Policy", "no-referrer");

  // Cross-Origin security headers
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");

  // Permissions policy - restrict browser features (comprehensive list)
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(), usb=(), bluetooth=(), serial=(), hid=()"
  );

  // Content Security Policy - strict policy allowing only Tesseract.js CDN
  // 'unsafe-eval' required for Tesseract.js WebAssembly
  // 'unsafe-inline' required for React inline styles
  // jsdelivr.net required for Tesseract.js worker scripts
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self'",
      "img-src 'self' data: blob:",
      "worker-src 'self' blob: https://cdn.jsdelivr.net",
      "connect-src 'self' blob: https://cdn.jsdelivr.net",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join("; ")
  );

  // Enable HSTS in production (tells browsers to always use HTTPS)
  if (process.env.NODE_ENV === "production") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  next();
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Apply security headers to all requests
  app.use(securityHeaders);

  // Disable X-Powered-By header to hide Express
  app.disable("x-powered-by");

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  // Serve static files with caching headers
  app.use(
    express.static(staticPath, {
      maxAge: process.env.NODE_ENV === "production" ? "1d" : 0,
      etag: true,
    })
  );

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
