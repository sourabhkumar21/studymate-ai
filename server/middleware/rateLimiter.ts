import rateLimit from 'express-rate-limit';

// 💬 Chat Limiter: 30 messages per 15 minutes per IP
export const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, 
  message: { message: "Take a breath! You're messaging too fast. Try again in a few minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// 🚀 Heavy AI Task Limiter (For Roadmaps & Scenarios): 5 per 15 minutes
export const heavyTaskLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, 
  message: { message: "AI generation limit reached to prevent server overload. Please wait 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});