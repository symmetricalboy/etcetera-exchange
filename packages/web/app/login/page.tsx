'use client'

import { useState, useEffect } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  const errorParam = searchParams.get('error')

  useEffect(() => {
    if (errorParam) {
      setError('Authentication failed. Please try again.')
    }
  }, [errorParam])

  useEffect(() => {
    // Check if user is already signed in
    getSession().then((session) => {
      if (session) {
        router.push(callbackUrl)
      }
    })
  }, [router, callbackUrl])

  const handleSignIn = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const result = await signIn('bluesky', {
        callbackUrl,
        redirect: false
      })
      
      if (result?.error) {
        setError('Authentication failed. Please try again.')
      } else if (result?.url) {
        router.push(result.url)
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-etcetera-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-br from-purple-400/10 to-etcetera-400/10 rounded-full blur-3xl animate-pulse" />
        
        {/* Floating game elements */}
        <motion.div 
          className="absolute top-20 left-20 text-4xl"
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          🔮
        </motion.div>
        
        <motion.div 
          className="absolute top-40 right-20 text-3xl"
          animate={{ 
            y: [0, -15, 0],
            rotate: [0, -3, 0]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        >
          ⭐
        </motion.div>
        
        <motion.div 
          className="absolute bottom-40 left-40 text-3xl"
          animate={{ 
            y: [0, -12, 0],
            rotate: [0, 4, 0]
          }}
          transition={{ 
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        >
          🎁
        </motion.div>
      </div>

      <div className="relative max-w-md w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          {/* Logo */}
          <Link href="/" className="inline-flex items-center space-x-2 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-etcetera-500 to-etcetera-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">∞</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-etcetera-400 to-purple-400 bg-clip-text text-transparent">
              etcetera.exchange
            </span>
          </Link>

          <h2 className="text-3xl font-bold text-white mb-2">
            🚀 Level Up Your Collection!
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Sign in to access your magical object vault and start your adventure!
          </p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl"
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-center"
            >
              ⚠️ {error}
            </motion.div>
          )}

          <div className="space-y-6">
            {/* Bluesky Sign In Button */}
            <motion.button
              onClick={handleSignIn}
              disabled={isLoading}
              className="w-full btn-magical text-white px-6 py-4 rounded-xl font-semibold text-lg inline-flex items-center justify-center transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <>
                  <div className="mr-3 animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                  Connecting...
                </>
              ) : (
                <>
                  <span className="mr-3 text-xl">🦋</span>
                  Connect with Bluesky
                </>
              )}
            </motion.button>

            {/* Demo Mode */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-transparent text-gray-300">or</span>
              </div>
            </div>

            <motion.button
              onClick={() => router.push('/')}
              className="w-full bg-white/10 text-white px-6 py-4 rounded-xl font-semibold border border-white/20 hover:bg-white/20 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              👀 Browse as Guest
            </motion.button>
          </div>

          {/* Game-style footer */}
          <div className="mt-8 pt-6 border-t border-white/20 text-center">
            <p className="text-sm text-gray-400">
              🎮 Ready Player One? Join the adventure!
            </p>
          </div>
        </motion.div>

        {/* Help Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center text-gray-400 text-sm"
        >
          <p>
            Don't have a Bluesky account?{' '}
            <a 
              href="https://bsky.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-etcetera-400 hover:text-etcetera-300 underline"
            >
              Create one here! 🌟
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
