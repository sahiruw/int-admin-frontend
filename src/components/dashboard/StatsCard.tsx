import { cn } from "@/lib/utils"



const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  description, 
  color = 'blue' 
}: {
  title: string
  value: string | number
  icon: any
  trend?: string
  description?: string
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo'
}) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 text-blue-600 bg-blue-50 dark:bg-blue-950',
    green: 'from-green-500 to-green-600 text-green-600 bg-green-50 dark:bg-green-950',
    purple: 'from-purple-500 to-purple-600 text-purple-600 bg-purple-50 dark:bg-purple-950',
    orange: 'from-orange-500 to-orange-600 text-orange-600 bg-orange-50 dark:bg-orange-950',
    red: 'from-red-500 to-red-600 text-red-600 bg-red-50 dark:bg-red-950',
    indigo: 'from-indigo-500 to-indigo-600 text-indigo-600 bg-indigo-50 dark:bg-indigo-950'
  }

  return (
    <div className="bg-white dark:bg-gray-dark rounded-xl shadow-card p-6 border border-stroke dark:border-dark-3">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</p>
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-500">{description}</p>
          )}
          {trend && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">{trend}</p>
          )}
        </div>
        <div className={cn(
          "w-12 h-12 rounded-lg flex items-center justify-center",
          colorClasses[color]
        )}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}
export default StatsCard