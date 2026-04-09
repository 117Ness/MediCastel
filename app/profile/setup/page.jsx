// app/profile/setup/page.jsx
'use client' // Required for client-side forms in Next.js App Router
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function EHRSetupForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    blood_group: 'A+',
    known_allergies: '',
    chronic_conditions: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Get the currently logged-in user
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Upsert (Insert or Update) the medical profile
      const { error } = await supabase
        .from('medical_profiles')
        .upsert({
          id: user.id, // Must match the auth.user ID due to our RLS policy!
          ...formData,
          updated_at: new Date()
        });

      if (error) alert('Error saving profile: ' + error.message);
      else alert('Medical Profile Saved Successfully!');
    } else {
      alert('You must be logged in.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-8 mt-10 bg-white rounded-lg shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Complete Your Medical Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input 
            type="text" 
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500"
            onChange={(e) => setFormData({...formData, full_name: e.target.value})} 
            required 
            placeholder="e.g., Jane Doe"
          />
        </div>

        {/* Blood Group Select */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Blood Group</label>
          <select 
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500"
            onChange={(e) => setFormData({...formData, blood_group: e.target.value})}
            defaultValue="A+"
          >
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>

        {/* Allergies Textarea */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Known Allergies (if any)</label>
          <textarea 
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500"
            onChange={(e) => setFormData({...formData, known_allergies: e.target.value})} 
            placeholder="e.g., Penicillin, Peanuts"
            rows="3"
          />
        </div>

        {/* Chronic Conditions Textarea */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Chronic Conditions (if any)</label>
          <textarea 
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500"
            onChange={(e) => setFormData({...formData, chronic_conditions: e.target.value})} 
            placeholder="e.g., Asthma, Type 1 Diabetes"
            rows="3"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          {loading ? 'Saving securely...' : 'Save Health Record'}
        </button>
      </form>
    </div>
  );
}