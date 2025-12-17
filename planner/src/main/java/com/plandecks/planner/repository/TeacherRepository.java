package com.plandecks.planner.repository;

import com.plandecks.planner.model.entity.CourseEntity;
import com.plandecks.planner.model.entity.RoomEntity;
import com.plandecks.planner.model.entity.TeacherEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TeacherRepository extends JpaRepository<TeacherEntity, Integer> {

    List<TeacherEntity> findAllByUserId(Integer userId);


}
