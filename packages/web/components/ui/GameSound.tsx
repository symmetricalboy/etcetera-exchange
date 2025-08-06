'use client'

import { useEffect, useRef } from 'react'

// Game sound effects component
export function GameSound() {
  const audioContextRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    // Initialize audio context on user interaction
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
    }

    // Add event listeners for user interaction
    document.addEventListener('click', initAudio, { once: true })
    document.addEventListener('keydown', initAudio, { once: true })

    return () => {
      document.removeEventListener('click', initAudio)
      document.removeEventListener('keydown', initAudio)
    }
  }, [])

  // Create sound effects
  const playSound = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
    if (!audioContextRef.current) return

    const oscillator = audioContextRef.current.createOscillator()
    const gainNode = audioContextRef.current.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContextRef.current.destination)

    oscillator.frequency.value = frequency
    oscillator.type = type

    gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration)

    oscillator.start(audioContextRef.current.currentTime)
    oscillator.stop(audioContextRef.current.currentTime + duration)
  }

  // Export sound functions globally for use in other components
  useEffect(() => {
    (window as any).gameSound = {
      hover: () => playSound(800, 0.1),
      click: () => playSound(600, 0.15),
      success: () => {
        playSound(523, 0.1) // C
        setTimeout(() => playSound(659, 0.1), 100) // E
        setTimeout(() => playSound(784, 0.2), 200) // G
      },
      error: () => {
        playSound(200, 0.3, 'sawtooth')
      },
      levelUp: () => {
        playSound(523, 0.1)
        setTimeout(() => playSound(659, 0.1), 100)
        setTimeout(() => playSound(784, 0.1), 200)
        setTimeout(() => playSound(1047, 0.3), 300)
      },
      coin: () => {
        playSound(1000, 0.1)
        setTimeout(() => playSound(1200, 0.1), 50)
      },
      notification: () => {
        playSound(440, 0.2, 'triangle')
      }
    }
  }, [])

  return null // This component doesn't render anything
}

// Hook for using game sounds
export function useGameSound() {
  const playHover = () => (window as any).gameSound?.hover()
  const playClick = () => (window as any).gameSound?.click()
  const playSuccess = () => (window as any).gameSound?.success()
  const playError = () => (window as any).gameSound?.error()
  const playLevelUp = () => (window as any).gameSound?.levelUp()
  const playCoin = () => (window as any).gameSound?.coin()
  const playNotification = () => (window as any).gameSound?.notification()

  return {
    playHover,
    playClick,
    playSuccess,
    playError,
    playLevelUp,
    playCoin,
    playNotification
  }
}
