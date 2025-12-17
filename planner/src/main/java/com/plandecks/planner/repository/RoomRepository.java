package com.plandecks.planner.repository;

import com.plandecks.planner.model.entity.CourseEntity;
import com.plandecks.planner.model.entity.RoomEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoomRepository extends JpaRepository<RoomEntity, Integer> {

    List<RoomEntity> findAllByUserId(Integer userId);

}
