import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import znlogo from '../assets/znlogo.png'
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
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center px-4">
      {/* Logo Section */}
      <div className="text-center mb-8 mt-10">
        <div className="flex justify-center mb-2">
          <img src={znlogo} alt="ZenYourLife" className="w-12 h-12" />
        </div>
        <h1 className="text-xl font-semibold text-gray-800">ZenYourLife</h1>
        <p className="text-sm text-gray-500">Admin Panel</p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-6 -mt-5">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Login</h2>
          <p className="text-sm text-gray-500">
            Enter your credentials to access the booking<br />system.
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
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#DFB13B]/20 focus:border-[#DFB13B]/50 transition"
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
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#DFB13B]/20 focus:border-[#DFB13B]/50 transition pr-10"
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
            className="w-full bg-gradient-to-r from-[#DFB13B] to-[#C9A032] text-white py-3 rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-[#DFB13B]/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
        © 2024 ZenYourLife Admin
      </p>
    </div>
  )
}

export default Login
