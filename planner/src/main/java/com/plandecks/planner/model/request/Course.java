package com.plandecks.planner.model.request;

import java.util.List;

public record Course(
        int id,
        String subject,
        int weeklyCount,
        List<String> requiredEquipment
) {}
