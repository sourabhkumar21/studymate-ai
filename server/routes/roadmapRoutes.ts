import express from "express";
import { protect } from "../middleware/auth.js";
import { 
  createRoadmap, 
  updateTaskStatus, 
  recalibrateRoadmap, 
  getSingleRoadmap, 
  getUserRoadmaps, 
  chatWithBuddy, 
  globalChatWithBuddy,
  cloneRoadmap, 
  getPublicRoadmaps, 
  togglePublicStatus,
  generateScenario,// ✨ We will build this next!
  toggleLike,
  addComment
} from "../controllers/roadmapController.js";

// ✨ Importing our new security shields
import { chatLimiter, heavyTaskLimiter } from '../middleware/rateLimiter.js';

const roadmapRouter = express.Router(); 

// 1. Health Check
roadmapRouter.get("/test", (req, res) => {
  console.log("ROADMAP TEST ROUTE HIT");
  res.json({ message: "Roadmap backend is alive and well!" });
});

// ✨ 2. COMMUNITY ROUTES (Must go ABOVE /:roadmapId)
roadmapRouter.get("/public", getPublicRoadmaps);
roadmapRouter.patch("/:id/publish", protect, togglePublicStatus);
roadmapRouter.post("/:roadmapId/clone", protect, cloneRoadmap);

roadmapRouter.post("/:roadmapId/like", protect, toggleLike);
roadmapRouter.post("/:roadmapId/comment", protect, addComment);

// ✨ 3. HEAVY AI GENERATION ROUTES (Protected by heavyTaskLimiter)
roadmapRouter.post("/create", protect, heavyTaskLimiter, createRoadmap);
roadmapRouter.post("/tasks/:taskId/scenario", protect, heavyTaskLimiter, generateScenario); // The new Scenario Route!


// ✨ 4. STANDARD DASHBOARD ROUTES
roadmapRouter.patch("/tasks/:taskId", protect, updateTaskStatus);
roadmapRouter.post("/:id/recalibrate", protect, recalibrateRoadmap);
roadmapRouter.get("/", protect, getUserRoadmaps);
roadmapRouter.get("/:roadmapId", protect, getSingleRoadmap);


// ✨ 5. AI CHAT ROUTE (Protected by chatLimiter)
roadmapRouter.post("/global-chat", protect, chatLimiter, globalChatWithBuddy);
roadmapRouter.post("/:id/chat", protect, chatLimiter, chatWithBuddy); 

export default roadmapRouter;