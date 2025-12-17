import { useState, useEffect } from 'react';
import { Sparkles, Brain, Coffee, Zap, Search, Clock, Calculator, Smile, Layers, CheckCircle, Cpu, Hourglass } from 'lucide-react';

const MESSAGES = [
    { text: "Yapay zeka motorları ısınıyor... 🤖", icon: <Brain size={40} className="text-purple-500" /> },
    { text: "Milyarlarca olasılık hesaplanıyor... 🌌", icon: <Search size={40} className="text-blue-500" /> },
    { text: "Öğretmenlerin kahve molaları ayarlanıyor... ☕", icon: <Coffee size={40} className="text-orange-700" /> },
    { text: "Çakışmaları yok etmek için uzay-zaman bükülüyor... ⏳", icon: <Clock size={40} className="text-red-500" /> },
    { text: "En uygun derslikler bulunuyor... 🏫", icon: <Zap size={40} className="text-yellow-500" /> },
    { text: "Matematiksel düğümler tek tek çözülüyor... ➗", icon: <Calculator size={40} className="text-pink-500" /> },
    { text: "Öğrencilerin en sevdiği saatler ayarlanıyor... 😊", icon: <Smile size={40} className="text-yellow-400" /> },
    { text: "Ders programı katmanları optimize ediliyor... 📚", icon: <Layers size={40} className="text-cyan-600" /> },
    { text: "Sanal nöronlar ateşleniyor, çözüm yakın... 🧠", icon: <Cpu size={40} className="text-violet-600" /> },
    { text: "Kaosun içinden düzen yaratılıyor... 🌪️", icon: <Sparkles size={40} className="text-teal-500" /> },
    { text: "Algoritma derinlemesine düşünüyor... 🤔", icon: <Hourglass size={40} className="text-amber-600" /> },
    { text: "Tüm kısıtlamalar gözden geçiriliyor... 📋", icon: <Search size={40} className="text-emerald-600" /> },
    { text: "Neredeyse bitti, mükemmellik zaman alır... ✨", icon: <Sparkles size={40} className="text-indigo-500" /> },
    { text: "Son kontroller yapılıyor, kemerlerinizi bağlayın! 🚀", icon: <CheckCircle size={40} className="text-green-500" /> },

];

export default function LoadingModal() {
    const [msgIndex, setMsgIndex] = useState(0);

    useEffect(() => {
        // Her 2.5 saniyede bir değiştir
        const interval = setInterval(() => {
            setMsgIndex((prev) => (prev + 1) % MESSAGES.length);
        }, 2500);

        return () => clearInterval(interval);
    }, []);

    const currentMsg = MESSAGES[msgIndex];

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center animate-fade-in p-4">
            {/* SABİT BOYUT AYARI:
                w-[30rem] -> Genişliği sabitler (~480px)
                h-[26rem] -> Yüksekliği sabitler (~416px)
                Böylece içerik ne kadar uzun olursa olsun kutu titremez.
            */}
            <div className="bg-white rounded-3xl shadow-2xl flex flex-col items-center justify-center w-[30rem] h-[26rem] text-center relative overflow-hidden border border-gray-100">

                {/* Arka plan dekorasyonu */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient-x"></div>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-50 rounded-full blur-2xl opacity-50"></div>
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-purple-50 rounded-full blur-2xl opacity-50"></div>

                {/* --- ANİMASYONLU GÖRSEL ALANI --- */}
                <div className="relative w-28 h-28 mb-8 flex items-center justify-center">
                    {/* Dış halkalar */}
                    <div className="absolute inset-0 border-[6px] border-blue-50 rounded-full"></div>
                    <div className="absolute inset-0 border-[6px] border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                    <div className="absolute inset-2 border-4 border-purple-100 rounded-full"></div>

                    {/* Ortadaki İkon */}
                    <div key={msgIndex} className="animate-bounce-slow transition-all duration-500 transform">
                        {currentMsg.icon}
                    </div>
                </div>

                {/* --- BAŞLIK --- */}
                <h3 className="text-2xl font-bold text-gray-800 mb-4 transition-all duration-300 tracking-tight">
                    Plan Oluşturuluyor
                </h3>

                {/* --- SABİT YÜKSEKLİKLİ METİN ALANI --- */}
                {/* h-24 (96px) vererek metnin sığacağı sabit bir alan ayırdık. */}
                <div className="h-24 px-8 w-full flex items-center justify-center">
                    <p key={msgIndex} className="text-gray-600 font-medium text-lg leading-relaxed animate-fade-in-up">
                        {currentMsg.text}
                    </p>
                </div>

                {/* Alt bilgi */}
                <p className="text-xs text-gray-400 mt-6 font-medium bg-gray-50 px-3 py-1 rounded-full">
                    Bu işlem veri yoğunluğuna göre biraz zaman alabilir
                </p>
            </div>
        </div>
    );
}