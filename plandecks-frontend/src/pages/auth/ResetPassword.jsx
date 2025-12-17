import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Lock } from 'lucide-react';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token'); // URL'den token'ı al

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState({ type: '', msg: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setStatus({ type: 'error', msg: 'Şifreler eşleşmiyor!' });
        }

        try {
            await api.post('/auth/reset-password', { token, password });
            setStatus({ type: 'success', msg: 'Şifreniz başarıyla güncellendi! Giriş sayfasına yönlendiriliyorsunuz...' });
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setStatus({ type: 'error', msg: err.response?.data?.message || 'Link geçersiz veya süresi dolmuş.' });
        }
    };

    if (!token) return <div className="p-10 text-center text-red-600">Geçersiz Bağlantı. Token bulunamadı.</div>;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Yeni Şifre Belirle</h2>

                {status.msg && (
                    <div className={`p-3 rounded-lg mb-4 text-sm ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {status.msg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Yeni Şifre</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock size={18} className="text-gray-400" /></div>
                            <input type="password" required className="pl-10 block w-full border border-gray-300 rounded-lg p-2.5 outline-none"
                                   value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Şifre Tekrar</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock size={18} className="text-gray-400" /></div>
                            <input type="password" required className="pl-10 block w-full border border-gray-300 rounded-lg p-2.5 outline-none"
                                   value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded-lg font-semibold hover:bg-indigo-700 transition">
                        Şifreyi Güncelle
                    </button>
                </form>
            </div>
        </div>
    );
}