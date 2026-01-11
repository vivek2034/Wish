import React, { useState, useEffect } from 'react';
import { GeneratedManifestation } from '../types';
import { Play, Download, Sparkles, CheckCircle, Share2, StopCircle } from 'lucide-react';
import { speakAffirmation, stopSpeech } from '../services/geminiService';

interface ResultDisplayProps {
  data: GeneratedManifestation;
  onReset: () => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ data, onReset }) => {
  const [isPlaying, setIsPlaying] = useState<string | null>(null); // Stores ID of currently playing affirmation
  const [activeTab, setActiveTab] = useState<'affirmations' | 'script' | 'action'>('affirmations');
  const [imageLoaded, setImageLoaded] = useState(false);

  // Stop speech if component unmounts
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  const handlePlayAudio = (text: string, index: number) => {
    const id = `affirmation-${index}`;
    
    // If clicking the currently playing item, stop it
    if (isPlaying === id) {
      stopSpeech();
      setIsPlaying(null);
      return;
    }

    // Play new item
    setIsPlaying(id);
    speakAffirmation(text, () => {
      setIsPlaying(null);
    });
  };

  const handleReset = () => {
    stopSpeech();
    onReset();
  };

  return (
    <div className="relative z-10 w-full max-w-5xl mx-auto p-4 space-y-8 animate-float">
      
      {/* Header */}
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-indigo-900/40 border border-indigo-500/30 text-indigo-200 text-sm">
           <Sparkles className="w-4 h-4 text-amber-300" />
           <span>Manifestation Complete</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-purple-200 to-indigo-200">
          {data.originalDesire}
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Vision Card */}
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-2 relative group overflow-hidden shadow-2xl shadow-indigo-900/20">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                <a 
                  href={data.visionBoardUrl} 
                  download={`ethera-card-${Date.now()}.png`}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur text-white px-4 py-2 rounded-full flex items-center gap-2 transition-all transform translate-y-4 group-hover:translate-y-0"
                >
                  <Download className="w-4 h-4" /> Download Card
                </a>
            </div>
            {data.visionBoardUrl ? (
               <div className="relative overflow-hidden rounded-xl">
                 {!imageLoaded && (
                   <div className="absolute inset-0 bg-indigo-950/50 flex items-center justify-center z-0">
                      <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse" />
                   </div>
                 )}
                 <img 
                   src={data.visionBoardUrl} 
                   alt="Manifestation Card" 
                   onLoad={() => setImageLoaded(true)}
                   className={`w-full h-auto rounded-xl shadow-lg border border-white/5 transition-all duration-1000 ease-out transform ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                 />
               </div>
            ) : (
              <div className="w-full h-96 bg-indigo-950/50 flex items-center justify-center rounded-xl">
                 <span className="text-indigo-400">Generating Card...</span>
              </div>
            )}
          </div>

          {/* Visualization Prompts */}
          <div className="glass-panel p-6 rounded-2xl">
             <h3 className="text-xl font-serif text-indigo-200 mb-4 flex items-center gap-2">
               <span className="w-8 h-[1px] bg-indigo-500/50"></span>
               Visualizations
             </h3>
             <ul className="space-y-3 text-indigo-100/80 text-sm leading-relaxed">
               {data.visualizations.map((vis, i) => (
                 <li key={i} className="flex gap-3">
                   <span className="text-amber-400/80 mt-1">✦</span>
                   {vis}
                 </li>
               ))}
             </ul>
          </div>
        </div>

        {/* Right Column: Text Content */}
        <div className="space-y-6">
          
          {/* Tabs */}
          <div className="flex gap-4 border-b border-white/10 pb-2">
            {[
              { id: 'affirmations', label: 'Affirmations' },
              { id: 'script', label: 'Scripting' },
              { id: 'action', label: 'Actions' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-2 px-1 text-sm tracking-wider transition-colors ${
                  activeTab === tab.id 
                    ? 'text-amber-300 border-b-2 border-amber-300' 
                    : 'text-indigo-300/60 hover:text-indigo-200'
                }`}
              >
                {tab.label.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === 'affirmations' && (
              <div className="space-y-4">
                {data.affirmations.map((aff, i) => (
                  <div 
                    key={i} 
                    className="glass-panel p-4 rounded-xl hover:bg-white/10 transition-colors group flex items-center justify-between gap-4"
                  >
                    <p className="text-lg font-serif text-indigo-100 italic">"{aff}"</p>
                    <button 
                      onClick={() => handlePlayAudio(aff, i)}
                      className={`p-2 rounded-full ${
                        isPlaying === `affirmation-${i}` 
                          ? 'bg-amber-400 text-black animate-pulse' 
                          : 'bg-white/5 text-indigo-300 hover:bg-indigo-500 hover:text-white'
                      } transition-all`}
                    >
                      {isPlaying === `affirmation-${i}` ? <StopCircle className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                    </button>
                  </div>
                ))}
                <p className="text-xs text-center text-indigo-400/60 mt-4">
                  Tip: Speak these aloud while looking at your manifestation card.
                </p>
              </div>
            )}

            {activeTab === 'script' && (
              <div className="glass-panel p-8 rounded-2xl relative">
                <div className="absolute top-4 left-4 text-6xl font-serif text-white/5">"</div>
                <p className="text-indigo-100 leading-8 font-light tracking-wide whitespace-pre-wrap relative z-10">
                  {data.scripting}
                </p>
                <div className="absolute bottom-4 right-4 text-6xl font-serif text-white/5 rotate-180">"</div>
              </div>
            )}

            {activeTab === 'action' && (
              <div className="space-y-4">
                {data.actions.map((act, i) => (
                  <div key={i} className="flex gap-4 items-start p-4 rounded-xl border border-white/5 bg-gradient-to-r from-indigo-900/20 to-transparent">
                    <div className="mt-1 bg-indigo-500/20 p-2 rounded-full text-indigo-300">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-indigo-200 font-medium mb-1">Step {i + 1}</h4>
                      <p className="text-indigo-300/80 text-sm">{act}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex justify-center pt-8">
             <button 
               onClick={handleReset}
               className="px-8 py-3 rounded-full border border-white/10 text-indigo-300 hover:bg-white/5 transition-colors uppercase tracking-widest text-xs"
             >
               Manifest Something Else
             </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;