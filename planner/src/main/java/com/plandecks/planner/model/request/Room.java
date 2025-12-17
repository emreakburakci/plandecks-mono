package com.plandecks.planner.model.request;

import java.util.List;

public record Room(
        int id,
        String name,      // Burası "name" olmalı. Kod r.name() diye çağırıyor.
        String type,
        int capacity,
        List<String> features,
        boolean[][] availability

) {}