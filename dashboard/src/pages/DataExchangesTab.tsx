import { useState, useEffect } from 'react'
import { apiService } from '@/services/api'
import { DataExchange } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

export default function DataExchangesTab() {
  const [exchanges, setExchanges] = useState<DataExchange[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [selectedExchange, setSelectedExchange] = useState<DataExchange | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  
  const itemsPerPage = 5

  const loadExchanges = async () => {
    setLoading(true)
    try {
      const data = await apiService.getDataExchanges()
      
      if (!data) {
        setExchanges([])
        toast.info('No data exchanges available')
        return
      }

      const exchangeArray = Array.isArray(data) ? data : []
      setExchanges(exchangeArray)
      
      if (exchangeArray.length === 0) {
        toast.info('No data exchanges found')
      } else {
        toast.success(`Loaded ${exchangeArray.length} data exchange(s)`)
      }
    } catch (error) {
      console.error('Load exchanges error:', error)
      
      const errorMessage = error && typeof error === 'object' && 'message' in error
        ? (error.message as string)
        : 'Failed to load data exchanges'
      
      toast.error(errorMessage)
      setExchanges([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadExchanges()
  }, [])

  const paginatedExchanges = exchanges.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  )

  const totalPages = Math.ceil(exchanges.length / itemsPerPage)

  const handleExchangeClick = (exchange: DataExchange) => {
    setSelectedExchange(exchange)
    setDialogOpen(true)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Data Exchanges</CardTitle>
              <CardDescription>
                View all data exchanges ({exchanges.length} total)
              </CardDescription>
            </div>
            <Button onClick={loadExchanges} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading data exchanges...
            </div>
          ) : exchanges.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No data exchanges found
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {paginatedExchanges.map((exchange) => (
                  <div
                    key={exchange._id}
                    onClick={() => handleExchangeClick(exchange)}
                    className="p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">ID: {exchange._id}</p>
                        {exchange.status && (
                          <p className="text-sm text-muted-foreground">
                            Status: {exchange.status}
                          </p>
                        )}
                        {exchange.createdAt && (
                          <p className="text-sm text-muted-foreground">
                            Created: {new Date(exchange.createdAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <Button variant="ghost" size="sm">
                        View Details →
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                    disabled={currentPage === 0}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage + 1} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                    disabled={currentPage === totalPages - 1}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Data Exchange Details</DialogTitle>
            <DialogDescription>
              Complete information about this data exchange
            </DialogDescription>
          </DialogHeader>
          {selectedExchange && (
            <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
              {JSON.stringify(selectedExchange, null, 2)}
            </pre>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
