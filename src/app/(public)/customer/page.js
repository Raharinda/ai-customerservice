'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CustomerPage() {
    const { user, logout, getIdToken } = useAuth();
    const router = useRouter();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Form state
    const [formData, setFormData] = useState({
        subject: '',
        message: '',
        category: '',
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        // Redirect jika user adalah agent
        if (user && user.role === 'agent') {
            router.push('/agent');
        }
        
        // Load tickets saat component mount
        if (user) {
            loadTickets();
        }
    }, [user, router]);

    // Fungsi untuk load tickets
    const loadTickets = async () => {
        try {
            setLoading(true);
            setError('');
            const token = await getIdToken();
            
            const response = await fetch('/api/tickets', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (response.ok) {
                setTickets(data.data.tickets);
            } else {
                setError(data.error || 'Gagal memuat tickets');
            }
        } catch (err) {
            console.error('Error loading tickets:', err);
            setError('Gagal memuat tickets');
        } finally {
            setLoading(false);
        }
    };

    // Fungsi untuk submit ticket baru
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSubmitting(true);

        try {
            const token = await getIdToken();
            
            const response = await fetch('/api/tickets/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Ticket berhasil dibuat!');
                setFormData({ subject: '', message: '', category: '' });
                // Reload tickets
                loadTickets();
            } else {
                setError(data.error || 'Gagal membuat ticket');
            }
        } catch (err) {
            console.error('Error creating ticket:', err);
            setError('Gagal membuat ticket');
        } finally {
            setSubmitting(false);
        }
    };

    // Fungsi untuk format tanggal
    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Fungsi untuk mendapatkan warna badge status
    const getStatusBadge = (status) => {
        const badges = {
            open: 'bg-blue-100 text-blue-800',
            'in-progress': 'bg-yellow-100 text-yellow-800',
            resolved: 'bg-green-100 text-green-800',
            closed: 'bg-gray-100 text-gray-800',
        };
        return badges[status] || badges.open;
    };

    // Fungsi untuk mendapatkan warna badge category
    const getCategoryBadge = (category) => {
        const badges = {
            'Technical Issue': 'bg-purple-100 text-purple-800',
            'Billing & Payment': 'bg-green-100 text-green-800',
            'Feature Request': 'bg-pink-100 text-pink-800',
            'Account Access': 'bg-yellow-100 text-yellow-800',
            'Other': 'bg-blue-100 text-blue-800',
        };
        return badges[category] || badges['Other'];
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-100 p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-2xl font-bold">Customer Dashboard</h1>
                            <button
                                onClick={logout}
                                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                        
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-semibold mb-4">Informasi User</h2>
                            <div className="space-y-2">
                                <p><span className="font-medium">Nama:</span> {user?.displayName || user?.email}</p>
                                <p><span className="font-medium">Email:</span> {user?.email}</p>
                                <p>
                                    <span className="font-medium">Role:</span>{' '}
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        Customer
                                    </span>
                                </p>
                                <p><span className="font-medium">User ID:</span> {user?.uid}</p>
                            </div>
                        </div>

                        {/* Form untuk membuat ticket baru */}
                        <div className="mt-6 border-t pt-6">
                            <h2 className="text-xl font-semibold mb-4">📝 Buat Ticket Support Baru</h2>
                            
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
                                    {error}
                                </div>
                            )}
                            
                            {success && (
                                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
                                    {success}
                                </div>
                            )}
                            
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Subject
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Masukkan judul permasalahan (min. 5 karakter)"
                                        required
                                        minLength={5}
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Category
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Select category</option>
                                        <option value="Technical Issue">Technical Issue</option>
                                        <option value="Billing & Payment">Billing & Payment</option>
                                        <option value="Feature Request">Feature Request</option>
                                        <option value="Account Access">Account Access</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Pesan
                                    </label>
                                    <textarea
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows="4"
                                        placeholder="Jelaskan permasalahan Anda (min. 10 karakter)"
                                        required
                                        minLength={10}
                                    />
                                </div>
                                
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
                                >
                                    {submitting ? 'Mengirim...' : 'Kirim Ticket'}
                                </button>
                            </form>
                        </div>

                        {/* Daftar tickets */}
                        <div className="mt-8 border-t pt-6">
                            <h2 className="text-xl font-semibold mb-4">📋 Tickets Anda</h2>
                            
                            {loading ? (
                                <p className="text-gray-600">Memuat tickets...</p>
                            ) : tickets.length === 0 ? (
                                <p className="text-gray-600">Belum ada ticket. Buat ticket pertama Anda di atas!</p>
                            ) : (
                                <div className="space-y-3">
                                    {tickets.map((ticket) => (
                                        <div
                                            key={ticket.ticketId}
                                            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-semibold text-lg">{ticket.subject}</h3>
                                                <div className="flex gap-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(ticket.status)}`}>
                                                        {ticket.status}
                                                    </span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryBadge(ticket.category)}`}>
                                                        {ticket.category}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">
                                                ID: {ticket.ticketId}
                                            </p>
                                            <div className="flex justify-between items-center text-sm text-gray-500">
                                                <span>💬 {ticket.messageCount} pesan</span>
                                                <span>🕐 {formatDate(ticket.createdAt)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
