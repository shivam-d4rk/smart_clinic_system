import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, Users, ClipboardList, LogOut } from 'lucide-react';

const ReceptionistDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-900 text-white flex flex-col justify-between p-4">
        <div>
          <h2 className="text-xl font-bold mb-8 text-center border-b border-indigo-800 pb-4">
            Clinic Desk 🏥
          </h2>
          <nav className="space-y-2">
            <a href="#" className="flex items-center space-x-3 p-3 bg-indigo-800 rounded-lg">
              <Calendar className="w-5 h-5" />
              <span>Walk-in Booking</span>
            </a>
            <a href="#" className="flex items-center space-x-3 p-3 hover:bg-indigo-800 rounded-lg transition">
              <Users className="w-5 h-5" />
              <span>Queue Manager</span>
            </a>
            <a href="#" className="flex items-center space-x-3 p-3 hover:bg-indigo-800 rounded-lg transition">
              <ClipboardList className="w-5 h-5" />
              <span>Billing / Invoices</span>
            </a>
          </nav>
        </div>
        
        <button 
          onClick={logout}
          className="flex items-center space-x-3 p-3 hover:bg-red-700 bg-red-600 rounded-lg transition mt-auto w-full justify-center"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Main Panel */}
      <div className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Welcome, {user?.name}</h1>
          <p className="text-gray-500">Role: Receptionist Operational Hub</p>
        </header>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-600">Walk-in queue metrics and dynamic booking modules will display here.</p>
        </div>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;