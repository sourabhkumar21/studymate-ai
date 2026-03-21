import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import ChatCompanion from "../components/ChatCompanion";

export default function UserDashboard() {
  const { getToken } = useAuth();
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllRoadmaps = async () => {
      try {
        const token = await getToken();
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/roadmaps`, {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setRoadmaps(data);
        }
      } catch (error) {
        console.error("Error fetching roadmaps:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllRoadmaps();
  }, [getToken]);

  if (loading) return <div className="text-white text-center mt-20 text-xl">Loading your command center...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 mt-10">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-white">My Study Roadmaps</h1>
        <Link to="/generate" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-bold transition">
          + New Plan
        </Link>
      </div>

      {roadmaps.length === 0 ? (
        <div className="text-center text-gray-400 mt-20 bg-gray-800 p-10 rounded-lg border border-gray-700">
          <p className="text-xl mb-4">You haven't created any study plans yet.</p>
          <p>Click "+ New Plan" to let the AI generate your first roadmap!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roadmaps.map((map) => (
            <Link key={map.id} to={`/roadmap/${map.id}`} className="block group">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-blue-500 transition-all shadow-lg hover:shadow-blue-500/20">
                <h2 className="text-xl font-bold text-blue-400 mb-2 group-hover:text-blue-300">{map.title}</h2>
                <div className="text-gray-400 text-sm mb-4 space-y-1">
                  <p>📅 Exam: {new Date(map.examDate).toLocaleDateString()}</p>
                  <p>📚 Tasks: {map._count?.tasks || 0} total modules</p>
                </div>
                <div className="text-blue-500 text-sm font-semibold group-hover:underline flex items-center gap-1">
                  View Roadmap →
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      {/* ✨ Drop the Global Chatbot here without passing a roadmapId! */}
      <ChatCompanion />
    </div>
  );
}