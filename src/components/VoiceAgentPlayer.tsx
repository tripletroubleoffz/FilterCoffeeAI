'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, RotateCcw, Headphones, Sparkles, Mic, Sliders } from 'lucide-react';

interface VoiceAgentPlayerProps {
  text: string;
  title?: string;
  onStart?: () => void;
  onEnd?: () => void;
}

export default function VoiceAgentPlayer({ text, title = 'Intelligence Briefing', onStart, onEnd }: VoiceAgentPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState(1.0);
  const [volume, setVolume] = useState(0.8);
  const [hostType, setHostType] = useState<'espresso' | 'crema' | 'decaf'>('crema');
  const [currentCharIndex, setCurrentCharIndex] = useState(-1);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('');

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const amplitudeRef = useRef(0); // For smooth transition of visualizer waves

  // Load browser voices
  useEffect(() => {
    const loadVoices = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
        
        // Pick a default English voice
        const englishVoice = availableVoices.find(v => v.lang.startsWith('en')) || availableVoices[0];
        if (englishVoice) {
          setSelectedVoiceName(englishVoice.name);
        }
      }
    };

    loadVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Web Audio API Retro Intro Chime
  const playIntroChime = async (): Promise<boolean> => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return false;
      const ctx = new AudioContextClass();
      
      // Dual-sine bell chime
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      gain1.gain.setValueAtTime(0.12, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.4);
      
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12); // E5
      gain2.gain.setValueAtTime(0.12, ctx.currentTime + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc2.start(ctx.currentTime + 0.12);
      osc2.stop(ctx.currentTime + 0.6);

      await new Promise(resolve => setTimeout(resolve, 650));
      return true;
    } catch (err) {
      console.warn('Synth chime blocked or failed:', err);
      return false;
    }
  };

  // Canvas visualizer loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    
    const draw = () => {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Smooth amplitude transitions
      const targetAmp = isPlaying && !isPaused ? 24 : 1.5;
      amplitudeRef.current += (targetAmp - amplitudeRef.current) * 0.1;

      const width = canvas.width;
      const height = canvas.height;
      const midY = height / 2;

      // Draw three layers of overlapping waves
      const drawWave = (color: string, speed: number, waveCount: number, opacity: number, offsetPhase: number) => {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.8;
        ctx.globalAlpha = opacity;
        
        for (let x = 0; x < width; x++) {
          // Fade wave out at the edges
          const edgeDecay = Math.sin((x / width) * Math.PI);
          const y = midY + Math.sin(x * (waveCount / width) * Math.PI * 2 + phase * speed + offsetPhase) * amplitudeRef.current * edgeDecay;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      };

      // Draw waves (Coffee accent colors)
      drawWave('#c28854', 1.0, 1.8, 0.9, 0); // Core gold/brown
      drawWave('#ecc19a', 1.6, 2.5, 0.5, Math.PI / 3); // Light cream
      drawWave('#583624', 0.7, 1.2, 0.4, Math.PI / 1.5); // Dark roasted espresso

      ctx.globalAlpha = 1.0;
      phase += 0.05;
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, isPaused]);

  // Setup/Trigger Speech Synthesis
  const handlePlay = async () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Your browser does not support Speech Synthesis APIs.');
      return;
    }

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    // Stop current runs
    window.speechSynthesis.cancel();

    // Trigger onStart callback
    if (onStart) onStart();

    // Play podcast chime first
    await playIntroChime();

    // Clean text to read (stripping html tags or markdown markup if any)
    const cleanText = text
      .replace(/###\s+/g, '')
      .replace(/\*\*/g, '')
      .replace(/-\s+/g, ', ')
      .replace(/<[^>]*>/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utteranceRef.current = utterance;

    // Apply voice settings
    const selectedVoice = voices.find(v => v.name === selectedVoiceName);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    // Adjust parameters based on host branding
    if (hostType === 'espresso') {
      utterance.pitch = 0.75; // Low-pitch radio host
      utterance.rate = rate * 0.95;
    } else if (hostType === 'crema') {
      utterance.pitch = 1.15; // Smooth warm host
      utterance.rate = rate * 1.02;
    } else {
      utterance.pitch = 0.95; // Calm reading
      utterance.rate = rate * 0.9;
    }

    utterance.volume = volume;

    // Boundary tracker for highlighting
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        setCurrentCharIndex(event.charIndex);
      }
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentCharIndex(-1);
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      setIsPlaying(false);
      setIsPaused(false);
    };

    setIsPlaying(true);
    setIsPaused(false);
    window.speechSynthesis.speak(utterance);
  };

  const handlePause = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && isPlaying) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentCharIndex(-1);
      if (onEnd) onEnd();
    }
  };

  const handleRateChange = (newRate: number) => {
    setRate(newRate);
    if (isPlaying && utteranceRef.current) {
      // Re-trigger with new rate
      const currentIdx = currentCharIndex !== -1 ? currentCharIndex : 0;
      const remainingText = text.slice(currentIdx);
      window.speechSynthesis.cancel();
      setTimeout(() => {
        handlePlayWithTextSegment(remainingText);
      }, 50);
    }
  };

  const handlePlayWithTextSegment = (segmentText: string) => {
    const cleanText = segmentText
      .replace(/###\s+/g, '')
      .replace(/\*\*/g, '')
      .replace(/-\s+/g, ', ')
      .replace(/<[^>]*>/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utteranceRef.current = utterance;

    const selectedVoice = voices.find(v => v.name === selectedVoiceName);
    if (selectedVoice) utterance.voice = selectedVoice;

    if (hostType === 'espresso') {
      utterance.pitch = 0.75;
      utterance.rate = rate * 0.95;
    } else if (hostType === 'crema') {
      utterance.pitch = 1.15;
      utterance.rate = rate * 1.02;
    } else {
      utterance.pitch = 0.95;
      utterance.rate = rate * 0.9;
    }
    utterance.volume = volume;

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        // Offset the character index by where we started
        const offsetIndex = text.length - segmentText.length;
        setCurrentCharIndex(offsetIndex + event.charIndex);
      }
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentCharIndex(-1);
      if (onEnd) onEnd();
    };

    setIsPlaying(true);
    setIsPaused(false);
    window.speechSynthesis.speak(utterance);
  };

  // Helper to parse transcript highlighting
  const getHighlightedText = () => {
    if (currentCharIndex === -1 || currentCharIndex >= text.length) {
      return <span className="text-coffee-cream/80">{text}</span>;
    }

    // Find the word boundary
    let endOfWord = currentCharIndex;
    while (endOfWord < text.length && /[\w\d]/.test(text[endOfWord])) {
      endOfWord++;
    }

    if (endOfWord === currentCharIndex) {
      endOfWord = currentCharIndex + 1;
    }

    const before = text.slice(0, currentCharIndex);
    const word = text.slice(currentCharIndex, endOfWord);
    const after = text.slice(endOfWord);

    return (
      <span className="text-coffee-cream/80 leading-relaxed transition-all duration-300">
        {before}
        <span className="bg-coffee-accent/20 border border-coffee-accent/40 text-coffee-accent font-bold px-1.5 py-0.5 rounded shadow-[0_2px_8px_rgba(194,136,84,0.15)] inline-block scale-105 transition-transform font-mono mx-0.5">
          {word}
        </span>
        {after}
      </span>
    );
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-coffee-border/40 bg-[#0c0806]/95 space-y-6">
      {/* Player header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Headphones className="w-5 h-5 text-coffee-accent animate-bounce" />
          <div>
            <h4 className="text-xs font-display font-extrabold text-coffee-cream">{title}</h4>
            <span className="text-[9px] font-mono text-coffee-text-muted flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-coffee-accent" /> Powered by FilterCoffee AI Voice Agents
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-[#070403] px-2.5 py-1 rounded border border-coffee-border/30 text-[9.5px] font-mono text-coffee-cream">
          <Mic className="w-3.5 h-3.5 text-coffee-accent" />
          <span className="capitalize">{hostType} Host Active</span>
        </div>
      </div>

      {/* Visualizer canvas */}
      <div className="relative h-14 bg-[#070403] rounded-xl border border-coffee-border/20 overflow-hidden flex items-center justify-center">
        <canvas ref={canvasRef} width={450} height={56} className="w-full h-full" />
        <div className="absolute inset-x-0 bottom-1.5 flex justify-center pointer-events-none">
          <span className="text-[7.5px] font-mono text-coffee-text-muted uppercase tracking-widest bg-[#070403]/90 px-2 rounded-full border border-coffee-border/10">
            Live Stream Sound Wave
          </span>
        </div>
      </div>

      {/* Control Console */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-coffee-dark/20 p-4 rounded-xl border border-coffee-border/20 text-xs">
        {/* Host select */}
        <div className="space-y-1.5">
          <label className="text-[9.5px] font-mono text-coffee-text-muted uppercase tracking-wider block">Voice Host Agent</label>
          <div className="grid grid-cols-3 gap-1">
            {(['crema', 'espresso', 'decaf'] as const).map((host) => (
              <button
                key={host}
                onClick={() => setHostType(host)}
                className={`py-1.5 rounded text-[10px] font-mono font-bold capitalize transition-all border ${
                  hostType === host
                    ? 'bg-coffee-accent text-[#0c0806] border-coffee-accent'
                    : 'bg-[#070403] text-coffee-text-muted border-coffee-border/30 hover:border-coffee-border/60 hover:text-coffee-cream'
                }`}
              >
                {host}
              </button>
            ))}
          </div>
        </div>

        {/* Speed select */}
        <div className="space-y-1.5">
          <label className="text-[9.5px] font-mono text-coffee-text-muted uppercase tracking-wider block">Speaking Speed</label>
          <div className="grid grid-cols-4 gap-1">
            {([0.8, 1.0, 1.25, 1.5] as const).map((r) => (
              <button
                key={r}
                onClick={() => handleRateChange(r)}
                className={`py-1.5 rounded text-[10.5px] font-mono font-bold transition-all border ${
                  rate === r
                    ? 'bg-coffee-accent text-[#0c0806] border-coffee-accent'
                    : 'bg-[#070403] text-coffee-text-muted border-coffee-border/30 hover:border-coffee-border/60 hover:text-coffee-cream'
                }`}
              >
                {r}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Voice selection from system */}
      {voices.length > 0 && (
        <div className="space-y-1 bg-coffee-dark/10 p-3 rounded-lg border border-coffee-border/10 text-[10px] flex justify-between items-center">
          <span className="font-mono text-coffee-text-muted text-[9px] uppercase tracking-wider">System Voice Synth:</span>
          <select
            value={selectedVoiceName}
            onChange={(e) => setSelectedVoiceName(e.target.value)}
            className="bg-[#070403] border border-coffee-border/40 text-coffee-cream text-[10px] font-mono px-2 py-1 rounded outline-none focus:border-coffee-accent max-w-[200px]"
          >
            {voices.map((v) => (
              <option key={v.name} value={v.name}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Large Player Controls */}
      <div className="flex items-center justify-between pt-2 border-t border-coffee-border/20">
        <div className="flex items-center gap-2">
          {isPlaying ? (
            <button
              onClick={handlePause}
              className="w-11 h-11 rounded-full bg-coffee-accent hover:bg-coffee-accent-hover text-[#0c0806] flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-[0_4px_12px_rgba(194,136,84,0.3)]"
            >
              <Pause className="w-5 h-5 fill-current" />
            </button>
          ) : (
            <button
              onClick={handlePlay}
              className="w-11 h-11 rounded-full bg-coffee-accent hover:bg-coffee-accent-hover text-[#0c0806] flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-[0_4px_12px_rgba(194,136,84,0.3)]"
            >
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </button>
          )}

          <button
            onClick={handleStop}
            className="w-8 h-8 rounded-full bg-[#070403] border border-coffee-border/40 hover:border-coffee-border/70 text-coffee-cream flex items-center justify-center transition-colors"
            title="Stop & Reset"
          >
            <RotateCcw className="w-4 h-4 text-coffee-accent" />
          </button>
        </div>

        {/* Volume controls */}
        <div className="flex items-center gap-2 text-coffee-text-muted text-xs font-mono">
          <Volume2 className="w-4 h-4 text-coffee-accent" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-20 h-1 bg-coffee-border rounded-lg appearance-none cursor-pointer accent-coffee-accent"
          />
          <span className="w-6 text-right text-[10px]">{Math.round(volume * 100)}%</span>
        </div>
      </div>

      {/* Scrolling live highlighted transcript */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[9px] font-mono text-coffee-text-muted uppercase tracking-wider">
          <span>Live Speaking Transcript</span>
          {isPlaying && <span className="text-coffee-accent animate-pulse font-bold">● Streaming</span>}
        </div>
        <div className="bg-[#070403] border border-coffee-border/30 rounded-xl p-4 max-h-[140px] overflow-y-auto text-[11px] font-mono leading-relaxed select-none">
          {getHighlightedText()}
        </div>
      </div>
    </div>
  );
}
