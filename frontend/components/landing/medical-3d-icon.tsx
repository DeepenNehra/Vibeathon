'use client'

import { useEffect, useState } from 'react'
import { Heart, Brain, Dna, Activity } from 'lucide-react'

export function Medical3DIcon() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="relative w-full h-64 flex items-center justify-center">
      {/* 3D DNA Helix */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-48 h-48 animate-rotate-3d">
          {/* DNA Strand 1 */}
          <div className="absolute inset-0 animate-dna-float">
            {[...Array(8)].map((_, i) => (
              <div
                key={`strand1-${i}`}
                className="absolute w-4 h-4 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full shadow-lg"
                style={{
                  left: `${50 + 40 * Math.cos((i * Math.PI) / 4)}%`,
                  top: `${50 + 40 * Math.sin((i * Math.PI) / 4)}%`,
                  transform: 'translate(-50%, -50%)',
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
          
          {/* DNA Strand 2 */}
          <div className="absolute inset-0 animate-dna-float-reverse">
            {[...Array(8)].map((_, i) => (
              <div
                key={`strand2-${i}`}
                className="absolute w-4 h-4 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full shadow-lg"
                style={{
                  left: `${50 - 40 * Math.cos((i * Math.PI) / 4)}%`,
                  top: `${50 + 40 * Math.sin((i * Math.PI) / 4)}%`,
                  transform: 'translate(-50%, -50%)',
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>

          {/* Connecting Lines */}
          <svg className="absolute inset-0 w-full h-full opacity-30">
            {[...Array(8)].map((_, i) => {
              const angle = (i * Math.PI) / 4
              const x1 = 50 + 40 * Math.cos(angle)
              const y1 = 50 + 40 * Math.sin(angle)
              const x2 = 50 - 40 * Math.cos(angle)
              const y2 = 50 + 40 * Math.sin(angle)
              return (
                <line
                  key={`line-${i}`}
                  x1={`${x1}%`}
                  y1={`${y1}%`}
                  x2={`${x2}%`}
                  y2={`${y2}%`}
                  stroke="url(#gradient)"
                  strokeWidth="2"
                  className="animate-pulse"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              )
            })}
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#14b8a6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Floating Medical Icons */}
      <div className="absolute inset-0">
        <div className="absolute top-4 left-4 animate-float-slow">
          <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-3 rounded-xl shadow-lg transform hover:scale-110 transition-transform">
            <Heart className="w-6 h-6 text-white animate-heartbeat" />
          </div>
        </div>
        
        <div className="absolute top-4 right-4 animate-float-slow" style={{ animationDelay: '1s' }}>
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-3 rounded-xl shadow-lg transform hover:scale-110 transition-transform">
            <Brain className="w-6 h-6 text-white" />
          </div>
        </div>
        
        <div className="absolute bottom-4 left-4 animate-float-slow" style={{ animationDelay: '2s' }}>
          <div className="bg-gradient-to-br from-blue-500 to-teal-600 p-3 rounded-xl shadow-lg transform hover:scale-110 transition-transform">
            <Dna className="w-6 h-6 text-white" />
          </div>
        </div>
        
        <div className="absolute bottom-4 right-4 animate-float-slow" style={{ animationDelay: '1.5s' }}>
          <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-3 rounded-xl shadow-lg transform hover:scale-110 transition-transform">
            <Activity className="w-6 h-6 text-white animate-pulse" />
          </div>
        </div>
      </div>

      {/* Center Glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-32 h-32 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse-slow" />
      </div>
    </div>
  )
}
