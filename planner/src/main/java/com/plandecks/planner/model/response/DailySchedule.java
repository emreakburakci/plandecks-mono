package com.plandecks.planner.model.response;

import java.util.List;

public record DailySchedule(String day, List<LessonSlot> lessons) {}
