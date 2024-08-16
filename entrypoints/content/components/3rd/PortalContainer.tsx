import React from 'react'
import { createContext } from 'react'
import { createPortal } from 'react-dom'
import { Toaster } from '../ui/toaster'

const PortalContext = createContext<HTMLElement | undefined | null>(undefined)

export const usePortalContainer = () => {
  return React.useContext(PortalContext)
}

export function PortalContainer(props: {
  children: React.ReactNode
  container?: HTMLElement | null
}) {
  return (
    <PortalContext.Provider value={props.container}>
      {props.children}
      {/* 在特定 dom 中渲染 */}
      {props.container && createPortal(<Toaster />, props.container)}
    </PortalContext.Provider>
  )
}
