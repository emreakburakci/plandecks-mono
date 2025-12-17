package com.plandecks.planner.model.request;

import java.util.List;

public record GenerateRequest(
        // boolean[7][8] -> 7 Gün, 8 Saat. True=Planlama Yapılabilir, False=Kapalı
        boolean[][] globalAvailability,
        String strategy // "COMPRESSED" veya "DISTRIBUTED"
) {}