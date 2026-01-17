"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

export type SkinType = "aeterna" | "legacy"

interface SkinContextType {
  skin: SkinType
  setSkin: (skin: SkinType) => void
  toggleSkin: () => void
}

const SkinContext = createContext<SkinContextType | undefined>(undefined)

export function SkinProvider({ children }: { children: React.ReactNode }) {
  const [skin, setSkinState] = useState<SkinType>("aeterna")

  // Load skin from localStorage on mount
  useEffect(() => {
    const savedSkin = localStorage.getItem("aeterna-skin") as SkinType
    if (savedSkin && (savedSkin === "aeterna" || savedSkin === "legacy")) {
      setSkinState(savedSkin)
    }
  }, [])

  // Apply skin attribute to document element
  useEffect(() => {
    document.documentElement.setAttribute("data-skin", skin)
    localStorage.setItem("aeterna-skin", skin)
  }, [skin])

  const setSkin = (newSkin: SkinType) => {
    setSkinState(newSkin)
  }

  const toggleSkin = () => {
    setSkinState((prev) => (prev === "aeterna" ? "legacy" : "aeterna"))
  }

  return (
    <SkinContext.Provider value={{ skin, setSkin, toggleSkin }}>
      {children}
    </SkinContext.Provider>
  )
}

export function useSkin() {
  const context = useContext(SkinContext)
  if (context === undefined) {
    throw new Error("useSkin must be used within a SkinProvider")
  }
  return context
}
