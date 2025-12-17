package com.plandecks.planner.model.response;

import java.util.List;

public record ClassSchedule(String className, List<DailySchedule> days) {}
