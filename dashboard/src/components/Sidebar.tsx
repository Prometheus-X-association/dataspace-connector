import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navigationItems = [
  { name: 'Dashboard', icon: '📊', path: '/' },
  { name: 'Analytics', icon: '📈', path: '/analytics' },
  { name: 'Users', icon: '👥', path: '/users' },
  { name: 'Settings', icon: '⚙️', path: '/settings' },
]

export default function Sidebar() {
  const [activeItem, setActiveItem] = useState('Dashboard')

  return (
    <div className="flex flex-col w-64 bg-gray-900 border-r">
      <div className="flex items-center justify-center h-16 border-b border-gray-800">
        <span className="text-white font-bold text-xl">PDC Dashboard</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigationItems.map((item) => (
          <Button
            key={item.name}
            variant="ghost"
            onClick={() => setActiveItem(item.name)}
            className={cn(
              "w-full justify-start text-left font-normal",
              activeItem === item.name
                ? 'bg-gray-800 text-white hover:bg-gray-700 hover:text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            )}
          >
            <span className="text-xl mr-3">{item.icon}</span>
            <span>{item.name}</span>
          </Button>
        ))}
      </nav>
    </div>
  )
}
