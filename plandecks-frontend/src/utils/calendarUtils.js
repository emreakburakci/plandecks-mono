export const convertEventsToBackendFormat = (calendarEvents) => {
    const eventsByGroup = {};

    calendarEvents.forEach(event => {
        const props = event.extendedProps || {};
        const groupName = props.group || props.className || "Genel";

        if (!eventsByGroup[groupName]) {
            eventsByGroup[groupName] = [];
        }
        eventsByGroup[groupName].push(event);
    });

    const schedules = Object.keys(eventsByGroup).map(groupName => {
        const groupEvents = eventsByGroup[groupName];
        const daysMap = {};

        groupEvents.forEach(event => {
            // Event start tarihi (Date objesi)
            const startDate = new Date(event.start);

            // Yerel saate göre gün indeksi (0: Pazar, 1: Pzt ...) alıyoruz.
            // getUTCDay() DEĞİL, getDay() kullanıyoruz.
            const dayIndex = startDate.getDay();

            const dayNames = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
            const dayName = dayNames[dayIndex];

            // Saati al
            const hour = startDate.getHours();
            const timeStr = `${hour.toString().padStart(2, '0')}:00`;

            if (!daysMap[dayName]) {
                daysMap[dayName] = [];
            }

            const props = event.extendedProps || {};

            daysMap[dayName].push({
                hour: hour,
                time: timeStr,
                course: props.course || props.courseName || event.title,
                teacher: props.teacher || "",
                room: props.room || ""
            });
        });

        // Günleri ve saatleri sırala
        const daysList = Object.keys(daysMap).map(day => ({
            day: day,
            lessons: daysMap[day].sort((a, b) => a.hour - b.hour)
        }));

        return {
            className: groupName,
            days: daysList
        };
    });

    return {
        status: "MANUAL_EDIT",
        executionTimeMs: 0,
        schedules: schedules,
        failureReasons: null
    };
};