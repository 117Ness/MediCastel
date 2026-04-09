'use client'
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function StudentDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/login');
      return;
    }

    // Redirect doctors away from the student view
    if (user.email === 'doctor@vitbhopal.ac.in') {
      router.push('/doctor/requests');
      return;
    }

    // Fetch ONLY this specific student's requests
    const { data, error } = await supabase
      .from('service_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setRequests(data);
    }
    setLoading(false);
  };

  // Helper function to calculate progress bar width visually
  const getProgressWidth = (status) => {
    if (status === 'Pending') return '15%';
    if (status === 'En Route') return '50%';
    if (status === 'Completed') return '100%';
    return '0%';
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading your active requests...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
            <p className="text-gray-500 mt-1">Track your active medical and logistic requests.</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button 
              onClick={fetchMyRequests} 
              className="flex-1 md:flex-none text-blue-600 bg-blue-50 px-4 py-2 rounded-md hover:bg-blue-100 transition font-medium text-center"
            >
              ↻ Refresh Status
            </button>
            <Link 
              href="/requests/new" 
              className="flex-1 md:flex-none bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700 transition font-medium text-center"
            >
              + New Request
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          {requests.length === 0 ? (
            <div className="p-10 bg-white rounded-xl border border-gray-200 text-center shadow-sm">
              <div className="text-4xl mb-3">📭</div>
              <h3 className="text-lg font-medium text-gray-900">No Active Requests</h3>
              <p className="text-gray-500 mt-1">You have no active or past medical requests.</p>
            </div>
          ) : (
            requests.map((req) => (
              <div key={req.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
                <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-xl text-gray-800">{req.request_type}</span>
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                        req.urgency === 'Emergency' ? 'bg-red-100 text-red-800' : 
                        req.urgency === 'High' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {req.urgency}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Requested on: {new Date(req.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-left sm:text-right w-full sm:w-auto bg-gray-50 sm:bg-transparent p-3 sm:p-0 rounded-md">
                    <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Current Status</span>
                    <span className={`font-bold text-lg ${
                      req.status === 'Completed' ? 'text-green-600' : 'text-blue-600'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                </div>

                {/* The Visual Progress Bar */}
                <div className="relative pt-2">
                  <div className="overflow-hidden h-3 mb-2 text-xs flex rounded-full bg-gray-100 border border-gray-200 shadow-inner">
                    <div 
                      style={{ width: getProgressWidth(req.status) }} 
                      className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-1000 ease-out ${
                        req.status === 'Completed' ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-gray-400 px-1">
                    <span className={req.status !== 'Pending' ? 'text-blue-600' : ''}>Request Sent</span>
                    <span className={req.status === 'En Route' || req.status === 'Completed' ? 'text-blue-600' : ''}>Assigned / En Route</span>
                    <span className={req.status === 'Completed' ? 'text-green-600' : ''}>Completed</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}