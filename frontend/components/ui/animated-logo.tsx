import { Activity } from 'lucide-react'
import Link from 'next/link'

interface AnimatedLogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  href?: string
  className?: string
}

export function AnimatedLogo({ 
  size = 'md', 
  showText = true, 
  href = '/',
  className = '' 
}: AnimatedLogoProps) {
  const sizes = {
    sm: { icon: 'w-4 h-4', padding: 'p-1.5', text: 'text-lg', container: 'gap-2' },
    md: { icon: 'w-6 h-6', padding: 'p-2.5', text: 'text-2xl', container: 'gap-3' },
    lg: { icon: 'w-8 h-8', padding: 'p-3', text: 'text-3xl', container: 'gap-4' },
  }

  const s = sizes[size]

  const LogoContent = () => (
    <div className={`flex items-center ${s.container} group ${className}`}>
      {/* Animated 3D Logo */}
      <div className="relative">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
        
        {/* Main logo container */}
        <div className={`relative bg-gradient-to-br from-teal-500 to-cyan-600 ${s.padding} rounded-xl shadow-lg transform group-hover:scale-110 transition-all duration-300 group-hover:rotate-3`}>
          {/* Animated heartbeat line */}
          <div className="relative">
            <Activity className={`${s.icon} text-white animate-heartbeat`} />
            
            {/* Pulse rings */}
            <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping" />
            <div className="absolute inset-0 rounded-full border border-white/20 animate-pulse" />
          </div>
        </div>
        
        {/* 3D shadow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600 to-cyan-700 rounded-xl transform translate-x-0.5 translate-y-0.5 -z-10" />
      </div>
      
      {showText && (
        <span className={`${s.text} font-bold bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent group-hover:scale-105 transition-transform`}>
          Arogya-AI
        </span>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href}>
        <LogoContent />
      </Link>
    )
  }

  return <LogoContent />
}
