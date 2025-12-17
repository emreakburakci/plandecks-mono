import React from 'react';

const DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function AvailabilityGrid({ availability, setAvailability }) {

    const toggleSlot = (dayIndex, hourIndex) => {
        // State'in kopyasını al (Deep copy)
        const newGrid = availability.map(row => [...row]);
        // Değeri tersine çevir (True -> False)
        newGrid[dayIndex][hourIndex] = !newGrid[dayIndex][hourIndex];
        setAvailability(newGrid);
    };

    const toggleDay = (dayIndex) => {
        const newGrid = availability.map(row => [...row]);
        // O günün tamamı zaten müsaitse kapat, değilse aç
        const allAvailable = newGrid[dayIndex].every(val => val === true);
        for(let i=0; i<24; i++) newGrid[dayIndex][i] = !allAvailable;
        setAvailability(newGrid);
    }

    return (
        <div className="mt-4 select-none">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Müsaitlik Durumu (Yeşil: Müsait, Gri: Dolu)
            </label>

            <div className="overflow-x-auto">
                <div className="inline-block min-w-full">
                    {/* Header (Saatler) */}
                    <div className="flex">
                        <div className="w-24 flex-shrink-0"></div> {/* Gün ismi boşluğu */}
                        {HOURS.map(h => (
                            <div key={h} className="w-10 text-center text-xs text-gray-500 font-bold">
                                {h}:00
                            </div>
                        ))}
                    </div>

                    {/* Grid Satırları */}
                    {DAYS.map((day, dIndex) => (
                        <div key={day} className="flex items-center mb-1">
                            {/* Gün İsmi (Tıklayınca tüm satırı değiştirir) */}
                            <button
                                type="button"
                                onClick={() => toggleDay(dIndex)}
                                className="w-24 text-xs font-semibold text-gray-600 text-left hover:text-blue-600 cursor-pointer"
                            >
                                {day}
                            </button>

                            {/* Saat Kutucukları */}
                            {availability[dIndex].map((isAvailable, hIndex) => (
                                <div
                                    key={`${dIndex}-${hIndex}`}
                                    onClick={() => toggleSlot(dIndex, hIndex)}
                                    className={`
                    w-8 h-8 mx-1 rounded cursor-pointer transition-colors border
                    flex items-center justify-center
                    ${isAvailable
                                        ? 'bg-green-500 border-green-600 hover:bg-green-400'
                                        : 'bg-gray-200 border-gray-300 hover:bg-gray-300'}
                  `}
                                    title={`${day} ${HOURS[hIndex]}:00 - ${isAvailable ? 'Müsait' : 'Müsait Değil'}`}
                                >
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
            <p className="text-xs text-gray-400 mt-1">* Gün ismine tıklayarak o günü komple açıp kapatabilirsiniz.</p>
        </div>
    );
}