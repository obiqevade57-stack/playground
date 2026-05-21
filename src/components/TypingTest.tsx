'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

const PARAGRAPHS = [
  "The ancient library of Alexandria once held over 400000 scrolls making it the largest collection of knowledge in the ancient world. Scholars traveled from distant lands to study its vast archives and contribute their own discoveries to its shelves.",
  "Deep in the Pacific Ocean hydrothermal vents release superheated water rich in minerals. These underwater geysers support unique ecosystems where life thrives without sunlight relying instead on chemical energy from the Earth's core.",
  "The art of origami began in Japan over a thousand years ago. What started as ceremonial paper folding evolved into a sophisticated art form that now inspires mathematical models and engineering solutions for folding solar panels and medical stents.",
  "Quantum computing harnesses the strange properties of subatomic particles to process information. Unlike classical bits that are either zero or one quantum bits can exist in multiple states simultaneously enabling exponentially faster calculations.",
  "The migration of the Arctic tern spans roughly 44000 miles each year as it travels from pole to pole. This remarkable journey makes it the longest migration of any animal on Earth following an elliptical path across both hemispheres.",
  "In the heart of the Amazon rainforest trees communicate through an underground network of fungal threads known as mycorrhizal networks. Scientists call this the wood wide web because it allows trees to share nutrients and warn each other of threats."
]

export default function TypingTest() {
  const [text, setText] = useState('')
  const [input, setInput] = useState('')
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [bestWpm, setBestWpm] = useState<number | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const pickRandom = useCallback(() => {
    const idx = Math.floor(Math.random() * PARAGRAPHS.length)
    return PARAGRAPHS[idx]
  }, [])

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setText(pickRandom())
    setInput('')
    setStarted(false)
    setFinished(false)
    setStartTime(null)
    setElapsed(0)
    setTimeout(() => textareaRef.current?.focus(), 50)
  }, [pickRandom])

  useEffect(() => {
    setText(pickRandom())
    try {
      const stored = localStorage.getItem('typing-best-wpm')
      if (stored) setBestWpm(Number(stored))
    } catch {}
  }, [pickRandom])

  useEffect(() => {
    if (started && !finished) {
      intervalRef.current = setInterval(() => {
        setElapsed(Date.now() - (startTime ?? Date.now()))
      }, 100)
      return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
    }
  }, [started, finished, startTime])

  const correctChars = input.split('').filter((c, i) => c === text[i]).length
  const wrongChars = input.length - correctChars
  const minutes = elapsed / 60000
  const wpm = minutes > 0 ? Math.round((correctChars / 5) / minutes) : 0
  const accuracy = input.length > 0 ? Math.round((correctChars / input.length) * 100) : 0

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (finished) return
    const val = e.target.value
    if (!started && val.length > 0) {
      setStarted(true)
      setStartTime(Date.now())
    }
    if (val.length <= text.length) {
      setInput(val)
      if (val.length === text.length) {
        setFinished(true)
        if (intervalRef.current) clearInterval(intervalRef.current)
        setElapsed(Date.now() - (startTime ?? Date.now()))
        const finalWpm = minutes > 0 ? Math.round((correctChars / 5) / minutes) : 0
        try {
          const stored = localStorage.getItem('typing-best-wpm')
          if (!stored || finalWpm > Number(stored)) {
            localStorage.setItem('typing-best-wpm', String(finalWpm))
            setBestWpm(finalWpm)
          }
        } catch {}
      }
    }
  }

  const renderText = () => {
    return text.split('').map((char, i) => {
      let color = 'rgba(255,255,255,0.35)'
      if (i < input.length) {
        color = input[i] === char ? '#10b981' : '#ef4444'
      }
      return (
        <span key={i} style={{ color, transition: 'color 0.1s' }}>{char}</span>
      )
    })
  }

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000)
    const m = Math.floor(totalSec / 60)
    const s = totalSec % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a10',
      color: '#e2e8f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{ maxWidth: 720, width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            <span style={{ color: '#7c3aed' }}>⌨️</span> Typing Speed Test
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem' }}>
            Test your typing speed and accuracy
          </p>
        </div>

        {/* Stats bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem',
          marginBottom: '1.5rem',
          fontSize: '0.95rem',
        }}>
          <div style={{ color: '#a78bfa' }}>⏱ {formatTime(elapsed)}</div>
          <div style={{ color: '#10b981' }}>⚡ {wpm} WPM</div>
          <div style={{ color: '#e2e8f0' }}>🎯 {accuracy}%</div>
          {bestWpm !== null && (
            <div style={{ color: 'rgba(255,255,255,0.5)' }}>🏆 Best: {bestWpm}</div>
          )}
        </div>

        {/* Text display */}
        <div style={{
          background: '#12121a',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12,
          padding: '1.5rem',
          marginBottom: '1rem',
          fontSize: '1.15rem',
          lineHeight: 1.8,
          letterSpacing: '0.02em',
          userSelect: 'none',
        }}>
          {renderText()}
        </div>

        {/* Input */}
        {!finished && (
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            placeholder="Start typing here..."
            autoFocus
            style={{
              width: '100%',
              background: '#12121a',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
              padding: '1rem 1.5rem',
              color: '#e2e8f0',
              fontSize: '1.05rem',
              lineHeight: 1.6,
              resize: 'none',
              outline: 'none',
              minHeight: 80,
              fontFamily: 'inherit',
            }}
          />
        )}

        {/* Results card */}
        {finished && (
          <div style={{
            background: '#12121a',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16,
            padding: '2rem',
            textAlign: 'center',
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', color: '#7c3aed' }}>
              🎉 Test Complete!
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}>
              {[
                { label: 'WPM', value: wpm, color: '#10b981' },
                { label: 'Accuracy', value: `${accuracy}%`, color: '#a78bfa' },
                { label: 'Time', value: formatTime(elapsed), color: '#e2e8f0' },
                { label: 'Correct / Wrong', value: `${correctChars} / ${wrongChars}`, color: '#e2e8f0' },
              ].map((stat) => (
                <div key={stat.label} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 10,
                  padding: '1rem',
                }}>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: 4 }}>{stat.label}</div>
                  <div style={{ color: stat.color, fontSize: '1.4rem', fontWeight: 700 }}>{stat.value}</div>
                </div>
              ))}
            </div>
            {bestWpm !== null && (
              <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                🏆 Best WPM: {bestWpm}
              </p>
            )}
            <button
              onClick={reset}
              style={{
                background: '#7c3aed',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '0.75rem 2rem',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = '#6d28d9')}
              onMouseOut={(e) => (e.currentTarget.style.background = '#7c3aed')}
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
