import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { expect as chaiExpect } from 'chai'
import sinon from 'sinon'
import DataExchangesTab from '@/pages/DataExchangesTab'
import * as apiModule from '@/services/api'
import { toast } from 'sonner'

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
  },
}))

describe('DataExchangesTab Component', () => {
  let apiServiceStub: sinon.SinonStub

  beforeEach(() => {
    vi.clearAllMocks()
    sinon.restore()
  })

  const mockExchanges = Array.from({ length: 10 }, (_, i) => ({
    _id: `exchange-${i}`,
    status: i % 2 === 0 ? 'completed' : 'pending',
    contract: `https://contract.com/contract-${i}`,
    createdAt: new Date().toISOString(),
    providerParams: { name: `Provider${i}` },
    consumerParams: { name: `Consumer${i}` },
  }))

  it('should render data exchanges tab', () => {
    apiServiceStub = sinon.stub(apiModule.apiService, 'getDataExchanges').resolves([])

    render(<DataExchangesTab />)

    expect(screen.getByText('Data Exchanges')).toBeInTheDocument()
    expect(screen.getByText(/View all data exchanges/i)).toBeInTheDocument()
  })

  it('should load data exchanges on mount', async () => {
    apiServiceStub = sinon.stub(apiModule.apiService, 'getDataExchanges').resolves(mockExchanges)

    render(<DataExchangesTab />)

    await waitFor(() => {
      chaiExpect(apiServiceStub.calledOnce).to.be.true
      expect(toast.success).toHaveBeenCalledWith(`Loaded ${mockExchanges.length} data exchange(s)`)
    })
  })

  it('should display data exchanges in table', async () => {
    apiServiceStub = sinon.stub(apiModule.apiService, 'getDataExchanges').resolves(mockExchanges.slice(0, 5))

    render(<DataExchangesTab />)

    await waitFor(() => {
      expect(screen.getByText(/ID: exchange-0/i)).toBeInTheDocument()
    })
    
    // Check for multiple status elements
    const statusElements = screen.getAllByText(/Status:/i)
    expect(statusElements.length).toBeGreaterThan(0)
  })

  it('should handle pagination', async () => {
    apiServiceStub = sinon.stub(apiModule.apiService, 'getDataExchanges').resolves(mockExchanges)

    render(<DataExchangesTab />)

    await waitFor(() => {
      expect(screen.getByText(/ID: exchange-0/i)).toBeInTheDocument()
    })

    // Should show 5 items per page
    expect(screen.queryByText(/ID: exchange-5/i)).not.toBeInTheDocument()

    // Click next page
    const nextButton = screen.getByRole('button', { name: /Next/i })
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText(/ID: exchange-5/i)).toBeInTheDocument()
      expect(screen.queryByText(/ID: exchange-0/i)).not.toBeInTheDocument()
    })
  })

  it('should open modal when clicking view details', async () => {
    apiServiceStub = sinon.stub(apiModule.apiService, 'getDataExchanges').resolves(mockExchanges.slice(0, 5))

    render(<DataExchangesTab />)

    await waitFor(() => {
      expect(screen.getByText(/ID: exchange-0/i)).toBeInTheDocument()
    })

    const viewButton = screen.getAllByRole('button', { name: /View Details/i })[0]
    fireEvent.click(viewButton)

    await waitFor(() => {
      expect(screen.getByText('Data Exchange Details')).toBeInTheDocument()
      expect(screen.getByText(/"_id": "exchange-0"/i)).toBeInTheDocument()
    })
  })

  it('should close modal', async () => {
    apiServiceStub = sinon.stub(apiModule.apiService, 'getDataExchanges').resolves(mockExchanges.slice(0, 5))

    render(<DataExchangesTab />)

    await waitFor(() => {
      expect(screen.getByText(/ID: exchange-0/i)).toBeInTheDocument()
    })

    const viewButton = screen.getAllByRole('button', { name: /View Details/i })[0]
    fireEvent.click(viewButton)

    await waitFor(() => {
      expect(screen.getByText('Data Exchange Details')).toBeInTheDocument()
    })

    // Close by clicking the X button or clicking outside
    fireEvent.keyDown(screen.getByText('Data Exchange Details'), { key: 'Escape' })

    await waitFor(() => {
      expect(screen.queryByText('Data Exchange Details')).not.toBeInTheDocument()
    })
  })

  it('should handle empty data exchanges', async () => {
    apiServiceStub = sinon.stub(apiModule.apiService, 'getDataExchanges').resolves([])

    render(<DataExchangesTab />)

    await waitFor(() => {
      expect(toast.info).toHaveBeenCalledWith('No data exchanges found')
      expect(screen.getByText(/No data exchanges found/i)).toBeInTheDocument()
    })
  })

  it('should handle load error', async () => {
    apiServiceStub = sinon.stub(apiModule.apiService, 'getDataExchanges').rejects({
      message: 'Failed to load exchanges',
    })

    render(<DataExchangesTab />)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to load exchanges')
    })
  })

  it('should disable pagination buttons correctly', async () => {
    apiServiceStub = sinon.stub(apiModule.apiService, 'getDataExchanges').resolves(mockExchanges)

    render(<DataExchangesTab />)

    await waitFor(() => {
      expect(screen.getByText(/ID: exchange-0/i)).toBeInTheDocument()
    })

    const previousButton = screen.getByRole('button', { name: /Previous/i })
    const nextButton = screen.getByRole('button', { name: /Next/i })

    // On first page, previous should be disabled
    expect(previousButton).toBeDisabled()
    expect(nextButton).not.toBeDisabled()

    // Go to last page
    fireEvent.click(nextButton)
    
    await waitFor(() => {
      expect(screen.getByText(/ID: exchange-5/i)).toBeInTheDocument()
    })

    // On last page, next should be disabled
    expect(nextButton).toBeDisabled()
    expect(previousButton).not.toBeDisabled()
  })

  it('should show correct page information', async () => {
    apiServiceStub = sinon.stub(apiModule.apiService, 'getDataExchanges').resolves(mockExchanges)

    render(<DataExchangesTab />)

    await waitFor(() => {
      expect(screen.getByText(/Page 1 of 2/i)).toBeInTheDocument()
    })
  })
})
