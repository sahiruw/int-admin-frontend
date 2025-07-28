import { Fish } from "lucide-react"

const WelcomeBanner = ({ userName, userRole }: { userName: string, userRole: string }) => {
  const getCurrentGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 rounded-xl p-8 text-white mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">
            {getCurrentGreeting()}, {userName}!
          </h1>
          <p className="text-blue-100 dark:text-blue-200">
            Welcome to your Niigata Koi Global admin dashboard. You're logged in as {userRole}.
          </p>
        </div>
        <div className="hidden md:block">
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center">
            <Fish className="w-10 h-10 text-white" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default WelcomeBanner