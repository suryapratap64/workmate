import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import api from '../lib/axios';
import { useSelector, useDispatch } from 'react-redux';

const ClientWallet = () => {
  const { user } = useSelector((s) => s.worker);
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchWallet = async () => {
    try {
      const res = await api.get('/user/wallet');
      if (res.data?.success) {
        setWallet(res.data.wallet);
        setTransactions(res.data.transactions || []);
      }
    } catch (err) {
      console.error('fetch wallet', err);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    setLoading(true);
    try {
      const res = await api.post('/user/wallet/deposit', { amount: Number(amount) });
      if (res.data?.success) {
        setWallet(res.data.wallet);
        // refetch transactions
        await fetchWallet();
        setAmount('');
      }
    } catch (err) {
      console.error('deposit', err);
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
            <p className="text-3xl font-bold">{wallet ? `${wallet.currency} ${wallet.balance}` : '—'}</p>
          </div>
        </div>

        <form onSubmit={handleDeposit} className="mt-6 flex gap-2">
          <input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border rounded px-3 py-2 w-full"
            placeholder="Amount to add"
          />
          <Button type="submit" className="whitespace-nowrap" disabled={loading}>
            {loading ? 'Adding...' : 'Add Money'}
          </Button>
        </form>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="font-medium mb-4">Recent transactions</h3>
        {transactions.length === 0 ? (
          <p className="text-gray-500">No transactions yet.</p>
        ) : (
          <ul className="space-y-3">
            {transactions.map((t) => (
              <li key={t._id} className="flex justify-between">
                <div>
                  <div className="font-medium">{t.type}</div>
                  <div className="text-xs text-gray-500">{new Date(t.createdAt).toLocaleString()}</div>
                </div>
                <div className={`font-semibold ${t.type === 'deposit' ? 'text-green-600' : ''}`}>₹{t.amount}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ClientWallet;
