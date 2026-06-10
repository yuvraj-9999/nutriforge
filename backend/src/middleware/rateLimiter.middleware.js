import rateLimit from "express-rate-limit";

export const aiRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,

    max: 5,

    message: {
        success: false,
        message: "Too many AI requests. Please try again later.",
    },

    standardHeaders: true,

    legacyHeaders: false,

    keyGenerator: (req) => {
        return req.user?.userId || req.ip;
    },
});