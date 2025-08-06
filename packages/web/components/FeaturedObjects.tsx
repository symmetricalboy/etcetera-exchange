'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { formatRarity, type GameObject } from '@etcetera/shared'
import { LoadingSpinner } from './ui/LoadingSpinner'

export function FeaturedObjects() {
  const [objects, setObjects] = useState<GameObject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchFeaturedObjects() {
      try {
        const response = await fetch('/api/objects/featured')
        if (!response.ok) {
          throw new Error('Failed to fetch featured objects')
        }
        const data = await response.json()
        setObjects(data.objects || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedObjects()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🤔</div>
        <p className="text-gray-600 dark:text-gray-400">
          Hmm, our magical object catalog seems to be taking a coffee break...
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
          {error}
        </p>
      </div>
    )
  }

  if (objects.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📦</div>
        <p className="text-gray-600 dark:text-gray-400">
          No objects have been discovered yet! Be the first to claim one from our bot!
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {objects.map((object, index) => (
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
  )
}

interface ObjectCardProps {
  object: GameObject
}

function ObjectCard({ object }: ObjectCardProps) {
  const rarityColor = getRarityColor(object.rarity)
  
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group-hover:scale-105 border-2 border-transparent hover:border-${rarityColor}-200`}>
      {/* Object Image */}
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-600">
        {object.image_url ? (
          <Image
            src={object.image_url}
            alt={object.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            {object.emoji || '📦'}
          </div>
        )}
        
        {/* Rarity badge */}
        <div className={`absolute top-2 right-2 bg-${rarityColor}-500 text-white px-2 py-1 rounded-lg text-xs font-semibold`}>
          {formatRarity(object.rarity)}
        </div>
        
        {/* Unique indicator */}
        {object.is_unique && (
          <div className="absolute top-2 left-2 bg-pink-500 text-white px-2 py-1 rounded-lg text-xs font-semibold animate-pulse">
            ✨ UNIQUE
          </div>
        )}
      </div>
      
      {/* Object Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
          {object.name}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-3">
          {object.description}
        </p>
        
        {/* Tags */}
        {object.tags && object.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {object.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-block bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
            {object.tags.length > 3 && (
              <span className="text-gray-500 dark:text-gray-400 text-xs">
                +{object.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function getRarityColor(rarity: string): string {
  const colors = {
    common: 'gray',
    uncommon: 'green',
    rare: 'blue',
    epic: 'purple',
    legendary: 'yellow',
    mythic: 'red',
    unique: 'pink'
  }
  return colors[rarity as keyof typeof colors] || 'gray'
}