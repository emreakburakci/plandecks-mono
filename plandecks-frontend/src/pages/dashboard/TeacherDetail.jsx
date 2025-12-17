import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import AvailabilityGrid from '../../components/AvailabilityGrid';
import { Save, ArrowLeft, Trash2, User, CheckSquare, Square } from 'lucide-react';

export default function TeacherDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [selectedSubjects, setSelectedSubjects] = useState([]); // Array olarak tutuyoruz
    const [allCourses, setAllCourses] = useState([]); // Tüm dersler

    // Varsayılan 7 gün
    const [availability, setAvailability] = useState(
        Array(7).fill().map(() => Array(24).fill(true))
    );
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [teacherRes, courseRes] = await Promise.all([
                api.get(`/teachers/${id}`),
                api.get('/courses')
            ]);

            const t = teacherRes.data;
            setAllCourses(courseRes.data);

            setName(t.name);
            setSelectedSubjects(t.subjects); // Backend zaten liste dönüyor

            if (t.availabilityMatrix) {
                let matrix = t.availabilityMatrix;

                // 1. ADIM: Satır Sayısını (Günleri) 7'ye tamamla
                if (matrix.length < 7) {
                    const missingDays = 7 - matrix.length;
                    // Yeni eklenen günler 24 saatlik olsun
                    const extraRows = Array(missingDays).fill().map(() => Array(24).fill(true));
                    matrix = [...matrix, ...extraRows];
                }

                // 2. ADIM: Sütun Sayısını (Saatleri) HER SATIR İÇİN 24'e tamamla
                // Bu işlemi if bloğunun dışına çıkardık, böylece 7 gün olsa bile saatler düzeltilir.
                matrix = matrix.map(row => {
                    if (row.length < 24) {
                        const missingHours = 24 - row.length;
                        // Eksik saatleri "true" (müsait) olarak ekle
                        return [...row, ...Array(missingHours).fill(true)];
                    }
                    return row;
                });

                setAvailability(matrix);
            }

        } catch (err) {
            alert("Veri yüklenemedi!");
            navigate('/dashboard/teachers');
        } finally {
            setLoading(false);
        }
    };

    const toggleSubject = (subjectName) => {
        if (selectedSubjects.includes(subjectName)) {
            setSelectedSubjects(selectedSubjects.filter(s => s !== subjectName));
        } else {
            setSelectedSubjects([...selectedSubjects, subjectName]);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (selectedSubjects.length === 0) return alert("En az bir ders seçmelisiniz.");

        try {
            await api.put(`/teachers/${id}`, {
                name,
                subjects: selectedSubjects, // Array gönderiyoruz
                availabilityMatrix: availability
            });
            alert("Bilgiler güncellendi! ✅");
        } catch (err) {
            alert("Güncelleme başarısız.");
        }
    };

    const handleDelete = async () => {
        if(!confirm("Bu öğretmeni silmek istediğine emin misin?")) return;
        await api.delete(`/teachers/${id}`);
        navigate('/dashboard/teachers');
    };

    if (loading) return <div className="p-10 text-center">Yükleniyor...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            {/* Üst Bar */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard/teachers')} className="p-2 hover:bg-gray-200 rounded-full">
                        <ArrowLeft size={20}/>
                    </button>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <User className="text-blue-600"/> {name}
                    </h2>
                </div>
                <button onClick={handleDelete} className="text-red-500 hover:bg-red-50 px-3 py-2 rounded flex items-center gap-2 text-sm font-semibold">
                    <Trash2 size={16}/> Sil
                </button>
            </div>

            <form onSubmit={handleUpdate} className="bg-white p-6 rounded-lg shadow-sm">

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
                    <input
                        type="text"
                        className="border rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 outline-none"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                    />
                </div>

                {/* --- YENİ ALAN: DERS SEÇİMİ (EDİT) --- */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Branşlar (Tıklayarak Seçin)</label>
                    <div className="flex flex-wrap gap-2 bg-gray-50 p-4 rounded-lg border">
                        {allCourses.map(course => {
                            const isSelected = selectedSubjects.includes(course.subject);
                            return (
                                <div
                                    key={course.id}
                                    onClick={() => toggleSubject(course.subject)}
                                    className={`cursor-pointer px-4 py-2 rounded-full text-sm flex items-center gap-2 border transition select-none font-medium
                                ${isSelected
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105'
                                        : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-200'}
                            `}
                                >
                                    {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                                    {course.subject}
                                </div>
                            );
                        })}
                    </div>
                    {selectedSubjects.length === 0 && <p className="text-red-500 text-xs mt-1">Lütfen bir branş seçin.</p>}
                </div>

                <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-2">Müsaitlik Durumu</h3>
                    <AvailabilityGrid
                        availability={availability}
                        setAvailability={setAvailability}
                    />
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-semibold shadow-lg shadow-blue-500/30 transition-all"
                    >
                        <Save size={20} /> Değişiklikleri Kaydet
                    </button>
                </div>

            </form>
        </div>
    );
}