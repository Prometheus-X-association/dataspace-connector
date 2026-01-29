import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { expect as chaiExpect } from 'chai'
import sinon from 'sinon'
import ProtectedRoute from '@/components/ProtectedRoute'
import * as apiModule from '@/services/api'

describe('ProtectedRoute Component', () => {
  let isAuthenticatedStub: sinon.SinonStub

  beforeEach(() => {
    sinon.restore()
  })

  const renderProtectedRoute = (isAuthenticated: boolean) => {
    isAuthenticatedStub = sinon.stub(apiModule.apiService, 'isAuthenticated').returns(isAuthenticated)

    return render(
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </BrowserRouter>
    )
  }

  it('should render children when authenticated', () => {
    renderProtectedRoute(true)

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
    chaiExpect(isAuthenticatedStub.calledOnce).to.be.true
  })

  it('should redirect to login when not authenticated', () => {
    renderProtectedRoute(false)

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    expect(screen.getByText('Login Page')).toBeInTheDocument()
    chaiExpect(isAuthenticatedStub.called).to.be.true
  })
})
