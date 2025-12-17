import { useEffect, useState, useRef } from 'react'; // useRef eklendi
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

export default function VerifyAccount() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('Doğrulanıyor...');

    // İsteğin atılıp atılmadığını kontrol eden ref
    const hasFetched = useRef(false);

    useEffect(() => {
        // Eğer istek daha önce atıldıysa durdur
        if (hasFetched.current) return;

        const verify = async () => {
            const code = searchParams.get('code');
            if (!code) return setStatus("Hata: Doğrulama kodu bulunamadı.");

            // İsteğin atıldığını işaretle (React StrictMode için)
            hasFetched.current = true;

            try {
                const res = await api.get(`/auth/verify?code=${code}`);

                // Token'ı kaydet
                localStorage.setItem('token', res.data.token);

                setStatus("✅ Hesap başarıyla doğrulandı! Yönlendiriliyorsunuz...");

                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1500);
            } catch (err) {
                // Eğer token zaten varsa (ilk istek başarılıysa) hatayı gösterme, yönlendir
                if (localStorage.getItem('token')) {
                    setStatus("✅ Hesap zaten doğrulanmış! Yönlendiriliyorsunuz...");
                    setTimeout(() => window.location.href = '/dashboard', 1000);
                } else {
                    console.error(err);
                    setStatus("❌ Doğrulama başarısız. Link geçersiz veya süresi dolmuş olabilir.");
                }
            }
        };

        verify();

        // Cleanup function gerekmiyor çünkü hasFetched kalıcı olmalı
    }, []); // Dependency array boş

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-sm w-full">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Hesap Aktivasyonu</h2>
                <p className={`text-lg ${status.includes('✅') ? 'text-green-600' : status.includes('❌') ? 'text-red-600' : 'text-gray-600'}`}>
                    {status}
                </p>
            </div>
        </div>
    );
}