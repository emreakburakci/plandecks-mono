import { useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import api from '../../api/axios';
import { convertEventsToBackendFormat } from '../../utils/calendarUtils';
import LoadingModal from '../../components/LoadingModal'; // Yolu dosya yapınıza göre ayarlayın

import {
    Save,
    Play,
    Loader,
    Settings,
    ChevronDown,
    ChevronUp,
    X,
    Clock,
    MapPin,
    User,
    Users,
    BookOpen,
    AlertTriangle, AlignLeft, AlignJustify, Info, HelpCircle
} from 'lucide-react';import AvailabilityGrid from "../../components/AvailabilityGrid.jsx";
import Tooltip from "../../components/Tooltip.jsx";
export default function ScheduleCalendar() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [planName, setPlanName] = useState('');

    const [globalAvailability, setGlobalAvailability] = useState(
        Array(7).fill().map(() => Array(24).fill(true))
    );
    const [showSettings, setShowSettings] = useState(false);

    const [strategy, setStrategy] = useState("DISTRIBUTED"); // Varsayılan: DAĞITIK
    // HATA MODAL STATE'İ
    const [errorList, setErrorList] = useState([]);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [showHelpAlert, setShowHelpAlert] = useState(true); // YENİ: Yardım kutusu görünürlüğü

    // --- DETAY MODAL STATE'LERİ ---
    const [selectedEvent, setSelectedEvent] = useState(null); // Tıklanan dersin verisi
    const [isModalOpen, setIsModalOpen] = useState(false);


    const calendarRef = useRef(null);


    const handleGenerate = async () => {
        setLoading(true);
        setErrorList([]); // Temizle
        try {
            const res = await api.post('/planning/generate', { globalAvailability,strategy });

            // INFEASIBLE KONTROLÜ
            if (res.data.status === 'INFEASIBLE' || res.data.status === 'MODEL_INVALID') {
                // Backend'den gelen hata listesini al
                const reasons = res.data.failureReasons || ["Bilinmeyen bir sebepten dolayı plan oluşturulamadı. Kısıtlamaları gevşetin."];
                setErrorList(reasons);
                setShowErrorModal(true);
            } else {
                const formattedEvents = transformDataToEvents(res.data);
                setEvents(formattedEvents);
                setShowSettings(false);
            }
        } catch (err) {
            console.error(err);
            alert("Plan hesaplanırken hata oluştu!");
        } finally {
            setLoading(false);
        }
    };

    // 2. KAYDET
    const handleSave = async () => {
        if (!planName) return alert("Lütfen plana bir isim verin.");
        if (events.length === 0) return alert("Kaydedilecek bir plan yok.");

        const calendarApi = calendarRef.current.getApi();
        const currentEvents = calendarApi.getEvents().map(e => ({
            start: e.start,
            end: e.end,
            title: e.title,
            extendedProps: e.extendedProps
        }));

        const scheduleData = convertEventsToBackendFormat(currentEvents);
        console.log(scheduleData)

        try {
            await api.post('/planning/save', {
                name: planName,
                scheduleData: scheduleData
            });
            alert("Plan başarıyla kaydedildi! 🎉");
            setEvents([]);
            setPlanName('');
        } catch (err) {
            alert("Kaydetme başarısız.");
        }
    };
// --- VERİ DÖNÜŞTÜRME (DÜZELTİLMİŞ) ---
    const transformDataToEvents = (data) => {
        const calendarEvents = [];
        const today = new Date();
        const currentDay = today.getDay(); // 0: Pazar, 1: Pzt ...

        // Pazartesi'yi haftanın başı yap
        const distanceToMonday = (currentDay === 0 ? -6 : 1) - currentDay;
        const mondayDate = new Date(today);
        mondayDate.setDate(today.getDate() + distanceToMonday);

        data.schedules.forEach(classSchedule => {
            classSchedule.days.forEach(daySchedule => {
                let dayOffset = 0;
                switch(daySchedule.day) {
                    case "Pazartesi": dayOffset = 0; break;
                    case "Salı": dayOffset = 1; break;
                    case "Çarşamba": dayOffset = 2; break;
                    case "Perşembe": dayOffset = 3; break;
                    case "Cuma": dayOffset = 4; break;
                    case "Cumartesi": dayOffset = 5; break;
                    case "Pazar": dayOffset = 6; break;
                }

                // --- GÜN KAYMASINI ÖNLEYEN KOD ---
                const eventDate = new Date(mondayDate);
                eventDate.setDate(mondayDate.getDate() + dayOffset);

                // toISOString() ASLA KULLANMAYIN. Yerel tarih stringi oluşturuyoruz:
                const year = eventDate.getFullYear();
                const month = String(eventDate.getMonth() + 1).padStart(2, '0');
                const day = String(eventDate.getDate()).padStart(2, '0');
                const dateStr = `${year}-${month}-${day}`;
                // ----------------------------------

                daySchedule.lessons.forEach(lesson => {
                    // Backend'den gelen "00:00" gibi saati direkt kullanıyoruz.
                    // Eski kodunuzda burada calculateRealTime vardı, onu kaldırdık.
                    const startHour = parseInt(lesson.time.split(':')[0]);
                    const endHour = startHour + 1;

                    calendarEvents.push({
                        id: Math.random().toString(36).substr(2, 9),
                        title: lesson.course,
                        // Tarih ve saati manuel birleştiriyoruz, böylece tarayıcı yerel saat kabul eder
                        start: `${dateStr}T${lesson.time}:00`,
                        end: `${dateStr}T${endHour.toString().padStart(2, '0')}:00:00`,
                        backgroundColor: getColor(classSchedule.className),
                        borderColor: getColor(classSchedule.className),
                        textColor: '#ffffff',
                        extendedProps: {
                            course: lesson.course,
                            teacher: lesson.teacher,
                            room: lesson.room,
                            group: classSchedule.className,
                            // Detaylarda görünecek saat bilgisi
                            fullTime: `${lesson.time} - ${endHour.toString().padStart(2, '0')}:00`
                        }
                    });
                });
            });
        });
        return calendarEvents;
    };
    const getColor = (str) => {
        const colors = ['#2563eb', '#dc2626', '#16a34a', '#d97706', '#9333ea', '#0891b2', '#be185d'];
        let hash = 0;
        for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
    };
    const renderEventContent = (eventInfo) => {
        return (
            <div className="p-1 h-full flex flex-col justify-center leading-tight overflow-hidden">
                {/* Yazıların alt satıra geçmesi için whitespace-normal kullanıyoruz */}
                <div className="font-bold text-xs whitespace-normal">{eventInfo.event.title}</div>
                <div className="text-[10px] font-bold text-yellow-200 whitespace-normal mt-0.5 border-b border-white/20 pb-0.5 mb-0.5">
                    {eventInfo.event.extendedProps.group}
                </div>
                <div className="text-[10px] italic opacity-90 whitespace-normal">{eventInfo.event.extendedProps.teacher}</div>
                <div className="text-[10px] opacity-80 whitespace-normal">{eventInfo.event.extendedProps.room}</div>
            </div>
        );
    };

    // --- CLICK HANDLE ---
    const handleEventClick = (clickInfo) => {
        setSelectedEvent(clickInfo.event);
        setIsModalOpen(true);
    };


    return (
        <div className="h-full flex flex-col relative">
            {/* Üst Bar (Aynı) */}
            <div className="mb-4 bg-white p-4 rounded-lg shadow-sm flex flex-col gap-4">
                {/* --- YENİ: YARDIM KUTUSU --- */}
                {showHelpAlert && (
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg flex items-start justify-between animate-fade-in">
                        <div className="flex gap-3">
                            <div className="bg-blue-100 p-2 rounded-full text-blue-600 mt-0.5"><Info size={20} /></div>
                            <div className="text-sm text-blue-800">
                                <h4 className="font-bold mb-1">PlanDecks'e Hoş Geldiniz!</h4>
                                <ul className="list-disc list-inside space-y-1 text-blue-700">
                                    <li>Önce <strong>"Ayarlar"</strong> butonuna tıklayarak plan saatlerini ve stratejinizi belirleyin.</li>
                                    <li>Ardından <strong>"Otomatik Planla"</strong> butonuna basarak yapay zekanın planı oluşturmasını bekleyin.</li>
                                    <li>Oluşan plan üzerinde dersleri sürükleyip bırakarak manuel düzenleme yapabilirsiniz.</li>
                                </ul>
                            </div>
                        </div>
                        <button onClick={() => setShowHelpAlert(false)} className="text-blue-400 hover:text-blue-600"><X size={18}/></button>
                    </div>
                )}
                <div className="flex justify-between items-center flex-wrap gap-4">
                    <h2 className="text-xl font-bold text-gray-700">Yeni Plan Oluştur
                        <Tooltip text="Bu ekran, öğretmen ve derslik kısıtlamalarına göre en uygun programı otomatik hazırlar." position="right">
                            <HelpCircle size={16} className="text-gray-400 cursor-help"/>
                        </Tooltip>
                    </h2>
                    <div className="flex gap-4 items-center">
                        <Tooltip text="Planı kaydederken bu isim kullanılacak." position="bottom">
                            <input type="text" placeholder="Örn: 2025 Güz Dönemi Taslak 1" className="border p-2 rounded w-64 outline-none focus:ring-2 focus:ring-blue-500" value={planName} onChange={(e) => setPlanName(e.target.value)}/>
                        </Tooltip>


                        <Tooltip text="Plan stratejisi ve planlama yapılacak saatleri ayarlayın.">

                        <button onClick={() => setShowSettings(!showSettings)} className="border px-4 py-2 rounded hover:bg-gray-100 flex items-center gap-2 text-gray-700">
                            <Settings size={18}/>Ayarlar {showSettings ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                        </button>
                        </Tooltip>

                        <Tooltip text="Yapay zeka motorunu çalıştırır ve dersleri otomatik yerleştirir.">
                        <button onClick={handleGenerate} disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
                            {loading ? <Loader className="animate-spin" size={18}/> : <Play size={18}/>} Otomatik Planla
                        </button>
                        </Tooltip>

                        <Tooltip text="Oluşturulan planı kaydeder. Kaydedilen plana Panel sayfasından ulaşabilir üzerinde değişiklik yapabilirsiniz.">

                        <button onClick={handleSave} disabled={events.length === 0} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-2">
                            <Save size={18}/> Kaydet
                        </button>
                        </Tooltip>

                    </div>
                </div>

                {showSettings && (
                    <div className="border-t pt-4 mt-2 animate-fade-in-down">
                        {/* 2. Sütun: Planlama Stratejisi (YENİ) */}
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                            <h3 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                                <Settings size={18}/> Strateji
                            </h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setStrategy("COMPRESSED")}
                                    className={`flex-1 p-2 rounded text-sm font-medium transition flex flex-col items-center gap-1 ${strategy === "COMPRESSED" ? 'bg-purple-600 text-white shadow-lg' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}
                                >
                                    <AlignLeft size={20} />
                                    Sıkıştırılmış
                                </button>
                                <button
                                    onClick={() => setStrategy("DISTRIBUTED")}
                                    className={`flex-1 p-2 rounded text-sm font-medium transition flex flex-col items-center gap-1 ${strategy === "DISTRIBUTED" ? 'bg-purple-600 text-white shadow-lg' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}
                                >
                                    <AlignJustify size={20} />
                                    Dağıtılmış
                                </button>
                            </div>
                            <p className="text-[10px] text-purple-600 mt-2 text-center">
                                {strategy === "COMPRESSED" ? "Dersler mümkün olan en erken saatlere yerleştirilir." : "Dersler tüm haftaya daha dengeli yayılmaya çalışılır."}
                            </p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <h3 className="font-semibold text-blue-800 mb-2">📅 Planlanabilir Zaman Dilimleri</h3>
                            <AvailabilityGrid availability={globalAvailability} setAvailability={setGlobalAvailability} />
                        </div>

                    </div>

                )}
            </div>

            {/* --- LOADING MODAL --- */}
            {/* loading true ise modalı göster, false ise gizle */}
            {loading && <LoadingModal />}

            {/* TAKVİM ALANI */}
            <div className="flex-1 bg-white p-4 rounded-lg shadow relative min-h-[85vh]">

                {/* Özel CSS Injection: Slot yüksekliğini artırır */}
                <style>{`
          .fc-timegrid-slot { height: 60px !important; } 
        `}</style>

                <FullCalendar
                    ref={calendarRef}
                    plugins={[timeGridPlugin, interactionPlugin]}
                    initialView="timeGridWeek"
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'timeGridWeek,timeGridDay'
                    }}
                    slotMinTime="00:00:00"
                    slotMaxTime="24:00:00"
                    allDaySlot={false}
                    weekends={true}
                    firstDay={1}
                    events={events}
                    editable={true}
                    height="100%"

                    // --- YENİ EKLENEN ÖZELLİKLER ---
                    eventContent={renderEventContent} // Kutu içi tasarım
                    eventClick={handleEventClick}     // Tıklama olayı
                    slotLabelInterval="01:00"         // Saat etiketlerini netleştirir
                />
            </div>
            {/* --- HATA RAPORU MODALI --- */}
            {showErrorModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">

                        {/* Başlık */}
                        <div className="bg-red-50 p-6 border-b border-red-100 flex items-start gap-4">
                            <div className="bg-red-100 p-2 rounded-full text-red-600 shrink-0">
                                <AlertTriangle size={28} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-red-700">Planlama Başarısız</h3>
                                <p className="text-red-600 text-sm mt-1">
                                    Aşağıdaki sorunlar nedeniyle uygun bir ders programı oluşturulamadı:
                                </p>
                            </div>
                        </div>

                        {/* Hata Listesi */}
                        <div className="p-6 max-h-80 overflow-y-auto bg-white">
                            <ul className="space-y-3">
                                {errorList.map((err, index) => (
                                    <li key={index} className="flex items-start gap-3 text-gray-700 text-sm bg-gray-50 p-3 rounded border border-gray-200">
                                        <span className="text-red-500 font-bold select-none">•</span>
                                        {err}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-gray-50 border-t flex justify-end">
                            <button
                                onClick={() => setShowErrorModal(false)}
                                className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-lg font-medium transition flex items-center gap-2"
                            >
                                <X size={18}/> Kapat ve Düzenle
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* --- DETAY MODAL --- */}
            {isModalOpen && selectedEvent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden transform transition-all scale-100">

                        {/* Modal Header */}
                        <div className="bg-indigo-600 p-4 flex justify-between items-start text-white">
                            <div>
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <BookOpen size={20} />
                                    {selectedEvent.title}
                                </h3>
                                <p className="text-indigo-200 text-sm mt-1">{selectedEvent.extendedProps.fullTime}</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-white hover:bg-indigo-700 p-1 rounded-full transition">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-4">

                            <div className="flex items-center gap-3 text-gray-700">
                                <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                                    <Users size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold uppercase">Öğrenci Grubu</p>
                                    <p className="font-medium">{selectedEvent.extendedProps.group}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-gray-700">
                                <div className="bg-green-100 p-2 rounded-full text-green-600">
                                    <User size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold uppercase">Öğretmen</p>
                                    <p className="font-medium">{selectedEvent.extendedProps.teacher}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-gray-700">
                                <div className="bg-purple-100 p-2 rounded-full text-purple-600">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold uppercase">Derslik / Mekan</p>
                                    <p className="font-medium">{selectedEvent.extendedProps.room}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-gray-700">
                                <div className="bg-orange-100 p-2 rounded-full text-orange-600">
                                    <Clock size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold uppercase">Zaman Dilimi</p>
                                    <p className="font-medium">{selectedEvent.start.toLocaleDateString('tr-TR', { weekday: 'long' })}</p>
                                </div>
                            </div>

                        </div>

                        {/* Modal Footer */}
                        <div className="bg-gray-50 p-4 flex justify-end">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 transition"
                            >
                                Kapat
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}