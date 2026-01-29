import { useNavigate } from 'react-router-dom'
import { apiService } from '@/services/api'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import ConfigurationTab from './ConfigurationTab'
import DataExchangesTab from './DataExchangesTab'

export default function Dashboard() {
  const navigate = useNavigate()

  const handleLogout = () => {
    apiService.logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">PDC Dashboard</h1>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="configuration" className="space-y-6">
          <TabsList>
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
            <TabsTrigger value="exchanges">Data Exchanges</TabsTrigger>
          </TabsList>

          <TabsContent value="configuration">
            <ConfigurationTab />
          </TabsContent>

          <TabsContent value="exchanges">
            <DataExchangesTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
