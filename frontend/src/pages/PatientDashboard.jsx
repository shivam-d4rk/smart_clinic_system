import React, { useState, useEffect } from 'react';
import { useAuth, API } from '../context/AuthContext';
import { 
  Calendar, FileText, User, LogOut, 
  Activity, Clock, CheckCircle, ShieldAlert, PlusCircle, AlertCircle 
} from 'lucide-react';

const PatientDashboard = () => {
  const { user, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState('appointments');
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [bookingData, setBookingData] = useState({ doctorId: '', appointmentDate: '', slot: '10:30 AM' });
  const [bookingSuccess, setBookingSuccess] = useState('');

  const userName = user?.name || user?.fullName || 'Patient';
  const userPhone = user?.phone || user?.phoneNumber || 'N/A';
  const userIdDisplay = user?.id ? String(user.id).slice(0, 8).toUpperCase() : 'PATIENT';

  const fetchMedicalRecords = async () => {
    try {
      setLoading(true);
      setError('');
      
      try {
        const apptRes = await API.get('/patient/appointments');
        if (apptRes.data?.success || Array.isArray(apptRes.data)) {
          setAppointments(apptRes.data.data || apptRes.data || []);
        }
      } catch (err) { console.warn("Appts fetch:", err); }

      try {
        const pxRes = await API.get('/patient/prescriptions');
        if (pxRes.data?.success || Array.isArray(pxRes.data)) {
          setPrescriptions(pxRes.data.data || pxRes.data || []);
        }
      } catch (err) { console.warn("Prescriptions fetch:", err); }

      try {
        const dRes = await API.get('/patient/available-doctors');
        const docList = dRes.data?.data || (Array.isArray(dRes.data) ? dRes.data : []);
        setDoctors(docList);
      } catch (err) { console.error("Doctors fetch:", err); }

    } catch (err) {
      console.error("[CRITICAL SYNC FAULT]:", err);
      setError('Failed to sync live clinical data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicalRecords();
  }, []);

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!bookingData.doctorId) {
      setError('Please select a valid Medical Practitioner.');
      return;
    }

    try {
      setError('');
      const res = await API.post('/patient/appointments', bookingData);
      if (res.data?.success || res.status === 200 || res.status === 201) {
        setBookingSuccess('Appointment booked successfully!');
        await fetchMedicalRecords(); 
        setTimeout(() => { 
          setActiveTab('appointments'); 
          setBookingSuccess(''); 
          setBookingData({ doctorId: '', appointmentDate: '', slot: '10:30 AM' });
        }, 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit booking record.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3 p-4">
          <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-medium text-slate-500">Synchronizing clinical pipeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row antialiased text-slate-800 w-full overflow-x-hidden">
      
      {/* MOBILE HEADER / SIDEBAR */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col justify-between p-4 md:p-6 shadow-xl shrink-0">
        <div className="space-y-4 md:space-y-8">
          <div className="flex items-center justify-between md:justify-start gap-3 border-b border-slate-800 pb-3 md:pb-4">
            <div className="flex items-center gap-3">
              <Activity className="h-6 w-6 text-blue-400" />
              <span className="font-bold text-lg tracking-wide">Clinic Portal</span>
            </div>
            <button onClick={logout} className="md:hidden text-rose-400 text-xs font-semibold border border-rose-900/50 px-2 py-1 rounded-lg">
              Sign Out
            </button>
          </div>
          
          <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
            <button 
              onClick={() => setActiveTab('appointments')}
              className={`flex items-center gap-2 md:gap-3 px-3.5 py-2 md:px-4 md:py-2.5 rounded-xl font-medium text-xs md:text-sm whitespace-nowrap transition-all text-left cursor-pointer ${activeTab === 'appointments' || activeTab === 'book' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <Calendar className="h-4 w-4" /> Appointments
            </button>
            <button 
              onClick={() => setActiveTab('prescriptions')}
              className={`flex items-center gap-2 md:gap-3 px-3.5 py-2 md:px-4 md:py-2.5 rounded-xl font-medium text-xs md:text-sm whitespace-nowrap transition-all text-left cursor-pointer ${activeTab === 'prescriptions' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <FileText className="h-4 w-4" /> Prescriptions
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 md:gap-3 px-3.5 py-2 md:px-4 md:py-2.5 rounded-xl font-medium text-xs md:text-sm whitespace-nowrap transition-all text-left cursor-pointer ${activeTab === 'profile' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <User className="h-4 w-4" /> Profile Info
            </button>
          </nav>
        </div>

        <button 
          onClick={logout}
          className="hidden md:flex w-full items-center gap-3 px-4 py-2.5 border border-slate-800 hover:bg-rose-950/30 hover:border-rose-900 hover:text-rose-400 rounded-xl font-medium text-sm transition-all cursor-pointer"
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full min-w-0">
        {error && (
          <div className="mb-4 md:mb-6 p-3 md:p-4 bg-amber-50 border-l-4 border-amber-500 rounded-xl flex items-center gap-3 text-amber-800 text-xs md:text-sm font-medium shadow-sm">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 md:mb-8 bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-0.5">Welcome, {userName}</h1>
            <p className="text-xs md:text-sm text-slate-500">Official Patient Electronic Health Record (EHR).</p>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">ID: {userIdDisplay}</span>
          </div>
        </header>

        {activeTab === 'appointments' && (
          <>
            <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
              <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Clock className="h-5 w-5 md:h-6 md:w-6" /></div>
                <div>
                  <p className="text-xs md:text-sm text-slate-500 font-medium">Total Sessions</p>
                  <h3 className="text-base md:text-lg font-bold text-slate-900 mt-0.5">{appointments.length} History Logs</h3>
                </div>
              </div>
              <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle className="h-5 w-5 md:h-6 md:w-6" /></div>
                <div>
                  <p className="text-xs md:text-sm text-slate-500 font-medium">Active Prescriptions</p>
                  <h3 className="text-base md:text-lg font-bold text-slate-900 mt-0.5">{prescriptions.length} Active</h3>
                </div>
              </div>
              <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 sm:col-span-2 md:col-span-1">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><ShieldAlert className="h-5 w-5 md:h-6 md:w-6" /></div>
                <div>
                  <p className="text-xs md:text-sm text-slate-500 font-medium">Registered Phone</p>
                  <h3 className="text-sm md:text-base font-bold text-slate-900 mt-0.5">{userPhone}</h3>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h2 className="text-base md:text-lg font-bold text-slate-900">Your Appointment History</h2>
                <button 
                  onClick={() => setActiveTab('book')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-medium text-xs md:text-sm transition-all shadow-sm cursor-pointer"
                >
                  <PlusCircle className="h-4 w-4" /> Book New Session
                </button>
              </div>
              
              <div className="overflow-x-auto w-full">
                {appointments.length === 0 ? (
                  <div className="p-8 md:p-12 text-center text-slate-400 text-xs md:text-sm">No appointment logs found in your clinic profile.</div>
                ) : (
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                        <th className="p-3 md:p-4 pl-4 md:pl-6">Assigned Doctor</th>
                        <th className="p-3 md:p-4">Appointment Date</th>
                        <th className="p-3 md:p-4">Allocated Time</th>
                        <th className="p-3 md:p-4 pr-4 md:pr-6">Current Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs md:text-sm">
                      {appointments.map((appt) => (
                        <tr key={appt.id || Math.random()} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3 md:p-4 pl-4 md:pl-6 font-semibold text-slate-900">{appt.Doctor?.name || appt.doctorName || 'Medical Officer'}</td>
                          <td className="p-3 md:p-4 text-slate-600">{appt.appointmentDate}</td>
                          <td className="p-3 md:p-4 text-slate-600">{appt.slot}</td>
                          <td className="p-3 md:p-4 pr-4 md:pr-6">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] md:text-xs font-semibold bg-blue-50 text-blue-700 uppercase">
                              {appt.status || 'Scheduled'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          </>
        )}

        {/* VIEW 2: PRESCRIPTIONS */}
        {activeTab === 'prescriptions' && (
          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-6">
            <h2 className="text-base md:text-lg font-bold text-slate-900 mb-4">Official Prescribed Treatment Plans</h2>
            {prescriptions.length === 0 ? (
              <p className="text-slate-400 text-xs md:text-sm py-6 text-center">No digital prescriptions issued yet.</p>
            ) : (
              <div className="space-y-4">
                {prescriptions.map((p) => (
                  <div key={p.id || Math.random()} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs md:text-sm">
                          Dr. {p.Doctor?.name || p.DoctorName || p.doctorName || 'Medical Specialist'}
                        </h4>
                        <p className="text-[10px] md:text-xs text-slate-500">Issued on: {p.Appointment?.appointmentDate || p.createdAt?.slice(0, 10) || 'Recent Session'}</p>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] md:text-xs font-bold bg-emerald-50 text-emerald-700 rounded-full uppercase">{p.status || 'Active'}</span>
                    </div>
                    <p className="mt-3 text-xs md:text-sm bg-white p-3 rounded-lg border border-slate-100 font-mono text-slate-700 whitespace-pre-line">{p.medicines}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* VIEW 3: PROFILE */}
        {activeTab === 'profile' && (
          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-6 max-w-xl">
            <h2 className="text-base md:text-lg font-bold text-slate-900 mb-4 md:mb-6 border-b border-slate-100 pb-3">Patient Demographics Info</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 text-xs md:text-sm">
              <div>
                <label className="text-[10px] md:text-xs text-slate-400 font-semibold block uppercase tracking-wider mb-1">Full Identity Name</label>
                <p className="font-semibold text-slate-800 p-2.5 bg-slate-50 rounded-lg border border-slate-200">{userName}</p>
              </div>
              <div>
                <label className="text-[10px] md:text-xs text-slate-400 font-semibold block uppercase tracking-wider mb-1">Secure Registered Email</label>
                <p className="font-semibold text-slate-800 p-2.5 bg-slate-50 rounded-lg border border-slate-200 break-all">{user?.email}</p>
              </div>
              <div>
                <label className="text-[10px] md:text-xs text-slate-400 font-semibold block uppercase tracking-wider mb-1">Contact Handset Line</label>
                <p className="font-semibold text-slate-800 p-2.5 bg-slate-50 rounded-lg border border-slate-200">{userPhone}</p>
              </div>
              <div>
                <label className="text-[10px] md:text-xs text-slate-400 font-semibold block uppercase tracking-wider mb-1">System Global Role</label>
                <p className="font-semibold text-slate-800 p-2.5 bg-slate-50 rounded-lg border border-slate-200 uppercase tracking-wide">{user?.role || 'PATIENT'}</p>
              </div>
            </div>
          </section>
        )}

        {/* VIEW 4: BOOKING */}
        {activeTab === 'book' && (
          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-6 max-w-lg">
            <h2 className="text-base md:text-lg font-bold text-slate-900 mb-1">Schedule Clinical Consultation</h2>
            <p className="text-xs text-slate-400 mb-4 md:mb-6">Create a dynamic allocation request inside clinic database.</p>
            
            {bookingSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs md:text-sm font-medium">
                {bookingSuccess}
              </div>
            )}

            <form onSubmit={handleBookAppointment} className="space-y-4">
              <div>
                <label className="block text-[10px] md:text-xs font-semibold text-slate-600 mb-1.5 uppercase">Select Medical Officer / Specialists</label>
                <select 
                  required 
                  value={bookingData.doctorId}
                  onChange={(e) => setBookingData({...bookingData, doctorId: e.target.value})}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer text-slate-700"
                >
                  <option value="">-- Choose From Active Practitioners --</option>
                  {doctors.length > 0 && doctors.map((doc) => (
                    <option key={doc.id || doc._id} value={doc.id || doc._id}>
                      Dr. {doc.name || doc.fullName} ({doc.specialization || doc.department || doc.email || 'Specialist'})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] md:text-xs font-semibold text-slate-600 mb-1.5 uppercase">Target Date</label>
                  <input 
                    type="date" 
                    required 
                    value={bookingData.appointmentDate}
                    onChange={(e) => setBookingData({...bookingData, appointmentDate: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-[10px] md:text-xs font-semibold text-slate-600 mb-1.5 uppercase">Preferred Slot</label>
                  <select 
                    value={bookingData.slot}
                    onChange={(e) => setBookingData({...bookingData, slot: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:30 AM">10:30 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="04:30 PM">04:30 PM</option>
                  </select>
                </div>
              </div>
              <button 
                type="submit" 
                className="w-full py-3 bg-slate-900 text-white font-semibold rounded-xl text-xs md:text-sm hover:bg-slate-800 transition-all shadow-sm cursor-pointer"
              >
                Confirm Live Database Booking
              </button>
            </form>
          </section>
        )}
      </main>
    </div>
  );
};

export default PatientDashboard;