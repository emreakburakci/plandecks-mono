import { useState } from 'react'; // State ekledik
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { LayoutDashboard, Users, BookOpen, Home as HomeIcon, Calendar, LogOut, Menu, X } from 'lucide-react'; // Menu ve X ikonları eklendi

export default function DashboardLayout() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobil menü durumu

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const menuItems = [
        { icon: <LayoutDashboard size={20} />, label: 'Panel', path: '/dashboard' },
        { icon: <Calendar size={20} />, label: 'Planlama & Takvim', path: '/dashboard/schedule' },
        { icon: <Users size={20} />, label: 'Öğretmenler', path: '/dashboard/teachers' },
        { icon: <BookOpen size={20} />, label: 'Dersler', path: '/dashboard/courses' },
        { icon: <HomeIcon size={20} />, label: 'Sınıflar (Oda)', path: '/dashboard/rooms' },
        { icon: <Users size={20} />, label: 'Öğrenci Grupları', path: '/dashboard/groups' },
    ];

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* MOBİL OVERLAY (Menü açıkken arkadaki karartma) */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar - Mobilde 'fixed' ve 'translate' ile gizlenir/gösterilir */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-white border-r flex flex-col transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                md:relative md:translate-x-0
            `}>
                <div className="p-6 border-b flex justify-between items-center">
                    <span className="text-xl font-bold text-blue-600">PlanDecks</span>
                    {/* Mobilde kapatma butonu */}
                    <button className="md:hidden" onClick={() => setIsSidebarOpen(false)}>
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsSidebarOpen(false)} // Tıklanınca mobilde menüyü kapat
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                                location.pathname === item.path
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                            }`}
                        >
                            {item.icon}
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Çıkış Yap</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* MOBİL ÜST BAR */}
                <header className="md:hidden flex items-center justify-between p-4 bg-white border-b shadow-sm shrink-0">
                    <span className="font-bold text-blue-600">PlanDecks</span>
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <Menu size={24} />
                    </button>
                </header>

                {/* Sayfa İçeriği */}
                <div className="flex-1 overflow-auto p-4 md:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}