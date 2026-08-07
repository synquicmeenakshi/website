import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { YantraMark } from '../components/Brand'
import { createAdminSession } from '../utils/cookies'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'

const Login = () => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }

      // Store authentication data
      localStorage.setItem('admin_token', data.data.token)
      localStorage.setItem('admin_api_key', data.data.apiKey)
      localStorage.setItem('admin_email', data.data.admin.email)
      localStorage.setItem('admin_name', data.data.admin.name)

      // Create session cookie (for backward compatibility)
      createAdminSession(data.data.admin.email)

      // Navigate to dashboard
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--ivory)] flex flex-col items-center justify-center px-4">
      {/* Masthead, set as the website sets it */}
      <div className="text-center mb-7">
        <div className="flex justify-center mb-3">
          <YantraMark width={44} height={44} className="text-[var(--saffron)]" />
        </div>
        <h1
          className="text-[var(--ink)]"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '30px', fontWeight: 500,
            letterSpacing: '0.18em', textTransform: 'uppercase', lineHeight: 1,
          }}
        >
          Meenakshi
        </h1>
        <p className="text-[var(--ink-soft)] mt-2"
          style={{ fontSize: '9px', letterSpacing: '0.32em', textTransform: 'uppercase' }}>
          Sacred Sciences
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white rounded-[var(--radius)] border border-[var(--hairline)] p-7">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-[var(--ink)] mb-2"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '25px', fontWeight: 500 }}>
            Admin Portal
          </h2>
          <p className="text-[13px] text-[var(--ink-soft)]">
            Enter your credentials to manage consultations and site content.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-500 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Email/Username Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username or Email
            </label>
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your username or email"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#d4531d]/20 focus:border-[rgba(212,83,29,0.45)] transition"
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#d4531d]/20 focus:border-[rgba(212,83,29,0.45)] transition pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--saffron)] text-white py-3 rounded-lg text-sm font-medium hover:shadow-lg hover:transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        {/* Forgot Password Link */}
        {/* <div className="text-center mt-5">
          <a href="#" className="text-sm text-gray-500 hover:text-gray-700 transition">
            Forgot Password?
          </a>
        </div> */}
      </div>

      {/* Footer */}
      <p className="text-sm text-gray-400 mt-8">
        © {new Date().getFullYear()} Meenakshi
      </p>
    </div>
  )
}

export default Login
