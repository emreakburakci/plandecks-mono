import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState({ type: '', msg: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', msg: '' });

        try {
            // Backend'e istek at
            const res = await api.post(`/auth/forgot-password?email=${email}`);
            setStatus({ type: 'success', msg: res.data.message });
        } catch (err) {
            setStatus({ type: 'error', msg: err.response?.data?.message || 'Bir hata oluştu.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Şifremi Unuttum</h2>
                    <p className="text-gray-500 text-sm mt-2">Kayıtlı e-posta adresinizi girin, size sıfırlama bağlantısı gönderelim.</p>
                </div>

                {status.msg && (
                    <div className={`p-3 rounded-lg mb-4 text-sm ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {status.msg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">E-Posta Adresi</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail size={18} className="text-gray-400" />
                            </div>
                            <input
                                type="email" required
                                className="pl-10 block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 outline-none"
                                placeholder="ornek@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-70">
                        {loading ? 'Gönderiliyor...' : 'Bağlantı Gönder'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link to="/login" className="text-gray-600 hover:text-gray-800 text-sm flex items-center justify-center gap-2">
                        <ArrowLeft size={16} /> Giriş ekranına dön
                    </Link>
                </div>
            </div>
        </div>
    );
}