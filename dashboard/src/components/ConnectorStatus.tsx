import { useEffect, useState } from 'react'
import { apiService } from '@/services/api'

export default function ConnectorStatus() {
  const [isOnline, setIsOnline] = useState<boolean | null>(null)

  const checkStatus = async () => {
    try {
      const response = await apiService.checkHealth()
      setIsOnline(response.status === 200)
    } catch (error) {
      setIsOnline(false)
    }
  }

  useEffect(() => {
    // Initial check
    checkStatus()

    // Poll every 10 seconds
    const interval = setInterval(checkStatus, 10000)

    return () => clearInterval(interval)
  }, [])

  if (isOnline === null) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
        <span className="text-muted-foreground">Checking...</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <div
        className={`w-2 h-2 rounded-full ${
          isOnline ? 'bg-green-500' : 'bg-red-500'
        }`}
      />
      <span className="text-muted-foreground">
        Connector {isOnline ? 'Up' : 'Down'}
      </span>
    </div>
  )
}
