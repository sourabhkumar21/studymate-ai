import { useState } from "react";

interface ScenarioPayload {
  topic: string;
  companyScenario: string;
  theProblem: string;
  theChallenge: string;
  theSolution: string;
  interviewBonus: string;
}

interface ScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: ScenarioPayload | null;
  isLoading: boolean;
}

export default function ScenarioModal({ isOpen, onClose, scenario, isLoading }: ScenarioModalProps) {
  const [isRevealed, setIsRevealed] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsRevealed(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 sm:p-6">
      <div className="bg-[#0f1117] border border-gray-800 rounded-2xl max-w-2xl w-full shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/50 sticky top-0 z-10">
          <div>
            <span className="text-blue-500 text-xs font-bold tracking-widest uppercase">FAANG Interview Simulator</span>
            <h2 className="text-xl font-bold text-white mt-1">{scenario?.topic || "Loading Scenario..."}</h2>
          </div>
          <button onClick={handleClose} className="text-gray-500 hover:text-white text-2xl transition-colors">✕</button>
        </div>

        {/* Scrollable Content Area */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <p className="text-gray-400 animate-pulse">Consulting Senior Engineers...</p>
              <p className="text-xs text-gray-600">Generating real-world architecture challenge.</p>
            </div>
          ) : scenario ? (
            <div className="space-y-6">
              
              {/* 🏢 Context */}
              <div className="bg-blue-900/10 border border-blue-900/30 p-4 rounded-xl">
                <h3 className="text-blue-400 text-sm font-bold mb-2 flex items-center gap-2">
                  <span>🏢</span> Real-World Context
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">{scenario.companyScenario}</p>
              </div>

              {/* 🚨 The Problem */}
              <div className="bg-red-900/10 border border-red-900/30 p-4 rounded-xl">
                <h3 className="text-red-400 text-sm font-bold mb-2 flex items-center gap-2">
                  <span>🚨</span> The Catastrophic Failure
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">{scenario.theProblem}</p>
              </div>

              {/* 🎯 The Challenge */}
              <div className="p-4">
                <h3 className="text-white text-lg font-bold mb-2">Your Task:</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">{scenario.theChallenge}</p>
                
                {!isRevealed ? (
                  <button 
                    onClick={() => setIsRevealed(true)}
                    className="w-full py-4 bg-white/5 hover:bg-white/10 border border-gray-700 hover:border-blue-500 rounded-xl text-white font-bold transition-all shadow-lg"
                  >
                    🧠 I've thought of the answer. Reveal Solution.
                  </button>
                ) : (
                  <div className="animate-fade-in space-y-6 mt-4 pt-6 border-t border-gray-800">
                    
                    {/* ✅ The Solution */}
                    <div>
                      <h3 className="text-green-400 text-sm font-bold mb-2 flex items-center gap-2">
                        <span>✅</span> The Architectural Fix
                      </h3>
                      <div className="bg-black border border-gray-800 p-4 rounded-xl text-gray-300 text-sm font-mono whitespace-pre-wrap leading-relaxed">
                        {scenario.theSolution}
                      </div>
                    </div>

                    {/* 💎 Interview Bonus */}
                    <div className="bg-purple-900/10 border border-purple-900/30 p-4 rounded-xl">
                      <h3 className="text-purple-400 text-sm font-bold mb-2 flex items-center gap-2">
                        <span>💎</span> Senior Engineer Pro-Tip
                      </h3>
                      <p className="text-gray-300 text-sm leading-relaxed">{scenario.interviewBonus}</p>
                    </div>

                    <button 
                      onClick={handleClose}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold transition-colors"
                    >
                      Mark as Reviewed & Close
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center text-red-400 py-10">Failed to load scenario.</div>
          )}
        </div>
      </div>
    </div>
  );
}