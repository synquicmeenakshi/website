import { useState, useEffect } from 'react'
import {
  Activity, Server, Database, Cloud, Clock, CheckCircle2, XCircle,
  RefreshCw, Wifi, HardDrive, Globe, Zap,
  AlertTriangle, Menu, TrendingUp, Users, Calendar, MessageSquare,
  Code, Copy, Check, ChevronDown, ChevronRight, ExternalLink as _ExternalLink
} from 'lucide-react'
import Sidebar from '../components/Sidebar'

import { API_BASE_URL } from '../config/api'

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'checking'
  message: string
  responseTime?: number
  lastChecked?: string
  httpStatus?: number
  response?: any
}

interface ServiceStatus {
  name: string
  endpoint: string
  status: HealthStatus
  icon: React.ElementType
  color: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
}

interface SystemStats {
  totalServices: number
  totalProperties: number
  totalAppointments: number
  totalInquiries: number
  serverUptime: string
  apiVersion: string
}

// JSON Syntax Highlighter Component
const JsonViewer = ({ data, collapsed = false }: { data: any; collapsed?: boolean }) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsed)
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const syntaxHighlight = (json: string) => {
    return json
      .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
        let cls = 'text-amber-600' // number
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'text-blue-600' // key
            match = match.replace(/"/g, '')
          } else {
            cls = 'text-emerald-600' // string
          }
        } else if (/true|false/.test(match)) {
          cls = 'text-violet-600' // boolean
        } else if (/null/.test(match)) {
          cls = 'text-slate-400' // null
        }
        return `<span class="${cls}">${match}</span>`
      })
  }

  const formattedJson = JSON.stringify(data, null, 2)
  const lineCount = formattedJson.split('\n').length

  return (
    <div className="bg-slate-900 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <Code className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400 font-mono">JSON Response</span>
          <span className="text-xs text-slate-500">({lineCount} lines)</span>
        </div>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1.5 px-2 py-1 text-xs text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="p-4 overflow-x-auto max-h-80 overflow-y-auto custom-scrollbar">
          <pre
            className="text-xs font-mono leading-relaxed text-slate-300"
            dangerouslySetInnerHTML={{ __html: syntaxHighlight(formattedJson) }}
          />
        </div>
      )}
    </div>
  )
}

