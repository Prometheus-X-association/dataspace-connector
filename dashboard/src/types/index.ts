// Common types used across the application

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
