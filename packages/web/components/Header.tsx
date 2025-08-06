'use client'

import { Fragment } from 'react'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useSession, signIn, signOut } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { clsx } from 'clsx'

const navigation = [
  { name: 'Home', href: '/', current: false },
  { name: 'How It Works', href: '#how-it-works', current: false },
  { name: 'Leaderboard', href: '/leaderboard', current: false },
]

export function Header() {
  const { data: session, status } = useSession()

  return (
    <Disclosure as="nav" className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Link href="/" className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-etcetera-500 to-etcetera-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">∞</span>
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-etcetera-600 to-etcetera-500 bg-clip-text text-transparent">
                      etcetera.exchange
                    </span>
                  </Link>
                </div>
                
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={clsx(
                        'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors',
                        item.current
                          ? 'border-etcetera-500 text-gray-900 dark:text-white'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-300 dark:hover:text-white'
                      )}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
              
              <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
                {status === 'loading' ? (
                  <div className="h-8 w-24 shimmer rounded" />
                ) : session ? (
                  <Menu as="div" className="relative">
                    <div>
                      <Menu.Button className="flex items-center space-x-2 bg-white dark:bg-slate-800 rounded-full p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-etcetera-500">
                        <span className="sr-only">Open user menu</span>
                        {session.user?.image ? (
                          <Image
                            className="h-8 w-8 rounded-full"
                            src={session.user.image}
                            alt={session.user.name || 'User avatar'}
                            width={32}
                            height={32}
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-etcetera-500 flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {session.user?.name?.[0]?.toUpperCase() || '?'}
                            </span>
                          </div>
                        )}
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {session.user?.name || 'User'}
                        </span>
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              href="/collection"
                              className={clsx(
                                active ? 'bg-gray-100 dark:bg-slate-700' : '',
                                'block px-4 py-2 text-sm text-gray-700 dark:text-gray-300'
                              )}
                            >
                              📦 My Collection
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              href="/gifts"
                              className={clsx(
                                active ? 'bg-gray-100 dark:bg-slate-700' : '',
                                'block px-4 py-2 text-sm text-gray-700 dark:text-gray-300'
                              )}
                            >
                              🎁 Send Gifts
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              href="/profile"
                              className={clsx(
                                active ? 'bg-gray-100 dark:bg-slate-700' : '',
                                'block px-4 py-2 text-sm text-gray-700 dark:text-gray-300'
                              )}
                            >
                              ⚙️ Settings
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => signOut()}
                              className={clsx(
                                active ? 'bg-gray-100 dark:bg-slate-700' : '',
                                'block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300'
                              )}
                            >
                              🚪 Sign out
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                ) : (
                  <button
                    onClick={() => signIn('bluesky')}
                    className="btn-magical text-white px-4 py-2 rounded-lg font-medium inline-flex items-center"
                  >
                    <span className="mr-2">🦋</span>
                    Sign in with Bluesky
                  </button>
                )}
              </div>
              
              <div className="-mr-2 flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-etcetera-500">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as={Link}
                  href={item.href}
                  className={clsx(
                    'block pl-3 pr-4 py-2 border-l-4 text-base font-medium',
                    item.current
                      ? 'bg-etcetera-50 border-etcetera-500 text-etcetera-700'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                  )}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
            
            <div className="pt-4 pb-3 border-t border-gray-200">
              {session ? (
                <div className="space-y-1">
                  <div className="flex items-center px-4">
                    {session.user?.image ? (
                      <Image
                        className="h-10 w-10 rounded-full"
                        src={session.user.image}
                        alt={session.user.name || 'User avatar'}
                        width={40}
                        height={40}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-etcetera-500 flex items-center justify-center">
                        <span className="text-white font-medium">
                          {session.user?.name?.[0]?.toUpperCase() || '?'}
                        </span>
                      </div>
                    )}
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800">
                        {session.user?.name}
                      </div>
                      <div className="text-sm font-medium text-gray-500">
                        {session.user?.email}
                      </div>
                    </div>
                  </div>
                  
                  <Disclosure.Button
                    as={Link}
                    href="/collection"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  >
                    📦 My Collection
                  </Disclosure.Button>
                  
                  <Disclosure.Button
                    as={Link}
                    href="/gifts"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  >
                    🎁 Send Gifts
                  </Disclosure.Button>
                  
                  <Disclosure.Button
                    as="button"
                    onClick={() => signOut()}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  >
                    🚪 Sign out
                  </Disclosure.Button>
                </div>
              ) : (
                <div className="px-4">
                  <button
                    onClick={() => signIn('bluesky')}
                    className="btn-magical text-white w-full px-4 py-2 rounded-lg font-medium inline-flex items-center justify-center"
                  >
                    <span className="mr-2">🦋</span>
                    Sign in with Bluesky
                  </button>
                </div>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}