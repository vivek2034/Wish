
import React, { useState, useEffect } from 'react';
import StarField from './components/StarField';
import ResultDisplay from './components/ResultDisplay';
import { AppState, GeneratedManifestation, HistoryItem } from './types';
import { generateManifestationText } from './services/geminiService';
import { generateManifestationCard } from './services/cardGenerator';
import { Sparkles, History, LayoutTemplate, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [desire, setDesire] = useState('');
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [result, setResult] = useState<GeneratedManifestation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    const saved = localStorage.getItem('wish_theory_history');
    if (saved) {
      try { setHistory(JSON.parse(saved)); } catch (e) {}
    }
    return () => clearTimeout(timer);
  }, []);

  const handleManifest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desire.trim()) return;

    setAppState(AppState.GENERATING_TEXT);
    setError(null);
    setResult(null);

    try {
      const textData = await generateManifestationText(desire);
      setAppState(AppState.GENERATING_IMAGE);
      
      const randomIndex = Math.floor(Math.random() * (textData.affirmations.length || 1));
      const primaryAffirmation = textData.affirmations[randomIndex] || "I manifest my reality.";
      
      const cardUrl = await generateManifestationCard(desire, primaryAffirmation);

      const newManifestation: GeneratedManifestation = {
        ...textData,
        id: Date.now().toString(),
        timestamp: Date.now(),
        originalDesire: desire,
        visionBoardUrl: cardUrl
      };

      setResult(newManifestation);
      setAppState(AppState.COMPLETE);
      
      const newHistoryItem = {
        id: newManifestation.id,
        desire: newManifestation.originalDesire,
        date: new Date().toLocaleDateString()
      };
      const updatedHistory = [newHistoryItem, ...history].slice(0, 10);
      setHistory(updatedHistory);
      localStorage.setItem('wish_theory_history', JSON.stringify(updatedHistory));

    } catch (err: any) {
      console.error("Manifestation Error:", err);
      setError(err.message || "The universe is currently recalibrating. Please check your connection and try again.");
      setAppState(AppState.ERROR);
    }
  };

  if (showSplash) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#0f0c29] flex items-center justify-center overflow-hidden">
        <StarField />
        <div className="relative flex flex-col items-center gap-6 animate-float">
          <div className="relative w-24 h-24">
             <div className="absolute inset-0 rounded-full border border-indigo-500/30 animate-[ping_3s_linear_infinite]"></div>
             <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-600 to-amber-400 p-0.5 shadow-[0_0_50px_rgba(139,92,246,0.5)]">
                <div className="w-full h-full rounded-full bg-[#0f0c29] flex items-center justify-center">
                   <Sparkles className="w-10 h-10 text-white animate-pulse" />
                </div>
             </div>
          </div>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-[0.3em] text-white">WISH THEORY</h1>
            <p className="mt-4 text-indigo-300/60 tracking-[0.5em] text-[10px] uppercase">Aligning Your Reality</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-[#0f0c29] text-indigo-100 font-sans selection:bg-amber-500/30">
      <StarField />
      <nav className="relative z-20 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setAppState(AppState.IDLE)}>
           <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-amber-300 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
           </div>
           <h1 className="text-2xl font-serif font-bold tracking-widest text-white">WISH THEORY</h1>
        </div>
        <button onClick={() => setShowHistory(!showHistory)} className="p-2 rounded-full hover:bg-white/5 text-indigo-300">
          <History className="w-5 h-5" />
        </button>
      </nav>

      {showHistory && (
        <div className="absolute top-20 right-6 z-50 w-80 glass-panel rounded-xl p-4 shadow-2xl border border-white/10">
          <h3 className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-4">Past Manifestations</h3>
          <ul className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {history.map(item => (
              <li key={item.id}>
                <button onClick={() => {setDesire(item.desire); setShowHistory(false);}} className="group w-full flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 text-left">
                  <LayoutTemplate className="w-4 h-4 mt-1 text-indigo-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-indigo-200 truncate">{item.desire}</p>
                    <p className="text-[10px] text-indigo-500/80">{item.date}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </li>
            ))}
            {history.length === 0 && <p className="text-xs text-indigo-500 text-center py-4 italic">No history yet</p>}
          </ul>
        </div>
      )}

      <main className="relative z-10 px-4 min-h-[80vh] flex flex-col items-center justify-center">
        {appState === AppState.IDLE && (
          <div className="w-full max-w-2xl text-center space-y-8">
            <h2 className="text-4xl md:text-6xl font-serif font-thin text-transparent bg-clip-text bg-gradient-to-b from-white to-indigo-400">
              What do you wish<br/>to bring into reality?
            </h2>
            <form onSubmit={handleManifest} className="relative group space-y-6">
              <div className="relative">
                <input
                  type="text"
                  value={desire}
                  onChange={(e) => setDesire(e.target.value)}
                  placeholder="e.g., A peaceful home by the ocean..."
                  className="relative w-full bg-black/30 backdrop-blur-xl border border-white/10 rounded-full px-8 py-6 text-xl text-center text-white focus:outline-none focus:ring-1 focus:ring-indigo-400/50 shadow-2xl"
                />
              </div>
              <button type="submit" disabled={!desire.trim()} className="px-10 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full font-medium tracking-widest text-sm uppercase transition-all transform hover:scale-105 active:scale-95">
                Manifest
              </button>
            </form>
          </div>
        )}

        {(appState === AppState.GENERATING_TEXT || appState === AppState.GENERATING_IMAGE) && (
          <div className="flex flex-col items-center gap-6">
             <div className="relative w-24 h-24">
                <div className="absolute inset-0 rounded-full border-t-2 border-indigo-400 animate-spin"></div>
                <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-white animate-pulse" />
             </div>
             <div className="text-center space-y-2">
                <p className="text-indigo-200 font-serif text-2xl animate-pulse">
                   {appState === AppState.GENERATING_TEXT ? "Securely aligning frequencies..." : "Creating your vision card..."}
                </p>
                <p className="text-indigo-500 text-xs uppercase tracking-[0.2em]">Please stay focused on your intention</p>
             </div>
          </div>
        )}

        {appState === AppState.ERROR && (
          <div className="w-full max-w-md glass-panel rounded-3xl p-8 text-center space-y-6 border-red-500/20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 text-red-400 mb-2">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-serif text-white">Frequency Disturbance</h3>
            <p className="text-indigo-300 text-sm leading-relaxed">{error}</p>
            <button 
              onClick={() => setAppState(AppState.IDLE)} 
              className="flex items-center gap-2 mx-auto px-6 py-2 bg-indigo-600/50 hover:bg-indigo-600 rounded-full text-xs uppercase tracking-widest transition-all"
            >
              <RefreshCw className="w-3 h-3" /> Try Again
            </button>
          </div>
        )}

        {appState === AppState.COMPLETE && result && (
          <ResultDisplay data={result} onReset={() => setAppState(AppState.IDLE)} />
        )}
      </main>
    </div>
  );
}
