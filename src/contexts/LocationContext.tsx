import React, { createContext, useContext, useState, ReactNode } from 'react'

interface LocationContextType {
  estado: string
  cidade: string
  bairro: string
  setEstado: (estado: string) => void
  setCidade: (cidade: string) => void
  setBairro: (bairro: string) => void
}

const LocationContext = createContext<LocationContextType | undefined>(undefined)

export function LocationProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState('RN')
  const [cidade, setCidade] = useState('Mossoró')
  const [bairro, setBairro] = useState('Todos')

  return (
    <LocationContext.Provider value={{ estado, cidade, bairro, setEstado, setCidade, setBairro }}>
      {children}
    </LocationContext.Provider>
  )
}

export function useLocation() {
  const context = useContext(LocationContext)
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider')
  }
  return context
}
