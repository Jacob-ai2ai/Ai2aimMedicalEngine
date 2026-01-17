"use client"

import React, { useEffect, useRef } from "react"
import { useSkin } from "@/components/theme/skin-provider"

export const AeternaBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { skin } = useSkin()

  useEffect(() => {
    if (skin !== "aeterna") return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    let particles: Particle[] = []

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initParticles()
    }

    class Particle {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      opacity: number

      constructor(canvasWidth: number, canvasHeight: number) {
        this.x = Math.random() * canvasWidth
        this.y = Math.random() * canvasHeight
        this.size = Math.random() * 1.5 + 0.1
        this.speedX = Math.random() * 0.2 - 0.1
        this.speedY = Math.random() * 0.2 - 0.1
        this.opacity = Math.random() * 0.5 + 0.1
      }

      update(canvasWidth: number, canvasHeight: number) {
        this.x += this.speedX
        this.y += this.speedY

        if (this.x > canvasWidth) this.x = 0
        else if (this.x < 0) this.x = canvasWidth

        if (this.y > canvasHeight) this.y = 0
        else if (this.y < 0) this.y = canvasHeight
      }

      draw(context: CanvasRenderingContext2D) {
        context.fillStyle = `rgba(16, 185, 129, ${this.opacity})` // Nebula Emerald
        context.beginPath()
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        context.fill()
      }
    }

    const initParticles = () => {
      particles = []
      const particleCount = Math.floor((canvas.width * canvas.height) / 15000)
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(canvas.width, canvas.height))
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Draw subtle gradient background
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width
      )
      gradient.addColorStop(0, "rgba(2, 4, 8, 0)")
      gradient.addColorStop(1, "rgba(2, 4, 8, 0.4)")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle) => {
        particle.update(canvas.width, canvas.height)
        particle.draw(ctx)
      })
      
      animationFrameId = requestAnimationFrame(animate)
    }

    window.addEventListener("resize", resizeCanvas)
    resizeCanvas()
    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [skin])

  if (skin !== "aeterna") return null

  return (
    <div className="fixed inset-0 -z-20 pointer-events-none overflow-hidden bg-[#020408]">
      {/* Parallax Nebula Layers */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[140px] animate-pulse" />
      <div 
        className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[160px] animate-pulse-slow" 
      />
      
      {/* Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 opacity-40"
      />
      
      {/* Atmospheric Vignette */}
      <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.8)]" />
    </div>
  )
}
