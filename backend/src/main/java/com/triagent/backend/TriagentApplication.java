package com.triagent.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.File;

@SpringBootApplication
public class TriagentApplication {

    public static void main(String[] args) {
        ensureDatabaseDirectoryExists();
        SpringApplication.run(TriagentApplication.class, args);
    }

    private static void ensureDatabaseDirectoryExists() {
        String dbPath = System.getenv("DB_FILE_PATH");
        if (dbPath == null || dbPath.isBlank()) {
            dbPath = System.getProperty("DB_FILE_PATH", "./data/triagent.db");
        }
        File dbFile = new File(dbPath);
        File parentDir = dbFile.getParentFile();
        if (parentDir != null && !parentDir.exists()) {
            boolean created = parentDir.mkdirs();
            if (created) {
                System.out.println("[TRIAGENT DB INIT] Created missing database directory: " + parentDir.getAbsolutePath());
            }
        }
    }
}
