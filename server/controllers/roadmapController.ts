import { Request, Response } from "express";
import * as Sentry from "@sentry/node";
import { prisma } from "../configs/prisma.js"; 
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAuth } from '@clerk/express';


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

// ==========================================
// CREATE A NEW ROADMAP
// ==========================================
export const createRoadmap = async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized: Please log in." });
   
    /*// ✨ THE FIX: Auto-register the user here too!
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
       email: `${userId}@studymate.com`, // 👈 Guaranteed to be unique now!
        name: "StudyMate Scholar",
        image: "none"
      }
    });*/

    const { title, examDate, syllabusText } = req.body;
    if (!title || !examDate || !syllabusText) {
      return res.status(400).json({ message: "Title, Exam Date, and Syllabus are required." });
    }

    const exam = new Date(examDate);
    const today = new Date();
    const daysRemaining = Math.max(1, Math.ceil((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `
      You are an expert data extractor. Analyze the following syllabus text.
      Extract the distinct, core study topics.
      CRITICAL RULE: Return ONLY a valid JSON array of strings. 
      Do NOT include markdown formatting (\`\`\`json). Just the raw array.
      
      Syllabus Text:
      "${syllabusText}"
    `;

    const result = await model.generateContent(prompt);
    const cleanJsonString = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    const topicsArray: string[] = JSON.parse(cleanJsonString);

    const roadmap = await prisma.roadmap.create({
      data: {
        userId,
        title,
        examDate: exam,
        syllabusText,
        tasks: {
          create: topicsArray.map((topic, index) => ({
            topic,
            dayNumber: (index % daysRemaining) + 1,
            confidenceLevel: "WEAK",
            isCompleted: false
          }))
        }
      },
      include: { tasks: true } 
    });

    return res.status(201).json({ message: "Generated successfully!", roadmap });
  } catch (error: any) {
    Sentry.captureException(error);
    console.error("Generation Error:", error);
    return res.status(500).json({ message: "Failed to generate roadmap." });
  }
};

// ==========================================
// FETCH SINGLE ROADMAP (Dashboard View)
// ==========================================
export const getSingleRoadmap = async (req: Request, res: Response): Promise<any> => {
  try {
    // ✨ STRICT TYPE FIX HERE:
    const { roadmapId } = req.params as { roadmapId: string };
    const { userId } = getAuth(req); 
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const roadmap = await prisma.roadmap.findUnique({
      where: { id: roadmapId, userId },
      include: { tasks: { orderBy: { dayNumber: 'asc' } } }
    });

    if (!roadmap) return res.status(404).json({ message: "Roadmap not found." });
    return res.status(200).json(roadmap);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch roadmap." });
  }
};

// ==========================================
// UPDATE TASK STATUS
// ==========================================
export const updateTaskStatus = async (req: Request, res: Response): Promise<any> => {
  try {
    // ✨ STRICT TYPE FIX HERE:
    const { taskId } = req.params as { taskId: string };
    const { confidenceLevel, isCompleted, incrementRevision } = req.body;

    const updatedTask = await prisma.studyTask.update({
      where: { id: taskId },
      data: {
        ...(confidenceLevel && { confidenceLevel }),
        ...(typeof isCompleted === "boolean" && { isCompleted }),
        ...(incrementRevision && { revisionCount: { increment: 1 } })
      }
    });

    return res.status(200).json({ task: updatedTask });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update task." });
  }
};

// ==========================================
// THE RECALIBRATION ENGINE
// ==========================================
export const recalibrateRoadmap = async (req: Request, res: Response): Promise<any> => {
  try {
    // ✨ STRICT TYPE FIX HERE:
    const { id } = req.params as { id: string };
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const roadmap = await prisma.roadmap.findFirst({
      where: { id, userId },
      include: { tasks: { where: { isCompleted: false }, orderBy: { dayNumber: 'asc' } } }
    });

    if (!roadmap) return res.status(404).json({ message: "Roadmap not found." });
    if (roadmap.tasks.length === 0) return res.status(200).json({ message: "All caught up!" });

    const daysRemaining = Math.max(1, Math.ceil((new Date(roadmap.examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

    // ✨ ADDED TYPES HERE: (task: any, index: number)
    const queries = roadmap.tasks.map((task: any, index: number) => 
      prisma.studyTask.update({
        where: { id: task.id },
        data: { dayNumber: (index % daysRemaining) + 1 }
      })
    );

    await prisma.$transaction(queries);
    return res.status(200).json({ message: "Recalibrated!" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to recalibrate." });
  }
};

// ==========================================
// FETCH ALL ROADMAPS FOR A USER
// ==========================================
export const getUserRoadmaps = async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const roadmaps = await prisma.roadmap.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { tasks: true } } }
    });

    return res.status(200).json(roadmaps);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch roadmaps." });
  }
};

// ==========================================
// THE AI STUDY BUDDY (Context-Aware RAG)
// ==========================================
export const chatWithBuddy = async (req: Request, res: Response): Promise<any> => {
  try {
    // ✨ STRICT TYPE FIX HERE:
    const { id } = req.params as { id: string };
    const { message } = req.body;
    const { userId } = getAuth(req);

    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!message) return res.status(400).json({ message: "Message is required" });

    const roadmap = await prisma.roadmap.findFirst({
      where: { id, userId },
      include: { tasks: true }
    });

    if (!roadmap) return res.status(404).json({ message: "Roadmap not found" });

    const completed = roadmap.tasks.filter((t: any) => t.isCompleted).length;
    const pendingTopics = roadmap.tasks.filter((t: any) => !t.isCompleted).map((t: any) => t.topic).join(", ");
    const completionRate = roadmap.tasks.length > 0 ? Math.round((completed / roadmap.tasks.length) * 100) : 0;

    const systemPrompt = `
  You are StudyMate, an elite, highly tactical academic strategist. Do NOT act like a generic AI.
  
  Context: Studying "${roadmap.title}". Exam: ${new Date(roadmap.examDate).toDateString()}.
  Status: ${completionRate}% complete. Next up: ${pendingTopics || "Final Review"}.
  User Message: "${message}"
  
  Rules:
  1. Answer the message directly.
  2. Assess urgency: Compare their progress against the exam date. Give a brief reality check (praise if ahead, warn constructively if behind).
  3. Give ONE highly specific, tactical study method (e.g., Feynman technique, Spaced Repetition, building a specific mental model) tailored exactly to their "Next up" topics.
  4. Max 4 sentences. Be punchy, brutally encouraging, and deeply practical. No generic fluff.
`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const aiResponse = await model.generateContent(systemPrompt);
    
    return res.status(200).json({ reply: aiResponse.response.text() });
  } catch (error) {
    return res.status(500).json({ message: "AI Buddy failed." });
  }
};

