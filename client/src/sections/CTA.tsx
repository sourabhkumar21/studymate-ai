import { useNavigate } from "react-router-dom";

export default function CTA() {
  const navigate = useNavigate();

  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
        
        {/* Glowing background effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/20 blur-[100px] rounded-full -z-10" />

        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Ready to ace your next <span className="text-blue-500">exam?</span>
        </h2>
        
        <p className="text-gray-400 max-w-2xl mx-auto mb-10 text-lg">
          Join students who have stopped procrastinating and started studying smarter. Let AI organize your syllabus so you can focus on actually learning.
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button 
            onClick={() => navigate('/generate')} 
            className="px-8 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-medium transition shadow-[0_0_20px_rgba(37,99,235,0.4)]"
          >
            Start planning — it's free →
          </button>
        </div>

      </div>
    </section>
  );
}