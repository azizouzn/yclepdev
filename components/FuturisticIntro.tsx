
import React, { useState, useEffect } from 'react';
import CubeTransparentIcon from './icons/CubeTransparentIcon';
import GlobeAltIcon from './icons/GlobeAltIcon';

interface FuturisticIntroProps {
  onComplete: () => void;
}

const FuturisticIntro: React.FC<FuturisticIntroProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'network' | 'box' | 'flash' | 'reveal'>('network');

  useEffect(() => {
    // Sequence Timing
    const networkDuration = 3500; // Time for data aggregation
    const boxDuration = 3500;     // Time for synthesis
    const flashDuration = 200;    // Quick flash

    const toBox = setTimeout(() => setPhase('box'), networkDuration);
    const toFlash = setTimeout(() => setPhase('flash'), networkDuration + boxDuration);
    const toReveal = setTimeout(() => setPhase('reveal'), networkDuration + boxDuration + flashDuration);
    const finish = setTimeout(onComplete, networkDuration + boxDuration + flashDuration + 1000); // +1s fade out

    return () => {
      clearTimeout(toBox);
      clearTimeout(toFlash);
      clearTimeout(toReveal);
      clearTimeout(finish);
    };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black overflow-hidden transition-opacity duration-1000 ease-in-out ${phase === 'reveal' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      
      {/* Flash Overlay */}
      <div className={`absolute inset-0 bg-white z-50 transition-opacity duration-200 ${phase === 'flash' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} />

      {/* Content Container */}
      <div className={`relative z-10 flex flex-col items-center justify-center w-full h-full transition-opacity duration-500 ${phase === 'flash' ? 'opacity-0' : 'opacity-100'}`}>
        
        {/* PHASE 1: NETWORK - Aggregating Data */}
        {phase === 'network' && (
          <div className="flex flex-col items-center animate-fadeIn">
            <div className="relative w-64 h-64 mb-8 flex items-center justify-center">
               {/* Central Globe */}
               <div className="absolute inset-0 text-blue-500 animate-spin-slow opacity-80">
                 <GlobeAltIcon className="w-full h-full" />
               </div>
               {/* Scanning Ring */}
               <div className="absolute inset-0 border-2 border-cyan-400/50 rounded-full animate-ping-slow"></div>
               {/* Orbiting Particles */}
               <div className="absolute w-full h-full animate-spin-reverse">
                  <div className="absolute top-0 left-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_15px_white]"></div>
               </div>
               <div className="absolute w-3/4 h-3/4 animate-spin-slow delay-75">
                  <div className="absolute bottom-0 right-1/2 w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_10px_cyan]"></div>
               </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 tracking-[0.2em] uppercase animate-pulse">
              Aggregating Global Data
            </h2>
            <p className="text-blue-300/50 font-mono text-xs mt-2 tracking-widest">CONNECTING TO NEURAL NET...</p>
          </div>
        )}

        {/* PHASE 2: THE BOX - Synthesizing */}
        {phase === 'box' && (
          <div className="flex flex-col items-center animate-popIn">
             <div className="relative w-48 h-48 mb-10 flex items-center justify-center">
                {/* Background Glow */}
                <div className="absolute w-32 h-32 bg-indigo-600 rounded-full blur-[60px] opacity-60 animate-pulse-fast"></div>
                
                {/* The AI Cube */}
                <div className="relative z-10 text-white animate-float-3d">
                    <CubeTransparentIcon className="w-40 h-40 drop-shadow-[0_0_25px_rgba(255,255,255,0.5)]" />
                </div>

                {/* Energy Streams */}
                <div className="absolute inset-0 border-2 border-indigo-400/20 rounded-xl rotate-45 scale-110 animate-spin-slow"></div>
                <div className="absolute inset-0 border-2 border-purple-400/20 rounded-xl -rotate-45 scale-125 animate-spin-reverse"></div>
             </div>

             <h2 className="text-3xl md:text-4xl font-black text-white tracking-widest uppercase mb-2 drop-shadow-lg text-center">
               Synthesizing Insights
             </h2>
             <div className="w-64 h-1 bg-gray-900 rounded-full overflow-hidden mt-4 border border-gray-800">
                <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-progress"></div>
             </div>
          </div>
        )}

      </div>

      {/* CSS for custom keyframes that Tailwind doesn't cover easily */}
      <style>{`
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes spin-reverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        @keyframes ping-slow { 0% { transform: scale(1); opacity: 0.5; } 100% { transform: scale(1.5); opacity: 0; } }
        @keyframes float-3d { 
            0% { transform: translateY(0) scale(1) rotate(0deg); filter: drop-shadow(0 0 20px rgba(99, 102, 241, 0.5)); } 
            50% { transform: translateY(-15px) scale(1.05) rotate(3deg); filter: drop-shadow(0 0 40px rgba(99, 102, 241, 0.8)); } 
            100% { transform: translateY(0) scale(1) rotate(0deg); filter: drop-shadow(0 0 20px rgba(99, 102, 241, 0.5)); } 
        }
        @keyframes progress { from { width: 0%; } to { width: 100%; } }
        @keyframes popIn { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .animate-spin-slow { animation: spin-slow 15s linear infinite; }
        .animate-spin-reverse { animation: spin-reverse 12s linear infinite; }
        .animate-ping-slow { animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite; }
        .animate-float-3d { animation: float-3d 4s ease-in-out infinite; }
        .animate-pulse-fast { animation: pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        .animate-progress { animation: progress 3s ease-out forwards; }
        .animate-popIn { animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .animate-fadeIn { animation: fadeIn 0.8s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default FuturisticIntro;
