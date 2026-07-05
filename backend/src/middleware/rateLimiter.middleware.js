import rateLimit, { ipKeyGenerator } from "express-rate-limit";

export const aiRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,

    max: 5,

    message: {
        success: false,
        message: "Too many AI requests. Please try again later.",
    },

    standardHeaders: true,

    legacyHeaders: false,

   keyGenerator: (req) =>
    req.user?.userId ?? ipKeyGenerator(req.ip)
});

export const emailLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many email requests. Please try again in 15 minutes.",
    },
});