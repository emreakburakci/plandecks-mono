package com.plandecks.planner.model.request;

import java.util.List;

public record Teacher(int id, String name, List<String> subjects, boolean[][] availability) {} // availability[day][slot]
