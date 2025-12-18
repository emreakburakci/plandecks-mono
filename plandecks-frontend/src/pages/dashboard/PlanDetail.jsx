import {useEffect, useRef, useState} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import api from '../../api/axios';
import { ArrowLeft, Save, Loader, X, Clock, MapPin, User, Users, BookOpen, FileSpreadsheet } from 'lucide-react'; // FileSpreadsheet EKLENDİ
import { convertEventsToBackendFormat } from '../../utils/calendarUtils';
import * as XLSX from 'xlsx'; // XLSX EKLENDİ

export default function PlanDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [planName, setPlanName] = useState('');
    const [loading, setLoading] = useState(true);

    // MODAL STATE'LERİ
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const calendarRef = useRef(null);

    useEffect(() => {
        fetchPlanDetail();
    }, [id]);

    const fetchPlanDetail = async () => {
        try {
            const res = await api.get(`/dashboard/plans/${id}`);
            setPlanName(res.data.scheduleName);

            const scheduleData = JSON.parse(res.data.scheduleJsonData);
            const formattedEvents = transformDataToEvents(scheduleData);
            setEvents(formattedEvents);
        } catch (err) {
            alert("Plan detayları yüklenemedi.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        if(!confirm("Bu planda yaptığınız değişiklikler kaydedilecek. Emin misiniz?")) return;

        const calendarApi = calendarRef.current.getApi();
        const currentEvents = calendarApi.getEvents().map(e => ({
            start: e.start,
            end: e.end,
            title: e.title,
            extendedProps: e.extendedProps
        }));

        const scheduleData = convertEventsToBackendFormat(currentEvents);

        try {
            await api.put(`/planning/${id}`, scheduleData);
            alert("Plan güncellendi! ✅");
        } catch (err) {
            alert("Güncelleme hatası.");
        }
    };

    // --- EXCEL DIŞA AKTARMA (YENİ) ---
    const handleExcelExport = () => {
        if (events.length === 0) return alert("İndirilecek veri yok.");

        // 1. Veriyi Excel için uygun formata (JSON Listesi) çevir
        const dataToExport = events.map(event => {
            // Tarihi Türkçe gün ismine çevir
            const dateObj = new Date(event.start);
            const dayName = dateObj.toLocaleDateString('tr-TR', { weekday: 'long' });

            return {
                "Sınıf Grubu": event.extendedProps.group,
                "Gün": dayName,
                "Saat": event.extendedProps.fullTime || "Belirsiz", // fullTime yoksa
                "Ders Adı": event.extendedProps.course,
                "Öğretmen": event.extendedProps.teacher,
                "Derslik": event.extendedProps.room
            };
        });

        // 2. Sıralama Yap (Gün ve Saate Göre) - İsteğe Bağlı ama şık durur
        const dayOrder = { "Pazartesi": 1, "Salı": 2, "Çarşamba": 3, "Perşembe": 4, "Cuma": 5, "Cumartesi": 6, "Pazar": 7 };
        dataToExport.sort((a, b) => {
            const dayDiff = dayOrder[a["Gün"]] - dayOrder[b["Gün"]];
            if (dayDiff !== 0) return dayDiff;
            return a["Saat"].localeCompare(b["Saat"]);
        });

        // 3. Workbook Oluştur
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);

        // Sütun genişliklerini ayarla (Görsel iyileştirme)
        const wscols = [
            {wch: 20}, // Sınıf
            {wch: 12}, // Gün
            {wch: 15}, // Saat
            {wch: 25}, // Ders
            {wch: 20}, // Öğretmen
            {wch: 15}  // Derslik
        ];
        worksheet['!cols'] = wscols;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Ders Programı");

        // 4. Dosyayı İndir
        XLSX.writeFile(workbook, `${planName || 'ders_programi'}.xlsx`);
    };

// --- VERİ DÖNÜŞTÜRME (DÜZELTİLMİŞ) ---
    const transformDataToEvents = (data) => {
        const calendarEvents = [];
        // dayMap nesnesine ihtiyacımız kalmadı, backend zaten gün ismini veriyor.

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

                // --- BURASI ESKİ KODDU VE HATALIYDI (toISOString) ---
                // const dateStr = eventDate.toISOString().split('T')[0];  <-- BU SATIR GÜNÜ KAYDIRIYORDU

                // --- YENİ VE DOĞRU KOD ---
                const eventDate = new Date(mondayDate);
                eventDate.setDate(mondayDate.getDate() + dayOffset);

                const year = eventDate.getFullYear();
                const month = String(eventDate.getMonth() + 1).padStart(2, '0');
                const day = String(eventDate.getDate()).padStart(2, '0');
                const dateStr = `${year}-${month}-${day}`;
                // -------------------------

                daySchedule.lessons.forEach(lesson => {
                    // lesson.time formatı "00:00" string olarak geliyor
                    const startHour = parseInt(lesson.time.split(':')[0]);
                    const endHour = startHour + 1;

                    calendarEvents.push({
                        id: Math.random().toString(36).substr(2, 9),
                        title: lesson.course,
                        // Tarih stringini elle birleştirdiğimiz için tarayıcı yerel saat olarak algılar
                        start: `${dateStr}T${lesson.time}:00`,
                        end: `${dateStr}T${endHour.toString().padStart(2, '0')}:00:00`,
                        backgroundColor: getColor(classSchedule.className),
                        borderColor: getColor(classSchedule.className),
                        textColor: '#ffffff',
                        extendedProps: {
                            group: classSchedule.className,
                            teacher: lesson.teacher,
                            room: lesson.room,
                            course: lesson.course,
                            // Saat bilgisini direkt backend verisinden alıyoruz
                            fullTime: `${lesson.time} - ${endHour.toString().padStart(2, '0')}:00`
                        }
                    });
                });
            });
        });
        return calendarEvents;
    };

    const renderEventContent = (eventInfo) => {
        return (
            <div className="p-1 h-full flex flex-col justify-center leading-tight overflow-hidden text-center cursor-pointer">
                <div className="font-bold text-xs whitespace-normal">{eventInfo.event.title}</div>
                <div className="text-[10px] font-semibold text-yellow-100 whitespace-normal mt-0.5">
                    {eventInfo.event.extendedProps.group}
                </div>
                <div className="text-[10px] italic opacity-90 whitespace-normal mt-0.5">
                    {eventInfo.event.extendedProps.teacher}
                </div>
                <div className="text-[10px] opacity-80 whitespace-normal">
                    {eventInfo.event.extendedProps.room}
                </div>
            </div>
        );
    };

    const getColor = (str) => {
        if (!str) return '#9ca3af';
        const colors = ['#2563eb', '#dc2626', '#16a34a', '#d97706', '#9333ea', '#0891b2', '#be185d'];
        let hash = 0;
        for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
    };

    const handleEventClick = (clickInfo) => {
        setSelectedEvent(clickInfo.event);
        setIsModalOpen(true);
    };

    if (loading) return (
        <div className="h-full flex items-center justify-center">
            <Loader className="animate-spin text-blue-600" size={40} />
        </div>
    );

    return (
        <div className="h-full flex flex-col space-y-4">
            {/* ÜST BAR - Mobilde dikey, masaüstünde yatay düzen */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-4 w-full">
                    <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-gray-700 shrink-0">
                        <ArrowLeft size={24}/>
                    </button>
                    <h2 className="text-lg md:text-2xl font-bold text-gray-800 truncate">{planName}</h2>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <button
                        onClick={handleExcelExport}
                        className="flex-1 md:flex-none bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 text-sm font-medium transition"
                    >
                        <FileSpreadsheet size={18}/> <span className="hidden xs:inline">Excel</span>
                    </button>
                    <button
                        onClick={handleUpdate}
                        className="flex-1 md:flex-none bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-sm font-medium transition"
                    >
                        <Save size={18}/> <span className="hidden xs:inline">Güncelle</span>
                    </button>
                </div>
            </div>

            {/* TAKVİM KONTEYNERI - Scrollbar ve Sticky Header için */}
            <div className="flex-1 bg-white p-4 rounded-lg shadow relative min-h-[500px] h-full overflow-hidden">
                <style>{`
                  .fc-timegrid-slot { height: 60px !important; }
                  .fc .fc-col-header-cell { background: white; }
                `}</style>

                <FullCalendar
                    ref={calendarRef}
                    plugins={[timeGridPlugin, interactionPlugin]}
                    // Mobilde günlük, masaüstünde haftalık
                    initialView={window.innerWidth < 768 ? 'timeGridDay' : 'timeGridWeek'}
                    headerToolbar={{
                        left: 'prev,next',
                        center: 'title',
                        right: window.innerWidth < 768 ? '' : 'timeGridWeek,timeGridDay'
                    }}
                    height="100%"
                    stickyHeaderDates={true}
                    slotMinTime="00:00:00"
                    slotMaxTime="24:00:00"
                    allDaySlot={false}
                    weekends={true}
                    firstDay={1}
                    slotLabelInterval="01:00"
                    events={events}
                    eventContent={renderEventContent}
                    editable={true}
                    eventClick={handleEventClick}
                />
            </div>

            {/* DETAY MODAL (Aynı Kalıyor) */}
            {isModalOpen && selectedEvent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden">
                        <div className="bg-indigo-600 p-4 flex justify-between items-start text-white">
                            <div>
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <BookOpen size={20} /> {selectedEvent.title}
                                </h3>
                                <p className="text-indigo-200 text-sm mt-1">{selectedEvent.extendedProps.fullTime}</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-white hover:bg-indigo-700 p-1 rounded-full"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-3 text-gray-700">
                                <div className="bg-blue-100 p-2 rounded-full text-blue-600"><Users size={20} /></div>
                                <div><p className="text-xs text-gray-500 font-semibold uppercase">Grup</p><p className="font-medium">{selectedEvent.extendedProps.group}</p></div>
                            </div>
                            <div className="flex items-center gap-3 text-gray-700">
                                <div className="bg-green-100 p-2 rounded-full text-green-600"><User size={20} /></div>
                                <div><p className="text-xs text-gray-500 font-semibold uppercase">Öğretmen</p><p className="font-medium">{selectedEvent.extendedProps.teacher}</p></div>
                            </div>
                            <div className="flex items-center gap-3 text-gray-700">
                                <div className="bg-purple-100 p-2 rounded-full text-purple-600"><MapPin size={20} /></div>
                                <div><p className="text-xs text-gray-500 font-semibold uppercase">Derslik</p><p className="font-medium">{selectedEvent.extendedProps.room}</p></div>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-4 flex justify-end">
                            <button onClick={() => setIsModalOpen(false)} className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 transition">Kapat</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}