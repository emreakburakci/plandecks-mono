package com.plandecks.planner.repository;

import com.plandecks.planner.model.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

// Hepsini tek dosyada tanımlayabiliriz veya ayrı ayrı yapabilirsin.
public interface StudentGroupRepository extends JpaRepository<StudentGroupEntity, Integer> {

    List<StudentGroupEntity> findAllByUserId(Integer userId);

}
