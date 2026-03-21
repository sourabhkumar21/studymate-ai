import { useNavigate } from "react-router-dom";
import Button from "../components/Button";

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden pt-32 pb-24">
      {/* HERO BACKGROUND */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 bg-gradient-to-br from-blue-500/15 via-cyan-500/10 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        
        {/* LEFT SIDE */}
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm rounded-full bg-white/5 border border-white/10 text-gray-300 backdrop-blur-md">
            🚀 The #1 AI Study Planner for Students
          </div>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Crush your exams with AI-powered
            <br />
            <span className="text-blue-500">
              study plans
            </span>
          </h1>

          <p className="mt-6 text-gray-400 max-w-lg">
            Stop feeling overwhelmed. Paste your syllabus and let StudyMate AI generate a personalized, day-by-day roadmap with a context-aware AI tutor by your side.
          </p>

          <div className="flex flex-wrap gap-4 mt-8">
            {/* ✨ FIXED: Updated to point to the correct route! */}
            <div onClick={() => navigate("/create-roadmap")}>
               <Button>Create Your First Roadmap →</Button>
            </div>
            <div onClick={() => navigate("/dashboard")}>
              <Button variant="secondary">Go to Dashboard</Button>
            </div>
          </div>

          <div className="flex gap-8 mt-10 text-sm text-gray-400">
            <div>
              ⚡ <span className="text-white">Built for speed</span>
            </div>
            <div>
              ✔ <span className="text-white">100% Free for Students</span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        {/* ✨ Added mt-12 so it doesn't touch the text on mobile */}
        <div className="relative mt-12 lg:mt-0 w-full max-w-md mx-auto">
          
          {/* ✨ FIXED OVERLAP: Added z-20, and made it a solid blue badge so it pops! */}
          <div className="absolute -top-5 -left-4 md:-left-8 z-20 px-4 py-1.5 text-xs font-bold tracking-wide rounded-full bg-blue-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)] border border-blue-400">
            ✨ Powered by Google Gemini
          </div>

          {/* ✨ FIXED BLANK IMAGE: Replaced with a beautiful HTML "Mock App" UI */}
          <div
            className="relative z-10 rounded-2xl p-2 bg-gray-900 border border-gray-700 transition-all duration-300 hover:scale-[1.02] shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
          >
            <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
              
              {/* Mock Dashboard Header */}
              <div className="p-4 border-b border-gray-700 bg-gray-800/50 flex justify-between items-center">
                <div>
                  <div className="text-xs text-blue-400 font-bold mb-1">DATA STRUCTURES</div>
                  <div className="text-white font-semibold text-sm">Exam Prep Plan</div>
                </div>
                {/* Mock Progress Circle */}
                <div className="h-10 w-10 rounded-full border-[3px] border-gray-700 border-t-green-500 flex items-center justify-center text-xs text-white font-bold">
                  67%
                </div>
              </div>

              {/* Mock Tasks List */}
              <div className="p-4 space-y-3">
                
                {/* Completed Task */}
                <div className="bg-gray-900 border border-green-500/30 p-3 rounded-lg flex items-center gap-3">
                  <div className="bg-green-500 text-black text-xs p-1 rounded">✅</div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500">Day 1</div>
                    <div className="text-sm text-gray-300">Arrays & Linked Lists</div>
                  </div>
                </div>

                {/* Pending Task */}
                <div className="bg-gray-900 border border-gray-700 p-3 rounded-lg flex items-center gap-3">
                  <div className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded">DAY 2</div>
                  <div className="flex-1">
                    <div className="text-sm text-white">Dynamic Programming</div>
                  </div>
                  <div className="text-xs text-gray-500 px-2 py-1 border border-gray-600 rounded">Pending</div>
                </div>

                 {/* Pending Task 3 */}
                 <div className="bg-gray-900 border border-gray-700 p-3 rounded-lg flex items-center gap-3 opacity-60">
                  <div className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded">DAY 3</div>
                  <div className="flex-1">
                    <div className="text-sm text-white">Graph Algorithms</div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}