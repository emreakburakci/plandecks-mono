package com.plandecks.planner.model.request;// Sadece konsepti göstermek için basit record'lar kullanıyorum.
// Gerçek projede bunlar Entity olacaktır.

import java.util.List;

public record StudentGroup(int id, String name, int size, List<Course> courses) {} // Öğrenci grubu (Örn: 9-A)
