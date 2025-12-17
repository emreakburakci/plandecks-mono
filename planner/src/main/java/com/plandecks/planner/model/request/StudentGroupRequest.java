package com.plandecks.planner.model.request;

import java.util.List;

public record StudentGroupRequest(String name, int size, List<Integer> courseIds) {}