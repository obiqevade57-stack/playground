'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

/* ─── Pure Color Math ──────────────────────────────────────────── */

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) =>
    Math.max(0, Math.min(255, Math.round(c)))
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function rgbToHsl(
  r: number,
  g: number,
  b: number
): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return { h: h * 360, s, l };
}

function hslToRgb(
  h: number,
  s: number,
  l: number
): { r: number; g: number; b: number } {
  h = ((h % 360) + 360) % 360;
  if (s === 0) {
    const v = Math.round(l * 255);
    return { r: v, g: v, b: v };
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return {
    r: Math.round(hue2rgb(p, q, h / 360 + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h / 360) * 255),
    b: Math.round(hue2rgb(p, q, h / 360 - 1 / 3) * 255),
  };
}

function hslToHex(h: number, s: number, l: number): string {
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

function randomHex(): string {
  return rgbToHex(
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256)
  );
}

type HarmonyMode =
  | 'analogous'
  | 'complementary'
  | 'triadic'
  | 'split-complementary'
  | 'monochromatic';

function generatePalette(baseHex: string, mode: HarmonyMode): string[] {
  const { r, g, b } = hexToRgb(baseHex);
  const { h, s, l } = rgbToHsl(r, g, b);

  switch (mode) {
    case 'analogous':
      return [
        hslToHex(h - 30, s, l),
        hslToHex(h - 15, s, l),
        baseHex,
        hslToHex(h + 15, s, l),
        hslToHex(h + 30, s, l),
      ];
    case 'complementary':
      return [
        hslToHex(h, s, Math.min(1, l + 0.15)),
        hslToHex(h, s, l),
        hslToHex(h, s, Math.max(0, l - 0.15)),
        hslToHex(h + 180, s, l),
        hslToHex(h + 180, s, Math.max(0, l - 0.15)),
      ];
    case 'triadic':
      return [
        baseHex,
        hslToHex(h, s, Math.max(0, l - 0.1)),
        hslToHex(h + 120, s, l),
        hslToHex(h + 120, s, Math.max(0, l - 0.1)),
        hslToHex(h + 240, s, l),
      ];
    case 'split-complementary':
      return [
        baseHex,
        hslToHex(h, s, Math.max(0, l - 0.12)),
        hslToHex(h + 150, s, l),
        hslToHex(h + 210, s, l),
        hslToHex(h + 210, s, Math.max(0, l - 0.12)),
      ];
    case 'monochromatic':
      return [
        hslToHex(h, s, Math.min(1, l + 0.2)),
        hslToHex(h, s, Math.min(1, l + 0.1)),
        baseHex,
        hslToHex(h, s, Math.max(0, l - 0.1)),
        hslToHex(h, s, Math.max(0, l - 0.2)),
      ];
    default:
      return [baseHex, baseHex, baseHex, baseHex, baseHex];
  }
}

/* ─── Text contrast helper ─────────────────────────────────────── */

function textColor(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.58 ? '#12121a' : '#e2e8f0';
}

/* ─── History type ─────────────────────────────────────────────── */

interface HistoryEntry {
  colors: string[];
  mode: HarmonyMode;
}

const HISTORY_KEY = 'color-history';
const MAX_HISTORY = 5;

/* ─── Component ────────────────────────────────────────────────── */

const MODES: { key: HarmonyMode; label: string }[] = [
  { key: 'analogous', label: 'Analogous' },
  { key: 'complementary', label: 'Complementary' },
  { key: 'triadic', label: 'Triadic' },
  { key: 'split-complementary', label: 'Split-Comp' },
  { key: 'monochromatic', label: 'Monochromatic' },
];

export default function ColorPalette() {
  const [baseColor, setBaseColor] = useState<string>('#7c3aed');
  const [mode, setMode] = useState<HarmonyMode>('analogous');
  const [locked, setLocked] = useState<(boolean)[]>([false, false, false, false, false]);
  const [palette, setPalette] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialized = useRef(false);

  /* Load history from localStorage on mount */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    if (!initialized.current) {
      initialized.current = true;
      const rand = randomHex();
      setBaseColor(rand);
      setPalette(generatePalette(rand, 'analogous'));
    }
  }, []);

  /* Persist history */
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {
      /* ignore */
    }
  }, [history]);

  /* Regenerate palette when baseColor or mode changes */
  useEffect(() => {
    if (!initialized.current) return;
    const newPalette = generatePalette(baseColor, mode);
    setPalette((prev) =>
      newPalette.map((c, i) => (prev[i] && locked[i] ? prev[i] : c))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseColor, mode]);

  const pushHistory = useCallback(
    (colors: string[]) => {
      setHistory((prev) => {
        const next = [{ colors, mode }, ...prev.filter((e) => JSON.stringify(e.colors) !== JSON.stringify(colors))];
        return next.slice(0, MAX_HISTORY);
      });
    },
    [mode]
  );

  const handleGenerate = useCallback(() => {
    const rand = randomHex();
    setBaseColor(rand);
    const newPalette = generatePalette(rand, mode);
    setPalette((prev) =>
      newPalette.map((c, i) => (prev[i] && locked[i] ? prev[i] : c))
    );
    // We need to push history after state updates, so use a microtask
    setTimeout(() => {
      setHistory((prev) => {
        const finalPalette = newPalette.map((c, i) => {
          // We can't read the latest state here easily, so push the raw new palette
          return c;
        });
        const next = [
          { colors: finalPalette, mode },
          ...prev.filter((e) => JSON.stringify(e.colors) !== JSON.stringify(finalPalette)),
        ];
        return next.slice(0, MAX_HISTORY);
      });
    }, 0);
  }, [mode]);

  const handleModeChange = useCallback(
    (m: HarmonyMode) => {
      setMode(m);
      const newPalette = generatePalette(baseColor, m);
      setPalette((prev) =>
        newPalette.map((c, i) => (prev[i] && locked[i] ? prev[i] : c))
      );
    },
    [baseColor, locked]
  );

  const handleCopy = useCallback((hex: string, index: number) => {
    navigator.clipboard.writeText(hex).catch(() => {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = hex;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    });
    setCopiedIndex(index);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setCopiedIndex(null), 1500);
  }, []);

  const toggleLock = useCallback((index: number) => {
    setLocked((prev) => prev.map((v, i) => (i === index ? !v : v)));
  }, []);

  const handleHistoryClick = useCallback((entry: HistoryEntry) => {
    setMode(entry.mode);
    setPalette(entry.colors);
    setBaseColor(entry.colors[2] || entry.colors[0]);
    setLocked([false, false, false, false, false]);
  }, []);

  /* ─── Render ─────────────────────────────────────────────────── */

  return (
    <div
      style={{
        '--accent': '#7c3aed',
        '--accent-light': '#a78bfa',
        '--card': '#12121a',
        '--border': 'rgba(255,255,255,0.08)',
        '--text': '#e2e8f0',
        '--text-muted': 'rgba(255,255,255,0.5)',
        minHeight: '100vh',
        background: 'var(--card)',
        color: 'var(--text)',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: '2rem 1rem',
      } as React.CSSProperties}
    >
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        {/* Header */}
        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            marginBottom: '0.25rem',
          }}
        >
          🎨 Color Palette Generator
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Click a card to copy its hex code. Lock colors to keep them across regenerations.
        </p>

        {/* Mode Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap',
            marginBottom: '1rem',
          }}
        >
          {MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => handleModeChange(m.key)}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: 8,
                border: `1px solid ${mode === m.key ? 'var(--accent)' : 'var(--border)'}`,
                background: mode === m.key ? 'var(--accent)' : 'transparent',
                color: mode === m.key ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 600,
                transition: 'all 0.2s',
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          style={{
            marginBottom: '1.5rem',
            padding: '0.6rem 1.4rem',
            borderRadius: 8,
            border: 'none',
            background: 'var(--accent)',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = '#6d28d9')
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = 'var(--accent)')
          }
        >
          ✨ Generate Random
        </button>

        {/* Palette Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          {palette.map((hex, i) => {
            const rgb = hexToRgb(hex);
            const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
            const fg = textColor(hex);

            return (
              <div
                key={i}
                style={{
                  position: 'relative',
                  borderRadius: 12,
                  overflow: 'hidden',
                  border: '1px solid var(--border)',
                  background: hex,
                  cursor: 'pointer',
                  transition: 'transform 0.15s',
                }}
                onClick={() => handleCopy(hex, i)}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = 'translateY(-3px)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = 'translateY(0)')
                }
              >
                {/* Color preview area */}
                <div
                  style={{
                    height: 120,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: fg,
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    letterSpacing: '0.5px',
                    position: 'relative',
                  }}
                >
                  {hex.toUpperCase()}

                  {/* Copied toast */}
                  {copiedIndex === i && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: 'rgba(0,0,0,0.75)',
                        color: '#fff',
                        padding: '0.3rem 0.7rem',
                        borderRadius: 6,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        pointerEvents: 'none',
                        animation: 'fadeIn 0.15s ease',
                      }}
                    >
                      Copied!
                    </div>
                  )}
                </div>

                {/* Info area */}
                <div
                  style={{
                    background: 'rgba(0,0,0,0.55)',
                    backdropFilter: 'blur(8px)',
                    padding: '0.7rem 0.75rem',
                    fontSize: '0.7rem',
                    color: '#ccc',
                    lineHeight: 1.6,
                  }}
                >
                  <div>
                    <strong style={{ color: '#fff' }}>RGB</strong>{' '}
                    {rgb.r}, {rgb.g}, {rgb.b}
                  </div>
                  <div>
                    <strong style={{ color: '#fff' }}>HSL</strong>{' '}
                    {Math.round(hsl.h)}°, {Math.round(hsl.s * 100)}%,{' '}
                    {Math.round(hsl.l * 100)}%
                  </div>
                </div>

                {/* Lock button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLock(i);
                  }}
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    border: 'none',
                    background: locked[i]
                      ? 'var(--accent)'
                      : 'rgba(255,255,255,0.15)',
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    transition: 'background 0.2s',
                  }}
                  title={locked[i] ? 'Unlock color' : 'Lock color'}
                >
                  {locked[i] ? '🔒' : '🔓'}
                </button>
              </div>
            );
          })}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div>
            <h2
              style={{
                fontSize: '1rem',
                fontWeight: 600,
                marginBottom: '0.75rem',
                color: 'var(--text-muted)',
              }}
            >
              🕘 Recent Palettes
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {history.map((entry, hi) => (
                <div
                  key={hi}
                  onClick={() => handleHistoryClick(entry)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    cursor: 'pointer',
                    padding: '0.4rem 0.6rem',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    transition: 'border-color 0.2s',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = 'var(--accent-light)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = 'var(--border)')
                  }
                >
                  {entry.colors.map((c, ci) => (
                    <div
                      key={ci}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        background: c,
                        flexShrink: 0,
                      }}
                    />
                  ))}
                  <span
                    style={{
                      fontSize: '0.7rem',
                      color: 'var(--text-muted)',
                      marginLeft: 'auto',
                    }}
                  >
                    {MODES.find((m) => m.key === entry.mode)?.label || entry.mode}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
