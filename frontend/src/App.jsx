import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard'; // Ensures the real dashboard is loaded

function App() {
  return (
    <Router>
      <Routes>
        {/* Entry Landing Gateway */}
        <Route path="/" element={<AuthPage />} />
        
        {/* Secure Live Patient Portal Route */}
        <Route path="/patient-dashboard" element={<PatientDashboard />} />
        
        {/* Secure Live Doctor Portal Route */}
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
        
        {/* Fallback Redirection System */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;