// ==========================================
// 🌐 COMMUNITY LOGIC
// ==========================================
export const togglePublicStatus = async (req: Request, res: Response): Promise<any> => {
  try {
    // ✨ STRICT TYPE FIX HERE:
    const { id } = req.params as { id: string };
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const roadmap = await prisma.roadmap.update({
      where: { id, userId },
      data: { isPublic: true }
    });
    return res.status(200).json({ message: "Published!", roadmap });
  } catch (error) {
    return res.status(500).json({ message: "Publishing failed" });
  }
};

export const cloneRoadmap = async (req: Request, res: Response): Promise<any> => {
  try {
    // ✨ STRICT TYPE FIX HERE:
    const { roadmapId } = req.params as { roadmapId: string };
    const { userId } = getAuth(req); 
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

   /* // ✨ THE FIX: Make sure the user exists in our DB before assigning roadmaps!
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: `${userId}@studymate.com`, // 👈 Guaranteed to be unique now!
        name: "StudyMate Scholar",
        image: "none"
      }
    });*/

    const original = await prisma.roadmap.findUnique({
      where: { id: roadmapId },
      include: { tasks: true }
    });

    if (!original) return res.status(404).json({ message: "Roadmap not found" });

    const clonedRoadmap = await prisma.roadmap.create({
      data: {
        userId,
        title: `${original.title} (Clone)`,
        examDate: original.examDate,
        syllabusText: original.syllabusText,
        isPublic: false, 
        // ✨ ADDED TYPE HERE: (task: any)
        tasks: {
          create: original.tasks.map((task: any) => ({
            topic: task.topic,
            dayNumber: task.dayNumber,
            confidenceLevel: "WEAK", 
            isCompleted: false,
            revisionCount: 0
          }))
        }
      },
      include: { tasks: true }
    });

    return res.status(201).json({ roadmap: clonedRoadmap });
  } catch (error) {
    return res.status(500).json({ message: "Failed to clone roadmap." });
  }
};

