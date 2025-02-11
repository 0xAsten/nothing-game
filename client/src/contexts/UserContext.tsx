'use client'

import React, { createContext, useContext } from 'react'
import { useUserVerification } from '@/hooks/useUserVerification'

const UserContext = createContext<
  ReturnType<typeof useUserVerification> | undefined
>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const userVerification = useUserVerification()

  return (
    <UserContext.Provider value={userVerification}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
