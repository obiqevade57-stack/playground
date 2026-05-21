'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

type Mode = 'focus' | 'shortBreak' | 'longBreak';

const MODES: Record<Mode, { label: string; duration: number; color: string }> = {
  focus: { label: 'Focus', duration: 25 * 60, color: 'var(--accent)' },
  shortBreak: { label: 'Short Break', duration: 5 * 60, color: 'var(--success)' },
  longBreak: { label: 'Long Break', duration: 15 * 60, color: 'var(--warning)' },
};

const RADIUS = 120;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface DailyStats {
  date: string;
  sessions: number;
  totalMinutes: number;
}

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function loadStats(): DailyStats {
  try {
    const raw = localStorage.getItem('pomodoro-stats');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.date === getToday()) return parsed;
    }
  } catch {}
  return { date: getToday(), sessions: 0, totalMinutes: 0 };
}

function saveStats(stats: DailyStats) {
  localStorage.setItem('pomodoro-stats', JSON.stringify(stats));
}

function calculateStreak(): number {
  try {
    const raw = localStorage.getItem('pomodoro-history');
    if (!raw) return 0;
    const days: string[] = JSON.parse(raw);
    const uniqueDays = [...new Set(days)].sort().reverse();
    if (uniqueDays.length === 0) return 0;
    if (uniqueDays[0] !== getToday()) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (uniqueDays[0] !== yesterday) return 0;
    }
    let streak = 1;
    for (let i = 1; i < uniqueDays.length; i++) {
      const prev = new Date(uniqueDays[i - 1]);
      const curr = new Date(uniqueDays[i]);
      const diff = (prev.getTime() - curr.getTime()) / 86400000;
      if (diff === 1) streak++;
      else break;
    }
    return streak;
  } catch {
    return 0;
  }
}

function addDayToHistory() {
  try {
    const raw = localStorage.getItem('pomodoro-history');
    const days: string[] = raw ? JSON.parse(raw) : [];
    days.push(getToday());
    localStorage.setItem('pomodoro-history', JSON.stringify(days));
  } catch {}
}

function playBeep() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.8);

    setTimeout(() => {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.frequency.value = 1100;
      osc2.type = 'sine';
      gain2.gain.setValueAtTime(0.3, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc2.start(ctx.currentTime);
      osc2.stop(ctx.currentTime + 0.6);
    }, 300);
  } catch {}
}

export default function PomodoroTimer() {
  const [mode, setMode] = useState<Mode>('focus');
  const [timeLeft, setTimeLeft] = useState(MODES.focus.duration);
  const [isRunning, setIsRunning] = useState(false);
  const [session, setSession] = useState(1);
  const [stats, setStats] = useState<DailyStats>(() => loadStats());
  const [streak, setStreak] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setStreak(calculateStreak());
  }, []);

  const progress = 1 - timeLeft / MODES[mode].duration;

  const switchMode = useCallback((newMode: Mode) => {
    setMode(newMode);
    setTimeLeft(MODES[newMode].duration);
    setIsRunning(false);
  }, []);

  const handleTimerEnd = useCallback(() => {
    playBeep();
    setIsRunning(false);

    if (mode === 'focus') {
      const newStats: DailyStats = {
        date: getToday(),
        sessions: stats.sessions + 1,
        totalMinutes: stats.totalMinutes + 25,
      };
      setStats(newStats);
      saveStats(newStats);
      addDayToHistory();
      setStreak(calculateStreak());

      if (session >= 4) {
        setSession(1);
        switchMode('longBreak');
      } else {
        setSession((s) => s + 1);
        switchMode('shortBreak');
      }
    } else {
      switchMode('focus');
    }
  }, [mode, session, stats, switchMode]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(intervalRef.current!);
            // Use setTimeout to avoid setState during render
            setTimeout(handleTimerEnd, 0);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, handleTimerEnd]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(MODES[mode].duration);
  };

  const dashOffset = CIRCUMFERENCE * (1 - progress);
  const modeColor = MODES[mode].color;

  return (
    <div
      style={{
        '--accent': '#7c3aed',
        '--accent-light': '#a78bfa',
        '--success': '#10b981',
        '--warning': '#f59e0b',
        '--card': '#12121a',
        '--border': 'rgba(255,255,255,0.08)',
        '--text': '#e2e8f0',
        '--text-muted': 'rgba(255,255,255,0.5)',
        minHeight: '100vh',
        background: '#0a0a12',
        color: 'var(--text)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      } as React.CSSProperties}
    >
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '24px',
          padding: '40px',
          maxWidth: '420px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        }}
      >
        {/* Mode Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', justifyContent: 'center' }}>
          {(['focus', 'shortBreak', 'longBreak'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => {
                switchMode(m);
                setSession(m === 'focus' ? 1 : session);
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '12px',
                border: 'none',
                background: mode === m ? MODES[m].color : 'rgba(255,255,255,0.05)',
                color: mode === m ? '#fff' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {MODES[m].label}
            </button>
          ))}
        </div>

        {/* Circular Timer */}
        <div style={{ position: 'relative', width: '280px', height: '280px', margin: '0 auto 32px' }}>
          <svg width="280" height="280" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="140"
              cy="140"
              r={RADIUS}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="8"
            />
            <circle
              cx="140"
              cy="140"
              r={RADIUS}
              fill="none"
              stroke={modeColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '56px', fontWeight: 700, letterSpacing: '2px', fontVariantNumeric: 'tabular-nums' }}>
              {formatTime(timeLeft)}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
              Session {session}/4
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '32px' }}>
          {!isRunning ? (
            <button
              onClick={handleStart}
              style={{
                padding: '12px 36px',
                borderRadius: '14px',
                border: 'none',
                background: modeColor,
                color: '#fff',
                fontWeight: 600,
                fontSize: '15px',
                cursor: 'pointer',
                transition: 'opacity 0.2s',
              }}
            >
              Start
            </button>
          ) : (
            <button
              onClick={handlePause}
              style={{
                padding: '12px 36px',
                borderRadius: '14px',
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--text)',
                fontWeight: 600,
                fontSize: '15px',
                cursor: 'pointer',
              }}
            >
              Pause
            </button>
          )}
          <button
            onClick={handleReset}
            style={{
              padding: '12px 24px',
              borderRadius: '14px',
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--text-muted)',
              fontWeight: 500,
              fontSize: '15px',
              cursor: 'pointer',
            }}
          >
            Reset
          </button>
        </div>

        {/* Today's Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '12px',
            padding: '20px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '16px',
            border: '1px solid var(--border)',
          }}
        >
          <div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--accent-light)' }}>
              {stats.sessions}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Sessions
            </div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--success)' }}>
              {stats.totalMinutes}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Minutes
            </div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--warning)' }}>
              {streak}🔥
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Streak
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
