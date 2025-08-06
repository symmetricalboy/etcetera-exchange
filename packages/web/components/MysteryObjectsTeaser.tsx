'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

const mysteryBoxes = [
  {
    id: 1,
    rarity: 'common',
    emoji: '📦',
    hint: 'Something useful for everyday life...',
    color: 'from-gray-400 to-gray-600',
    probability: '40%'
  },
  {
    id: 2,
    rarity: 'uncommon',
    emoji: '🎁',
    hint: 'A quirky twist on something familiar...',
    color: 'from-green-400 to-green-600',
    probability: '25%'
  },
  {
    id: 3,
    rarity: 'rare',
    emoji: '✨',
    hint: 'Magic begins to show its face...',
    color: 'from-blue-400 to-blue-600',
    probability: '20%'
  },
  {
    id: 4,
    rarity: 'epic',
    emoji: '🔮',
    hint: 'Powerful forces are at work...',
    color: 'from-purple-400 to-purple-600',
    probability: '10%'
  },
  {
    id: 5,
    rarity: 'legendary',
    emoji: '⭐',
    hint: 'Legends speak of such things...',
    color: 'from-yellow-400 to-yellow-600',
    probability: '4%'
  },
  {
    id: 6,
    rarity: 'mythic',
    emoji: '🌟',
    hint: 'Reality itself might be rewritten...',
    color: 'from-red-400 to-red-600',
    probability: '0.9%'
  },
  {
    id: 7,
    rarity: 'unique',
    emoji: '💫',
    hint: 'Only one exists in all of existence...',
    color: 'from-pink-400 to-pink-600',
    probability: '0.1%'
  }
]

const floatingEmojis = ['🎭', '🎪', '🎨', '🔍', '🗝️', '💎', '🎯', '🎲', '🃏', '🎊']

export function MysteryObjectsTeaser() {
  const [hoveredBox, setHoveredBox] = useState<number | null>(null)

  return (
    <div className="relative">
      {/* Floating mystery emojis */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingEmojis.map((emoji, index) => (
          <motion.div
            key={index}
            className="absolute text-2xl opacity-20"
            style={{
              left: `${10 + (index * 10)}%`,
              top: `${20 + (index % 3) * 30}%`,
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 10, 0],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{
              duration: 4 + (index % 3),
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.5
            }}
          >
            {emoji}
          </motion.div>
        ))}
      </div>

      {/* Mystery Boxes Grid */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
        {mysteryBoxes.map((box, index) => (
          <motion.div
            key={box.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            onHoverStart={() => setHoveredBox(box.id)}
            onHoverEnd={() => setHoveredBox(null)}
            className="group cursor-pointer"
          >
            <motion.div
              whileHover={{ 
                scale: 1.05,
                rotateY: 10,
              }}
              className={`relative bg-gradient-to-br ${box.color} rounded-2xl p-6 shadow-lg overflow-hidden`}
            >
              {/* Magical sparkle effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full animate-ping" />
                <div className="absolute bottom-3 left-3 w-1 h-1 bg-white/80 rounded-full animate-pulse" />
                <div className="absolute top-1/2 left-1/4 w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" />
              </div>

              {/* Question mark overlay when not hovered */}
              <motion.div
                className="absolute inset-0 bg-black/20 flex items-center justify-center"
                animate={{ 
                  opacity: hoveredBox === box.id ? 0 : 1 
                }}
                transition={{ duration: 0.3 }}
              >
                <span className="text-6xl text-white/80">?</span>
              </motion.div>

              {/* Box content */}
              <div className="relative z-10 text-center text-white">
                <motion.div
                  className="text-4xl mb-3"
                  animate={{ 
                    scale: hoveredBox === box.id ? 1.2 : 1,
                    rotate: hoveredBox === box.id ? [0, 5, -5, 0] : 0
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {box.emoji}
                </motion.div>
                
                <h3 className="font-bold text-lg mb-2 capitalize">
                  {box.rarity}
                </h3>
                
                <div className="text-sm font-semibold mb-3 bg-white/20 rounded-full px-3 py-1">
                  {box.probability}
                </div>
                
                <motion.p
                  className="text-sm text-white/90 h-12 flex items-center justify-center"
                  animate={{ 
                    opacity: hoveredBox === box.id ? 1 : 0.7 
                  }}
                >
                  {hoveredBox === box.id ? box.hint : 'Hover to peek...'}
                </motion.p>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.7 }}
        className="text-center bg-white/10 dark:bg-slate-800/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
      >
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          🎮 Ready to Roll the Dice?
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
          Every day brings a new chance to discover something extraordinary! 
          Mention our bot on Bluesky to claim your daily object and see what magical treasure awaits you.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.a
            href="https://bsky.app/profile/etcetera.exchange"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-magical text-white px-8 py-3 rounded-lg font-semibold inline-flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="mr-2">🤖</span>
            Find the Bot
          </motion.a>
          
          <motion.a
            href="/login"
            className="bg-white dark:bg-slate-800 text-etcetera-600 dark:text-etcetera-400 px-8 py-3 rounded-lg font-semibold border-2 border-etcetera-600 dark:border-etcetera-400 hover:bg-etcetera-50 dark:hover:bg-slate-700 transition-colors inline-flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="mr-2">👀</span>
            View Collection
          </motion.a>
        </div>
      </motion.div>

      {/* Stats teaser */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="mt-8 text-center"
      >
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-etcetera-500/20 to-purple-500/20 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-full text-sm font-medium border border-etcetera-200 dark:border-etcetera-700">
          <motion.div 
            className="w-2 h-2 bg-green-500 rounded-full"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span>Thousands of objects are waiting to be discovered!</span>
        </div>
      </motion.div>
    </div>
  )
}
