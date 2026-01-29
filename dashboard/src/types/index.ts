// Common types used across the application

export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user' | 'moderator'
  avatar?: string
}

export interface DashboardStats {
  totalUsers: number
  revenue: number
  activeSessions: number
  conversionRate: number
}

export interface Activity {
  id: string
  userId: string
  action: string
  timestamp: Date
  metadata?: Record<string, unknown>
}

export interface DataExchange {
  _id: string
  contract?: string
  purposeId?: string
  resourceId?: string
  serviceChainId?: string
  resources?: Array<{
    resource: string
    params?: Record<string, unknown>
  }>
  purposes?: Array<{
    resource: string
    params?: Record<string, unknown>
  }>
  providerParams?: Record<string, unknown>
  consumerParams?: Record<string, unknown>
  serviceChainParams?: Array<Record<string, unknown>>
  createdAt?: string
  updatedAt?: string
  status?: string
  [key: string]: unknown
}

export interface Configuration {
  [key: string]: unknown
}
