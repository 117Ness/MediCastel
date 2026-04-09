'use client'
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewRequestPage() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    request_type: 'Room Visit',
    urgency: 'Medium',
    description: ''
  });

  // Verify user is logged in and is NOT the doctor
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else if (user.email === 'doctor@vitbhopal.ac.in') {
        router.push('/doctor/requests');
      } else {
        setUser(user);
      }
    };
    checkUser();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('service_requests')
      .insert([
        {
          user_id: user.id,
          request_type: formData.request_type,
          urgency: formData.urgency,
          description: formData.description,
          status: 'Pending'
        }
      ]);

    setLoading(false);

    if (error) {
      alert('Error submitting request: ' + error.message);
    } else {
      // Success! Send them to the tracking dashboard
      router.push('/dashboard');
    }
  };

  if (!user) return <div className="p-10 text-center text-gray-500">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Medical Assistance Hub</h2>
            <p className="text-blue-100 mt-1 text-sm">Request immediate support or logistical assistance.</p>
          </div>
          <Link href="/dashboard" className="text-sm bg-blue-700 hover:bg-blue-800 px-3 py-2 rounded transition">
            Cancel
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Request Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">What do you need?</label>
            <select 
              className="w-full rounded-md border-gray-300 shadow-sm p-3 border bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500"
              value={formData.request_type}
              onChange={(e) => setFormData({...formData, request_type: e.target.value})}
            >
              <option value="Tele-consultation">Tele-consultation (Online)</option>
              <option value="Room Visit">Doctor Room Visit</option>
              <option value="Ambulance">Ambulance / Transport</option>
              <option value="Sick Diet">Sick Diet (Mess Delivery)</option>
              <option value="Medication">Medication Drop-off</option>
            </select>
          </div>

          {/* Urgency */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">How urgent is this?</label>
            <select 
              className="w-full rounded-md border-gray-300 shadow-sm p-3 border bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500"
              value={formData.urgency}
              onChange={(e) => setFormData({...formData, urgency: e.target.value})}
            >
              <option value="Low">Low (Can wait a few hours)</option>
              <option value="Medium">Medium (Need assistance soon)</option>
              <option value="High">High (Urgent, feeling very unwell)</option>
              <option value="Emergency">Emergency (Immediate life-safety issue)</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Describe your symptoms / request</label>
            <textarea 
              required
              rows="4"
              className="w-full rounded-md border-gray-300 shadow-sm p-3 border bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Please provide details (e.g., severe headache, fever of 102, need paracetamol...)"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})} 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full font-bold py-3 px-4 rounded text-white transition ${
              formData.urgency === 'Emergency' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Submitting...' : `Request ${formData.request_type}`}
          </button>
        </form>
      </div>
    </div>
  );
}