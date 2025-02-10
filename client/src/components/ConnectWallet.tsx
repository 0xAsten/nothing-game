'use client'

import { useAccount, useConnect, useDisconnect } from '@starknet-react/core'
import { useEffect, useState } from 'react'
import ControllerConnector from '@cartridge/connector/controller'

interface ConnectWalletProps {
  variant?: 'header' | 'main'
}

export function ConnectWallet({ variant = 'header' }: ConnectWalletProps) {
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { address } = useAccount()
  const controller = connectors[0] as ControllerConnector
  const [username, setUsername] = useState<string>()

  useEffect(() => {
    if (!address) return
    controller.username()?.then((n) => setUsername(n))
  }, [address, controller])

  const buttonClasses =
    variant === 'header'
      ? 'bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200'
      : 'bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-lg text-lg font-medium transition-colors duration-200 shadow-lg hover:shadow-xl'

  return (
    <div className="flex items-center gap-4">
      {address && variant === 'header' && (
        <div className="text-sm text-gray-600">
          <p
            className="font-medium cursor-pointer"
            onClick={() => navigator.clipboard.writeText(address)}
          >
            Account: {address.slice(0, 6)}...{address.slice(-4)}
          </p>
          {username && <p className="text-gray-500">Username: {username}</p>}
        </div>
      )}
      <button
        onClick={() =>
          address ? disconnect() : connect({ connector: controller })
        }
        className={buttonClasses}
      >
        {address ? 'Disconnect' : 'Connect Wallet'}
      </button>
    </div>
  )
}
