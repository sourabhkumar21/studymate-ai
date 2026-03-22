import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';

// ✨ CHANGE 1: Added the '?' to make roadmapId optional!
export default function ChatCompanion({ roadmapId }: { roadmapId?: string }) {
  const { getToken } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // The Throttle State
  const [cooldown, setCooldown] = useState(0);
  
  // The Countdown Effect
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // ✨ CHANGE 2: Dynamic Greeting based on where the user is
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { 
      role: 'ai', 
      text: roadmapId 
        ? "Hey! I'm your StudyMate. I'm looking at this specific roadmap right now. What concept is tripping you up?" 
        : "Hey! I'm your StudyMate. I can see your overall progress across all your subjects. How are you managing your workload today?" 
    }
  ]);
  
  // Auto-scroller trick
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🛡️ THE DEFENSIVE API CALL
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || cooldown > 0) return; // Spam prevention!

    const userText = input;
    setInput(''); // Clear input immediately for snappy UX
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const token = await getToken();
      
      // ✨ CHANGE 3: Switch API endpoints based on which mode we are in!
      const endpoint = roadmapId 
  ? `${import.meta.env.VITE_API_URL}/api/roadmaps/${roadmapId}/chat`
  : `${import.meta.env.VITE_API_URL}/api/roadmaps/global-chat`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ message: userText })
      });

      if (!response.ok) throw new Error("Rate limited or server error");
      
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);

    } catch (error) {
      console.error(error);
      // Graceful degradation
      setMessages(prev => [...prev, { role: 'ai', text: "Whoops! I'm helping a lot of students right now and need to catch my breath. Can you try asking me that again in 30 seconds?" }]);
    } finally {
      setIsLoading(false);
      // Trigger a 5-second API Throttle Cooldown after every message
      setCooldown(5);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* 💬 THE FLOATING CHAT WINDOW */}
      {isOpen && (
        <div className="mb-4 w-80 md:w-96 h-[500px] bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ease-in-out transform origin-bottom-right">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 flex justify-between items-center shadow-md">
            <div>
              <h3 className="font-bold text-white flex items-center gap-2">
                🧠 StudyMate AI
              </h3>
              <p className="text-purple-200 text-xs">
                {roadmapId ? "Focused Subject Tutor" : "Global Academic Mentor"}
              </p>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200 font-bold text-xl">
              ×
            </button>
          </div>

          {/* Message History Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-gray-800 border border-gray-700 text-gray-200 rounded-bl-none'
                  }`}
                  style={{ whiteSpace: 'pre-wrap' }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 border border-gray-700 text-gray-400 p-3 rounded-2xl rounded-bl-none text-sm flex gap-1 items-center">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-3 bg-gray-800 border-t border-gray-700">
            <div className="flex gap-2 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={cooldown > 0 ? `API Cooling down... (${cooldown}s)` : "Ask about your syllabus..."}
                disabled={isLoading || cooldown > 0}
                className="flex-1 bg-gray-900 border border-gray-600 text-white text-sm rounded-full px-4 py-2 focus:outline-none focus:border-blue-500 disabled:opacity-50"
              />
              <button 
                type="submit" 
                disabled={isLoading || cooldown > 0 || !input.trim() }
                className="bg-blue-600 hover:bg-blue-500 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cooldown > 0 ? '🔒' : '↑'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ✨ THE TRIGGER BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${isOpen ? 'scale-0' : 'scale-100'} transition-transform duration-300 w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full shadow-lg hover:shadow-purple-500/50 flex items-center justify-center text-white text-2xl hover:-translate-y-1`}
      >
        💬
      </button>

    </div>
  );
}