// Fetch all public roadmaps for the Community Feed
export const getPublicRoadmaps = async (req: Request, res: Response): Promise<any> => {
  try {
    const publicRoadmaps = await prisma.roadmap.findMany({
      where: { isPublic: true },
      include: {
        user: { select: { name: true, image: true } },
        tasks: true,
        likes: true,    // ✨ Fetch the likes to see who liked it
        comments: {     // ✨ Fetch comments ordered by newest
          orderBy: { createdAt: 'desc' }
        } 
      },
      orderBy: { likeCount: 'desc' } // 🔥 Sort by most popular!
    });

    return res.status(200).json(publicRoadmaps);
  } catch (error) {
    console.error("Error fetching public roadmaps:", error);
    return res.status(500).json({ message: "Failed to fetch community roadmaps." });
  }
};

// ==========================================
// 🚀 THE SCENARIO SIMULATOR (Global Cache)
// ==========================================
export const generateScenario = async (req: Request, res: Response): Promise<any> => {
  try {
    const { taskId } = req.params as { taskId: string };
    const { userId } = getAuth(req);
    
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // 1. Fetch the exact topic from the database
    const task = await prisma.studyTask.findUnique({
      where: { id: taskId }
    });

    if (!task) return res.status(404).json({ message: "Task not found" });

    const rawTopic = task.topic;

    // 2. ✨ THE NORMALIZER: Strip spaces, dashes, and make it lowercase
    // "Mutex Locks!" and "mutex-locks" both become "mutexlocks"
    const normalizedTopic = rawTopic.toLowerCase().replace(/[^a-z0-9]/g, '');

    // 3. 🛡️ CHECK THE CACHE FIRST
    const cached = await prisma.cachedChallenge.findUnique({
      where: { topic: normalizedTopic }
    });

    if (cached) {
      console.log(`⚡ CACHE HIT: Served [${rawTopic}] instantly for $0 API cost!`);
      // It's already in the DB, send it straight to the user!
      return res.status(200).json(cached.payload);
    }

    // 4. 🧠 CACHE MISS: Call Gemini with the Golden Prompt
    console.log(`🧠 CACHE MISS: Waking up Gemini for [${rawTopic}]...`);
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    // THE GOLDEN PROMPT: Short, strict, and demands high-yield interview scenarios
    const prompt = `
      Act as a FAANG Senior Engineer. Create a realistic, high-stakes interview scenario testing: "${rawTopic}".
      Focus on the most common pitfall or core pattern.
      Return ONLY a raw, valid JSON object. No markdown, no backticks.
      Schema:
      {
        "topic": "${rawTopic}",
        "companyScenario": "1 sentence real-world context (e.g., Uber surge pricing API)",
        "theProblem": "1 sentence describing the catastrophic failure if the concept is missing/wrong",
        "theChallenge": "The exact question to ask the student to fix it",
        "theSolution": "The technical fix with brief pseudo-code",
        "interviewBonus": "1 common trap or pro-tip interviewers look for"
      }
    `;

    const result = await model.generateContent(prompt);
    
    // Clean the response just in case Gemini accidentally adds Markdown backticks
    const cleanJsonString = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    const payload = JSON.parse(cleanJsonString);

    // 5. 💾 SAVE TO CACHE (So we never pay for this topic again)
    await prisma.cachedChallenge.create({
      data: {
        topic: normalizedTopic,
        payload: payload
      }
    });

    // Send the brand new scenario to the user
    return res.status(200).json(payload);

  } catch (error: any) {
    console.error("Scenario Generation Error:", error);
    return res.status(500).json({ message: "Failed to generate scenario." });
  }
};

