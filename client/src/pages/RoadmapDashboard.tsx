import { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; 
import { useAuth } from "@clerk/clerk-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import ChatCompanion from "../components/ChatCompanion";
import ScenarioModal from "../components/ScenarioModal"; // ✨ Imported the new Modal!

// ==========================================
// 1. THE BLUEPRINTS (TypeScript Interfaces)
// ==========================================
interface StudyTask {
  id: string;
  topic: string;
  dayNumber: number;
  isCompleted: boolean;
  confidenceLevel: string;
}

interface RoadmapData {
  id: string;
  title: string;
  examDate: string;
  tasks: StudyTask[]; 
  isPublic: boolean;
}

export default function RoadmapDashboard() {
  const { id } = useParams(); 
  const { getToken } = useAuth();
  
  // ==========================================
  // 2. STATE MANAGEMENT
  // ==========================================
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRecalibrating, setIsRecalibrating] = useState(false);

  // ✨ NEW: Scenario Simulator State
  const [isScenarioOpen, setIsScenarioOpen] = useState(false);
  const [currentScenario, setCurrentScenario] = useState<any>(null);
  const [isGeneratingScenario, setIsGeneratingScenario] = useState(false);
  const [activeTaskTopic, setActiveTaskTopic] = useState("");

  // ==========================================
  // 📊 THE ANALYTICS ENGINE
  // ==========================================
  const totalTasks = roadmap?.tasks.length || 0;
  const completedTasks = roadmap?.tasks.filter(t => t.isCompleted).length || 0;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const chartData = [
    { name: 'Mastered', value: completedTasks },
    { name: 'Pending', value: totalTasks - completedTasks }
  ];
  const COLORS = ['#22c55e', '#374151']; 

  // ==========================================
  // 3. THE FETCH ENGINE 
  // ==========================================
  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const token = await getToken();
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/roadmaps/${id}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Failed to fetch roadmap data");
        
        const data = await response.json();
        setRoadmap(data); 
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchRoadmap();
  }, [id, getToken]); 

  // ==========================================
  // ✨ THE UPDATE ENGINE
  // ==========================================
  const toggleTaskCompletion = async (taskId: string, currentStatus: boolean) => {
    try {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/roadmaps/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ isCompleted: !currentStatus })
      });

      if (!response.ok) throw new Error("Failed to update task");

      setRoadmap((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          tasks: prev.tasks.map((task) => 
            task.id === taskId ? { ...task, isCompleted: !currentStatus } : task
          )
        };
      });
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  const handleRecalibrate = async () => {
    if (!window.confirm("This will rewrite all your pending tasks based on the time left before your exam. Are you sure?")) return;
    
    setIsRecalibrating(true);
    try {
      const token = await getToken();
      await fetch(`${import.meta.env.VITE_API_URL}/api/roadmaps/${id}/recalibrate`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      window.location.reload(); 
    } catch (err) {
      console.error(err);
      alert("Failed to recalibrate. Check console.");
    } finally {
      setIsRecalibrating(false);
    }
  };

  const handlePublish = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/roadmaps/${id}/publish`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        setRoadmap(prev => prev ? { ...prev, isPublic: true } : prev);
        alert("🚀 Your roadmap is now live in the Community Hub!");
      }
    } catch (error) {
      console.error("Publishing failed", error);
    }
  };

  // ==========================================
  // ✨ THE SCENARIO ENGINE (Trigger the AI)
  // ==========================================
  const handleSimulate = async (taskId: string, topic: string) => {
    setIsScenarioOpen(true);
    setIsGeneratingScenario(true);
    setCurrentScenario(null); // Clear out the old scenario instantly
    setActiveTaskTopic(topic);
    
    try {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/roadmaps/tasks/${taskId}/scenario`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Failed to load scenario");

      const data = await response.json();
      setCurrentScenario(data);
    } catch (err) {
      console.error(err);
      alert("Simulation failed to load. The server might be rate-limited!");
      setIsScenarioOpen(false);
    } finally {
      setIsGeneratingScenario(false);
    }
  };

  // ==========================================
  // 4. THE UI RENDER
  // ==========================================
  if (loading) return <div className="text-center mt-20 text-xl text-white">Loading your master plan...</div>;
  if (error) return <div className="text-center mt-20 text-red-500">{error}</div>;
  if (!roadmap) return <div className="text-center mt-20 text-white">No roadmap found.</div>;

  const sortedTasks = [...roadmap.tasks].sort((a, b) => {
    if (a.isCompleted === b.isCompleted) return a.dayNumber - b.dayNumber;
    return a.isCompleted ? 1 : -1;
  });

  return (
    <div className="max-w-4xl mx-auto p-6 mt-10 text-white pb-32">
      
      {/* 📊 Analytics Header */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8 border border-gray-700 flex flex-col md:flex-row items-center justify-between">
        <div className="mb-6 md:mb-0">
          <h1 className="text-3xl font-bold text-blue-400 mb-2">{roadmap.title}</h1>
          <p className="text-gray-400 mb-4 flex items-center gap-2">
            📅 Exam Date: <span className="text-white font-semibold">{new Date(roadmap.examDate).toLocaleDateString()}</span>
          </p>
          
          <div className="flex flex-col items-start gap-4">
            <div className="flex gap-3">
              <button 
                onClick={handleRecalibrate}
                disabled={isRecalibrating}
                className="bg-purple-600/20 text-purple-400 border border-purple-600/50 hover:bg-purple-600 hover:text-white px-4 py-2 rounded text-sm font-bold transition-all disabled:opacity-50"
              >
                {isRecalibrating ? "🧠 AI is Recalculating..." : "⚡ Adapt Schedule"}
              </button>
              
              <button 
                onClick={handlePublish}
                disabled={roadmap.isPublic}
                className="bg-blue-600/20 text-blue-400 border border-blue-600/50 hover:bg-blue-600 hover:text-white disabled:bg-green-600/20 disabled:text-green-400 disabled:border-green-600/50 disabled:cursor-not-allowed px-4 py-2 rounded text-sm font-bold transition-all"
              >
                {roadmap.isPublic ? "✅ Published" : "🌐 Share to Community"}
              </button>
            </div>
          </div>
        </div>

        <div className="w-48 h-48 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} innerRadius={60} outerRadius={80} stroke="none" paddingAngle={5} dataKey="value">
                {chartData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute text-center">
            <span className="text-2xl font-bold text-white">{completionPercentage}%</span>
            <span className="block text-xs text-gray-500 uppercase tracking-widest">Done</span>
          </div>
        </div>
      </div>

      {/* 📝 Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedTasks.map((task) => (
          <div key={task.id} className="bg-gray-800 p-5 rounded-lg border border-gray-700 shadow-md flex flex-col justify-between hover:border-gray-600 transition-colors">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="bg-blue-600 text-xs font-bold px-2 py-1 rounded">Day {task.dayNumber}</span>
                <span className={`text-sm font-bold flex items-center gap-1 ${task.isCompleted ? 'text-green-400' : 'text-yellow-400'}`}>
                  {task.isCompleted ? "✅ Done" : "⏳ Pending"}
                </span>
              </div>
              <h3 className="text-lg font-semibold">{task.topic}</h3>
            </div>
            
            {/* Action Bar (Updated for Scenario Button) */}
            <div className="mt-5 pt-4 border-t border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
               
               <div className="flex items-center gap-3 w-full sm:w-auto">
                 <button 
                   onClick={() => toggleTaskCompletion(task.id, task.isCompleted)}
                   className="text-sm text-gray-400 hover:text-white transition-colors"
                 >
                   {task.isCompleted ? "Undo" : "Mark Complete"}
                 </button>

                 {/* ✨ NEW: Simulate Scenario Button */}
                 <button 
                   onClick={() => handleSimulate(task.id, task.topic)}
                   className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 font-bold bg-blue-500/10 px-3 py-1.5 rounded-md border border-blue-500/20 hover:border-blue-500/50 whitespace-nowrap"
                 >
                   🚀 Simulate Scenario
                 </button>
               </div>

               <span className={`text-xs font-bold uppercase tracking-wider ${task.isCompleted ? 'text-green-500' : 'text-gray-500'}`}>
                 {task.isCompleted ? "Mastered" : task.confidenceLevel}
               </span>
            </div>
          </div>
        ))}
      </div>

      {/* ✨ The Context-Aware AI Chat Widget */}
      <ChatCompanion roadmapId={id as string} />
      
      {/* ✨ The Scenario Simulator Modal */}
      <ScenarioModal 
        isOpen={isScenarioOpen} 
        onClose={() => setIsScenarioOpen(false)} 
        scenario={currentScenario} 
        isLoading={isGeneratingScenario} 
      />

    </div>
  );
}