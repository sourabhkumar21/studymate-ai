import 'dotenv/config';
import "./configs/instrument.js";
import express, { Request, Response } from 'express';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express'
import { clerkWebhooks } from './controllers/webhookController.js';
import * as Sentry from "@sentry/node";
import roadmapRoutes from './routes/roadmapRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

/* ---------------- CORS ---------------- */
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

/* ---------------- Clerk middleware ---------------- */
app.use(clerkMiddleware());

/* =========================================================
   ✨ CRITICAL FIX: Webhook MUST go before express.json()
   ========================================================= */
app.post('/api/clerk', express.raw({ type: 'application/json' }), clerkWebhooks);

/* ---------------- Body parsing ---------------- */
// Now that the webhook safely intercepted its raw data, 
// we can let the rest of the app parse normal JSON!
app.use(express.json());

/* ---------------- Routes ---------------- */
app.get('/', (req: Request, res: Response) => {
    res.send('StudyMate AI Server is Live!');
});

app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});


app.use('/api/roadmaps', roadmapRoutes);

// The error handler must be registered before any other error middleware and after all controllers
Sentry.setupExpressErrorHandler(app);

app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
});