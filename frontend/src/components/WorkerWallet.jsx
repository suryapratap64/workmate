import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import api from '../lib/axios';
import { useSelector } from 'react-redux';

const WorkerWallet = () => {
  const { user } = useSelector((s) => s.worker);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/user/profile');
      if (res.data?.success) {
        const u = res.data.user;
        setBalance(u.walletBalance ?? 0);
      }
    } catch (err) {
      console.error('fetch profile', err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleWithdraw = async () => {
    // placeholder: in production you'd call payout/withdraw endpoints and trigger provider flows
    setLoading(true);
    try {
      // simulate withdraw
      alert('Withdraw flow not implemented in demo.');
    } catch (err) {
      console.error('withdraw', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h2 className="text-2xl font-semibold mb-4">Wallet</h2>
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Available Balance</p>
            <p className="text-3xl font-bold">{balance !== null ? `₹${balance}` : '—'}</p>
          </div>
          <div>
            <Button variant="outline" onClick={handleWithdraw} disabled={loading}>
              {loading ? 'Processing...' : 'Withdraw'}
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="font-medium mb-4">Notes</h3>
        <p className="text-gray-600">Withdrawals need to be processed by the platform. This demo shows current balance only.</p>
      </div>
    </div>
  );
};

export default WorkerWallet;
