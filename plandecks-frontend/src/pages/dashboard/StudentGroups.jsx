import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Plus, Trash2, CheckSquare } from 'lucide-react';

export default function StudentGroups() {
    const [groups, setGroups] = useState([]);
    const [allCourses, setAllCourses] = useState([]);

    const [name, setName] = useState('');
    const [size, setSize] = useState(20);
    const [selectedCourseIds, setSelectedCourseIds] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [groupsRes, coursesRes] = await Promise.all([
                api.get('/groups'),
                api.get('/courses')
            ]);

            console.log("Gruplar:", groupsRes.data);
            console.log("Tüm Dersler:", coursesRes.data); // Konsoldan bu veriyi kontrol edin

            setGroups(groupsRes.data);
            setAllCourses(coursesRes.data);
        } catch (err) {
            console.error("Veri çekme hatası:", err);
        }
    };

    const handleCourseToggle = (courseId) => {
        if (selectedCourseIds.includes(courseId)) {
            setSelectedCourseIds(selectedCourseIds.filter(id => id !== courseId));
        } else {
            setSelectedCourseIds([...selectedCourseIds, courseId]);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await api.post('/groups', {
                name,
                size,
                courseIds: selectedCourseIds
            });

            setName('');
            setSize(20);
            setSelectedCourseIds([]);
            fetchData();
            alert("Grup başarıyla eklendi.");
        } catch (err) {
            alert("Ekleme başarısız.");
        }
    };

    const handleDelete = async (id) => {
        if(!confirm("Silmek istediğine emin misin?")) return;
        try {
            await api.delete(`/groups/${id}`);
            fetchData();
        } catch (err) {
            alert("Silme işlemi başarısız.");
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Öğrenci Grupleri ve Müfredat</h2>

            {/* Form Alanı */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                <form onSubmit={handleAdd}>
                    <div className="flex gap-4 mb-4">
                        <div className='flex-1'>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Grup Adı</label>
                            <input
                                type="text"
                                className="border rounded p-2 w-full focus:ring-2 focus:ring-blue-500 outline-none"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className='w-32'>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kişi Sayısı</label>
                            <input
                                type="number"
                                className="border rounded p-2 w-full focus:ring-2 focus:ring-blue-500 outline-none"
                                value={size}
                                onChange={e => setSize(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* DERS SEÇİM LİSTESİ */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bu Sınıfın Alacağı Dersler</label>

                        {/* Eğer ders listesi boşsa uyarı ver */}
                        {allCourses.length === 0 ? (
                            <div className="p-4 bg-yellow-50 text-yellow-700 text-sm border rounded">
                                Sistemde hiç ders bulunamadı. Lütfen önce "Dersler" sayfasından ders ekleyin.
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-gray-50 p-3 rounded border h-40 overflow-y-auto">
                                {allCourses.map(course => (
                                    <div key={course.id}
                                         onClick={() => handleCourseToggle(course.id)}
                                         className={`p-2 rounded border cursor-pointer flex items-center gap-2 text-sm transition select-none
                                    ${selectedCourseIds.includes(course.id) ? 'bg-blue-100 border-blue-400 text-blue-800' : 'bg-white hover:bg-gray-100'}
                                `}
                                    >
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${selectedCourseIds.includes(course.id) ? 'bg-blue-500 border-blue-500' : 'border-gray-400'}`}>
                                            {selectedCourseIds.includes(course.id) && <CheckSquare size={12} className="text-white"/>}
                                        </div>

                                        {/* DÜZELTİLMİŞ KISIM: course.subject */}
                                        <span className="truncate" title={course.subject}>
                                    {course.subject} ({course.weeklyCount} Saat)
                                </span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <p className="text-xs text-gray-500 mt-1">{selectedCourseIds.length} ders seçildi.</p>
                    </div>

                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
                        <Plus size={18} /> Grubu Kaydet
                    </button>
                </form>
            </div>

            {/* Liste */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                    <tr>
                        <th className="p-4 font-semibold text-gray-600">Grup Adı</th>
                        <th className="p-4 font-semibold text-gray-600">Mevcut</th>
                        <th className="p-4 font-semibold text-gray-600">Müfredat (Dersler)</th>
                        <th className="p-4 text-right">İşlem</th>
                    </tr>
                    </thead>
                    <tbody>
                    {groups.map(g => (
                        <tr key={g.id} className="border-b hover:bg-gray-50">
                            <td className="p-4 font-medium">{g.name}</td>
                            <td className="p-4 text-gray-500">{g.size} Öğrenci</td>
                            <td className="p-4">
                                <div className="flex flex-wrap gap-1">
                                    {g.courses && g.courses.length > 0 ? (
                                        g.courses.map(c => (
                                            <span key={c.id} className="bg-gray-100 border text-gray-600 text-xs px-2 py-1 rounded">
                                {c.subject}
                              </span>
                                        ))
                                    ) : (
                                        <span className="text-red-400 text-xs italic">Ders seçilmemiş</span>
                                    )}
                                </div>
                            </td>
                            <td className="p-4 text-right">
                                <button onClick={() => handleDelete(g.id)} className="text-red-500 hover:text-red-700">
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