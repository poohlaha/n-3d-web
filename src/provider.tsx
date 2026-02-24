/**
 * @fileOverview language context
 * @date 2023-04-21
 * @author poohlaha
 */
import React, { createContext, useContext } from 'react'
import type { Jet } from '@bale-web/jet/export'

export interface AppContextValue {
  jet?: Jet
  logger?: any
  context?: Map<string, unknown>
}

export const AppContext = createContext<AppContextValue>({})
export const useAppContext = () => useContext(AppContext)

interface AppProviderProps {
  children: React.ReactNode
  value: AppContextValue
}

export const AppProvider = ({ children, value }: AppProviderProps) => {
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
