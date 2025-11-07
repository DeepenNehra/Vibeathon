'use client'

import { useState, useEffect } from 'react'
import { Activity } from 'lucide-react'

const translations = [
  { hindi: 'मुझे सिर में दर्द है', english: 'I have a headache' },
  { hindi: 'मुझे बुखार है', english: 'I have a fever' },
  { hindi: 'मुझे खांसी हो रही है', english: 'I have a cough' },
  { hindi: 'मेरा पेट दुख रहा है', english: 'My stomach hurts' },
]

export function TranslationDemo() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [hindiText, setHindiText] = useState('')
  const [englishText, setEnglishText] = useState('')
  const [isTypingHindi, setIsTypingHindi] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showEnglish, setShowEnglish] = useState(false)

  useEffect(() => {
    const current = translations[currentIndex]
    let hindiIndex = 0
    let englishIndex = 0

    // Reset states
    setHindiText('')
    setEnglishText('')
    setShowEnglish(false)
    setIsTypingHindi(true)
    setIsProcessing(false)

    // Type Hindi text
    const hindiInterval = setInterval(() => {
      if (hindiIndex < current.hindi.length) {
        setHindiText(current.hindi.slice(0, hindiIndex + 1))
        hindiIndex++
      } else {
        clearInterval(hindiInterval)
        setIsTypingHindi(false)
        
        // Show processing animation
        setTimeout(() => {
          setIsProcessing(true)
          
          // After processing, show English translation
          setTimeout(() => {
            setIsProcessing(false)
            setShowEnglish(true)
            
            // Type English text
            const englishInterval = setInterval(() => {
              if (englishIndex < current.english.length) {
                setEnglishText(current.english.slice(0, englishIndex + 1))
                englishIndex++
              } else {
                clearInterval(englishInterval)
                
                // Wait before moving to next translation
                setTimeout(() => {
                  setCurrentIndex((prev) => (prev + 1) % translations.length)
                }, 3000)
              }
            }, 50)
          }, 1500)
        }, 500)
      }
    }, 100)

    return () => {
      clearInterval(hindiInterval)
    }
  }, [currentIndex])

  return (
    <div className="space-y-6">
      {/* Hindi Input */}
      <div className="bg-teal-50 dark:bg-teal-950/50 rounded-xl p-4 space-y-2 min-h-[100px]">
        <p className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
          Patient (Hindi):
          {isTypingHindi && (
            <span className="inline-block w-1 h-4 bg-teal-600 animate-pulse" />
          )}
        </p>
        <p className="font-medium text-zinc-900 dark:text-zinc-100 text-lg">
          {hindiText}
          {isTypingHindi && <span className="animate-pulse">|</span>}
        </p>
      </div>

      {/* Processing Animation */}
      {isProcessing && (
        <div className="flex items-center justify-center gap-2 py-2">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-sm text-teal-600 dark:text-teal-400 animate-pulse">
            Translating...
          </span>
        </div>
      )}

      {/* English Translation */}
      {showEnglish && (
        <div className="bg-cyan-50 dark:bg-cyan-950/50 rounded-xl p-4 space-y-2 min-h-[100px] animate-slide-up">
          <div className="h-px bg-gradient-to-r from-teal-500 via-cyan-500 to-transparent mb-2" />
          <p className="text-sm text-teal-600 dark:text-teal-400 flex items-center gap-2">
            <Activity className="w-3 h-3 animate-pulse" />
            Translated:
          </p>
          <p className="font-medium text-teal-700 dark:text-teal-300 text-lg">
            {englishText}
            <span className="animate-pulse">|</span>
          </p>
        </div>
      )}

      {/* Progress Dots */}
      <div className="flex justify-center gap-2 pt-2">
        {translations.map((_, index) => (
          <div
            key={index}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'w-8 bg-gradient-to-r from-teal-500 to-cyan-600'
                : 'w-1.5 bg-teal-300/50 dark:bg-teal-700/50'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
