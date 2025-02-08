'use client'

import { useAccount, useConnect, useDisconnect } from '@starknet-react/core'
import { useEffect, useState } from 'react'
import ControllerConnector from '@cartridge/connector/controller'

export function ConnectWallet() {
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { address } = useAccount()
  const controller = connectors[0] as ControllerConnector
  const [username, setUsername] = useState<string>()

  useEffect(() => {
    if (!address) return
    controller.username()?.then((n) => setUsername(n))
  }, [address, controller])

  return (
    <div className="flex items-center gap-4">
      {address && (
        <div className="text-sm text-gray-600">
          <p className="font-medium">
            Account: {address.slice(0, 6)}...{address.slice(-4)}
          </p>
          {username && <p className="text-gray-500">Username: {username}</p>}
        </div>
      )}
      <button
        onClick={() =>
          address ? disconnect() : connect({ connector: controller })
        }
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
      >
        {address ? 'Disconnect' : 'Connect'}
      </button>
    </div>
  )
}
