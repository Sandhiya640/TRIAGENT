package com.triagent.backend.repository;

import com.triagent.backend.entity.Incident;
import com.triagent.backend.entity.IncidentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, String> {
    List<Incident> findByStatus(IncidentStatus status);
    List<Incident> findByStatusNot(IncidentStatus status);
}
