package com.plandecks.planner.model.request;

import com.plandecks.planner.model.response.ScheduleResponse;

public record SaveScheduleRequest(
    String name,
    ScheduleResponse scheduleData // Frontend'den gelen düzenlenmiş veri
) {}