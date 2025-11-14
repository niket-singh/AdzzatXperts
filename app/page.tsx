'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useTheme } from '@/lib/theme-context'

export default function Home() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'CONTRIBUTOR',
  })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()
  const { user, loading: authLoading, login, signup } = useAuth()
  const { theme, toggleTheme } = useTheme()

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      const role = user.role
      if (role === 'CONTRIBUTOR') {
        router.push('/contributor')
      } else if (role === 'REVIEWER') {
        router.push('/reviewer')
      } else if (role === 'ADMIN') {
        router.push('/admin')
      }
    }
  }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setSubmitting(true)

    try {
      if (isSignUp) {
        await signup(formData.email, formData.password, formData.name, formData.role)

        // Check if reviewer - they need approval
        if (formData.role === 'REVIEWER') {
          setMessage('Account created! Waiting for admin approval.')
          setSubmitting(false)
          return
        }
      } else {
        await login(formData.email, formData.password)
      }

      // The useEffect will handle redirect
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Something went wrong'
      setError(errorMessage)
      setSubmitting(false)
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900'
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className={`fixed top-6 right-6 p-3 rounded-full transition-all duration-300 hover:scale-110 ${
          theme === 'dark'
            ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
            : 'bg-white text-gray-700 hover:bg-gray-100 shadow-lg'
        }`}
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        )}
      </button>

      <div className={`rounded-2xl shadow-2xl p-8 w-full max-w-md backdrop-blur-sm transition-colors duration-300 ${
        theme === 'dark'
          ? 'bg-gray-800/90 border border-gray-700'
          : 'bg-white/90 border border-white'
      }`}>
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-blue-500 to-purple-600'
              : 'bg-gradient-to-br from-blue-600 to-indigo-600'
          }`}>
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className={`text-3xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            Reviewers-Adzzat
          </h1>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Task Submission & Review Platform
          </p>
        </div>

        {/* Tab Switcher */}
        <div className={`flex mb-6 rounded-xl p-1 ${
          theme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-100'
        }`}>
          <button
            onClick={() => setIsSignUp(false)}
            className={`flex-1 py-2.5 rounded-lg transition-all duration-300 font-medium ${
              !isSignUp
                ? theme === 'dark'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'bg-white text-blue-600 shadow-md'
                : theme === 'dark'
                ? 'text-gray-400 hover:text-gray-300'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsSignUp(true)}
            className={`flex-1 py-2.5 rounded-lg transition-all duration-300 font-medium ${
              isSignUp
                ? theme === 'dark'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'bg-white text-blue-600 shadow-md'
                : theme === 'dark'
                ? 'text-gray-400 hover:text-gray-300'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 ${
                  theme === 'dark'
                    ? 'bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                }`}
                placeholder="Enter your full name"
              />
            </div>
          )}

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 ${
                theme === 'dark'
                  ? 'bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
              }`}
              placeholder="your.email@example.com"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Password
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 ${
                theme === 'dark'
                  ? 'bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
              }`}
              placeholder="Enter your password"
            />
          </div>

          {isSignUp && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                I am a
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 ${
                  theme === 'dark'
                    ? 'bg-gray-900/50 border-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                }`}
              >
                <option value="CONTRIBUTOR">Contributor</option>
                <option value="REVIEWER">Reviewer</option>
              </select>
              {formData.role === 'REVIEWER' && (
                <p className={`text-xs mt-2 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Note: Reviewer accounts require admin approval
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm animate-shake">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-500/10 border border-green-500/50 text-green-600 dark:text-green-400 p-3 rounded-lg text-sm">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || authLoading}
            className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
              submitting || authLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : theme === 'dark'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            {submitting || authLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Please wait...
              </span>
            ) : (
              isSignUp ? 'Create Account' : 'Sign In'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className={`mt-6 text-center text-xs ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className={`font-medium underline hover:no-underline ${
              theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
            }`}
          >
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </div>
      </div>
    </div>
  )
}
