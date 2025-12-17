package com.plandecks.planner.model.response;

public record LessonSlot(int hour, String time, String course, String teacher, String room) {}