import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import AvailabilityGrid from '../../components/AvailabilityGrid';
import { Plus, Trash2, Edit, CheckSquare, Square } from 'lucide-react';

export default function Teachers() {
    const navigate = useNavigate();
    const [teachers, setTeachers] = useState([]);
    const [allCourses, setAllCourses] = useState([]); // Sistemdeki tüm dersler

    // Form State
    const [name, setName] = useState('');
    const [selectedSubjects, setSelectedSubjects] = useState([]); // Seçilen dersler (String Listesi)

    // Varsayılan müsaitlik (7 Gün)
    const createDefaultGrid = () => Array(7).fill().map(() => Array(24).fill(true));
    const [availability, setAvailability] = useState(createDefaultGrid());

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [teacherRes, courseRes] = await Promise.all([
                api.get('/teachers'),
                api.get('/courses')
            ]);
            setTeachers(teacherRes.data);
            setAllCourses(courseRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    // Ders Seçme/Kaldırma Fonksiyonu
    const toggleSubject = (subjectName) => {
        if (selectedSubjects.includes(subjectName)) {
            setSelectedSubjects(selectedSubjects.filter(s => s !== subjectName));
        } else {
            setSelectedSubjects([...selectedSubjects, subjectName]);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (selectedSubjects.length === 0) return alert("Lütfen en az bir ders seçin!");

        try {
            await api.post('/teachers', {
                name,
                subjects: selectedSubjects, // Artık dizi olarak gönderiyoruz
                availabilityMatrix: availability
            });

            setName('');
            setSelectedSubjects([]);
            setAvailability(createDefaultGrid());
            fetchData();
            alert("Öğretmen eklendi! ✅");
        } catch (err) {
            alert("Ekleme başarısız.");
        }
    };

    const handleDelete = async (id) => {
        if(!confirm("Bu öğretmeni silmek istediğine emin misin?")) return;
        await api.delete(`/teachers/${id}`);
        fetchData();
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Öğretmen Yönetimi</h2>

            {/* Ekleme Formu */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                <form onSubmit={handleAdd}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
                        <input
                            type="text"
                            className="border rounded p-2 w-full md:w-1/2 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                        />
                    </div>

                    {/* --- YENİ ALAN: DERS SEÇİMİ --- */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Verebileceği Dersler (Branşlar)</label>

                        {allCourses.length === 0 ? (
                            <div className="text-red-500 text-sm">Önce Dersler sayfasından ders eklemelisiniz.</div>
                        ) : (
                            <div className="flex flex-wrap gap-2 bg-gray-50 p-3 rounded border">
                                {allCourses.map(course => {
                                    const isSelected = selectedSubjects.includes(course.subject);
                                    return (
                                        <div
                                            key={course.id}
                                            onClick={() => toggleSubject(course.subject)}
                                            className={`cursor-pointer px-3 py-2 rounded-full text-sm flex items-center gap-2 border transition select-none
                                        ${isSelected
                                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'}
                                    `}
                                        >
                                            {isSelected ? <CheckSquare size={14} /> : <Square size={14} />}
                                            {course.subject}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        <p className="text-xs text-gray-500 mt-1">{selectedSubjects.length} ders seçildi.</p>
                    </div>

                    {/* Müsaitlik */}
                    <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Haftalık Müsaitlik</h3>
                        <AvailabilityGrid availability={availability} setAvailability={setAvailability} />
                    </div>

                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
                        <Plus size={18} /> Öğretmeni Kaydet
                    </button>
                </form>
            </div>

            {/* Liste */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                    <tr>
                        <th className="p-4 font-semibold text-gray-600">ID</th>
                        <th className="p-4 font-semibold text-gray-600">Ad Soyad</th>
                        <th className="p-4 font-semibold text-gray-600">Branşlar</th>
                        <th className="p-4 font-semibold text-gray-600">Durum</th>
                        <th className="p-4 text-right">İşlem</th>
                    </tr>
                    </thead>
                    <tbody>
                    {teachers.map(t => (
                        <tr
                            key={t.id}
                            className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => navigate(`/dashboard/teachers/${t.id}`)}
                        >
                            <td className="p-4 text-gray-500">#{t.id}</td>
                            <td className="p-4 font-medium text-gray-900">{t.name}</td>
                            <td className="p-4">
                                {t.subjects.map(s => (
                                    <span key={s} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1 border border-blue-200">
                      {s}
                    </span>
                                ))}
                            </td>
                            <td className="p-4">
                                {t.availabilityJson
                                    ? <span className="text-orange-600 bg-orange-50 px-2 py-1 rounded text-xs font-semibold border border-orange-200">Özel Plan</span>
                                    : <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-semibold border border-green-200">Tam Müsait</span>
                                }
                            </td>
                            <td className="p-4 text-right flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                <button onClick={() => navigate(`/dashboard/teachers/${t.id}`)} className="text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded-full">
                                    <Edit size={18} />
                                </button>
                                <button onClick={() => handleDelete(t.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-full">
                                    <Trash2 size={18} />
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}