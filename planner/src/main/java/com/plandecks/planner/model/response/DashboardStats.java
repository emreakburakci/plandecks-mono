package com.plandecks.planner.model.response;

public record DashboardStats(
    long teacherCount,
    long studentGroupCount,
    long courseCount,
    long roomCount,
    long planCount
) {}