import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Plus, Trash2, CheckSquare, Square, PlusCircle } from 'lucide-react';

// Varsayılan Başlangıç Listesi
const DEFAULT_FEATURES = ["Whiteboard", "Projector", "SmartBoard", "Lab", "Computer", "Gym"];

export default function Rooms() {
    const [rooms, setRooms] = useState([]);

    // Dinamik Özellik Listesi State'i
    const [availableFeatures, setAvailableFeatures] = useState(DEFAULT_FEATURES);
    const [newFeatureInput, setNewFeatureInput] = useState(""); // Yeni özellik yazma kutusu

    // Form State
    const [name, setName] = useState('');
    const [type, setType] = useState('Classroom');
    const [capacity, setCapacity] = useState(30);
    const [selectedFeatures, setSelectedFeatures] = useState([]);

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const res = await api.get('/rooms');
            setRooms(res.data);

            // --- DİNAMİK LİSTE OLUŞTURMA ---
            // Veritabanındaki odalarda kullanılan tüm özellikleri topla
            const usedFeatures = new Set([...DEFAULT_FEATURES]); // Varsayılanları ekle
            res.data.forEach(room => {
                if (room.features) {
                    room.features.forEach(f => usedFeatures.add(f));
                }
            });
            // Set'i diziye çevirip state'e at
            setAvailableFeatures(Array.from(usedFeatures));

        } catch (err) {
            console.error(err);
        }
    };

    const toggleFeature = (feature) => {
        if (selectedFeatures.includes(feature)) {
            setSelectedFeatures(selectedFeatures.filter(f => f !== feature));
        } else {
            setSelectedFeatures([...selectedFeatures, feature]);
        }
    };

    // YENİ ÖZELLİK EKLEME FONKSİYONU
    const addNewFeature = () => {
        if (!newFeatureInput.trim()) return;
        const val = newFeatureInput.trim();

        // Listede yoksa listeye ekle
        if (!availableFeatures.includes(val)) {
            setAvailableFeatures([...availableFeatures, val]);
        }
        // Otomatik olarak seçili hale getir
        if (!selectedFeatures.includes(val)) {
            setSelectedFeatures([...selectedFeatures, val]);
        }
        setNewFeatureInput(""); // Kutuyu temizle
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await api.post('/rooms', {
                name, type, capacity,
                features: selectedFeatures
            });

            // Reset
            setName(''); setCapacity(30); setSelectedFeatures([]);
            fetchRooms(); // Listeyi güncelle
        } catch (err) {
            alert("Oda eklenemedi.");
        }
    };

    const handleDelete = async (id) => {
        if(!confirm("Silmek istediğine emin misin?")) return;
        await api.delete(`/rooms/${id}`);
        fetchRooms();
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Sınıf ve Mekan Yönetimi</h2>

            <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                <form onSubmit={handleAdd}>
                    <div className="flex flex-wrap gap-4 mb-4">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Oda Adı</label>
                            <input type="text" className="border rounded p-2 w-full" value={name} onChange={e => setName(e.target.value)} required />
                        </div>
                        <div className="w-40">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tip</label>
                            <select className="border rounded p-2 w-full" value={type} onChange={e => setType(e.target.value)}>
                                <option value="Classroom">Sınıf</option>
                                <option value="Laboratory">Laboratuvar</option>
                                <option value="Gym">Spor Salonu</option>
                            </select>
                        </div>
                        <div className="w-24">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kapasite</label>
                            <input type="number" className="border rounded p-2 w-full" value={capacity} onChange={e => setCapacity(e.target.value)} required />
                        </div>
                    </div>

                    {/* --- ÖZELLİK SEÇİMİ VE EKLEME --- */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Oda Özellikleri / Ekipmanlar</label>

                        <div className="bg-gray-50 p-3 rounded border">
                            {/* Mevcut Seçenekler */}
                            <div className="flex flex-wrap gap-2 mb-3">
                                {availableFeatures.map(feat => {
                                    const isSelected = selectedFeatures.includes(feat);
                                    return (
                                        <div
                                            key={feat}
                                            onClick={() => toggleFeature(feat)}
                                            className={`cursor-pointer px-3 py-1.5 rounded-full text-sm flex items-center gap-2 border transition select-none
                                        ${isSelected
                                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'}
                                    `}
                                        >
                                            {isSelected ? <CheckSquare size={14} /> : <Square size={14} />}
                                            {feat}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Yeni Ekleme Inputu */}
                            <div className="flex gap-2 items-center max-w-xs">
                                <input
                                    type="text"
                                    placeholder="+ Yeni Özellik Ekle"
                                    className="border rounded p-1.5 text-sm flex-1 outline-none focus:border-blue-500"
                                    value={newFeatureInput}
                                    onChange={(e) => setNewFeatureInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addNewFeature())}
                                />
                                <button
                                    type="button"
                                    onClick={addNewFeature}
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-1.5 rounded"
                                    title="Listeye Ekle"
                                >
                                    <PlusCircle size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
                        <Plus size={18} /> Odayı Kaydet
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                    <tr>
                        <th className="p-4 font-semibold text-gray-600">Oda Adı</th>
                        <th className="p-4 font-semibold text-gray-600">Kapasite</th>
                        <th className="p-4 font-semibold text-gray-600">Özellikler</th>
                        <th className="p-4 text-right">İşlem</th>
                    </tr>
                    </thead>
                    <tbody>
                    {rooms.map(room => (
                        <tr key={room.id} className="border-b hover:bg-gray-50">
                            <td className="p-4 font-medium">{room.name}</td>
                            <td className="p-4 text-gray-500">{room.capacity}</td>
                            <td className="p-4">
                                {room.features && room.features.map(f => (
                                    <span key={f} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded mr-1 border border-green-200">
                          {f}
                      </span>
                                ))}
                            </td>
                            <td className="p-4 text-right">
                                <button onClick={() => handleDelete(room.id)} className="text-red-500 hover:text-red-700">
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