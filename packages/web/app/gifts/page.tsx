'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

// Mock data - replace with real API calls
const mockGiftHistory = [
  {
    id: '1',
    type: 'sent',
    object: { name: 'Lucky Pencil of Ideas', emoji: '✏️', rarity: 'rare' },
    recipient: { name: 'alice.bsky.social', avatar: null },
    date: '2024-01-15T10:30:00Z',
    message: 'Hope this helps with your writing!'
  },
  {
    id: '2', 
    type: 'received',
    object: { name: 'Comfort Mug of Endless Tea', emoji: '☕', rarity: 'uncommon' },
    sender: { name: 'bob.creative.dev', avatar: null },
    date: '2024-01-14T16:20:00Z',
    message: 'For those long coding sessions!'
  }
]

const rarityColors = {
  common: 'gray',
  uncommon: 'green',
  rare: 'blue', 
  epic: 'purple',
  legendary: 'yellow',
  mythic: 'red',
  unique: 'pink'
}

export default function GiftsPage() {
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState<'send' | 'history'>('send')
  const [giftHistory, setGiftHistory] = useState(mockGiftHistory)
  const [selectedObject, setSelectedObject] = useState<string>('')
  const [recipientHandle, setRecipientHandle] = useState('')
  const [giftMessage, setGiftMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/login?callbackUrl=/gifts'
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

  const handleSendGift = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Add to history
    const newGift = {
      id: Date.now().toString(),
      type: 'sent' as const,
      object: { name: 'Test Object', emoji: '🎁', rarity: 'common' as const },
      recipient: { name: recipientHandle, avatar: null },
      date: new Date().toISOString(),
      message: giftMessage
    }
    
    setGiftHistory([newGift, ...giftHistory])
    setRecipientHandle('')
    setGiftMessage('')
    setIsLoading(false)
    setActiveTab('history')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-900 dark:to-pink-900">
      {/* Gaming Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-600 to-emerald-600 py-16">
        {/* Floating gift emojis */}
        <div className="absolute inset-0 overflow-hidden">
          {['🎁', '💝', '🎊', '✨', '🌟', '💫'].map((emoji, index) => (
            <motion.div
              key={index}
              className="absolute text-4xl opacity-20"
              style={{
                left: `${15 + (index * 15)}%`,
                top: `${10 + (index % 3) * 25}%`,
              }}
              animate={{
                y: [0, -20, 0],
                rotate: [0, 10, -10, 0],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 4 + (index % 2),
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.8
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
              🎁 Gift Exchange Station
            </h1>
            <p className="text-xl text-white/90 mb-6">
              Spread joy by sharing your magical objects with friends!
            </p>
            
            {/* Quest-style stats */}
            <div className="flex justify-center space-x-8 text-white/90">
              <div className="text-center">
                <div className="text-2xl font-bold">{giftHistory.filter(g => g.type === 'sent').length}</div>
                <div className="text-sm">Gifts Sent</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{giftHistory.filter(g => g.type === 'received').length}</div>
                <div className="text-sm">Gifts Received</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">⭐⭐⭐⭐⭐</div>
                <div className="text-sm">Generosity Level</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-2 mb-8 border border-white/20"
        >
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('send')}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'send' 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg transform scale-105' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              🚀 Send Gift
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'history' 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg transform scale-105' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              📜 Gift History
            </button>
          </div>
        </motion.div>

        {/* Send Gift Tab */}
        {activeTab === 'send' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-8 border border-white/20"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              🎯 Launch a Gift Mission!
            </h2>

            <form onSubmit={handleSendGift} className="space-y-6">
              {/* Recipient */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  🎪 Target Recipient
                </label>
                <input
                  type="text"
                  value={recipientHandle}
                  onChange={(e) => setRecipientHandle(e.target.value)}
                  placeholder="Enter Bluesky handle (e.g., friend.bsky.social)"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                  required
                />
              </div>

              {/* Object Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  📦 Choose Your Gift
                </label>
                <div className="bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-700">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                    ⚡ Pro Tip: Use the bot on Bluesky to gift directly! Mention someone like: 
                    <code className="bg-yellow-200 dark:bg-yellow-800 px-2 py-1 rounded ml-1">
                      @etcetera.exchange gift @friend.bsky.social
                    </code>
                  </p>
                  <Link
                    href="/collection"
                    className="inline-flex items-center text-green-600 hover:text-green-500 font-medium"
                  >
                    🔍 View your collection to choose a gift →
                  </Link>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  💌 Gift Message (Optional)
                </label>
                <textarea
                  value={giftMessage}
                  onChange={(e) => setGiftMessage(e.target.value)}
                  placeholder="Add a personal message to make your gift extra special!"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                />
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading || !recipientHandle.trim()}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 px-6 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:from-green-600 hover:to-emerald-600 hover:scale-105"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <>
                    <div className="inline-block w-5 h-5 mr-2 animate-spin border-2 border-white/30 border-t-white rounded-full" />
                    Launching Gift...
                  </>
                ) : (
                  <>
                    🚀 Launch Gift Mission!
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        )}

        {/* Gift History Tab */}
        {activeTab === 'history' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              📚 Your Gift Chronicle
            </h2>

            {giftHistory.length === 0 ? (
              <div className="text-center py-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-white/20">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  No gifts yet! Start spreading joy by sending your first gift!
                </p>
              </div>
            ) : (
              giftHistory.map((gift, index) => (
                <motion.div
                  key={gift.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 border border-white/20 ${
                    gift.type === 'sent' 
                      ? 'border-l-4 border-l-green-500' 
                      : 'border-l-4 border-l-blue-500'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    {/* Gift Type Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      gift.type === 'sent' 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    }`}>
                      {gift.type === 'sent' ? '📤' : '📥'}
                    </div>

                    {/* Gift Details */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-2xl">{gift.object.emoji}</span>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {gift.object.name}
                        </h3>
                        <span className={`px-2 py-1 rounded-lg text-xs font-semibold bg-${rarityColors[gift.object.rarity as keyof typeof rarityColors]}-100 text-${rarityColors[gift.object.rarity as keyof typeof rarityColors]}-800 dark:bg-${rarityColors[gift.object.rarity as keyof typeof rarityColors]}-900/30 dark:text-${rarityColors[gift.object.rarity as keyof typeof rarityColors]}-400`}>
                          {gift.object.rarity}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {gift.type === 'sent' ? `Sent to ` : `Received from `}
                        <span className="font-medium">
                          {gift.type === 'sent' ? gift.recipient?.name : gift.sender?.name}
                        </span>
                      </p>

                      {gift.message && (
                        <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3 mb-2">
                          <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                            "{gift.message}"
                          </p>
                        </div>
                      )}

                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(gift.date).toLocaleDateString()} at {new Date(gift.date).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
