'use client'
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function FleetDashboard() {
  const [ambulances, setAmbulances] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchFleet();
  }, []);

  const fetchFleet = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || user.email !== 'doctor@vitbhopal.ac.in') {
      router.push('/login');
      return;
    }

    const { data, error } = await supabase
      .from('ambulances')
      .select('*')
      .order('vehicle_number', { ascending: true });

    if (data) {
      setAmbulances(data);
    }
    setLoading(false);
  };

  const updateStatus = async (id, newStatus) => {
    const { error } = await supabase
      .from('ambulances')
      .update({ 
        status: newStatus,
        last_updated: new Date()
      })
      .eq('id', id);

    if (!error) {
      fetchFleet(); // Refresh to show new status
    } else {
      alert("Error updating fleet: " + error.message);
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading fleet data...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Live Fleet Tracking</h1>
            <p className="text-gray-500">Manage campus ambulance availability and dispatch.</p>
          </div>
          <button onClick={fetchFleet} className="text-blue-600 bg-blue-50 px-4 py-2 rounded-md hover:bg-blue-100 transition">
            ↻ Refresh Fleet
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ambulances.map((van) => (
            <div key={van.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className={`p-4 text-white flex justify-between items-center ${
                van.status === 'Available' ? 'bg-green-600' :
                van.status === 'En Route' ? 'bg-blue-600' :
                van.status === 'Occupied' ? 'bg-orange-500' :
                'bg-gray-500'
              }`}>
                <h2 className="text-xl font-bold">{van.vehicle_number}</h2>
                <span className="text-sm font-semibold uppercase tracking-wider bg-black bg-opacity-20 px-2 py-1 rounded">
                  {van.status}
                </span>
              </div>
              
              <div className="p-5">
                <div className="mb-4">
                  <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Driver Details</p>
                  <p className="text-gray-900 font-medium">{van.driver_name}</p>
                  <p className="text-gray-600 text-sm">📞 {van.driver_contact}</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-2">Update Status</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => updateStatus(van.id, 'Available')}
                      disabled={van.status === 'Available'}
                      className="text-xs font-bold py-2 rounded border border-green-600 text-green-700 hover:bg-green-50 disabled:opacity-30 transition"
                    >
                      Available
                    </button>
                    <button 
                      onClick={() => updateStatus(van.id, 'En Route')}
                      disabled={van.status === 'En Route'}
                      className="text-xs font-bold py-2 rounded border border-blue-600 text-blue-700 hover:bg-blue-50 disabled:opacity-30 transition"
                    >
                      En Route
                    </button>
                    <button 
                      onClick={() => updateStatus(van.id, 'Occupied')}
                      disabled={van.status === 'Occupied'}
                      className="text-xs font-bold py-2 rounded border border-orange-500 text-orange-600 hover:bg-orange-50 disabled:opacity-30 transition"
                    >
                      Occupied
                    </button>
                    <button 
                      onClick={() => updateStatus(van.id, 'Maintenance')}
                      disabled={van.status === 'Maintenance'}
                      className="text-xs font-bold py-2 rounded border border-gray-500 text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition"
                    >
                      Maintenance
                    </button>
                  </div>
                </div>
                
                <p className="text-xs text-gray-400 mt-4 text-center">
                  Last updated: {new Date(van.last_updated).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}