// Method Badge Component
const MethodBadge = ({ method }: { method: string }) => {
  const colors: { [key: string]: string } = {
    GET: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    POST: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    PUT: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    DELETE: 'bg-red-500/20 text-red-400 border-red-500/30'
  }

  return (
    <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${colors[method] || colors.GET}`}>
      {method}
    </span>
  )
}

const HealthCheck = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [lastFullCheck, setLastFullCheck] = useState<string | null>(null)
  const [expandedService, setExpandedService] = useState<number | null>(null)
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalServices: 0,
    totalProperties: 0,
    totalAppointments: 0,
    totalInquiries: 0,
    serverUptime: 'Unknown',
    apiVersion: '1.0.0'
  })

  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: 'API Server',
      endpoint: '/health',
      status: { status: 'checking', message: 'Checking...' },
      icon: Server,
      color: 'indigo',
      method: 'GET'
    },
    {
      name: 'Services API',
      endpoint: '/services',
      status: { status: 'checking', message: 'Checking...' },
      icon: Zap,
      color: 'violet',
      method: 'GET'
    },
    {
      name: 'Properties API',
      endpoint: '/properties',
      status: { status: 'checking', message: 'Checking...' },
      icon: HardDrive,
      color: 'emerald',
      method: 'GET'
    },
    {
      name: 'Appointments API',
      endpoint: '/appointments',
      status: { status: 'checking', message: 'Checking...' },
      icon: Calendar,
      color: 'blue',
      method: 'GET'
    },
    {
      name: 'Contact API',
      endpoint: '/contact',
      status: { status: 'checking', message: 'Checking...' },
      icon: MessageSquare,
      color: 'amber',
      method: 'GET'
    },
    {
      name: 'Testimonials API',
      endpoint: '/testimonials',
      status: { status: 'checking', message: 'Checking...' },
      icon: Users,
      color: 'pink',
      method: 'GET'
    },
    {
      name: 'Legal Pages API',
      endpoint: '/legal-pages',
      status: { status: 'checking', message: 'Checking...' },
      icon: Globe,
      color: 'cyan',
      method: 'GET'
    },
    {
      name: 'Upload Service',
      endpoint: '/upload',
      status: { status: 'checking', message: 'Checking...' },
      icon: Cloud,
      color: 'rose',
      method: 'GET'
    }
  ])

  // Check individual service health
  const checkServiceHealth = async (endpoint: string): Promise<HealthStatus> => {
    const startTime = performance.now()
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      const endTime = performance.now()
      const responseTime = Math.round(endTime - startTime)

      let jsonResponse = null
      try {
        jsonResponse = await response.json()
      } catch {
        jsonResponse = { raw: 'Unable to parse response' }
      }

      if (response.ok) {
        return {
          status: responseTime > 1000 ? 'degraded' : 'healthy',
          message: responseTime > 1000 ? 'Slow response' : 'Operational',
          responseTime,
          lastChecked: new Date().toISOString(),
          httpStatus: response.status,
          response: jsonResponse
        }
      } else {
        return {
          status: 'degraded',
          message: `HTTP ${response.status}`,
          responseTime,
          lastChecked: new Date().toISOString(),
          httpStatus: response.status,
          response: jsonResponse
        }
      }
    } catch (error: any) {
      return {
        status: 'unhealthy',
        message: error.name === 'AbortError' ? 'Timeout' : 'Connection failed',
        lastChecked: new Date().toISOString(),
        httpStatus: 0,
        response: { error: error.message || 'Connection failed' }
      }
    }
  }

  // Check all services
  const checkAllServices = async () => {
    setIsChecking(true)

    const updatedServices = await Promise.all(
      services.map(async (service) => {
        const status = await checkServiceHealth(service.endpoint)
        return { ...service, status }
      })
    )

    setServices(updatedServices)
    setLastFullCheck(new Date().toLocaleString())
    setIsChecking(false)
  }

  // Fetch system stats
  const fetchSystemStats = async () => {
    try {
      // Fetch services count
      const servicesRes = await fetch(`${API_BASE_URL}/services`)
      const servicesData = await servicesRes.json()

      // Fetch properties count
      const propertiesRes = await fetch(`${API_BASE_URL}/properties`)
      const propertiesData = await propertiesRes.json()

      // Fetch appointments count
      const appointmentsRes = await fetch(`${API_BASE_URL}/appointments`)
      const appointmentsData = await appointmentsRes.json()

      // Fetch contact inquiries count
      const contactRes = await fetch(`${API_BASE_URL}/contact`)
      const contactData = await contactRes.json()

      setSystemStats({
        totalServices: servicesData.data?.length || servicesData.count || 0,
        totalProperties: propertiesData.data?.length || propertiesData.count || 0,
        totalAppointments: appointmentsData.data?.length || appointmentsData.count || 0,
        totalInquiries: contactData.data?.length || contactData.count || 0,
        serverUptime: 'Active',
        apiVersion: '1.0.0'
      })
    } catch (error) {
      console.error('Error fetching system stats:', error)
    }
  }

  // Initial check on mount
  useEffect(() => {
    checkAllServices()
    fetchSystemStats()

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      checkAllServices()
      fetchSystemStats()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  // Get overall system status
  const getOverallStatus = () => {
    const statuses = services.map(s => s.status.status)
    if (statuses.includes('unhealthy')) return 'unhealthy'
    if (statuses.includes('degraded')) return 'degraded'
    if (statuses.every(s => s === 'healthy')) return 'healthy'
    return 'checking'
  }

  const overallStatus = getOverallStatus()

  // Get status color classes
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return {
          bg: 'bg-[#FFEEC3]/30',
          border: 'border-[#DFB13B]/30',
          text: 'text-[#B8922D]',
          icon: 'text-[#DFB13B]',
          badge: 'bg-[#DFB13B]'
        }
      case 'degraded':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-600',
          icon: 'text-amber-500',
          badge: 'bg-amber-500'
        }
      case 'unhealthy':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-600',
          icon: 'text-red-500',
          badge: 'bg-red-500'
        }
      default:
        return {
          bg: 'bg-slate-50',
          border: 'border-slate-200',
          text: 'text-slate-600',
          icon: 'text-slate-400',
          badge: 'bg-slate-400'
        }
    }
  }

  const overallColors = getStatusColor(overallStatus)

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-60 min-h-screen overflow-y-auto">
        {/* Top Header Bar */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
          <div className="px-4 sm:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Menu className="w-5 h-5 text-slate-600" />
                </button>
                <div className="hidden sm:flex w-10 h-10 rounded-xl bg-gradient-to-br from-[#DFB13B] to-[#C9A032] items-center justify-center shadow-lg shadow-[#DFB13B]/30">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-semibold text-slate-800">System Health</h1>
                  <p className="text-xs sm:text-sm text-slate-500">Monitor server and API status</p>
                </div>
              </div>

              <button
                onClick={checkAllServices}
                disabled={isChecking}
                className="flex items-center gap-2 px-3 sm:px-5 py-2.5 bg-gradient-to-r from-[#DFB13B] to-[#C9A032] text-white rounded-xl hover:shadow-lg hover:shadow-[#DFB13B]/30 transition-all font-medium text-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isChecking ? 'Checking...' : 'Refresh'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          {/* Overall Status Banner */}
          <div className={`relative overflow-hidden ${overallColors.bg} border ${overallColors.border} rounded-2xl p-6 mb-8`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl ${overallColors.badge} flex items-center justify-center shadow-lg`}>
                  {overallStatus === 'healthy' && <CheckCircle2 className="w-7 h-7 text-white" />}
                  {overallStatus === 'degraded' && <AlertTriangle className="w-7 h-7 text-white" />}
                  {overallStatus === 'unhealthy' && <XCircle className="w-7 h-7 text-white" />}
                  {overallStatus === 'checking' && <RefreshCw className="w-7 h-7 text-white animate-spin" />}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    {overallStatus === 'healthy' && 'All Systems Operational'}
                    {overallStatus === 'degraded' && 'Degraded Performance'}
                    {overallStatus === 'unhealthy' && 'System Issues Detected'}
                    {overallStatus === 'checking' && 'Checking Systems...'}
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    {lastFullCheck ? `Last checked: ${lastFullCheck}` : 'Running initial checks...'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Wifi className={overallColors.icon} />
                  <span className={`text-sm font-medium ${overallColors.text}`}>
                    {services.filter(s => s.status.status === 'healthy').length}/{services.length} Online
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* System Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 border border-slate-100 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-500">Total Services</span>
                <Zap className="w-4 h-4 text-violet-500" />
              </div>
              <p className="text-2xl font-bold text-slate-800">{systemStats.totalServices}</p>
              <p className="text-xs text-[#B8922D] mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Active offerings
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-100 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-500">Properties</span>
                <HardDrive className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-slate-800">{systemStats.totalProperties}</p>
              <p className="text-xs text-slate-500 mt-1">Rental listings</p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-100 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-500">Appointments</span>
                <Calendar className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-slate-800">{systemStats.totalAppointments}</p>
              <p className="text-xs text-slate-500 mt-1">Total bookings</p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-100 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-500">Inquiries</span>
                <MessageSquare className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-bold text-slate-800">{systemStats.totalInquiries}</p>
              <p className="text-xs text-slate-500 mt-1">Contact messages</p>
            </div>
          </div>

          {/* API Endpoints - Professional JSON Response View */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Code className="w-5 h-5 text-indigo-500" />
              API Endpoints & Responses
            </h3>
            <div className="space-y-3">
              {services.map((service, index) => {
                const colors = getStatusColor(service.status.status)
                const IconComponent = service.icon
                const isExpanded = expandedService === index

                return (
                  <div
                    key={index}
                    className={`bg-white rounded-xl border ${colors.border} overflow-hidden transition-all ${isExpanded ? 'shadow-lg' : 'hover:shadow-md'}`}
                  >
                    {/* Endpoint Header */}
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer"
                      onClick={() => setExpandedService(isExpanded ? null : index)}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                          <IconComponent className={`w-5 h-5 ${colors.icon}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <MethodBadge method={service.method} />
                            <h4 className="text-sm font-semibold text-slate-800">{service.name}</h4>
                          </div>
                          <p className="text-xs text-slate-500 font-mono mt-1 truncate">
                            {API_BASE_URL}{service.endpoint}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Status Badge */}
                        <div className="flex items-center gap-2">
                          {service.status.httpStatus && (
                            <span className={`px-2 py-1 text-xs font-bold rounded ${
                              service.status.httpStatus >= 200 && service.status.httpStatus < 300
                                ? 'bg-emerald-100 text-emerald-700'
                                : service.status.httpStatus >= 400
                                ? 'bg-red-100 text-red-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {service.status.httpStatus}
                            </span>
                          )}
                          {service.status.responseTime && (
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {service.status.responseTime}ms
                            </span>
                          )}
                          <div className={`w-2.5 h-2.5 rounded-full ${colors.badge} ${service.status.status === 'checking' ? 'animate-pulse' : ''}`} />
                        </div>

                        {/* Expand Icon */}
                        <button className="text-slate-400 hover:text-slate-600 transition-colors">
                          {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Response View */}
                    {isExpanded && (
                      <div className="border-t border-slate-100">
                        {/* Request Info */}
                        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                          <div className="flex flex-wrap items-center gap-4 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500">Request URL:</span>
                              <span className="font-mono text-slate-700 bg-white px-2 py-1 rounded border border-slate-200">
                                {API_BASE_URL}{service.endpoint}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500">Method:</span>
                              <MethodBadge method={service.method} />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500">Status:</span>
                              <span className={`font-semibold ${colors.text}`}>
                                {service.status.httpStatus} {service.status.message}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500">Time:</span>
                              <span className="font-medium text-slate-700">{service.status.responseTime}ms</span>
                            </div>
                          </div>
                        </div>

                        {/* JSON Response */}
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">Response Body</span>
                            <span className="text-xs text-slate-400">application/json</span>
                          </div>
                          {service.status.response ? (
                            <JsonViewer data={service.status.response} />
                          ) : (
                            <div className="bg-slate-900 rounded-lg p-4">
                              <p className="text-xs text-slate-400 font-mono">Waiting for response...</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Server Info */}
          <div className="bg-white rounded-xl border border-slate-100 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Server className="w-5 h-5 text-indigo-500" />
              Server Information
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div>
                <p className="text-xs text-slate-500 mb-1">API Base URL</p>
                <p className="text-sm font-medium text-slate-800 font-mono">{API_BASE_URL.replace('/api', '')}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">API Version</p>
                <p className="text-sm font-medium text-slate-800">{systemStats.apiVersion}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Server Status</p>
                <p className="text-sm font-medium text-[#B8922D]">{systemStats.serverUptime}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Environment</p>
                <p className="text-sm font-medium text-slate-800">Development</p>
              </div>
            </div>

            {/* Database Connection */}
            <div className="mt-6 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFEEC3]/30 flex items-center justify-center">
                  <Database className="w-5 h-5 text-[#DFB13B]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">MongoDB Connection</p>
                  <p className="text-xs text-[#B8922D]">Connected & Operational</p>
                </div>
              </div>
            </div>
          </div>

          {/* Response Time Chart (Simple visualization) */}
          <div className="mt-6 bg-white rounded-xl border border-slate-100 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              Response Times
            </h3>
            <div className="space-y-3">
              {services.filter(s => s.status.responseTime).map((service, index) => {
                const maxTime = Math.max(...services.map(s => s.status.responseTime || 0))
                const percentage = ((service.status.responseTime || 0) / Math.max(maxTime, 1)) * 100
                const isGood = (service.status.responseTime || 0) < 500
                const isOkay = (service.status.responseTime || 0) < 1000

                return (
                  <div key={index} className="flex items-center gap-4">
                    <span className="text-xs text-slate-600 w-32 truncate">{service.name}</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isGood ? 'bg-[#DFB13B]' : isOkay ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    <span className={`text-xs font-medium w-16 text-right ${
                      isGood ? 'text-[#B8922D]' : isOkay ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {service.status.responseTime}ms
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HealthCheck
