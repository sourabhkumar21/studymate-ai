import { useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

export default function Community() {
  const { getToken, userId } = useAuth();
  const { user } = useUser(); // Need this to get the user's name for comments
  const navigate = useNavigate();

  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cloningId, setCloningId] = useState<string | null>(null);

  // Comment Modal State
  const [activeRoadmap, setActiveRoadmap] = useState<any | null>(null);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    fetchCommunityRoadmaps();
  }, []);

  const fetchCommunityRoadmaps = async () => {
    try {
      console.log("MY API URL IS:", import.meta.env.VITE_API_URL); // I bet this says undefined!

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/roadmaps/public`);
      const data = await response.json();
      setRoadmaps(data);
    } catch (error) {
      console.error("Error fetching community roadmaps:", error);
    } finally {
      setLoading(false);
    }
  };

  // ❤️ THE LIKE ENGINE
  const handleLike = async (roadmapId: string) => {
    try {
      const token = await getToken();
      
      // Optimistic UI Update (Make the heart turn red instantly!)
      setRoadmaps(prev => prev.map(rm => {
        if (rm.id === roadmapId) {
          const hasLiked = rm.likes.some((like: any) => like.userId === userId);
          return {
            ...rm,
            likeCount: hasLiked ? rm.likeCount - 1 : rm.likeCount + 1,
            likes: hasLiked 
              ? rm.likes.filter((like: any) => like.userId !== userId)
              : [...rm.likes, { userId }] // Fake a like object
          };
        }
        return rm;
      }));

      // Send to backend
      await fetch(`${import.meta.env.VITE_API_URL}/roadmaps/${roadmapId}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error("Like failed", error);
    }
  };

  // 💬 THE COMMENT ENGINE
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !activeRoadmap) return;

    setIsSubmittingComment(true);
    try {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/roadmaps/${activeRoadmap.id}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          text: commentText,
          authorName: user?.fullName || "Anonymous Student"
        })
      });

      if (response.ok) {
        const newComment = await response.json();
        
        // Update local state to show comment instantly
        setRoadmaps(prev => prev.map(rm => 
          rm.id === activeRoadmap.id 
            ? { ...rm, comments: [newComment, ...rm.comments] }
            : rm
        ));
        
        // Update active modal state
        setActiveRoadmap((prev: any) => ({
          ...prev,
          comments: [newComment, ...prev.comments]
        }));
        
        setCommentText("");
      }
    } catch (error) {
      console.error("Comment failed", error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // 🧬 THE CLONE ENGINE
  const handleClone = async (roadmapId: string) => {
    setCloningId(roadmapId);
    try {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/roadmaps/${roadmapId}/clone`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const newRoadmap = await response.json();
        navigate(`/dashboard/${newRoadmap.id}`);
      }
    } catch (error) {
      console.error("Cloning failed", error);
      alert("Failed to clone roadmap.");
    } finally {
      setCloningId(null);
    }
  };

  if (loading) return <div className="text-center mt-20 text-xl text-white">Loading Community Hub...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 mt-10 text-white pb-32">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-2">Community Hub</h1>
        <p className="text-gray-400">Discover, clone, and discuss top-rated study roadmaps created by other students.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roadmaps.map((roadmap) => {
          const hasLiked = roadmap.likes?.some((like: any) => like.userId === userId);

          return (
            <div key={roadmap.id} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-6 rounded-2xl shadow-xl flex flex-col justify-between hover:border-gray-500 transition-all">
              
              <div>
                {/* Header: Modules & Likes */}
                <div className="flex justify-between items-center mb-4">
                  <span className="bg-blue-900/50 text-blue-300 text-xs font-bold px-3 py-1 rounded-full border border-blue-700/50">
                    {roadmap.tasks?.length || 0} Modules
                  </span>
                  
                  {/* ❤️ Like Button */}
                  <button 
                    onClick={() => handleLike(roadmap.id)}
                    className="flex items-center gap-1.5 hover:scale-105 transition-transform"
                  >
                    <span className={hasLiked ? "text-red-500" : "text-gray-500 hover:text-red-400"}>
                      {hasLiked ? "❤️" : "🤍"}
                    </span>
                    <span className="text-sm font-bold text-gray-300">{roadmap.likeCount}</span>
                  </button>
                </div>

                <h3 className="text-xl font-bold mb-3 line-clamp-2">{roadmap.title}</h3>
                
                {/* Author Info */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold">
                    {roadmap.user?.name?.charAt(0) || "S"}
                  </div>
                  <span className="text-sm text-gray-400">By {roadmap.user?.name || "Student"}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                <button 
                  onClick={() => setActiveRoadmap(roadmap)}
                  className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-xl text-sm font-medium transition-colors flex justify-center items-center gap-2"
                >
                  💬 View Discussion ({roadmap.comments?.length || 0})
                </button>

                <button 
                  onClick={() => handleClone(roadmap.id)}
                  disabled={cloningId === roadmap.id}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 rounded-xl text-white font-bold transition-colors shadow-lg shadow-blue-900/20"
                >
                  {cloningId === roadmap.id ? "Cloning..." : "Clone to My Dashboard"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 💬 COMMENT SLIDE-OVER MODAL */}
      {activeRoadmap && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-md bg-gray-900 h-full border-l border-gray-700 shadow-2xl flex flex-col animate-slide-in-right">
            
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900 z-10">
              <h2 className="text-lg font-bold text-white truncate pr-4">{activeRoadmap.title} Discussion</h2>
              <button onClick={() => setActiveRoadmap(null)} className="text-gray-500 hover:text-white text-2xl">✕</button>
            </div>

            {/* Comment List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {activeRoadmap.comments?.length === 0 ? (
                <div className="text-center text-gray-500 mt-10">No feedback yet. Be the first to comment!</div>
              ) : (
                activeRoadmap.comments?.map((comment: any) => (
                  <div key={comment.id} className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-sm text-blue-400">{comment.authorName}</span>
                      <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">{comment.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Comment Input */}
            <div className="p-4 border-t border-gray-800 bg-gray-900">
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Leave some feedback or a tip..."
                  className="flex-1 bg-gray-800 border border-gray-700 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                />
                <button 
                  type="submit" 
                  disabled={isSubmittingComment || !commentText.trim()}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl px-4 font-bold transition-colors"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}