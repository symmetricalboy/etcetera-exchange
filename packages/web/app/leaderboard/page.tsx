'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

// Mock leaderboard data - replace with real API
const mockLeaderboardData = [
  {
    rank: 1,
    user: { name: 'alice.legendary', avatar: null, displayName: 'Alice the Collector' },
    totalObjects: 89,
    giftsGiven: 23,
    rareObjects: 8,
    dailyStreak: 15,
    level: 18,
    badges: ['🏆', '⭐', '💎']
  },
  {
    rank: 2,
    user: { name: 'bob.creative.dev', avatar: null, displayName: 'Bob the Builder' },
    totalObjects: 76,
    giftsGiven: 19,
    rareObjects: 6,
    dailyStreak: 12,
    level: 16,
    badges: ['🥈', '⚡', '🎁']
  },
  {
    rank: 3,
    user: { name: 'charlie.mystical', avatar: null, displayName: 'Charlie the Wise' },
    totalObjects: 68,
    giftsGiven: 31,
    rareObjects: 5,
    dailyStreak: 8,
    level: 14,
    badges: ['🥉', '💝', '🔮']
  },
  {
    rank: 4,
    user: { name: 'diana.explorer', avatar: null, displayName: 'Diana the Explorer' },
    totalObjects: 62,
    giftsGiven: 15,
    rareObjects: 7,
    dailyStreak: 20,
    level: 13,
    badges: ['🧭', '🔥', '🌟']
  },
  {
    rank: 5,
    user: { name: 'ethan.magical', avatar: null, displayName: 'Ethan the Enchanter' },
    totalObjects: 58,
    giftsGiven: 27,
    rareObjects: 4,
    dailyStreak: 6,
    level: 12,
    badges: ['✨', '🎪', '💫']
  }
]

const categories = [
  { id: 'objects', name: 'Total Objects', icon: '📦', key: 'totalObjects' },
  { id: 'gifts', name: 'Gifts Given', icon: '🎁', key: 'giftsGiven' },
  { id: 'rare', name: 'Rare Objects', icon: '💎', key: 'rareObjects' },
  { id: 'streak', name: 'Daily Streak', icon: '🔥', key: 'dailyStreak' },
]

export default function LeaderboardPage() {
  const [activeCategory, setActiveCategory] = useState('objects')
  const [leaderboardData, setLeaderboardData] = useState(mockLeaderboardData)
  const [loading, setLoading] = useState(false)
  const [timeframe, setTimeframe] = useState<'all' | 'month' | 'week'>('all')

  const sortedData = [...leaderboardData].sort((a, b) => {
    const key = categories.find(c => c.id === activeCategory)?.key || 'totalObjects'
    return (b[key as keyof typeof b] as number) - (a[key as keyof typeof a] as number)
  })

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'from-yellow-400 to-yellow-600'
      case 2: return 'from-gray-300 to-gray-500'
      case 3: return 'from-orange-400 to-orange-600'
      default: return 'from-blue-400 to-blue-600'
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '👑'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return '🏅'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-900 dark:to-pink-900">
      {/* Leaderboard Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-yellow-600 to-orange-600 py-16">
        {/* Floating trophy emojis */}
        <div className="absolute inset-0 overflow-hidden">
          {['🏆', '🥇', '👑', '⭐', '🎯', '💎', '🔥', '⚡'].map((emoji, index) => (
            <motion.div
              key={index}
              className="absolute text-4xl opacity-20"
              style={{
                left: `${5 + (index * 12)}%`,
                top: `${10 + (index % 4) * 20}%`,
              }}
              animate={{
                y: [0, -20, 0],
                rotate: [0, 15, -15, 0],
                scale: [1, 1.3, 1]
              }}
              transition={{
                duration: 4 + (index % 3),
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.3
              }}
            >
              {emoji}
            </motion.div>
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              🏆 Champion Leaderboard
            </h1>
            <p className="text-xl text-white/90 mb-6">
              See who's dominating the magical object universe!
            </p>
            
            {/* Top 3 Preview */}
            <div className="flex justify-center space-x-8 text-white/90">
              {sortedData.slice(0, 3).map((player, index) => (
                <motion.div
                  key={player.user.name}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <div className="text-3xl mb-1">{getRankIcon(index + 1)}</div>
                  <div className="text-lg font-bold">{player.user.displayName}</div>
                  <div className="text-sm">{player[categories.find(c => c.id === activeCategory)?.key as keyof typeof player]} {categories.find(c => c.id === activeCategory)?.name}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/20"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                    activeCategory === category.id
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                </button>
              ))}
            </div>

            {/* Timeframe Filter */}
            <div className="flex items-center space-x-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Timeframe:</label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as any)}
                className="bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="month">This Month</option>
                <option value="week">This Week</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Leaderboard Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden"
        >
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {sortedData.map((player, index) => (
                <motion.div
                  key={player.user.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-4">
                    {/* Rank */}
                    <motion.div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getRankColor(index + 1)} flex items-center justify-center text-white font-bold text-lg shadow-lg`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      {index + 1}
                    </motion.div>

                    {/* Avatar */}
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600">
                      {player.user.avatar ? (
                        <Image
                          src={player.user.avatar}
                          alt={player.user.displayName}
                          width={56}
                          height={56}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-lg">
                          {player.user.displayName[0]}
                        </div>
                      )}
                    </div>

                    {/* Player Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                          {player.user.displayName}
                        </h3>
                        <div className="flex space-x-1">
                          {player.badges.map((badge, idx) => (
                            <span key={idx} className="text-lg">{badge}</span>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        @{player.user.name} • Level {player.level}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="hidden md:flex space-x-8 text-center">
                      <div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {player.totalObjects}
                        </div>
                        <div className="text-xs text-gray-500">Objects</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {player.giftsGiven}
                        </div>
                        <div className="text-xs text-gray-500">Gifts</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {player.rareObjects}
                        </div>
                        <div className="text-xs text-gray-500">Rare</div>
                      </div>
                    </div>

                    {/* Main Stat */}
                    <motion.div
                      className="text-right"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="text-3xl font-bold text-yellow-600">
                        {player[categories.find(c => c.id === activeCategory)?.key as keyof typeof player]}
                      </div>
                      <div className="text-sm text-gray-500">
                        {categories.find(c => c.id === activeCategory)?.name}
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Compete Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-8 text-white text-center"
        >
          <h3 className="text-2xl font-bold mb-4">🎯 Ready to Climb the Ranks?</h3>
          <p className="text-lg mb-6 opacity-90">
            Collect more objects, send gifts to friends, and maintain your daily streak to rise up the leaderboard!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.a
              href="https://bsky.app/profile/etcetera.exchange"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-yellow-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🤖 Claim Daily Object
            </motion.a>
            <motion.a
              href="/gifts"
              className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold border border-white/30 hover:bg-white/30 transition-colors inline-flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🎁 Send Gifts
            </motion.a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
