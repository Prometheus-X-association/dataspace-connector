import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiService } from '@/services/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export default function Login() {
  const [secretKey, setSecretKey] = useState('')
  const [serviceKey, setServiceKey] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!secretKey.trim()) {
        throw { message: 'Secret Key is required' }
      }
      if (!serviceKey.trim()) {
        throw { message: 'Service Key is required' }
      }

      await apiService.login(secretKey, serviceKey)
      navigate('/dashboard')
    } catch (err: unknown) {
      console.error('Login error:', err)
      
      if (err && typeof err === 'object' && 'message' in err) {
        setError(err.message as string)
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Authentication failed. Please check your credentials and try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">PDC Dashboard Login</CardTitle>
          <CardDescription>
            Enter your credentials to access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="secretKey">Secret Key</Label>
              <Input
                id="secretKey"
                type="password"
                placeholder="Enter your secret key"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serviceKey">Service Key</Label>
              <Input
                id="serviceKey"
                type="text"
                placeholder="Enter your service key"
                value={serviceKey}
                onChange={(e) => setServiceKey(e.target.value)}
                required
              />
            </div>
            {error && (
              <div className="text-sm text-destructive">{error}</div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
