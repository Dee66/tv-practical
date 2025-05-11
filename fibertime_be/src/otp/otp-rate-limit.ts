import rateLimit from "express-rate-limit";

export const otpRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 requests per windowMs
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many OTP requests, please try again later.",
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});
