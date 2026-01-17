"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { createClientSupabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Mail, Lock, AlertCircle } from "lucide-react"

export default function LoginPage() {
  // Auto-fill credentials for testing
  const [email, setEmail] = useState("admin@ai2aimrx.com")
  const [password, setPassword] = useState("admin123")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Auto-fill on mount
  useEffect(() => {
    setEmail("admin@ai2aimrx.com")
    setPassword("admin123")
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    const supabase = createClientSupabase()
    
    // First, try to sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    if (!signInError && signInData.user) {
      // Login successful!
      window.location.href = "/dashboard"
      return
    }

    // If login failed, show helpful error
    if (signInError) {
      // If it's just invalid credentials, try signup
      if (signInError.message.includes('Invalid login credentials') || signInError.message.includes('Email not confirmed')) {
        setError('Creating new account...')
        
        // Try to sign up (this will create the user)
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`
          }
        })

        if (signUpError) {
          // If email is invalid, suggest using Supabase Dashboard
          if (signUpError.message.includes('invalid') || signUpError.message.includes('Invalid')) {
            setError('Email validation failed. Please create the user manually in Supabase Dashboard: Authentication > Users > Add user. Check "Auto Confirm User".')
          } else {
            setError(`Signup failed: ${signUpError.message}`)
          }
          setLoading(false)
          return
        }

        if (signUpData.user) {
          // User created! Now try to sign in
          const { error: loginAfterSignupError } = await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password,
          })

          if (loginAfterSignupError) {
            // If still can't login, might need email confirmation
            if (loginAfterSignupError.message.includes('Email not confirmed')) {
              setError('Account created! Please check your email to confirm, or disable email confirmation in Supabase Dashboard > Authentication > Settings.')
            } else {
              setError(`Login failed: ${loginAfterSignupError.message}`)
            }
            setLoading(false)
            return
          }

          // Successfully logged in! Create profile
          try {
            const { error: profileError } = await supabase
              .from('user_profiles')
              .insert({
                id: signUpData.user.id,
                email: email.trim().toLowerCase(),
                full_name: 'Admin User',
                role: 'admin'
              })

            if (profileError && !profileError.message.includes('duplicate')) {
              console.error('Profile creation error:', profileError)
            }
          } catch (err) {
            console.error('Error creating profile:', err)
          }

          window.location.href = "/dashboard"
          return
        }
      } else {
        setError(`Login failed: ${signInError.message}`)
        setLoading(false)
        return
      }
    }

    setError('Unable to login. Please try again.')
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 modern-light-gradient">
      <Card className="w-full max-w-md shadow-2xl border border-slate-200 bg-white rounded-[2rem] overflow-hidden">
        <CardHeader className="space-y-2 text-center pt-10 pb-6">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-emerald-100 text-emerald-600 shadow-lg">
              <Activity className="h-10 w-10" />
            </div>
          </div>
          <CardTitle className="text-4xl font-extrabold tracking-tight text-slate-800">
            AI2AIM RX
          </CardTitle>
          <CardDescription className="text-slate-600 font-medium">
            Sign in to your medical platform account
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-10">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="rounded-2xl bg-red-50 border-2 border-red-200 p-4 text-sm text-red-700 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p className="font-semibold">{error}</p>
              </div>
            )}
            <div className="space-y-3">
              <Label htmlFor="email" className="flex items-center gap-2 text-slate-700 font-bold uppercase tracking-wider text-xs">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="bg-slate-50 text-slate-900 border-2 border-slate-300 h-14 rounded-2xl px-6 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:border-emerald-500"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="password" className="flex items-center gap-2 text-slate-700 font-bold uppercase tracking-wider text-xs">
                <Lock className="h-4 w-4" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="bg-slate-50 text-slate-900 border-2 border-slate-300 h-14 rounded-2xl px-6 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:border-emerald-500"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-14 rounded-2xl text-lg font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/30 transition-all active:scale-[0.98]" 
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
            <div className="text-center text-xs font-semibold text-slate-500 uppercase tracking-widest mt-8">
              Medical RX Management Platform
            </div>
          </form>
          <Link
            href="/dashboard"
            className="w-full h-12 rounded-2xl text-base font-bold bg-slate-600 hover:bg-slate-700 text-white shadow-lg transition-all mt-4 flex items-center justify-center"
          >
            Skip Login (Demo Mode)
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
