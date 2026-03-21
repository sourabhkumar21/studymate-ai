import { NavLink } from "react-router-dom";

export default function Footer() {
  return (
    //<footer className="pt-20 pb-10 px-6 border-t border-white/5 bg-black/20">
    <footer className="pt-20 pb-10 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-10 mb-16">
        
        {/* Branding */}
        <div className="md:col-span-2">
          <h3 className="text-2xl font-bold text-white mb-4">StudyMate AI</h3>
          <p className="text-gray-400 text-sm max-w-sm">
            Your intelligent study companion. Stop feeling overwhelmed by giant syllabuses and start crushing your exams with adaptive, AI-powered study roadmaps.
          </p>
        </div>

        {/* Links */}
        <div>
          <h4 className="font-semibold text-white mb-4">Product</h4>
          <ul className="space-y-3 text-sm text-gray-400">
            <li><NavLink to="/" className="hover:text-blue-400 transition">Home</NavLink></li>
            <li><NavLink to="/generate" className="hover:text-blue-400 transition">Create Roadmap</NavLink></li>
            <li><NavLink to="/dashboard" className="hover:text-blue-400 transition">Dashboard</NavLink></li>
            <li><NavLink to="/community" className="hover:text-blue-400 transition">Community</NavLink></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-4">Legal</h4>
          <ul className="space-y-3 text-sm text-gray-400">
            <li><a href="#" className="hover:text-blue-400 transition">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-blue-400 transition">Terms of Service</a></li>
            <li><a href="#" className="hover:text-blue-400 transition">Contact Us</a></li>
          </ul>
        </div>

      </div>

      <div className="text-center text-sm text-gray-500 pt-8 border-t border-white/5">
        © 2026 StudyMate AI. Built by Sourabh Kumar.
      </div>
    </footer>
  );
}