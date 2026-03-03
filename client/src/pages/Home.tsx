import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Music, VolumeX, Coffee, Brain } from "lucide-react";
import confetti from "canvas-confetti";
import { useSessions, useCreateSession } from "@/hooks/use-sessions";

// ============================================================================
// CONSTANTS
// Keeping magic numbers as constants makes them easy to change later.
// ============================================================================
const FOCUS_MINUTES = 25;
const BREAK_MINUTES = 5;
const SECONDS_PER_MINUTE = 60;

export default function Home() {
  // ============================================================================
  // REACT STATE
  // State holds data that changes over time and updates the UI when modified.
  // ============================================================================
  
  // 1. Track the remaining time in seconds. Starts at 25 minutes (1500 seconds).
  const [timeLeft, setTimeLeft] = useState(FOCUS_MINUTES * SECONDS_PER_MINUTE);
  
  // 2. Track whether the timer is currently actively counting down.
  const [isRunning, setIsRunning] = useState(false);
  
  // 3. Track the current mode: are we focusing or taking a break?
  const [mode, setMode] = useState<"focus" | "break">("focus");
  
  // 4. Track if the Lo-Fi background music is playing.
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  // ============================================================================
  // HOOKS & REFS
  // ============================================================================
  
  // We use this ref to hold our audio element. A "ref" persists across renders
  // without triggering a re-render when it changes (unlike state).
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Fetch our backend hooks to read/write data
  const { data: sessions = [] } = useSessions();
  const createSession = useCreateSession();

  // Calculate today's stats by filtering the fetched sessions
  const todaySessionsCount = sessions.filter((session) => {
    // Note: session.completedAt is returned as a string from JSON or a Date object 
    // depending on the Zod parser. Let's safely convert it to a Date.
    const sessionDate = new Date(session.completedAt || Date.now());
    const today = new Date();
    return (
      sessionDate.getDate() === today.getDate() &&
      sessionDate.getMonth() === today.getMonth() &&
      sessionDate.getFullYear() === today.getFullYear()
    );
  }).length;

  // ============================================================================
  // THE TIMER LOGIC (THE HEART OF THE APP)
  // We use useEffect to set up a repeating interval that decreases the time.
  // ============================================================================
  useEffect(() => {
    // This variable will hold the ID of our timer, so we can stop it later.
    let intervalId: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      // If the timer is running and we have time left, start an interval!
      // setInterval runs the provided function every X milliseconds (1000ms = 1s).
      intervalId = setInterval(() => {
        // We use the "functional update" form of setState here: prev => prev - 1
        // This ensures we always subtract 1 from the MOST RECENT state, avoiding bugs.
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } 
    else if (isRunning && timeLeft === 0) {
      // WHAT HAPPENS WHEN THE TIMER HITS ZERO?
      
      // 1. We immediately stop the timer.
      setIsRunning(false);
      
      // 2. Play a celebration sound or animation
      triggerCelebration();

      // 3. If we just finished a focus session, save it to the database!
      if (mode === "focus") {
        createSession.mutate({ durationMinutes: FOCUS_MINUTES });
        // Automatically switch to break mode
        setMode("break");
        setTimeLeft(BREAK_MINUTES * SECONDS_PER_MINUTE);
      } else {
        // If we finished a break, switch back to focus mode
        setMode("focus");
        setTimeLeft(FOCUS_MINUTES * SECONDS_PER_MINUTE);
      }
    }

    // THE CLEANUP FUNCTION:
    // React runs this function right before the component unmounts, OR right before
    // this useEffect runs again. This is CRITICAL for intervals! If we don't clear
    // the interval, we will create multiple competing timers that count down way too fast.
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRunning, timeLeft, mode, createSession]); 
  // ^ The dependency array tells React to re-run this effect if any of these variables change.

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  // Toggle play/pause state
  const toggleTimer = () => setIsRunning(!isRunning);

  // Reset the timer back to the starting value of the current mode
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(mode === "focus" ? FOCUS_MINUTES * SECONDS_PER_MINUTE : BREAK_MINUTES * SECONDS_PER_MINUTE);
  };

  // Switch between Focus and Break modes manually
  const switchMode = (newMode: "focus" | "break") => {
    setMode(newMode);
    setIsRunning(false);
    setTimeLeft(newMode === "focus" ? FOCUS_MINUTES * SECONDS_PER_MINUTE : BREAK_MINUTES * SECONDS_PER_MINUTE);
  };

  // Toggle Lo-Fi music
  const toggleMusic = () => {
    if (!audioRef.current) return;
    
    if (isMusicPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.volume = 0.3; // Keep it soft and chill
      audioRef.current.play().catch(e => console.error("Audio play failed:", e));
    }
    setIsMusicPlaying(!isMusicPlaying);
  };

  // Fun visual effect when completing a session
  const triggerCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ffffff', '#a855f7', '#3b82f6'] // Matching our color palette
    });
  };

  // Convert pure seconds (e.g., 1499) into a clean "MM:SS" format (e.g., "24:59")
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    // .toString().padStart(2, '0') ensures 9 becomes "09"
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate percentage completed for the circular progress ring
  const totalSeconds = mode === "focus" ? FOCUS_MINUTES * SECONDS_PER_MINUTE : BREAK_MINUTES * SECONDS_PER_MINUTE;
  const percentage = ((totalSeconds - timeLeft) / totalSeconds) * 100;
  const strokeDasharray = 283; // Circumference of our SVG circle (2 * Math.PI * 45)
  const strokeDashoffset = strokeDasharray - (strokeDasharray * percentage) / 100;

  return (
    <div className="min-h-screen w-full bg-lofi-gradient flex flex-col items-center justify-center p-4 sm:p-8">
      
      {/* Hidden Audio Element for our Lo-Fi loop */}
      {/* We use a generic lofi loop placeholder. If it breaks, the visualizer still works! */}
      <audio 
        ref={audioRef} 
        loop 
        src="https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3" 
      />

      {/* Main Glassmorphism Container */}
      <main className="glass-panel rounded-3xl w-full max-w-md flex flex-col items-center p-8 sm:p-12 relative z-10">
        
        {/* App Title & Header */}
        <div className="text-center mb-10 w-full">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2 tracking-tight drop-shadow-md flex items-center justify-center gap-3">
            Focus Beats
          </h1>
          <p className="text-white/60 font-medium">Glassmorphism Pomodoro</p>
        </div>

        {/* Mode Selector Tabs (Focus vs Break) */}
        <div className="flex bg-black/20 p-1.5 rounded-full mb-10 border border-white/5 backdrop-blur-md relative z-20">
          <button
            onClick={() => switchMode("focus")}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
              mode === "focus" 
                ? "bg-white/20 text-white shadow-lg border border-white/20" 
                : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            <Brain className="w-4 h-4" /> Focus
          </button>
          <button
            onClick={() => switchMode("break")}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
              mode === "break" 
                ? "bg-white/20 text-white shadow-lg border border-white/20" 
                : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            <Coffee className="w-4 h-4" /> Break
          </button>
        </div>

        {/* The Timer Display - Beautiful Circular Design */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center mb-12">
          {/* SVG for the progress ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 transform drop-shadow-xl" viewBox="0 0 100 100">
            {/* Background ring */}
            <circle 
              cx="50" cy="50" r="45" 
              className="stroke-white/10" 
              strokeWidth="3" 
              fill="none" 
            />
            {/* Progress ring */}
            <circle 
              cx="50" cy="50" r="45" 
              className={`transition-all duration-1000 ease-linear ${mode === 'focus' ? 'stroke-purple-400' : 'stroke-blue-400'}`}
              strokeWidth="3" 
              fill="none" 
              strokeLinecap="round"
              style={{ 
                strokeDasharray, 
                strokeDashoffset 
              }}
            />
          </svg>
          
          {/* Text inside the circle */}
          <div className="flex flex-col items-center">
            <span style={{ fontFamily: 'var(--font-display)' }} className="text-6xl sm:text-7xl font-light text-white tracking-wider drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* Timer Controls */}
        <div className="flex items-center gap-6 z-20">
          <button 
            onClick={resetTimer}
            className="w-12 h-12 rounded-full glass-button flex items-center justify-center text-white/80 group"
            aria-label="Reset Timer"
          >
            <RotateCcw className="w-5 h-5 group-hover:-rotate-90 transition-transform duration-500" />
          </button>

          <button 
            onClick={toggleTimer}
            className="w-20 h-20 rounded-full bg-white/20 hover:bg-white/30 border border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.2)] backdrop-blur-xl flex items-center justify-center text-white transition-all duration-300 hover:scale-105 active:scale-95"
            aria-label={isRunning ? "Pause Timer" : "Start Timer"}
          >
            {isRunning ? (
              <Pause className="w-8 h-8 fill-current" />
            ) : (
              <Play className="w-8 h-8 fill-current ml-1" />
            )}
          </button>

          {/* Lo-Fi Audio Toggle */}
          <button 
            onClick={toggleMusic}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white relative ${isMusicPlaying ? 'glass-button-active' : 'glass-button text-white/80'}`}
            aria-label="Toggle Lo-Fi Background"
          >
            {isMusicPlaying ? (
              <Music className="w-5 h-5" />
            ) : (
              <VolumeX className="w-5 h-5" />
            )}
            
            {/* Mini visualizer bars showing when playing */}
            {isMusicPlaying && (
              <div className="absolute -bottom-6 flex items-end gap-1 h-4 w-full justify-center">
                <div className="w-1 bg-white/60 rounded-t-sm h-full visualizer-bar"></div>
                <div className="w-1 bg-white/60 rounded-t-sm h-full visualizer-bar"></div>
                <div className="w-1 bg-white/60 rounded-t-sm h-full visualizer-bar"></div>
                <div className="w-1 bg-white/60 rounded-t-sm h-full visualizer-bar"></div>
              </div>
            )}
          </button>
        </div>
      </main>

      {/* Stats Widget - Shows completion data fetched from backend */}
      <div className="mt-8 glass-panel rounded-2xl px-8 py-4 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
          <Brain className="w-5 h-5 text-purple-300" />
        </div>
        <div>
          <p className="text-white/60 text-xs font-semibold uppercase tracking-wider">Today's Focus</p>
          <p className="text-white font-medium">
            {todaySessionsCount === 0 
              ? "Ready to start?" 
              : `${todaySessionsCount} session${todaySessionsCount === 1 ? '' : 's'} completed`}
          </p>
        </div>
      </div>
    </div>
  );
}
