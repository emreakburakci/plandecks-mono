package com.plandecks.planner.model.response;// Dosya: ScheduleResponse.java

import java.util.List;

public record ScheduleResponse(
    String status,
    long executionTimeMs,
    List<ClassSchedule> schedules,
    List<String> failureReasons
) {}

