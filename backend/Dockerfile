# Step 1: Build stage using Java 17 and Maven
FROM maven:3.9-eclipse-temurin-17-alpine AS builder

WORKDIR /app

# Copy pom.xml and source code
COPY pom.xml .
COPY src ./src

# Build production executable JAR (skipping unit tests for fast deployment build)
RUN mvn clean package -DskipTests

# Step 2: Production runtime stage using lightweight Temurin Java 17 JRE
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Default environment variables for Render production execution
ENV PORT=8080 \
    DB_FILE_PATH=/var/data/triagent.db \
    FRONTEND_URL=""

# Copy compiled Spring Boot executable JAR from build stage
COPY --from=builder /app/target/*.jar app.jar

# Create database mount directory
RUN mkdir -p /var/data

# Expose default HTTP port
EXPOSE 8080

# Execute Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]
