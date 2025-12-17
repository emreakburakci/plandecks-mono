package com.plandecks.planner.model.request;

import java.util.List;

public record OptimizationRequest(
    List<StudentGroup> groups,
    List<Teacher> teachers,
    List<Room> rooms,
    List<Course> courses,
    boolean[][] globalAvailability,
    String strategy // "COMPRESSED" veya "DISTRIBUTED"
) {}