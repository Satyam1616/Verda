import winston from "winston";
import fs from "fs";

/**
 * On a normal machine we also write a rolling file log. On a read-only /
 * serverless filesystem (e.g. Vercel) creating the `logs/` directory throws,
 * which would crash the whole function at import time — so we add the file
 * transport only when the directory can actually be created.
 */
const transports: winston.transport[] = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
    ),
  }),
];

try {
  fs.mkdirSync("logs", { recursive: true });
  transports.push(new winston.transports.File({ filename: "logs/combined.log" }));
} catch {
  // Read-only filesystem — console logging only.
}

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports,
});

export default logger;
