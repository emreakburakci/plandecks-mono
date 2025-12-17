import { Link } from 'react-router-dom';
import { Calendar, CheckCircle, Zap, ArrowRight, Layout, ShieldCheck, Users } from 'lucide-react';

export default function Home() {
    return (
        <div className="min-h-screen bg-white flex flex-col font-sans">

            {/* --- NAVBAR --- */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-indigo-200 shadow-md">
                            <Calendar size={24} strokeWidth={3} />
                        </div>
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                            PlanDecks
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/login" className="hidden md:block text-gray-600 font-medium hover:text-indigo-600 transition">
                            Giriş Yap
                        </Link>
                        <Link to="/register" className="bg-indigo-600 text-white px-6 py-2.5 rounded-full font-medium hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 transform hover:-translate-y-0.5">
                            Ücretsiz Dene
                        </Link>
                    </div>
                </div>
            </nav>

            {/* --- HERO SECTION (RESİMLİ ALAN) --- */}
            <header className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden min-h-[90vh] flex items-center">

                {/* 1. ARKA PLAN RESMİ */}
                <div className="absolute inset-0 z-0">
                    <img
                        // Unsplash'ten ofis/planlama temalı profesyonel bir görsel
                        src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2664&auto=format&fit=crop"
                        alt="Planning Background"
                        className="w-full h-full object-cover"
                    />

                    {/* 2. KOYU FİLTRE (Yazı Okunabilirliği İçin) */}
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-indigo-900/30"></div>
                </div>

                {/* 3. İÇERİK (Yazıların Olduğu Kısım) */}
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="w-full md:w-2/3 lg:w-1/2 text-left animate-fade-in-up">

                        {/* Etiket */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-sm font-semibold mb-8 backdrop-blur-sm">
                            <Zap size={16} className="text-yellow-400" fill="currentColor" />
                            <span>Yapay Zeka Destekli Okul Planlama</span>
                        </div>

                        {/* Başlık */}
                        <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6 tracking-tight drop-shadow-sm">
                            Ders Programı <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-cyan-300">
                                Artık Dert Değil.
                            </span>
                        </h1>

                        {/* Alt Açıklama */}
                        <p className="text-lg md:text-xl text-slate-300 mb-10 leading-relaxed font-light">
                            Karmaşık Excel tablolarıyla saatlerinizi harcamayın.
                            Öğretmen, derslik ve zaman kısıtlamalarını girin;
                            saniyeler içinde çakışmasız ve mükemmel programı oluşturun.
                        </p>

                        {/* Butonlar */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                to="/register"
                                className="px-8 py-4 bg-white text-indigo-900 rounded-full font-bold text-lg hover:bg-indigo-50 transition shadow-xl flex items-center justify-center gap-2 group"
                            >
                                Hemen Başlayın
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
                            </Link>
                            <Link
                                to="/login"
                                className="px-8 py-4 bg-transparent border border-slate-500 text-white rounded-full font-bold text-lg hover:bg-slate-800/40 hover:border-white transition flex items-center justify-center gap-2 backdrop-blur-sm"
                            >
                                Giriş Yap
                            </Link>
                        </div>

                        {/* Güven Sinyalleri */}
                        <div className="mt-12 flex flex-wrap items-center gap-6 text-slate-400 text-sm font-medium">
                            <div className="flex items-center gap-2">
                                <CheckCircle size={18} className="text-green-400" /> Kredi Kartı Gerekmez
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle size={18} className="text-green-400" /> Sınırsız Deneme
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle size={18} className="text-green-400" /> 7/24 Destek
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* --- ÖZELLİKLER BÖLÜMÜ --- */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                        <h2 className="text-indigo-600 font-bold tracking-wide uppercase text-sm mb-3">Neden Biz?</h2>
                        <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Okul Yönetimini Kolaylaştırın</h3>
                        <p className="text-gray-500 text-lg">Geleneksel yöntemlerin aksine, modern algoritmalarla zamanınızı size geri kazandırıyoruz.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Özellik 1 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition duration-300">
                            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6 shadow-inner">
                                <Zap size={28} />
                            </div>
                            <h4 className="text-xl font-bold text-gray-800 mb-3">Akıllı Optimizasyon</h4>
                            <p className="text-gray-600 leading-relaxed">
                                Google OR-Tools altyapısıyla binlerce olasılığı tarar, öğretmen ve sınıflar için en adil dağılımı bulur.
                            </p>
                        </div>

                        {/* Özellik 2 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition duration-300">
                            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-6 shadow-inner">
                                <ShieldCheck size={28} />
                            </div>
                            <h4 className="text-xl font-bold text-gray-800 mb-3">Sıfır Çakışma</h4>
                            <p className="text-gray-600 leading-relaxed">
                                Aynı öğretmenin iki sınıfta olması veya bir sınıfın iki dersi olması gibi hataları matematiksel olarak engeller.
                            </p>
                        </div>

                        {/* Özellik 3 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition duration-300">
                            <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 mb-6 shadow-inner">
                                <Users size={28} />
                            </div>
                            <h4 className="text-xl font-bold text-gray-800 mb-3">Kolay Paylaşım</h4>
                            <p className="text-gray-600 leading-relaxed">
                                Oluşturulan programı Excel'e aktarın veya öğretmenlerinizle dijital olarak paylaşın.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="bg-white border-t border-gray-200 py-12 mt-auto">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-4 opacity-80">
                        <Calendar className="text-indigo-600" />
                        <span className="text-xl font-bold text-gray-900">PlanDecks</span>
                    </div>
                    <p className="text-gray-400 text-sm">© 2025 Tüm Hakları Saklıdır. Eğitim Kurumları İçin Geliştirildi.</p>
                </div>
            </footer>
        </div>
    );
}