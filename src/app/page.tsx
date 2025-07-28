'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { 
  Fish, 
  TrendingUp, 
  Package, 
  Users, 
  ShoppingCart, 
  Calendar,
  BarChart3,
  Activity,
  MapPin,
  Clock,
  Plus,
  Eye,
  FileText,
  Truck
} from 'lucide-react'
import Link from 'next/link'
import WelcomeBanner from '@/components/dashboard/WelcomeBanner'
import StatsCard from '@/components/dashboard/StatsCard'
import QuickActionCard from '@/components/dashboard/QuickActionCard'


interface DashboardStats {
  totalKoi: number
  totalSales: number
  pendingShipments: number
  totalCustomers: number
  recentActivity: number
  todaysSales: number
}


const page = () => {
  const { user, loading, isAdmin } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalKoi: 0,
    totalSales: 0,
    pendingShipments: 0,
    totalCustomers: 0,
    recentActivity: 0,
    todaysSales: 0
  })
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoadingStats(true)
        
        // Fetch koi count
        const koiResponse = await fetch('/api/koi')
        const koiData = await koiResponse.json()
        
        // Fetch customers count
        const customersResponse = await fetch('/api/customers')
        const customersData = await customersResponse.json()
        
        // Fetch recent sales for today's sales calculation
        const today = new Date().toISOString().split('T')[0]
        const salesResponse = await fetch(`/api/koi/sales?start=${today}&end=${today}`)
        const salesData = await salesResponse.json()
        
        // Calculate stats
        const totalKoi = koiData?.length || 0
        const pendingShipments = koiData?.filter((koi: any) => koi.date && !koi.shipped)?.length || 0
        const totalCustomers = customersData?.length || 0
        const todaysSalesAmount = salesData?.reduce((sum: number, sale: any) => 
          sum + (sale.jpy_total_sale || 0), 0) || 0
        
        setStats({
          totalKoi,
          totalSales: todaysSalesAmount,
          pendingShipments,
          totalCustomers,
          recentActivity: salesData?.length || 0,
          todaysSales: todaysSalesAmount
        })
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        setLoadingStats(false)
      }
    }

    if (!loading && user) {
      fetchDashboardStats()
    }
  }, [user, loading])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Please log in to access the dashboard
          </h1>
          <Link 
            href="/auth/login"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    )
  }
  const displayName = user.full_name || 'User'
  const displayRole = user.role === 'admin' ? 'Administrator' : 'Assistant'
  
  const quickActions = [
    {
      title: 'Add New Koi',
      description: 'Bulk upload or add individual koi to inventory',
      icon: Plus,
      href: '/koi/bulk-add',
      color: 'green' as const
    },
    {
      title: 'View Koi Inventory',
      description: 'Browse and manage your koi collection',
      icon: Eye,
      href: '/koi/view',
      color: 'blue' as const
    },
    {
      title: 'Sales Reports',
      description: 'View sales analytics and generate reports',
      icon: BarChart3,
      href: '/reports/sales',
      color: 'purple' as const
    },
    {
      title: 'Shipping Management',
      description: 'Manage shipments and tracking',
      icon: Truck,
      href: '/reports/shipping-list',
      color: 'orange' as const
    }
  ]

  return (
    <div className="p-6 space-y-6" >
      <WelcomeBanner userName={displayName} userRole={displayRole} />
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatsCard
          title="Total Koi"
          value={loadingStats ? "..." : stats.totalKoi.toLocaleString()}
          icon={Fish}
          description="In inventory"
          color="blue"
        />
        <StatsCard
          title="Today's Sales"
          value={loadingStats ? "..." : `¥${stats.todaysSales.toLocaleString()}`}
          icon={TrendingUp}
          description="Revenue today"
          color="green"
        />
        <StatsCard
          title="Pending Shipments"
          value={loadingStats ? "..." : stats.pendingShipments.toLocaleString()}
          icon={Package}
          description="Ready to ship"
          color="orange"
        />
        <StatsCard
          title="Total Customers"
          value={loadingStats ? "..." : stats.totalCustomers.toLocaleString()}
          icon={Users}
          description="Active customers"
          color="purple"
        />
        <StatsCard
          title="Today's Activity"
          value={loadingStats ? "..." : stats.recentActivity.toLocaleString()}
          icon={Activity}
          description="Sales today"
          color="indigo"
        />
        <StatsCard
          title="System Status"
          value="Online"
          icon={Clock}
          description="All systems operational"
          color="green"
        />
      </div>      
      
      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <QuickActionCard
              key={index}
              title={action.title}
              description={action.description}
              icon={action.icon}
              href={action.href}
              color={action.color}
            />
          ))}        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-32">
      
        {/* Popular Features */}
        <div className="bg-white dark:bg-gray-dark rounded-xl shadow-card p-6 border border-stroke dark:border-dark-3">          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Popular Features</h3>
            <BarChart3 className="w-5 h-5 text-gray-500" />
          </div>
          <div className="space-y-3">
            <Link 
              href="/koi/view" 
              className="flex items-center justify-between py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg px-3 -mx-3 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Fish className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Koi Management</span>
              </div>
              <span className="text-xs text-gray-500">View →</span>
            </Link>
            <Link 
              href="/reports/sales" 
              className="flex items-center justify-between py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg px-3 -mx-3 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Sales Reports</span>
              </div>
              <span className="text-xs text-gray-500">View →</span>
            </Link>
            <Link 
              href="/customers" 
              className="flex items-center justify-between py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg px-3 -mx-3 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Users className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Customer Management</span>
              </div>
              <span className="text-xs text-gray-500">View →</span>
            </Link>
            <Link 
              href="/reports/shipping-list" 
              className="flex items-center justify-between py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg px-3 -mx-3 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Truck className="w-4 h-4 text-orange-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Shipping</span>
              </div>
              <span className="text-xs text-gray-500">View →</span>
            </Link>
          </div>
        </div>

        {/* Admin-only section */}
      {isAdmin() && (
        <div className="bg-white dark:bg-gray-dark rounded-xl shadow-card p-6 border border-stroke dark:border-dark-3">          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Administrator Tools</h3>
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              href="/users" 
              className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Users className="w-5 h-5 text-red-600" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">User Management</p>
                <p className="text-xs text-gray-500">Manage user accounts</p>
              </div>
            </Link>
            <Link 
              href="/configurations" 
              className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <FileText className="w-5 h-5 text-red-600" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Configurations</p>
                <p className="text-xs text-gray-500">System settings</p>
              </div>
            </Link>
            <Link 
              href="/debug" 
              className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Activity className="w-5 h-5 text-red-600" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Debug Info</p>
                <p className="text-xs text-gray-500">System diagnostics</p>
              </div>
            </Link>
          </div>
        </div>
      )}
      </div>

      
    </div>
  )
}

export default page