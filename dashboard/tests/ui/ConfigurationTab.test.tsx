import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { expect as chaiExpect } from 'chai'
import sinon from 'sinon'
import ConfigurationTab from '@/pages/ConfigurationTab'
import * as apiModule from '@/services/api'
import { toast } from 'sonner'

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
  },
}))

describe('ConfigurationTab Component', () => {
  let apiServiceStub: sinon.SinonStub

  beforeEach(() => {
    vi.clearAllMocks()
    sinon.restore()
  })

  const mockConfig = {
    endpoint: 'https://example.com',
    serviceKey: 'test-key',
    secretKey: 'test-secret',
  }

  it('should render configuration tab', () => {
    apiServiceStub = sinon.stub(apiModule.apiService, 'getConfiguration').resolves(mockConfig)

    render(<ConfigurationTab />)

    expect(screen.getByText('Configuration')).toBeInTheDocument()
    expect(screen.getByText(/View and edit the configuration file/i)).toBeInTheDocument()
  })

  it('should load configuration on mount', async () => {
    apiServiceStub = sinon.stub(apiModule.apiService, 'getConfiguration').resolves(mockConfig)

    render(<ConfigurationTab />)

    await waitFor(() => {
      chaiExpect(apiServiceStub.calledOnce).to.be.true
      expect(toast.success).toHaveBeenCalledWith('Configuration loaded successfully')
    })
  })

  it('should display configuration in textarea', async () => {
    apiServiceStub = sinon.stub(apiModule.apiService, 'getConfiguration').resolves(mockConfig)

    render(<ConfigurationTab />)

    await waitFor(() => {
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
      const value = JSON.parse(textarea.value)
      chaiExpect(value).to.deep.equal(mockConfig)
    })
  })

  it('should handle configuration load error', async () => {
    apiServiceStub = sinon.stub(apiModule.apiService, 'getConfiguration').rejects({
      message: 'Failed to load',
    })

    render(<ConfigurationTab />)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to load')
    })
  })

  it('should update configuration successfully', async () => {
    sinon.stub(apiModule.apiService, 'getConfiguration').resolves(mockConfig)
    const updateStub = sinon.stub(apiModule.apiService, 'updateConfiguration').resolves(mockConfig)

    render(<ConfigurationTab />)

    await waitFor(() => {
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
    const newConfig = { ...mockConfig, endpoint: 'https://new-endpoint.com' }
    
    fireEvent.change(textarea, { target: { value: JSON.stringify(newConfig, null, 2) } })
    
    const updateButton = screen.getByRole('button', { name: /Update Configuration/i })
    fireEvent.click(updateButton)

    await waitFor(() => {
      chaiExpect(updateStub.calledOnce).to.be.true
      expect(toast.success).toHaveBeenCalledWith('Configuration updated successfully')
    })
  })

  it('should show error for invalid JSON', async () => {
    sinon.stub(apiModule.apiService, 'getConfiguration').resolves(mockConfig)

    render(<ConfigurationTab />)

    await waitFor(() => {
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: 'invalid json' } })
    
    const updateButton = screen.getByRole('button', { name: /Update Configuration/i })
    fireEvent.click(updateButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Invalid JSON'))
    })
  })

  it('should refresh configuration', async () => {
    const getConfigStub = sinon.stub(apiModule.apiService, 'getConfiguration')
    getConfigStub.onFirstCall().resolves(mockConfig)
    getConfigStub.onSecondCall().resolves({ ...mockConfig, endpoint: 'https://refreshed.com' })

    render(<ConfigurationTab />)

    await waitFor(() => {
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    const refreshButton = screen.getByRole('button', { name: /Refresh/i })
    fireEvent.click(refreshButton)

    await waitFor(() => {
      chaiExpect(getConfigStub.calledTwice).to.be.true
      expect(toast.success).toHaveBeenCalledWith('Configuration refreshed')
    })
  })

  it('should disable buttons while loading', async () => {
    sinon.stub(apiModule.apiService, 'getConfiguration').returns(
      new Promise(resolve => setTimeout(() => resolve(mockConfig), 100))
    )

    render(<ConfigurationTab />)

    const refreshButton = screen.getByRole('button', { name: /Loading.../i })
    expect(refreshButton).toBeDisabled()
  })
})
