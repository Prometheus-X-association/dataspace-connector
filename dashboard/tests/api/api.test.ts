import { describe, it, expect, beforeEach, vi } from 'vitest'
import { expect as chaiExpect } from 'chai'
import { apiService } from '@/services/api'

// Simplify tests to test only the public API, not axios internals
describe('ApiService', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('Authentication', () => {
    it('should logout and clear token', () => {
      localStorage.setItem('authToken', 'test-token')
      localStorage.setItem('refreshToken', 'test-refresh-token')

      apiService.logout()

      expect(localStorage.getItem('authToken')).toBeNull()
      expect(localStorage.getItem('refreshToken')).toBeNull()
    })

    it('should check if user is authenticated', () => {
      expect(apiService.isAuthenticated()).toBe(false)
      
      localStorage.setItem('authToken', 'test-token')
      expect(apiService.isAuthenticated()).toBe(true)

      localStorage.removeItem('authToken')
      expect(apiService.isAuthenticated()).toBe(false)
    })
  })

  describe('Configuration', () => {
    it('should throw error when config is missing', async () => {
      try {
        await apiService.updateConfiguration(null)
        expect.fail('Should have thrown an error')
      } catch (error: any) {
        chaiExpect(error.message).to.equal('Configuration data is required')
      }
    })
  })

  describe('Data Exchanges', () => {
    it('should throw error when exchange ID is missing', async () => {
      try {
        await apiService.getDataExchangeById('')
        expect.fail('Should have thrown an error')
      } catch (error: any) {
        chaiExpect(error.message).to.equal('Exchange ID is required')
      }
    })
  })
})
