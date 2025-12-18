import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import StatCard from '../../components/StatCard';
import { Users, Home, BookOpen, Layers, Calendar, ArrowRight,Trash2 } from 'lucide-react';

export default function DashboardHome() {
    const [stats, setStats] = useState({ teacherCount: 0, studentGroupCount: 0, courseCount: 0, roomCount: 0, planCount: 0 });
    const [plans, setPlans] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const statsRes = await api.get('/dashboard/stats');
            setStats(statsRes.data);

            const plansRes = await api.get('/dashboard/plans');
            // Son oluşturulan en üstte olsun
            setPlans(plansRes.data.reverse());
        } catch (err) {
            console.error("Dashboard verisi çekilemedi", err);
        }
    };

    // --- SİLME İŞLEMİ ---
    const handleDelete = async (e, planId) => {
        // Kartın tıklanma olayını durdur (Detaya gitmesin)
        e.stopPropagation();
        e.preventDefault();

        if (!confirm("Bu planı kalıcı olarak silmek istediğinize emin misiniz?")) return;

        try {
            await api.delete(`/planning/${planId}`);
            // Listeden silinen planı çıkar (State güncelleme)
            setPlans(plans.filter(plan => plan.id !== planId));
        } catch (err) {
            alert("Silme işlemi başarısız oldu.");
        }
    };

    return (
        <div>
            {/* --- İSTATİSTİK KARTLARI --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10 px-2">
                <StatCard
                    title="Toplam Plan"
                    value={stats.planCount}
                    icon={<Layers size={24} />}
                    color="orange"
                    footerText="Oluşturulan ders programları"
                />
                <StatCard
                    title="Öğretmenler"
                    value={stats.teacherCount}
                    icon={<Users size={24} />}
                    color="green"
                    footerText="Kayıtlı eğitmen sayısı"
                />
                <StatCard
                    title="Sınıflar / Odalar"
                    value={stats.roomCount}
                    icon={<Home size={24} />}
                    color="red"
                    footerText="Müsait mekan sayısı"
                />
                <StatCard
                    title="Dersler"
                    value={stats.courseCount}
                    icon={<BookOpen size={24} />}
                    color="blue"
                    footerText="Müfredattaki dersler"
                />
            </div>

            {/* --- PLAN LİSTESİ VE GRAFİK ALANI --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Sol Taraf: Plan Listesi (Geniş Alan) */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 bg-orange-500 text-white">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <Calendar size={20} /> Geçmiş Planlar
                        </h3>
                        <p className="text-orange-100 text-sm">Oluşturduğunuz son ders programları</p>
                    </div>

                    <div className="p-0">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                            <tr>
                                <th className="p-4">Plan Adı</th>
                                <th className="p-4">Oluşturulma Tarihi</th>
                                <th className="p-4 text-left">İşlemler</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {plans.map((plan) => (
                                <tr key={plan.id} className="hover:bg-gray-50 transition">
                                    <td className="p-4 font-medium text-gray-700">
                                        {plan.scheduleName || `Plan #${plan.id}`}
                                    </td>
                                    <td className="p-4 text-gray-500 text-sm">
                                        {new Date(plan.createdAt).toLocaleString('tr-TR')}
                                    </td>
                                    {/* Butonları tek bir hücrede (td) topladık */}
                                    <td className="p-4 text-right flex justify-end gap-2">
                                        <button
                                            onClick={(e) => handleDelete(e, plan.id)}
                                            className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 transition flex items-center gap-1"
                                            title="Sil"
                                        >
                                            <Trash2 size={16}/>
                                        </button>
                                        <button
                                            onClick={() => navigate(`/dashboard/plan/${plan.id}`)}
                                            className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-bold hover:bg-blue-100 flex items-center gap-1"
                                        >
                                            Görüntüle <ArrowRight size={12}/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {plans.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="p-8 text-center text-gray-400">
                                        Henüz hiç plan oluşturmadınız.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Sağ Taraf: Hızlı İşlem veya Bilgi (Görseldeki 3. kolon gibi) */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h4 className="font-bold text-gray-700 mb-4">Sistem Durumu</h4>
                    <div className="space-y-4">
                        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                            <p className="text-green-800 text-sm font-semibold">Servisler Aktif</p>
                            <p className="text-green-600 text-xs">Optimizasyon motoru çalışıyor.</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <p className="text-blue-800 text-sm font-semibold">Son Güncelleme</p>
                            <p className="text-blue-600 text-xs">Veritabanı senkronize edildi.</p>
                        </div>
                        <button
                            onClick={() => navigate('/dashboard/schedule')}
                            className="w-full bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-700 transition shadow-lg mt-4"
                        >
                            + Yeni Plan Oluştur
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}