import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, UserPlus, Settings, LogOut } from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-950 flex flex-col justify-between p-4 border-r border-gray-800">
        <div>
          <h2 className="text-xl font-bold mb-8 text-center text-indigo-400 border-b border-gray-800 pb-4">
            System Admin ⚙️
          </h2>
          <nav className="space-y-2">
            <a href="#" className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
              <UserPlus className="w-5 h-5" />
              <span>Manage Staff</span>
            </a>
            <a href="#" className="flex items-center space-x-3 p-3 hover:bg-gray-800 rounded-lg transition">
              <ShieldAlert className="w-5 h-5" />
              <span>Audit System Logs</span>
            </a>
            <a href="#" className="flex items-center space-x-3 p-3 hover:bg-gray-800 rounded-lg transition">
              <Settings className="w-5 h-5" />
              <span>Global Settings</span>
            </a>
          </nav>
        </div>
        
        <button 
          onClick={logout}
          className="flex items-center space-x-3 p-3 hover:bg-red-700 bg-red-600 rounded-lg transition mt-auto w-full justify-center text-white"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Main Panel */}
      <div className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-white">Root Infrastructure Terminal</h1>
          <p className="text-gray-400">Admin Account: {user?.email}</p>
        </header>
        <div className="bg-gray-850 p-6 rounded-xl border border-gray-800 bg-gray-800/50">
          <p className="text-gray-400">System management graphs and master controls configuration modules load area.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;