package com.triagent.backend.config;

import com.triagent.backend.entity.Incident;
import com.triagent.backend.entity.IncidentStatus;
import com.triagent.backend.repository.IncidentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.io.File;
import java.time.LocalDateTime;
import java.util.Optional;

@Component
public class DatabasePersistenceTestRunner implements CommandLineRunner {

    private final IncidentRepository incidentRepository;

    @Autowired
    public DatabasePersistenceTestRunner(IncidentRepository incidentRepository) {
        this.incidentRepository = incidentRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("=== TRIAGENT PERSISTENT DATABASE TEST ===");

        // 1. Ensure data directory exists
        File dataDir = new File("./data");
        if (!dataDir.exists()) {
            boolean created = dataDir.mkdirs();
            System.out.println("[DB TEST] Created data directory: " + dataDir.getAbsolutePath() + " (" + created + ")");
        }

        // 2. Insert test incident
        String testId = "INC-PERSIST-TEST";
        Incident testIncident = new Incident(
                testId,
                "Ransomware Detection",
                "Database Persistence Test Alert",
                "Production DB Node",
                LocalDateTime.now(),
                500,
                "Automated persistence verification test incident.",
                "Verify database commit and update integrity.",
                9, 9, 8, 9, 85
        );
        testIncident.setStatus(IncidentStatus.AWAITING_TRIAGE);

        incidentRepository.save(testIncident);
        System.out.println("[DB TEST] Step 4 - Inserted test incident: " + testId);

        // 3. Retrieve incident
        Optional<Incident> retrieved = incidentRepository.findById(testId);
        if (retrieved.isPresent()) {
            System.out.println("[DB TEST] Step 5 - Retrieved incident: " + retrieved.get().getId() + " | Asset: " + retrieved.get().getAsset());
        } else {
            System.err.println("[DB TEST] Failed to retrieve test incident!");
            return;
        }

        // 4. Update incident
        Incident incidentToUpdate = retrieved.get();
        incidentToUpdate.setStatus(IncidentStatus.TRIAGED);
        incidentToUpdate.setPriorityScore(88.5);
        incidentToUpdate.setTriageRank(1);
        incidentRepository.save(incidentToUpdate);
        System.out.println("[DB TEST] Step 6 - Updated incident status to TRIAGED with score 88.5 and rank 1");

        // 5. Confirm persistence
        Optional<Incident> updated = incidentRepository.findById(testId);
        if (updated.isPresent() && updated.get().getStatus() == IncidentStatus.TRIAGED && updated.get().getTriageRank() == 1) {
            System.out.println("[DB TEST] Step 7 - CONFIRMED: Persistent SQL database write, read, update, and commit succeeded!");
        }

        System.out.println("=== TRIAGENT DATABASE VERIFICATION COMPLETE ===");
    }
}
