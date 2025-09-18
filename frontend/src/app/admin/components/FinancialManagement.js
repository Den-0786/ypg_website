'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Plus, Edit, Trash2, DollarSign } from 'lucide-react';

export default function FinancialManagement({ donations, setDonations }) {
  const [showAddDonation, setShowAddDonation] = useState(false);
  const [newDonation, setNewDonation] = useState({
    donor: '',
    phone: '',
    email: '',
    amount: '',
    payment_method: 'online',
    date: new Date().toISOString().split('T')[0],
    purpose: '',
    status: 'completed'
  });
  const [editingDonation, setEditingDonation] = useState(null);

  // Handle adding a new donation
  const handleAddDonation = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/donations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newDonation,
          amount: parseFloat(newDonation.amount),
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setDonations(prev => [...prev, data.donation]);
        setShowAddDonation(false);
        setNewDonation({
          donor: '',
          phone: '',
          email: '',
          amount: '',
          payment_method: 'online',
          date: new Date().toISOString().split('T')[0],
          purpose: '',
          status: 'completed'
        });
      } else {
        console.error('Error adding donation:', data.error);
      }
    } catch (error) {
      console.error('Error adding donation:', error);
    }
  };
  
  // Handle updating a donation
  const handleUpdateDonation = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/donations', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingDonation.id,
          ...newDonation,
          amount: parseFloat(newDonation.amount),
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setDonations(prev =>
          prev.map(donation =>
            donation.id === editingDonation.id ? data.donation : donation
          )
        );
        setShowAddDonation(false);
        setNewDonation({
          donor: '',
          phone: '',
          email: '',
          amount: '',
          payment_method: 'online',
          date: new Date().toISOString().split('T')[0],
          purpose: '',
          status: 'completed'
        });
        setEditingDonation(null);
      } else {
        console.error('Error updating donation:', data.error);
      }
    } catch (error) {
      console.error('Error updating donation:', error);
    }
  };
  
  // Handle deleting a donation
  const handleDeleteDonation = async (id) => {
    try {
      const response = await fetch(`/api/donations?id=${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setDonations(prev => prev.filter(donation => donation.id !== id));
      } else {
        console.error('Error deleting donation:', data.error);
      }
    } catch (error) {
      console.error('Error deleting donation:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Donations</h2>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          onClick={() => {
            setEditingDonation(null);
            setNewDonation({
              donor: '',
              phone: '',
              email: '',
              amount: '',
              payment_method: 'online',
              date: new Date().toISOString().split('T')[0],
              purpose: '',
              status: 'completed'
            });
            setShowAddDonation(true);
          }}
        >
          <Plus className="w-4 h-4 inline mr-2" />
          Add Donation
        </button>
      </div>
      
      {/* Add Donation Modal */}
      <Transition.Root show={showAddDonation} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={setShowAddDonation}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
            leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity" />
          </Transition.Child>
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-gray-900 mb-4">
                    {editingDonation ? 'Edit Donation' : 'Add Donation'}
                  </Dialog.Title>
                  <form onSubmit={editingDonation ? handleUpdateDonation : handleAddDonation} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Donor Name</label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                        value={newDonation.donor}
                        onChange={e => setNewDonation({ ...newDonation, donor: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                        value={newDonation.phone}
                        onChange={e => setNewDonation({ ...newDonation, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                        value={newDonation.email}
                        onChange={e => setNewDonation({ ...newDonation, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                      <input
                        type="number"
                        required
                        min="1"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                        value={newDonation.amount}
                        onChange={e => setNewDonation({ ...newDonation, amount: parseFloat(e.target.value) || '' })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                        value={newDonation.payment_method}
                        onChange={e => setNewDonation({ ...newDonation, payment_method: e.target.value })}
                      >
                        <option value="online">Online</option>
                        <option value="check">Check</option>
                        <option value="cash">Cash</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <input
                        type="date"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                        value={newDonation.date}
                        onChange={e => setNewDonation({ ...newDonation, date: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                        value={newDonation.purpose}
                        onChange={e => setNewDonation({ ...newDonation, purpose: e.target.value })}
                      />
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                      <button
                        type="button"
                        className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                        onClick={() => setShowAddDonation(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
                      >
                        {editingDonation ? 'Update' : 'Add'} Donation
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md border">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Donations</p>
              <p className="text-2xl font-bold text-gray-900">
                ${donations.reduce((sum, donation) => sum + donation.amount, 0)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-md border">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Online Donations</p>
              <p className="text-2xl font-bold text-gray-900">
                ${donations.filter(d => d.payment_method === 'online').reduce((sum, donation) => sum + donation.amount, 0)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-md border">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Check Donations</p>
              <p className="text-2xl font-bold text-gray-900">
                ${donations.filter(d => d.payment_method === 'check').reduce((sum, donation) => sum + donation.amount, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Donor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Purpose
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {donations.map((donation) => (
                <tr key={donation.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {donation.donor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {donation.phone || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${donation.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      donation.payment_method === 'online'
                        ? 'bg-green-100 text-green-800'
                        : donation.payment_method === 'check'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {donation.payment_method}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(donation.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {donation.purpose}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      onClick={() => {
                        setEditingDonation(donation);
                        setNewDonation({
                          donor: donation.donor,
                          phone: donation.phone || '',
                          email: donation.email || '',
                          amount: donation.amount,
                          payment_method: donation.payment_method,
                          date: donation.date,
                          purpose: donation.purpose,
                          status: donation.status
                        });
                        setShowAddDonation(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleDeleteDonation(donation.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}