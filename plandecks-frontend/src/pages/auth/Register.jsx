import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios'; // Axios instance'ınızın yolu

export default function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [status, setStatus] = useState({ type: '', message: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: 'loading', message: 'İşlem yapılıyor...' });

        try {
            // Backend AuthController /register endpointine istek
            await api.post('/auth/register', formData);
            setStatus({
                type: 'success',
                message: 'Kayıt başarılı! Lütfen Backend konsoluna (veya e-postanıza) düşen linke tıklayın.'
            });
        } catch (err) {
            setStatus({
                type: 'error',
                message: err.response?.data?.message || 'Kayıt başarısız. Kullanıcı adı alınmış olabilir.'
            });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Kayıt Ol</h2>

                {status.message && (
                    <div className={`p-4 mb-4 rounded text-sm ${status.type === 'success' ? 'bg-green-100 text-green-700' : status.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                        {status.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kullanıcı Adı</label>
                        <input
                            type="text" required
                            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                            onChange={e => setFormData({...formData, username: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">E-Posta</label>
                        <input
                            type="email" required
                            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                            onChange={e => setFormData({...formData, email: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
                        <input
                            type="password" required
                            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                            onChange={e => setFormData({...formData, password: e.target.value})}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={status.type === 'loading'}
                        className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 font-semibold transition disabled:opacity-50"
                    >
                        {status.type === 'loading' ? 'Kaydediliyor...' : 'Kayıt Ol'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    Zaten hesabın var mı? <Link to="/login" className="text-blue-600 hover:underline">Giriş Yap</Link>
                </div>
            </div>
        </div>
    );
}