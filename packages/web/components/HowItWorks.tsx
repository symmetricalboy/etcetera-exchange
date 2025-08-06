'use client'

import { motion } from 'framer-motion'
import { CheckIcon } from '@heroicons/react/24/outline'

const steps = [
  {
    id: 1,
    title: 'Follow the Bot',
    description: 'Find @etcetera.exchange on Bluesky and give us a follow to stay updated!',
    icon: '🦋',
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 2,
    title: 'Mention for Daily Object',
    description: 'Mention our bot in any post to claim your free daily random object. Each one is unique and magical!',
    icon: '🎲',
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 3,
    title: 'Build Your Collection',
    description: 'Watch your collection grow! From common paperclips to legendary reality-bending mittens.',
    icon: '📦',
    color: 'from-pink-500 to-pink-600'
  },
  {
    id: 4,
    title: 'Gift & Share',
    description: 'Spread joy by gifting objects to friends. Mention the bot with their handle to send them something special!',
    icon: '🎁',
    color: 'from-green-500 to-green-600'
  }
]

const rarities = [
  { name: 'Common', percentage: '40%', color: 'bg-gray-500', example: 'A paperclip that remembers important dates' },
  { name: 'Uncommon', percentage: '25%', color: 'bg-green-500', example: 'A rubber duck that quacks in different languages' },
  { name: 'Rare', percentage: '20%', color: 'bg-blue-500', example: 'A compass that points to the nearest bookstore' },
  { name: 'Epic', percentage: '10%', color: 'bg-purple-500', example: 'A mirror that shows you in any outfit' },
  { name: 'Legendary', percentage: '4%', color: 'bg-yellow-500', example: 'A blanket that gives perfect dreams' },
  { name: 'Mythic', percentage: '0.9%', color: 'bg-red-500', example: 'A pocket watch that pauses time (except for cats)' },
  { name: 'Unique', percentage: '0.1%', color: 'bg-pink-500', example: 'The last hiccup in the universe, in a soap bubble' }
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-gray-50 dark:bg-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4"
          >
            How the Magic Works ✨
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
          >
            Getting started with your magical object collection is easier than finding a parking spot at the mall!
          </motion.p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-white dark:bg-slate-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className={`w-12 h-12 bg-gradient-to-br ${step.color} rounded-lg flex items-center justify-center text-2xl mb-4 mx-auto`}>
                  {step.icon}
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {step.description}
                  </p>
                </div>
              </div>
              
              {/* Connection line (except for last item) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 w-8 h-0.5 bg-gradient-to-r from-gray-300 to-gray-200 dark:from-gray-600 dark:to-gray-700" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Rarity System */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-white dark:bg-slate-700 rounded-2xl p-8 shadow-lg"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              🌟 Object Rarity System
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Every object has a rarity level. The rarer the object, the more magical (and harder to find) it becomes!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {rarities.map((rarity, index) => (
              <motion.div
                key={rarity.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="bg-gray-50 dark:bg-slate-600 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-slate-500 transition-colors group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {rarity.name}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${rarity.color}`} />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      {rarity.percentage}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                  {rarity.example}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Pro Tips */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-16 bg-gradient-to-r from-etcetera-500 to-purple-600 rounded-2xl p-8 text-white"
        >
          <h3 className="text-2xl font-bold mb-6 text-center">💡 Pro Tips for Collectors</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckIcon className="w-5 h-5 text-green-300 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Daily Claims Reset at Midnight UTC</h4>
                  <p className="text-sm text-white/80">Make sure to claim your object every day!</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckIcon className="w-5 h-5 text-green-300 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Unique Objects Can Only Exist Once</h4>
                  <p className="text-sm text-white/80">If someone already has it, you can't get it again!</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckIcon className="w-5 h-5 text-green-300 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Gift Objects to Make Friends</h4>
                  <p className="text-sm text-white/80">Sharing is caring in the etcetera universe!</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckIcon className="w-5 h-5 text-green-300 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">View Your Collection Here</h4>
                  <p className="text-sm text-white/80">Sign in to see all your magical treasures in one place!</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}