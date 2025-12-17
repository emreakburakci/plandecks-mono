import { Link, Outlet, useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, LayoutDashboard, LogOut } from 'lucide-react';

export default function PublicLayout() {
    const navigate = useNavigate();

    // Basit oturum kontrolü (Token var mı?)
    // Eğer AuthContext kullanıyorsanız const { isAuthenticated, logout } = useAuth(); şeklinde de alabilirsiniz.
    const isLoggedIn = !!localStorage.getItem('token');

    const handleLogout = () => {
        // Token'ı sil ve anasayfaya/login'e at
        localStorage.removeItem('token');
        // Eğer AuthContext kullanıyorsanız logout() fonksiyonunu çağırın
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="border-b sticky top-0 bg-white/95 backdrop-blur-sm z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="text-2xl font-bold text-blue-600 flex items-center gap-2">
                        PlanDecks
                    </Link>

                    {/* Navigasyon */}
                    <nav className="flex items-center gap-6">
                        <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium hidden md:block">
                            Anasayfa
                        </Link>
                        <Link to="/about" className="text-gray-600 hover:text-blue-600 font-medium hidden md:block">
                            Hakkımızda
                        </Link>

                        {/* DİNAMİK BUTONLAR */}
                        {!isLoggedIn ? (
                            // --- GİRİŞ YAPILMAMIŞSA GÖSTERİLECEK ---
                            <div className="flex items-center gap-3">
                                <Link
                                    to="/register"
                                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium px-3 py-2 transition"
                                >
                                    <UserPlus size={18} />
                                    <span className="hidden sm:inline">Kayıt Ol</span>
                                </Link>
                                <Link
                                    to="/login"
                                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm hover:shadow"
                                >
                                    <LogIn size={18} />
                                    <span>Giriş Yap</span>
                                </Link>
                            </div>
                        ) : (
                            // --- GİRİŞ YAPILMIŞSA GÖSTERİLECEK ---
                            <div className="flex items-center gap-3">
                                <Link
                                    to="/dashboard"
                                    className="flex items-center gap-2 text-blue-600 bg-blue-50 hover:bg-blue-100 font-medium px-4 py-2 rounded-lg transition"
                                >
                                    <LayoutDashboard size={18} />
                                    <span>Panele Git</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition"
                                    title="Çıkış Yap"
                                >
                                    <LogOut size={18} />
                                </button>
                            </div>
                        )}
                    </nav>
                </div>
            </header>

            {/* İçerik */}
            <main>
                <Outlet />
            </main>
        </div>
    );
}