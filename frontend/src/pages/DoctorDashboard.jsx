import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, Clipboard, CheckCircle, LogOut, 
  Activity, Clock, FileText, Send, AlertCircle
} from 'lucide-react';
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true
});

const DoctorDashboard = () => {
  const { user, logout } = useAuth();
  
  // Real Database States
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Prescription Submission Form State
  const [activeAppointment, setActiveAppointment] = useState(null);
  const [medicines, setMedicines] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch allocated appointments for this logged-in Doctor
  useEffect(() => {
    const fetchDoctorSchedule = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await API.get('/doctor/appointments');
        if (res.data.success) {
          setAppointments(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load doctor clinical records:", err);
        setError('Failed to fetch assigned clinical logs from the server.');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctorSchedule();
  }, []);

  // Updated Prescription Submit Handler with Detailed Fallbacks
  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();
    
    if (!activeAppointment || !medicines.trim()) {
      alert("Please select a patient and enter some medicines first.");
      return;
    }

    // Safely extract Patient ID regardless of Sequelize association structure
    const extractedPatientId = 
      activeAppointment.patientId || 
      activeAppointment.PatientId || 
      activeAppointment.Patient?.id;

    if (!extractedPatientId) {
      alert("Error: Patient ID is missing for this appointment. Check backend doctor/appointments response.");
      console.error("[RX ERROR] Missing Patient ID in active appointment object:", activeAppointment);
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      setSubmitSuccess('');
      
      console.log("[DEBUG-RX] Submitting Payload:", {
        appointmentId: activeAppointment.id,
        patientId: extractedPatientId,
        medicines: medicines
      });

      const res = await API.post('/doctor/prescriptions', {
        appointmentId: activeAppointment.id,
        patientId: extractedPatientId,
        medicines: medicines,
        diagnosis: "General Checkup"
      });

      if (res.data.success || res.status === 200 || res.status === 201) {
        setSubmitSuccess('Prescription issued successfully!');
        setMedicines('');
        setActiveAppointment(null); // Clear form desk
        
        // Update local state queue instantly
        const updated = appointments.map(appt => 
          appt.id === activeAppointment.id ? { ...appt, status: 'completed' } : appt
        );
        setAppointments(updated);
        
        // Clear success notification
        setTimeout(() => setSubmitSuccess(''), 3000);
      }
    } catch (err) {
      console.error("[CRITICAL RX SUBMIT ERROR]:", err);
      
      // Detailed error reporting
      const serverErrorMessage = 
        err.response?.data?.message || 
        err.response?.data?.error || 
        (err.response ? `Server Error (${err.response.status})` : 'Server connection failed. Is Backend running?');

      setError(serverErrorMessage);
      alert(`Rx Issue Failed: ${serverErrorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-medium text-slate-500">Loading Clinical Engine Schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex antialiased text-slate-800">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-teal-950 text-white flex flex-col justify-between p-6 shadow-xl">
        <div className="space-y-8">
          <div className="flex items-center gap-3 border-b border-teal-900 pb-4">
            <Activity className="h-6 w-6 text-teal-400" />
            <span className="font-bold text-lg tracking-wide">Doctor Console</span>
          </div>
          <nav className="space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-2.5 bg-teal-800 rounded-xl font-medium text-sm text-left">
              <Users className="h-4 w-4" /> Patient Queue
            </button>
          </nav>
        </div>
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 border border-teal-900 hover:bg-rose-950/30 hover:border-rose-900 hover:text-rose-400 rounded-xl font-medium text-sm transition-all cursor-pointer"
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </aside>

      {/* MAIN PANELS */}
      <main className="flex-1 p-8 overflow-y-auto">
        {error && (
          <div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-xl flex items-center gap-3 text-amber-800 text-sm font-medium shadow-sm">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Welcome, Dr. {user?.name}</h1>
            <p className="text-sm text-slate-500">Live Clinical Operations Practitioner Workspace.</p>
          </div>
          <span className="text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 px-4 py-2 rounded-xl">
            LICENSED MD
          </span>
        </header>

        {/* METRICS */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-3 bg-teal-50 text-teal-600 rounded-xl"><Clock className="h-6 w-6" /></div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Pending Consultations</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">
                {appointments.filter(a => a.status === 'scheduled').length} Patients
              </h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle className="h-6 w-6" /></div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Completed Sessions</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">
                {appointments.filter(a => a.status === 'completed').length} Treated
              </h3>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* APPOINTMENTS QUEUE TABLE */}
          <section className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Today's Live Appointment Matrix</h2>
            </div>
            <div className="overflow-x-auto">
              {appointments.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-sm">No patients scheduled for today.</div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase border-b border-slate-100">
                      <th className="p-4 pl-6">Patient Identifier Name</th>
                      <th className="p-4">Slot Time</th>
                      <th className="p-4 pr-6">Clinical Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {appointments.map((appt) => (
                      <tr key={appt.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 pl-6 font-semibold text-slate-900">
                          {appt.Patient?.name || appt.patientName || 'Walk-in Patient'}
                        </td>
                        <td className="p-4 text-slate-600">{appt.slot}</td>
                        <td className="p-4 pr-6">
                          {appt.status === 'completed' ? (
                            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase">Completed</span>
                          ) : (
                            <button 
                              onClick={() => setActiveAppointment(appt)}
                              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs rounded-lg transition-all cursor-pointer"
                            >
                              Write Prescription
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          {/* DYNAMIC ACTION DRAWER FOR WRITE PRESCRIPTION */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-fit">
            <h3 className="text-base font-bold text-slate-900 mb-2">E-Prescription Desk</h3>
            {submitSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 text-xs font-medium rounded-xl border border-emerald-100">
                {submitSuccess}
              </div>
            )}
            
            {activeAppointment ? (
              <form onSubmit={handlePrescriptionSubmit} className="space-y-4 mt-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <p className="text-slate-500">Treating Patient:</p>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">
                    {activeAppointment.Patient?.name || activeAppointment.patientName || 'Patient'}
                  </p>
                  <p className="text-slate-400 mt-1">Slot: {activeAppointment.slot}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Rx Medicines & Instructions</label>
                  <textarea
                    required
                    rows="6"
                    placeholder="1. Paracetamol 650mg - Thrice a day after meals&#10;2. Amoxicillin 500mg - Twice a day for 5 days"
                    value={medicines}
                    onChange={(e) => setMedicines(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-700"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-teal-900 hover:bg-teal-800 disabled:bg-slate-400 text-white font-semibold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="h-4 w-4" /> 
                  {isSubmitting ? 'Issuing Record...' : 'Issue RX Record'}
                </button>
              </form>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs border-2 border-dashed border-slate-100 rounded-xl mt-4">
                Select a patient from the active queue grid to open the prescription formulation terminal.
              </div>
            )}
          </section>
        </div>
      </main>

    </div>
  );
};

export default DoctorDashboard;