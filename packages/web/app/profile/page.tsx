'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

// Mock user stats - replace with real API
const mockUserStats = {
  totalObjects: 24,
  dailyStreak: 7,
  giftsGiven: 5,
  giftsReceived: 3,
  rareObjectsFound: 2,
  favoriteRarity: 'rare',
  memberSince: '2024-01-01',
  achievements: [
    { id: 1, name: 'First Steps', description: 'Claimed your first object', emoji: '👶', unlocked: true },
    { id: 2, name: 'Week Warrior', description: 'Maintained a 7-day streak', emoji: '⚡', unlocked: true },
    { id: 3, name: 'Generous Heart', description: 'Sent 5+ gifts to friends', emoji: '💝', unlocked: true },
    { id: 4, name: 'Rare Hunter', description: 'Found a rare object', emoji: '🔍', unlocked: true },
    { id: 5, name: 'Legend Seeker', description: 'Found a legendary object', emoji: '⭐', unlocked: false },
    { id: 6, name: 'Community Builder', description: 'Sent 20+ gifts', emoji: '🏗️', unlocked: false },
  ]
}

const statCards = [
  { key: 'totalObjects', label: 'Objects Collected', icon: '📦', color: 'from-blue-500 to-blue-600' },
  { key: 'dailyStreak', label: 'Daily Streak', icon: '🔥', color: 'from-orange-500 to-red-500' },
  { key: 'giftsGiven', label: 'Gifts Given', icon: '🎁', color: 'from-green-500 to-emerald-500' },
  { key: 'giftsReceived', label: 'Gifts Received', icon: '💝', color: 'from-pink-500 to-rose-500' },
]

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const [userStats, setUserStats] = useState(mockUserStats)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'settings'>('overview')

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/login?callbackUrl=/profile'
    }
  }, [status])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  const unlockedAchievements = userStats.achievements.filter(a => a.unlocked)
  const lockedAchievements = userStats.achievements.filter(a => !a.unlocked)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-900 dark:to-pink-900">
      {/* Profile Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 py-16">
        {/* Floating decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          {['⚙️', '🎮', '👑', '🏆', '⭐', '💫'].map((emoji, index) => (
            <motion.div
              key={index}
              className="absolute text-4xl opacity-20"
              style={{
                left: `${10 + (index * 16)}%`,
                top: `${15 + (index % 2) * 30}%`,
              }}
              animate={{
                y: [0, -15, 0],
                rotate: [0, 5, -5, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 3 + (index % 2),
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.5
              }}
            >
              {emoji}
            </motion.div>
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Avatar */}
            <div className="relative mb-6">
              <motion.div
                className="w-24 h-24 mx-auto rounded-full border-4 border-white/20 shadow-lg overflow-hidden"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                {session.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || 'Profile'}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-2xl font-bold">
                    {session.user?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
              </motion.div>
              
              {/* Level indicator */}
              <motion.div
                className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                LVL {Math.floor(userStats.totalObjects / 5) + 1}
              </motion.div>
            </div>

            <h1 className="text-4xl font-bold text-white mb-2">
              {session.user?.name || 'Anonymous Collector'}
            </h1>
            <p className="text-xl text-white/90 mb-6">
              🎯 {session.user?.email || 'Mysterious Adventurer'}
            </p>

            {/* Quick stats */}
            <div className="flex justify-center space-x-8 text-white/90">
              <div className="text-center">
                <div className="text-2xl font-bold">{userStats.totalObjects}</div>
                <div className="text-sm">Objects</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{unlockedAchievements.length}</div>
                <div className="text-sm">Achievements</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{userStats.dailyStreak}</div>
                <div className="text-sm">Day Streak</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-2 mb-8 border border-white/20"
        >
          <div className="flex space-x-2">
            {[
              { id: 'overview', label: '📊 Overview', icon: '📊' },
              { id: 'achievements', label: '🏆 Achievements', icon: '🏆' },
              { id: 'settings', label: '⚙️ Settings', icon: '⚙️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === tab.id 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-105' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((stat, index) => (
                <motion.div
                  key={stat.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`bg-gradient-to-br ${stat.color} rounded-2xl p-6 text-white shadow-lg`}
                  whileHover={{ scale: 1.05, rotateY: 5 }}
                >
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-3xl font-bold mb-1">
                    {userStats[stat.key as keyof typeof userStats]}
                  </div>
                  <div className="text-sm text-white/90">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Progress Section */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">🎯 Progress Tracking</h3>
              
              <div className="space-y-4">
                {/* Next Achievement Progress */}
                <div>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>Next Achievement: Legend Seeker</span>
                    <span>0/1 Legendary Objects</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-3 rounded-full" style={{ width: '0%' }} />
                  </div>
                </div>

                {/* Level Progress */}
                <div>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>Level Progress</span>
                    <span>{userStats.totalObjects % 5}/5 Objects to Next Level</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-purple-400 to-pink-400 h-3 rounded-full transition-all duration-300" 
                      style={{ width: `${(userStats.totalObjects % 5) * 20}%` }} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Unlocked Achievements */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                🏆 Unlocked Achievements ({unlockedAchievements.length})
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {unlockedAchievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-700"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{achievement.emoji}</div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {achievement.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {achievement.description}
                        </p>
                      </div>
                      <div className="text-green-500 ml-auto">✅</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Locked Achievements */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                🔒 Locked Achievements ({lockedAchievements.length})
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lockedAchievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-gray-100 dark:bg-slate-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600 opacity-60"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl grayscale">{achievement.emoji}</div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {achievement.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {achievement.description}
                        </p>
                      </div>
                      <div className="text-gray-400 ml-auto">🔒</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 border border-white/20"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">⚙️ Account Settings</h3>
            
            <div className="space-y-6">
              {/* Account Info */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Account Information</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Display Name</label>
                    <p className="text-gray-900 dark:text-white">{session.user?.name || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Email</label>
                    <p className="text-gray-900 dark:text-white">{session.user?.email || 'Not available'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Member Since</label>
                    <p className="text-gray-900 dark:text-white">
                      {new Date(userStats.memberSince).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">Actions</h4>
                
                <motion.button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="w-full md:w-auto bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  🚪 Sign Out
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
