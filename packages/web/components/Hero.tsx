'use client'

import { motion } from 'framer-motion'
import { useSession, signIn } from 'next-auth/react'
import Link from 'next/link'

export function Hero() {
  const { data: session, status } = useSession()

  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-etcetera-400/20 to-pink-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-etcetera-400/20 rounded-full blur-3xl" />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6">
              <span className="block">Welcome to the</span>
              <span className="block bg-gradient-to-r from-etcetera-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                etcetera.exchange
              </span>
            </h1>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto"
          >
            A whimsical universe where everyday objects become extraordinary treasures. 
            Collect, gift, and discover magical items in the Bluesky community.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            {status === 'loading' ? (
              <div className="flex gap-4 justify-center">
                <div className="h-12 w-48 shimmer rounded-lg" />
                <div className="h-12 w-48 shimmer rounded-lg" />
              </div>
            ) : session ? (
              <>
                <Link
                  href="/collection"
                  className="btn-magical text-white px-8 py-3 rounded-lg font-semibold inline-flex items-center justify-center text-lg"
                >
                  <span className="mr-2">📦</span>
                  View My Collection
                </Link>
                <Link
                  href="/gifts"
                  className="bg-white dark:bg-slate-800 text-etcetera-600 dark:text-etcetera-400 px-8 py-3 rounded-lg font-semibold border-2 border-etcetera-600 dark:border-etcetera-400 hover:bg-etcetera-50 dark:hover:bg-slate-700 transition-colors inline-flex items-center justify-center text-lg"
                >
                  <span className="mr-2">🎁</span>
                  Send a Gift
                </Link>
              </>
            ) : (
              <>
                <button
                  onClick={() => signIn('bluesky')}
                  className="btn-magical text-white px-8 py-3 rounded-lg font-semibold inline-flex items-center justify-center text-lg"
                >
                  <span className="mr-2">🦋</span>
                  Sign in with Bluesky
                </button>
                <a
                  href="https://bsky.app/profile/etcetera.exchange"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white dark:bg-slate-800 text-etcetera-600 dark:text-etcetera-400 px-8 py-3 rounded-lg font-semibold border-2 border-etcetera-600 dark:border-etcetera-400 hover:bg-etcetera-50 dark:hover:bg-slate-700 transition-colors inline-flex items-center justify-center text-lg"
                >
                  <span className="mr-2">🤖</span>
                  Meet the Bot
                </a>
              </>
            )}
          </motion.div>
          
          {/* Floating objects animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="flex justify-center space-x-8 text-6xl"
          >
            <motion.span
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 5, 0]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="inline-block"
            >
              📎
            </motion.span>
            <motion.span
              animate={{ 
                y: [0, -15, 0],
                rotate: [0, -5, 0]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
              className="inline-block"
            >
              🔮
            </motion.span>
            <motion.span
              animate={{ 
                y: [0, -12, 0],
                rotate: [0, 3, 0]
              }}
              transition={{ 
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
              className="inline-block"
            >
              ⭐
            </motion.span>
            <motion.span
              animate={{ 
                y: [0, -8, 0],
                rotate: [0, -3, 0]
              }}
              transition={{ 
                duration: 2.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.5
              }}
              className="inline-block"
            >
              🎁
            </motion.span>
            <motion.span
              animate={{ 
                y: [0, -14, 0],
                rotate: [0, 4, 0]
              }}
              transition={{ 
                duration: 3.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }}
              className="inline-block"
            >
              💫
            </motion.span>
          </motion.div>
          
          {/* Status indicator */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="mt-12"
          >
            <div className="inline-flex items-center space-x-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 px-4 py-2 rounded-full text-sm font-medium">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Bot is online and ready to distribute objects!</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}