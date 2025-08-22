import React, { useState } from 'react';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import Dashboard from './components/Dashboard';

export type User = {
  email: string;
  name: string;
};

function App() {
  const [currentView, setCurrentView] = useState<'login' | 'signup' | 'dashboard'>('login');
  const [user, setUser] = useState<User | null>(null);

  const handleLoginSuccess = (userData: User) => {
    setUser(userData);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('login');
  };

  const switchToSignup = () => setCurrentView('signup');
  const switchToLogin = () => setCurrentView('login');

  if (currentView === 'dashboard' && user) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-md">
          {currentView === 'login' ? (
            <LoginForm 
              onLoginSuccess={handleLoginSuccess}
              onSwitchToSignup={switchToSignup}
            />
          ) : (
            <SignupForm 
              onSignupSuccess={handleLoginSuccess}
              onSwitchToLogin={switchToLogin}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;