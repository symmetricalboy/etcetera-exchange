'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

// Mock data for now - replace with real API call later
const mockUserObjects = [
  {
    id: '1',
    name: 'Mystical Paperclip of Remembering',
    description: 'A seemingly ordinary paperclip that helps you remember where you put important documents. Glows softly when near lost items.',
    rarity: 'rare',
    emoji: '📎',
    tags: ['office', 'mystical', 'helpful'],
    acquired_at: '2024-01-15T10:30:00Z',
    is_unique: false,
    stats: { luck: 5, organization: 8 }
  },
  {
    id: '2', 
    name: 'Reality-Bending Rubber Duck',
    description: 'This rubber duck doesn\'t just help with debugging code - it debugs reality itself. Warning: May cause temporal loops in bathtubs.',
    rarity: 'legendary',
    emoji: '🦆',
    tags: ['programming', 'reality', 'dangerous'],
    acquired_at: '2024-01-10T14:20:00Z',
    is_unique: true,
    stats: { intelligence: 15, chaos: 12 }
  },
  {
    id: '3',
    name: 'Comfortable Anxiety Blanket',
    description: 'A blanket that wraps you in the perfect amount of worry - just enough to be productive, not enough to be paralyzed.',
    rarity: 'epic',
    emoji: '🛌',
    tags: ['comfort', 'mental-health', 'productivity'],
    acquired_at: '2024-01-08T20:15:00Z',
    is_unique: false,
    stats: { comfort: 10, focus: 7 }
  },
  {
    id: '4',
    name: 'Interdimensional Sock',
    description: 'The other sock from every pair you\'ve ever lost. Opens portals to the sock dimension. Handle with care.',
    rarity: 'mythic',
    emoji: '🧦',
    tags: ['interdimensional', 'laundry', 'mysterious'],
    acquired_at: '2024-01-05T09:45:00Z',
    is_unique: true,
    stats: { mystery: 20, usefulness: 3 }
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

const rarityGradients = {
  common: 'from-gray-400 to-gray-600',
  uncommon: 'from-green-400 to-green-600',
  rare: 'from-blue-400 to-blue-600', 
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-yellow-600',
  mythic: 'from-red-400 to-red-600',
  unique: 'from-pink-400 to-pink-600'
}

export default function CollectionPage() {
  const { data: session, status } = useSession()
  const [objects, setObjects] = useState(mockUserObjects)
  const [loading, setLoading] = useState(false)
  const [selectedRarity, setSelectedRarity] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('acquired_at')

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/login?callbackUrl=/collection'
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
    return null // Will redirect via useEffect
  }

  // Filter and sort objects
  const filteredObjects = objects
    .filter(obj => selectedRarity === 'all' || obj.rarity === selectedRarity)
    .sort((a, b) => {
      if (sortBy === 'acquired_at') {
        return new Date(b.acquired_at).getTime() - new Date(a.acquired_at).getTime()
      }
      if (sortBy === 'rarity') {
        const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'unique']
        return rarityOrder.indexOf(b.rarity) - rarityOrder.indexOf(a.rarity)
      }
      return 0
    })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-900 dark:to-pink-900">
      {/* Header with floating elements */}
      <div className="relative overflow-hidden bg-gradient-to-r from-etcetera-600 to-purple-600 py-16">
        {/* Floating UI elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute top-10 left-20 text-4xl"
            animate={{ 
              y: [0, -15, 0],
              rotate: [0, 5, 0]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            💎
          </motion.div>
          
          <motion.div 
            className="absolute top-20 right-32 text-3xl"
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, -3, 0]
            }}
            transition={{ 
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          >
            🏆
          </motion.div>
          
          <motion.div 
            className="absolute bottom-10 left-1/3 text-3xl"
            animate={{ 
              y: [0, -12, 0],
              rotate: [0, 4, 0]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          >
            ⚡
          </motion.div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              🎒 Your Legendary Collection
            </h1>
            <p className="text-xl text-white/90 mb-6">
              {objects.length} magical objects and counting!
            </p>
            
            {/* Quick Stats */}
            <div className="flex justify-center space-x-8 text-white/90">
              <div className="text-center">
                <div className="text-2xl font-bold">{objects.filter(o => o.is_unique).length}</div>
                <div className="text-sm">Unique Items</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{objects.filter(o => ['legendary', 'mythic'].includes(o.rarity)).length}</div>
                <div className="text-sm">Legendary+</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{Math.max(...objects.map(o => Object.values(o.stats || {}).reduce((a, b) => a + b, 0)))}</div>
                <div className="text-sm">Max Power</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters & Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/20"
        >
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            {/* Rarity Filter */}
            <div className="flex items-center space-x-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Rarity:</label>
              <select
                value={selectedRarity}
                onChange={(e) => setSelectedRarity(e.target.value)}
                className="bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-etcetera-500 focus:border-transparent"
              >
                <option value="all">All Rarities</option>
                <option value="common">Common</option>
                <option value="uncommon">Uncommon</option>
                <option value="rare">Rare</option>
                <option value="epic">Epic</option>
                <option value="legendary">Legendary</option>
                <option value="mythic">Mythic</option>
                <option value="unique">Unique</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center space-x-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-etcetera-500 focus:border-transparent"
              >
                <option value="acquired_at">Recently Acquired</option>
                <option value="rarity">Rarity (High to Low)</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Link
                href="/gifts"
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all duration-300 inline-flex items-center"
              >
                <span className="mr-2">🎁</span>
                Send Gift
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Objects Grid */}
        {filteredObjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No objects match your current filters!
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredObjects.map((object, index) => (
              <motion.div
                key={object.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <ObjectCard object={object} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface ObjectCardProps {
  object: any
}

function ObjectCard({ object }: ObjectCardProps) {
  const rarityColor = rarityColors[object.rarity as keyof typeof rarityColors]
  const rarityGradient = rarityGradients[object.rarity as keyof typeof rarityGradients]
  
  return (
    <motion.div
      whileHover={{ 
        scale: 1.03,
        rotateY: 5,
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
      }}
      className={`bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden border-2 border-transparent hover:border-${rarityColor}-200 transition-all duration-300 relative`}
    >
      {/* Rarity glow effect */}
      <div className={`absolute inset-0 bg-gradient-to-r ${rarityGradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl`} />
      
      {/* Object Image/Emoji */}
      <div className={`relative h-48 bg-gradient-to-br ${rarityGradient} flex items-center justify-center overflow-hidden`}>
        {object.image_url ? (
          <Image
            src={`/api/images/${object.image_url}`}
            alt={object.name}
            fill
            className="object-cover"
            onError={(e) => {
              // Fallback to emoji if image fails to load
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              const parent = target.parentElement
              if (parent) {
                parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-6xl">${object.emoji}</div>`
              }
            }}
          />
        ) : (
          <div className="text-6xl">{object.emoji}</div>
        )}
        
        {/* Rarity badge */}
        <div className={`absolute top-3 right-3 bg-${rarityColor}-500 text-white px-2 py-1 rounded-lg text-xs font-semibold capitalize`}>
          {object.rarity}
        </div>
        
        {/* Unique indicator */}
        {object.is_unique && (
          <div className="absolute top-3 left-3 bg-pink-500 text-white px-2 py-1 rounded-lg text-xs font-semibold animate-pulse">
            ✨ UNIQUE
          </div>
        )}
      </div>
      
      {/* Object Info */}
      <div className="p-5">
        <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">
          {object.name}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
          {object.description}
        </p>
        
        {/* Stats */}
        {object.stats && (
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Stats</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(object.stats).map(([stat, value]) => (
                <div key={stat} className="flex justify-between text-xs">
                  <span className="capitalize text-gray-600 dark:text-gray-400">{stat}:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Tags */}
        {object.tags && object.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {object.tags.slice(0, 3).map((tag: string, index: number) => (
              <span
                key={index}
                className="inline-block bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        
        {/* Acquired date */}
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Acquired {new Date(object.acquired_at).toLocaleDateString()}
        </div>
      </div>
    </motion.div>
  )
}
