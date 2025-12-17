import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Plus, Trash2, CheckSquare, Square, PlusCircle, AlertTriangle, X } from 'lucide-react';

const DEFAULT_EQUIPMENT = ["Whiteboard", "Projector", "Lab", "Computer", "Gym"];

export default function Courses() {
    const [courses, setCourses] = useState([]);

    // Dinamik Liste & Form State
    const [availableEquipment, setAvailableEquipment] = useState(DEFAULT_EQUIPMENT);
    const [newEquipInput, setNewEquipInput] = useState("");
    const [subject, setSubject] = useState('');
    const [weeklyCount, setWeeklyCount] = useState(2);
    const [requiredEquipment, setRequiredEquipment] = useState([]);

    // --- UYARI POP-UP STATE'LERİ ---
    const [showWarning, setShowWarning] = useState(false);
    const [warningData, setWarningData] = useState({ message: '', dependencies: [] });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => { /* ... Eski kodun aynısı ... */
        try {
            const res = await api.get('/courses');
            setCourses(res.data);
            const used = new Set([...DEFAULT_EQUIPMENT]);
            res.data.forEach(c => c.requiredEquipment?.forEach(e => used.add(e)));
            setAvailableEquipment(Array.from(used));
        } catch (err) { console.error(err); }
    };

    const toggleEquipment = (item) => { /* ... Eski kodun aynısı ... */
        if (requiredEquipment.includes(item)) setRequiredEquipment(requiredEquipment.filter(e => e !== item));
        else setRequiredEquipment([...requiredEquipment, item]);
    };

    const addNewEquipment = () => { /* ... Eski kodun aynısı ... */
        if (!newEquipInput.trim()) return;
        const val = newEquipInput.trim();
        if (!availableEquipment.includes(val)) setAvailableEquipment([...availableEquipment, val]);
        if (!requiredEquipment.includes(val)) setRequiredEquipment([...requiredEquipment, val]);
        setNewEquipInput("");
    };

    const handleAdd = async (e) => { /* ... Eski kodun aynısı ... */
        e.preventDefault();
        try {
            await api.post('/courses', { subject, weeklyCount, requiredEquipment });
            setSubject(''); setWeeklyCount(2); setRequiredEquipment([]);
            fetchData();
        } catch (err) { alert("Hata oluştu."); }
    };

    // --- GÜNCELLENEN SİLME FONKSİYONU ---
    const handleDelete = async (id) => {
        if(!confirm("Silmek istediğine emin misin?")) return;

        try {
            await api.delete(`/courses/${id}`);
            fetchData(); // Başarılıysa listeyi yenile
        } catch (err) {
            // Eğer Backend "409 Conflict" dönerse Pop-up aç
            if (err.response && err.response.status === 409) {
                setWarningData({
                    message: err.response.data.message,
                    dependencies: err.response.data.dependencies || []
                });
                setShowWarning(true);
            } else {
                alert("Silme işlemi sırasında bir hata oluştu.");
            }
        }
    };

    return (
        <div className="relative"> {/* Relative ekledik ki modal içinde düzgün dursun */}
            <h2 className="text-2xl font-bold mb-6">Ders Yönetimi</h2>

            {/* ... FORM ALANI (Değişiklik Yok) ... */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                <form onSubmit={handleAdd}>
                    {/* ... Form inputları aynı ... */}
                    <div className="flex gap-4 mb-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ders Adı</label>
                            <input type="text" className="border rounded p-2 w-full" value={subject} onChange={e => setSubject(e.target.value)} required />
                        </div>
                        <div className="w-32">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Haftalık Saat</label>
                            <input type="number" className="border rounded p-2 w-full" value={weeklyCount} onChange={e => setWeeklyCount(e.target.value)} required />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Gereksinimler</label>
                        <div className="bg-gray-50 p-3 rounded border">
                            <div className="flex flex-wrap gap-2 mb-3">
                                {availableEquipment.map(item => (
                                    <div key={item} onClick={() => toggleEquipment(item)} className={`cursor-pointer px-3 py-1.5 rounded-full text-sm flex items-center gap-2 border ${requiredEquipment.includes(item) ? 'bg-purple-600 text-white' : 'bg-white'}`}>
                                        {requiredEquipment.includes(item) ? <CheckSquare size={14} /> : <Square size={14} />} {item}
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2 items-center max-w-xs">
                                <input type="text" placeholder="+ Yeni" className="border rounded p-1.5 text-sm flex-1" value={newEquipInput} onChange={(e) => setNewEquipInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addNewEquipment())} />
                                <button type="button" onClick={addNewEquipment} className="bg-gray-200 p-1.5 rounded"><PlusCircle size={18}/></button>
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
                        <Plus size={18} /> Ders Ekle
                    </button>
                </form>
            </div>

            {/* ... TABLO ALANI (Değişiklik Yok) ... */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    {/* ... Tablo başlıkları ve body aynı ... */}
                    <thead className="bg-gray-50 border-b">
                    <tr>
                        <th className="p-4">Ders Adı</th><th className="p-4">Saat</th><th className="p-4">Gereksinim</th><th className="p-4 text-right">İşlem</th>
                    </tr>
                    </thead>
                    <tbody>
                    {courses.map(c => (
                        <tr key={c.id} className="border-b hover:bg-gray-50">
                            <td className="p-4">{c.subject}</td>
                            <td className="p-4">{c.weeklyCount}</td>
                            <td className="p-4">{c.requiredEquipment?.map(e=><span key={e} className="mr-1 bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">{e}</span>)}</td>
                            <td className="p-4 text-right">
                                <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-700"><Trash2 size={18}/></button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* --- UYARI MODAL (POP-UP) --- */}
            {showWarning && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fade-in-up">
                        <div className="flex items-center gap-3 text-red-600 mb-4">
                            <div className="bg-red-100 p-2 rounded-full">
                                <AlertTriangle size={24} />
                            </div>
                            <h3 className="text-lg font-bold">Silme İşlemi Engellendi</h3>
                        </div>

                        <p className="text-gray-700 mb-4">
                            {warningData.message} <br/>
                            Lütfen önce aşağıdaki gruplardan bu dersi kaldırın:
                        </p>

                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6 max-h-40 overflow-y-auto">
                            <ul className="list-disc list-inside text-sm text-red-800 font-medium">
                                {warningData.dependencies.map((dep, index) => (
                                    <li key={index}>{dep}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowWarning(false)}
                                className="bg-gray-800 text-white px-5 py-2 rounded hover:bg-gray-900 transition-colors flex items-center gap-2"
                            >
                                <X size={18} /> Tamam
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}