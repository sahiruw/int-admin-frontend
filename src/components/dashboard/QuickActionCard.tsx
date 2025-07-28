import { cn } from "@/lib/utils"
import Link from "next/link"


const QuickActionCard = ({ 
  title, 
  description, 
  icon: Icon, 
  href, 
  color = 'blue'
}: {
  title: string
  description: string
  icon: any
  href: string
  color?: 'blue' | 'green' | 'purple' | 'orange'
}) => {
  const colorClasses = {
    blue: 'border-blue-200 hover:border-blue-300 dark:border-blue-800 dark:hover:border-blue-700',
    green: 'border-green-200 hover:border-green-300 dark:border-green-800 dark:hover:border-green-700',
    purple: 'border-purple-200 hover:border-purple-300 dark:border-purple-800 dark:hover:border-purple-700',
    orange: 'border-orange-200 hover:border-orange-300 dark:border-orange-800 dark:hover:border-orange-700'
  }

  return (
    <Link href={href}>
      <div className={cn(
        "bg-white dark:bg-gray-dark rounded-xl shadow-card p-6 border-2 transition-all duration-200 hover:shadow-card-2 group",
        colorClasses[color]
      )}>
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default QuickActionCard