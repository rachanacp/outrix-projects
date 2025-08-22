import React, { useState, useEffect } from 'react';
import { 
  LogOut, 
  User, 
  Settings, 
  Home, 
  BarChart3, 
  FileText, 
  Bell,
  Search,
  Calendar,
  TrendingUp,
  Users,
  Activity
} from 'lucide-react';
import { User as UserType } from '../App';

interface DashboardProps {
  user: UserType;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const stats = [
    { label: 'Total Users', value: '12,345', change: '+12%', icon: Users, color: 'blue' },
    { label: 'Revenue', value: '$54,321', change: '+8%', icon: TrendingUp, color: 'green' },
    { label: 'Projects', value: '89', change: '+23%', icon: FileText, color: 'purple' },
    { label: 'Activity', value: '1,234', change: '+5%', icon: Activity, color: 'orange' },
  ];

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <Home className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">
                  {getGreeting()}, {user.name}!
                </h2>
                <p className="text-indigo-100 mb-4">
                  Welcome back to your dashboard. Here's what's happening today.
                </p>
                <div className="flex items-center text-indigo-100">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{currentTime.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <User className="w-12 h-12 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: Home },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'projects', label: 'Projects', icon: FileText },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Stats Grid */}
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                const colorClasses = {
                  blue: 'bg-blue-100 text-blue-600',
                  green: 'bg-green-100 text-green-600',
                  purple: 'bg-purple-100 text-purple-600',
                  orange: 'bg-orange-100 text-orange-600',
                };
                
                return (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-green-600 text-sm font-medium">{stat.change}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                    <p className="text-gray-600 text-sm">{stat.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {[
                  { action: 'New user registered', time: '2 minutes ago', type: 'success' },
                  { action: 'Project "Website Redesign" completed', time: '1 hour ago', type: 'info' },
                  { action: 'Payment received from client', time: '3 hours ago', type: 'success' },
                  { action: 'System maintenance scheduled', time: '1 day ago', type: 'warning' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                    <div className={`w-3 h-3 rounded-full ${
                      activity.type === 'success' ? 'bg-green-500' :
                      activity.type === 'info' ? 'bg-blue-500' :
                      'bg-yellow-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Other Tab Content */}
        {activeTab !== 'overview' && (
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {activeTab === 'analytics' && <BarChart3 className="w-8 h-8 text-gray-600" />}
              {activeTab === 'projects' && <FileText className="w-8 h-8 text-gray-600" />}
              {activeTab === 'settings' && <Settings className="w-8 h-8 text-gray-600" />}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Section
            </h3>
            <p className="text-gray-600">
              This section is coming soon. You can add more functionality here.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;