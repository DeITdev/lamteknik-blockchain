'use client';

import { useState } from 'react';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

export default function TestAPI() {
  const [email, setEmail] = useState('test@test.com');
  const [password, setPassword] = useState('test123');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const { user, token, isAuthenticated } = useAuthStore();

  const testLogin = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      console.log('🔐 Testing login API...');
      const response = await authApi.login(email, password);
      console.log('✅ Response:', response);
      setResult(response.data);
    } catch (err: any) {
      console.error('❌ Error:', err);
      setError(err.message || JSON.stringify(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6">🧪 API Test Console</h1>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <h2 className="font-bold text-blue-900">Current Auth State:</h2>
          <pre className="mt-2 text-sm bg-white p-3 rounded overflow-auto">
            {JSON.stringify(
              { isAuthenticated, user: user?.email, token: token ? '***' : null },
              null,
              2
            )}
          </pre>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-2 border-gray-300 rounded px-3 py-2"
              placeholder="test@test.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-2 border-gray-300 rounded px-3 py-2"
              placeholder="test123"
            />
          </div>
        </div>

        <button
          onClick={testLogin}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
        >
          {loading ? '🔄 Testing...' : '🧪 Test Login API'}
        </button>

        {error && (
          <div className="mt-6 bg-red-50 border-l-4 border-red-500 p-4">
            <h3 className="font-bold text-red-900 mb-2">❌ Error:</h3>
            <pre className="text-sm bg-white p-3 rounded overflow-auto">
              {error}
            </pre>
          </div>
        )}

        {result && (
          <div className="mt-6 bg-green-50 border-l-4 border-green-500 p-4">
            <h3 className="font-bold text-green-900 mb-2">✅ Success Response:</h3>
            <pre className="text-sm bg-white p-3 rounded overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8 pt-6 border-t">
          <h3 className="font-bold mb-3">📋 Debug Info:</h3>
          <ul className="text-sm space-y-2">
            <li>API URL: <code className="bg-gray-100 px-2 py-1">http://localhost:3003/api/v1</code></li>
            <li>Frontend URL: <code className="bg-gray-100 px-2 py-1">http://localhost:3002</code></li>
            <li>Check browser DevTools Console for logs</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
