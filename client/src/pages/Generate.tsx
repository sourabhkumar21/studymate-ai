import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react"; // ✨ UNCOMMENTED: We need this for the token!

export default function Generate() {
  const navigate = useNavigate();
  const { getToken } = useAuth(); // ✨ UNCOMMENTED: The magic key generator

  /* ================= STATE ================= */
  const [examTitle, setExamTitle] = useState("");
  const [examDate, setExamDate] = useState("");
  const [syllabus, setSyllabus] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  /* ================= SUBMIT HANDLER ================= */
  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!examTitle || !examDate || !syllabus) {
      alert("Please fill in all fields to generate your roadmap.");
      return;
    }

    try {
      setIsGenerating(true);
      
      // 1. Get the Clerk token
      const token = await getToken();
      
      // 2. Prepare the data exactly how your backend expects it
      const formData = {
        title: examTitle,
        examDate: examDate,
        syllabusText: syllabus
      };

      // 3. Make the real API call (Ported from CreateRoadmap.tsx)
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/roadmaps/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      // 4. Handle Success or Failure
      if (response.ok) {
        console.log("SUCCESS:", data.roadmap);
        // ✨ TELEPORT to the new roadmap
        navigate(`/roadmap/${data.roadmap.id}`);
      } else {
        alert("Error: " + data.message);
      }

    } catch (error) {
      console.error("Generation failed:", error);
      alert("Something went wrong. Is your backend server running?");
    } finally {
      setIsGenerating(false);
    }
  };

  /* ================= UI (The Beautiful Styling) ================= */
  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      
      {/* Background Glow */}
      <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full -z-10" />

      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Create AI Study Roadmap
          </h1>
          <p className="text-gray-400">
            Give StudyMate your syllabus, and our AI will build a perfect day-by-day plan.
          </p>
        </div>

        {/* The Form Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-10 backdrop-blur-md shadow-2xl">
          <form onSubmit={handleGenerate} className="flex flex-col gap-6">
            
            {/* Top Row: Title and Date */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-300 font-medium">Exam Title</label>
                <input
                  type="text"
                  placeholder="e.g., Operating Systems Final"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  className="bg-gray-900/50 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-300 font-medium">Exam Date</label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="bg-gray-900/50 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 transition-colors [color-scheme:dark]"
                  required
                />
              </div>
            </div>

            {/* Bottom Row: Syllabus */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-300 font-medium">Paste your Syllabus</label>
              <textarea
                placeholder="Paste the topics, chapters, or unstructured syllabus text here..."
                value={syllabus}
                onChange={(e) => setSyllabus(e.target.value)}
                rows={8}
                className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 transition-colors resize-y"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isGenerating}
              className="mt-4 w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Parsing Syllabus with AI...
                </>
              ) : (
                "Generate Roadmap"
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}