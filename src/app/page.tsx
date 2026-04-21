'use client';

import { useState, useEffect } from 'react';
import { 
  Sparkles, Copy, Check, Loader2, RefreshCw, 
  ShieldOff, VenetianMask, ChevronRight 
} from 'lucide-react';

interface Version {
  name: string;
  success: boolean;
  content: string;
}

const ALG_ICONS: Record<string, React.ReactNode> = {
  "blader/humanizer (Anti-Patterns)": <ShieldOff className="w-4 h-4" />,
  "StealthHumanizer (Ninja Mode)": <VenetianMask className="w-4 h-4" />
};

const ALG_COLORS: Record<string, string> = {
  "blader/humanizer (Anti-Patterns)": "from-blue-500 to-cyan-400",
  "StealthHumanizer (Ninja Mode)": "from-violet-500 to-fuchsia-500"
};

export default function HumanizerPage() {
  const [content, setContent] = useState('');
  const [voiceSample, setVoiceSample] = useState('');
  const [versions, setVersions] = useState<Version[]>([]);
  const [generating, setGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);
  const [voiceFocused, setVoiceFocused] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  async function handleHumanize() {
    if (!content.trim()) return;
    setGenerating(true);
    setError('');
    
    // Initialize empty versions array to show skeletons
    const initialVersions = Array.from({ length: 2 }).map((_, i) => ({
      name: '',
      success: false,
      content: '',
      loading: true
    }));
    setVersions(initialVersions as any);

    try {
      const promises = [0, 1].map(async (index) => {
        try {
          const res = await fetch('/api/humanize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content, versionIndex: index, voiceSample })
          });
          
          if (!res.ok) {
            throw new Error(`HTTP Error: ${res.status}`);
          }
          
          const reader = res.body?.getReader();
          if (!reader) throw new Error('No readable stream returned');
          
          const decoder = new TextDecoder('utf-8');
          let buffer = '';
          
          let finalCleanedChunks: string[] = [];
          let currentChunkTokens = '';

          const modelName = index === 0 ? "blader/humanizer (Anti-Patterns)" : "StealthHumanizer (Ninja Mode)";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            
            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed) continue;
              
              try {
                const event = JSON.parse(trimmed);
                
                if (event.type === 'voice_generation') {
                  setVersions(prev => {
                    const updated = [...prev];
                    updated[index] = { 
                      name: modelName, 
                      success: true, 
                      content: `\n[⚙️ System]: ${event.message}\n`, 
                      loading: false 
                    } as any;
                    return updated;
                  });
                } else if (event.type === 'token') {
                  // Text-based progress bar instead of raw text streaming
                  const percentage = Math.round((event.chunkIndex / event.totalChunks) * 100);
                  const blocks = Math.round(percentage / 10);
                  const bar = '▓'.repeat(blocks) + '░'.repeat(10 - blocks);
                  const progressMessage = `[${bar}] Processing Part ${event.chunkIndex} of ${event.totalChunks}... (${percentage}%)`;
                  
                  const displayContent = [...finalCleanedChunks, progressMessage].filter(Boolean).join('\n\n\n');
                  
                  // Only update state occasionally to save CPU cycles on tokens
                  if (Math.random() < 0.1) {
                    setVersions(prev => {
                      const updated = [...prev];
                      updated[index] = { 
                        name: modelName, 
                        success: true, 
                        content: displayContent, 
                        loading: false 
                      } as any;
                      return updated;
                    });
                  }
                } else if (event.type === 'chunk_final') {
                  finalCleanedChunks.push(event.content);
                  currentChunkTokens = ''; 
                  
                  setVersions(prev => {
                    const updated = [...prev];
                    updated[index] = { 
                      name: modelName, 
                      success: true, 
                      content: finalCleanedChunks.join('\n\n'), 
                      loading: false 
                    } as any;
                    return updated;
                  });
                } else if (event.type === 'error') {
                  throw new Error(event.message);
                }
              } catch (e: any) {
                // Ignore incomplete JSON chunks from buffer boundary issues
              }
            }
          }
        } catch (e: any) {
          setVersions(prev => {
            const updated = [...prev];
            updated[index] = { name: 'Model ' + (index + 1), success: false, content: e.message, loading: false } as any;
            return updated;
          });
        }
      });
      
      await Promise.all(promises);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  }

  function handleCopy(text: string, index: number) {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }

  function handleCopyAll() {
    const loadedVersions = versions.filter((v: any) => !v.loading && v.success);
    if (loadedVersions.length === 0) return;

    const allText = loadedVersions.map((v: any, i) => '=== VERSION ' + (i + 1) + ': ' + v.name + ' ===\n' + v.content + '\n').join('\n');
    navigator.clipboard.writeText(allText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 text-slate-800 pb-20">
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-400/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 px-6 pt-12 pb-16 max-w-7xl mx-auto font-sans">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Evasion Engine</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-5">
            Ultimate Humanizer v2
          </h1>
          <p className="text-slate-500 max-w-2xl text-lg md:text-xl font-light">
            Deploy <span className="text-slate-800 font-medium">2 top-tier algorithms</span> simultaneously to guarantee your text bypasses AI detection gracefully.
          </p>
        </div>

        {/* Input Section */}
        <div className="max-w-4xl mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl blur-lg opacity-50 transition duration-500" />
          
          <div className="relative bg-white border border-slate-200 rounded-2xl p-8 shadow-xl flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-indigo-500" /> Original AI Content
              </label>
              <span className="text-xs font-mono text-slate-400">{content.length} chars</span>
            </div>
            
            <textarea 
              value={content} 
              onChange={e=>setContent(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              rows={6} 
              placeholder="Paste your robotic, AI-generated text here... Let's breathe some life into it." 
              className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 resize-y text-lg leading-relaxed font-light mb-6 transition-all"
              style={{ minHeight: '120px' }}
            />
            
            {error && (
              <div className="flex items-center gap-3 px-4 py-3 mb-6 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                <ShieldOff className="w-4 h-4 flex-shrink-0" />
                <span><strong className="font-semibold text-red-700">Error:</strong> {error}</span>
              </div>
            )}

            <div className="flex justify-between items-center mb-4 pt-5 border-t border-slate-100">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-blue-500" /> Voice Calibration Sample <span className="lowercase font-normal text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">optional</span>
              </label>
              <span className="text-xs font-mono text-slate-400">{voiceSample.length} chars</span>
            </div>
            
            <textarea 
              value={voiceSample} 
              onChange={e=>setVoiceSample(e.target.value)}
              onFocus={() => setVoiceFocused(true)}
              onBlur={() => setVoiceFocused(false)}
              rows={3} 
              placeholder="Paste a sample of your personal writing here. Blader (Version 1) will analyze your unique style, sentence length, and vocabulary and mimic it perfectly." 
              className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 resize-y text-sm leading-relaxed font-light mb-8 transition-all"
              style={{ minHeight: '60px' }}
            />

            <button 
              onClick={handleHumanize} 
              disabled={!mounted || generating || !content.trim()}
              className="group relative w-full overflow-hidden rounded-xl font-semibold text-white text-base py-4 transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-500 bg-[length:200%_auto]"
              style={{
                animation: generating ? 'gradient-shift 2s linear infinite' : 'none'
              }}
            >
              <div className="absolute inset-0 bg-white/10 transition-opacity opacity-0 group-hover:opacity-100" />
              <div className="relative flex items-center justify-center gap-2">
                {generating ? (
                  <Loader2 className="w-5 h-5 animate-spin data-generating" />
                ) : (
                  <RefreshCw className="w-5 h-5 transition-transform group-hover:rotate-180 duration-500" />
                )}
                <span className="tracking-wide">
                  {generating ? 'Running 2 Concurrent Models...' : 'Ignite Humanization Engine'}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Results Section */}
        {(versions.length > 0 || generating) && (
          <div className="mt-20 relative">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px bg-slate-200 flex-1" />
              <h2 className="text-xl font-bold text-slate-400 uppercase tracking-widest">
                Generation Results
              </h2>
              <div className="h-px bg-slate-200 flex-1" />
            </div>

            <div className="flex justify-center mb-10">
              <button 
                onClick={handleCopyAll}
                disabled={!mounted || generating || versions.every((v: any) => v.loading)}
                className={`py-2 px-6 rounded-full font-medium text-sm transition-all duration-300 flex items-center gap-2 ${
                  copiedAll
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:shadow-sm'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {copiedAll ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedAll ? 'All Versions Copied!' : 'Copy Both Versions Together'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {versions.map((ver: any, idx) => {
                if (ver.loading) {
                  return (
                    <div key={idx} className="bg-white border border-slate-100 shadow-sm rounded-2xl p-8 relative overflow-hidden flex flex-col min-h-[300px]">
                      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-slate-50 to-transparent" />
                      <div className="flex items-center gap-3 mb-8">
                        <div className="w-8 h-8 rounded-full bg-slate-100" />
                        <div className="h-4 w-32 bg-slate-100 rounded-full" />
                      </div>
                      <div className="space-y-4 flex-1">
                        <div className="h-3 w-full bg-slate-100 rounded-full" />
                        <div className="h-3 w-5/6 bg-slate-100 rounded-full" />
                        <div className="h-3 w-4/6 bg-slate-100 rounded-full" />
                      </div>
                    </div>
                  );
                }

                const gradient = ALG_COLORS[ver.name] || "from-slate-400 to-slate-500";
                const icon = ALG_ICONS[ver.name] || <Sparkles className="w-4 h-4" />;
                
                return (
                  <div key={idx} className="group bg-white border border-slate-200 shadow-md rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col">
                      
                      {/* Top Accent Line */}
                      <div className={`h-1.5 w-full bg-gradient-to-r ${gradient}`} />
                      
                      <div className="p-8 flex flex-col flex-1">
                        {/* Card Header */}
                        <div className="flex items-start justify-between mb-6 gap-2">
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r ${gradient} bg-opacity-10 text-white font-semibold text-sm shadow-sm truncate max-w-[80%]`}>
                            <div className="opacity-90">{icon}</div>
                            <span className="truncate">{ver.name.split(' ')[0]}</span>
                          </div>
                          {!ver.success && (
                            <span className="text-[10px] uppercase tracking-wider font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md border border-red-100">Failed</span>
                          )}
                        </div>

                        {/* Subtitle */}
                        {ver.success && (
                          <div className="text-xs text-slate-400 mb-4 font-medium uppercase tracking-wider pl-1">
                            {ver.name.substring(ver.name.indexOf('('))}
                          </div>
                        )}
                        
                        {/* Card Content */}
                        <div className={`flex-1 overflow-y-auto pr-3 custom-scrollbar ${ver.success ? 'text-slate-600 font-light' : 'text-red-500 font-mono text-xs'} leading-relaxed text-base`} style={{ maxHeight: '300px' }}>
                          {ver.content}
                        </div>

                        {/* Card Footer */}
                        {ver.success && (
                          <div className="mt-6 pt-5 border-t border-slate-100">
                            <button 
                              onClick={() => handleCopy(ver.content, idx)} 
                              className={`w-full py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                                copiedIndex === idx 
                                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                                  : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                              }`}
                            >
                              {copiedIndex === idx ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                              {copiedIndex === idx ? 'Copied to Clipboard!' : 'Copy This Version'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.02); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.2); }
      `}</style>
    </div>
  );
}
