import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { expect as chaiExpect } from 'chai'
import sinon from 'sinon'
import Login from '@/pages/Login'
import * as apiModule from '@/services/api'
import { toast } from 'sonner'

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('Login Component', () => {
  let apiServiceStub: sinon.SinonStub

  beforeEach(() => {
    vi.clearAllMocks()
    sinon.restore()
    mockNavigate.mockClear()
  })

  const renderLogin = () => {
    return render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )
  }

  it('should render login form', () => {
    renderLogin()

    expect(screen.getByText('PDC Dashboard Login')).toBeInTheDocument()
    expect(screen.getByLabelText(/Secret Key/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Service Key/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument()
  })

  it('should show validation error when fields are empty', async () => {
    renderLogin()

    const submitButton = screen.getByRole('button', { name: /Login/i })
    
    // Clear the default required attribute behavior by using preventDefault
    const form = submitButton.closest('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByText(/Secret Key is required/i)).toBeInTheDocument()
    })
  })

  it('should call login API with correct credentials', async () => {
    apiServiceStub = sinon.stub(apiModule.apiService, 'login').resolves({
      content: { token: 'test-token' },
    })

    renderLogin()

    const secretKeyInput = screen.getByLabelText(/Secret Key/i)
    const serviceKeyInput = screen.getByLabelText(/Service Key/i)
    const submitButton = screen.getByRole('button', { name: /Login/i })

    fireEvent.change(secretKeyInput, { target: { value: 'test-secret' } })
    fireEvent.change(serviceKeyInput, { target: { value: 'test-service-key' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      chaiExpect(apiServiceStub.calledOnce).to.be.true
      chaiExpect(apiServiceStub.calledWith('test-secret', 'test-service-key')).to.be.true
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('should show error message on login failure', async () => {
    apiServiceStub = sinon.stub(apiModule.apiService, 'login').rejects({
      message: 'Invalid credentials',
    })

    renderLogin()

    const secretKeyInput = screen.getByLabelText(/Secret Key/i)
    const serviceKeyInput = screen.getByLabelText(/Service Key/i)
    const submitButton = screen.getByRole('button', { name: /Login/i })

    fireEvent.change(secretKeyInput, { target: { value: 'wrong-secret' } })
    fireEvent.change(serviceKeyInput, { target: { value: 'wrong-key' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument()
    })
  })

  it('should show loading state and disable button', async () => {
    apiServiceStub = sinon.stub(apiModule.apiService, 'login').returns(
      new Promise(resolve => setTimeout(resolve, 100))
    )

    renderLogin()

    const secretKeyInput = screen.getByLabelText(/Secret Key/i) as HTMLInputElement
    const serviceKeyInput = screen.getByLabelText(/Service Key/i) as HTMLInputElement
    const submitButton = screen.getByRole('button', { name: /Login/i }) as HTMLButtonElement

    fireEvent.change(secretKeyInput, { target: { value: 'test-secret' } })
    fireEvent.change(serviceKeyInput, { target: { value: 'test-service-key' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/Logging in.../i)).toBeInTheDocument()
      expect(submitButton.disabled).toBe(true)
    })
  })
})
