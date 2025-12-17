import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { Lock, User, AlertCircle, LogIn, Send, CheckCircle } from 'lucide-react';

export default function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    // State Yönetimi
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [showResendLink, setShowResendLink] = useState(false); // Link gösterme kontrolü

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setShowResendLink(false);
        setLoading(true);

        try {
            const res = await api.post('/auth/authenticate', { username, password });
            localStorage.setItem('token', res.data.token);
            window.location.href = '/dashboard';

        } catch (err) {
            const msg = err.response?.data?.message || 'Giriş başarısız! Sunucu hatası.';
            setError(msg);

            // Eğer mesajda "aktif" kelimesi geçiyorsa (Backend: Hesabınız henüz aktif edilmemiş...)
            // Butonu göster
            if (msg.toLowerCase().includes('aktif')) {
                setShowResendLink(true);
            }
        } finally {
            setLoading(false);
        }
    };

    // --- YENİDEN GÖNDERME FONKSİYONU ---
    const handleResendClick = async () => {
        setResendLoading(true);
        try {
            // Backend endpointi çağır
            const res = await api.post(`/auth/resend-verification?username=${username}`);
            setSuccessMsg(res.data.message);
            setError(''); // Hata mesajını temizle
            setShowResendLink(false); // Butonu gizle
        } catch (err) {
            setError("Link gönderilemedi. Kullanıcı adını kontrol edin.");
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-blue-600">PlanDecks</h1>
                    <p className="text-gray-500 mt-2">Hesabınıza giriş yapın</p>
                </div>

                {/* --- BAŞARILI MESAJI (YEŞİL) --- */}
                {successMsg && (
                    <div className="flex items-start gap-3 p-4 mb-6 rounded-lg text-sm bg-green-50 text-green-700 border border-green-200">
                        <CheckCircle size={20} className="shrink-0 mt-0.5" />
                        <span>{successMsg}</span>
                    </div>
                )}

                {/* --- HATA MESAJI (SARI/KIRMIZI) --- */}
                {error && (
                    <div className={`flex flex-col gap-2 p-4 mb-6 rounded-lg text-sm border 
                        ${error.includes('aktif')
                        ? 'bg-yellow-50 text-yellow-800 border-yellow-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}>

                        <div className="flex items-start gap-3">
                            <AlertCircle size={20} className="shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>

                        {/* AKTİVASYON LİNKİ BUTONU */}
                        {showResendLink && (
                            <button
                                onClick={handleResendClick}
                                disabled={resendLoading}
                                className="mt-2 text-xs font-bold underline flex items-center gap-1 hover:text-blue-600 w-fit"
                            >
                                {resendLoading ? 'Gönderiliyor...' : (
                                    <>
                                        Aktivasyon linkini tekrar gönder <Send size={12}/>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kullanıcı Adı</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User size={18} className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                required
                                className="pl-10 block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                placeholder="Kullanıcı Adı"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock size={18} className="text-gray-400" />
                            </div>
                            <input
                                type="password"
                                required
                                className="pl-10 block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                placeholder="••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {loading ? 'Giriş Yapılıyor...' : <><LogIn size={18} /> Giriş Yap</>}
                    </button>

                    <div className="flex justify-end">
                        <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                            Şifremi unuttum?
                        </Link>
                    </div>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    Hesabın yok mu?{' '}
                    <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium hover:underline">
                        Kayıt Ol
                    </Link>
                </div>
            </div>
        </div>
    );
}