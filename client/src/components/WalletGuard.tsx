'use client'

import { useAccount } from '@starknet-react/core'
import { useUserVerification } from '@/hooks/useUserVerification'
import { ConnectWallet } from './ConnectWallet'

interface WalletGuardProps {
  children: React.ReactNode
}

export function WalletGuard({ children }: WalletGuardProps) {
  const { address } = useAccount()
  const { isLoading, isVerified, error, spawnUser } = useUserVerification()

  if (!address) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            Welcome to the Game
          </h1>
          <p className="text-gray-400">
            Please connect your wallet to start playing
          </p>
        </div>
        <ConnectWallet />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!isVerified) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            Welcome New Player!
          </h1>
          <p className="text-gray-400 mb-4">
            You need to create a character before playing
          </p>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <button
            onClick={spawnUser}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            Create Character
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
