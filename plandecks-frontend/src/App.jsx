import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './layout/PublicLayout';
import DashboardLayout from './layout/DashboardLayout';
import { AuthProvider, useAuth } from './auth/AuthContext';

// Pages
import Home from './pages/public/Home';
import Login from './pages/auth/Login';
import Teachers from './pages/dashboard/Teachers';
import Courses from './pages/dashboard/Courses';
import Rooms from './pages/dashboard/Rooms';
import StudentGroups from './pages/dashboard/StudentGroups';
import ScheduleCalendar from './pages/dashboard/ScheduleCalendar';
import DashboardHome from "./pages/dashboard/DashboardHome.jsx";
import PlanDetail from "./pages/dashboard/PlanDetail.jsx";
import TeacherDetail from './pages/dashboard/TeacherDetail';
import Register from "./pages/auth/Register.jsx";
import VerifyAccount from "./pages/auth/VerifyAccount.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";

// Korumalı Route Bileşeni
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Yükleniyor...</div>;
    if (!user) return <Navigate to="/login" />;
    return children;
};

export default function App() {
    return (
        <AuthProvider>
            <Routes>
                {/* Public Routes */}
                <Route element={<PublicLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<div className="p-10 text-center">Hakkımızda Sayfası</div>} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/verify" element={<VerifyAccount />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                </Route>

                <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                    <Route index element={<DashboardHome />} /> {/* Anasayfa artık DashboardHome */}
                    <Route path="plan/:id" element={<PlanDetail />} /> {/* Detay Sayfası */}

                    <Route path="teachers" element={<Teachers />} />
                    <Route path="schedule" element={<ScheduleCalendar />} />
                    <Route path="courses" element={<Courses />} />
                    <Route path="rooms" element={<Rooms />} />
                    <Route path="groups" element={<StudentGroups />} />
                    <Route path="teachers" element={<Teachers />} />
                    <Route path="teachers/:id" element={<TeacherDetail />} />

                </Route>
            </Routes>
        </AuthProvider>
    );
}