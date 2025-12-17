package com.plandecks.planner.repository;

import com.plandecks.planner.model.entity.GeneratedScheduleEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

// Schedule Repository
public interface GeneratedScheduleRepository extends JpaRepository<GeneratedScheduleEntity, Long> {
    List<GeneratedScheduleEntity> findAllByUserId(Integer userId);
}