// ==========================================
// 🌍 GLOBAL AI MENTOR (Main Dashboard Chat)
// ==========================================
export const globalChatWithBuddy = async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId } = getAuth(req);
    const { message } = req.body;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // 1. Fetch ALL of the user's roadmaps to get the big picture
    const allRoadmaps = await prisma.roadmap.findMany({
      where: { userId },
      include: { tasks: true } 
    });

    // 2. Summarize the context
    let contextSummary = "No active study plans yet.";
    if (allRoadmaps.length > 0) {
      // ✨ ADDED TYPE HERE: (rm: any)
      contextSummary = allRoadmaps.map((rm: any) => {
        const total = rm.tasks.length;
        // ✨ ADDED TYPE HERE: (t: any)
        const done = rm.tasks.filter((t: any) => t.isCompleted).length;
        const percent = total > 0 ? Math.round((done / total) * 100) : 0;
        return `- ${rm.title} (Exam: ${new Date(rm.examDate).toLocaleDateString()}): ${percent}% complete.`;
      }).join("\n");
    }

    // 3. ✨ THE FIX: Lock the persona in using 'systemInstruction'
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: "You are StudyMate, an elite but compassionate academic mentor. You provide highly tactical, data-driven advice. When a user is stressed or sick, validate their feelings first, then use their workload data to create a practical triage plan to relieve their anxiety. Max 4 sentences."
    });

    // 4. Feed the clean data to the locked persona
    const prompt = `
      User's Current Workload Data:
      ${contextSummary}
      
      User Message: "${message}"
      
      Task: If they are stressed/sick, look at their Exam Dates and Completion %. Tell them exactly what to drop today, and what they can afford to delay based on the dates. Be specific!
    `;

    const result = await model.generateContent(prompt);
    const aiResponse = result.response.text();

    return res.status(200).json({ reply: aiResponse });

  } catch (error) {
    console.error("Global Chat Error:", error);
    return res.status(500).json({ message: "AI Mentor is currently sleeping." });
  }
};

// ==========================================
// ❤️ TOGGLE LIKE (The Social Engine)
// ==========================================
export const toggleLike = async (req: Request, res: Response): Promise<any> => {
  try {
    const { roadmapId } = req.params as { roadmapId: string };
    const { userId } = getAuth(req);

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // 1. Check if the user already liked this roadmap
    const existingLike = await prisma.like.findUnique({
      where: {
        roadmapId_userId: { // Prisma magically creates this compound unique ID!
          roadmapId,
          userId,
        },
      },
    });

    if (existingLike) {
      // 💔 UNLIKE: Delete the record and subtract 1 from the count simultaneously
      await prisma.$transaction([
        prisma.like.delete({ where: { id: existingLike.id } }),
        prisma.roadmap.update({
          where: { id: roadmapId },
          data: { likeCount: { decrement: 1 } },
        }),
      ]);
      return res.status(200).json({ message: "Unliked", isLiked: false });
    } else {
      // ❤️ LIKE: Create the record and add 1 to the count simultaneously
      await prisma.$transaction([
        prisma.like.create({ data: { roadmapId, userId } }),
        prisma.roadmap.update({
          where: { id: roadmapId },
          data: { likeCount: { increment: 1 } },
        }),
      ]);
      return res.status(200).json({ message: "Liked", isLiked: true });
    }
  } catch (error) {
    console.error("Like Error:", error);
    return res.status(500).json({ message: "Failed to toggle like" });
  }
};

// ==========================================
// 💬 ADD COMMENT (Community Feedback)
// ==========================================
export const addComment = async (req: Request, res: Response): Promise<any> => {
  try {
    const { roadmapId } = req.params as { roadmapId: string };
    const { userId } = getAuth(req);
    const { text, authorName } = req.body; // We send the name from React

    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!text || !authorName) return res.status(400).json({ message: "Missing comment data" });

    const newComment = await prisma.comment.create({
      data: {
        text,
        authorName,
        userId,
        roadmapId,
      },
    });

    return res.status(201).json(newComment);
  } catch (error) {
    console.error("Comment Error:", error);
    return res.status(500).json({ message: "Failed to post comment" });
  }
};