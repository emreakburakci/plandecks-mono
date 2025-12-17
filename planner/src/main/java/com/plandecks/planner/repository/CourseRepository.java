package com.plandecks.planner.repository;

import com.plandecks.planner.model.entity.CourseEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseRepository extends JpaRepository<CourseEntity, Integer> {

    List<CourseEntity> findAllByUserId(Integer userId);

}