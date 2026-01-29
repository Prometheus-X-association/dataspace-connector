import { useState, useEffect } from 'react'
import { apiService } from '@/services/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

export default function ConfigurationTab() {
  const [config, setConfig] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const loadConfiguration = async () => {
    setLoading(true)
    try {
      const data = await apiService.getConfiguration()
      setConfig(JSON.stringify(data, null, 2))
      toast.success('Configuration loaded successfully')
    } catch (error) {
      console.error('Load configuration error:', error)
      
      const errorMessage = error && typeof error === 'object' && 'message' in error
        ? (error.message as string)
        : 'Failed to load configuration'
      
      toast.error(errorMessage)
      setConfig('// Error loading configuration. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const reloadConfiguration = async () => {
    setLoading(true)
    try {
      const data = await apiService.getConfiguration()
      setConfig(JSON.stringify(data, null, 2))
      toast.success('Configuration refreshed')
    } catch (error) {
      console.error('Reload configuration error:', error)
      
      const errorMessage = error && typeof error === 'object' && 'message' in error
        ? (error.message as string)
        : 'Failed to reload configuration'
      
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const validateAndSave = async () => {
    try {
      // Validate JSON
      if (!config.trim()) {
        toast.error('Configuration cannot be empty')
        return
      }

      let parsed
      try {
        parsed = JSON.parse(config)
      } catch (syntaxError) {
        console.error('JSON parse error:', syntaxError)
        toast.error('Invalid JSON syntax. Please check your configuration.')
        return
      }
      
      setSaving(true)
      await apiService.updateConfiguration(parsed)
      toast.success('Configuration updated successfully')
      await loadConfiguration()
    } catch (error) {
      console.error('Update configuration error:', error)
      
      const errorMessage = error && typeof error === 'object' && 'message' in error
        ? (error.message as string)
        : 'Failed to update configuration'
      
      toast.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    loadConfiguration()
  }, [])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>
              View and edit the configuration file
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={reloadConfiguration}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
            <Button
              onClick={validateAndSave}
              disabled={saving || loading}
            >
              {saving ? 'Saving...' : 'Update Configuration'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Textarea
          value={config}
          onChange={(e) => setConfig(e.target.value)}
          className="font-mono text-sm min-h-[500px]"
          placeholder="Loading configuration..."
          disabled={loading}
        />
      </CardContent>
    </Card>
  )
}
