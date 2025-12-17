import {Outlet, Link, useNavigate} from 'react-router-dom';
import {useAuth} from '../auth/AuthContext';
import {LayoutDashboard, Users, BookOpen, Home as HomeIcon, Calendar, LogOut} from 'lucide-react';

export default function DashboardLayout() {
    const {logout} = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const menuItems = [
        {icon: <LayoutDashboard size={20}/>, label: 'Panel', path: '/dashboard'},
        {icon: <Calendar size={20}/>, label: 'Planlama & Takvim', path: '/dashboard/schedule'},
        {icon: <Users size={20}/>, label: 'Öğretmenler', path: '/dashboard/teachers'},
        {icon: <BookOpen size={20}/>, label: 'Dersler', path: '/dashboard/courses'}, // YENİ
        {icon: <HomeIcon size={20}/>, label: 'Sınıflar (Oda)', path: '/dashboard/rooms'}, // YENİ
        {icon: <Users size={20}/>, label: 'Öğrenci Grupları', path: '/dashboard/groups'}, // YENİ
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r flex flex-col">
                <div className="p-6 border-b">
                    <img src="/logo.svg" alt="PlanDecks Logo" className=""/>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition"
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
                        <LogOut size={20}/>
                        <span className="font-medium">Çıkış Yap</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-8">
                <Outlet/>
            </main>
        </div>
    );
}