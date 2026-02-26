FROM maven:3.9-eclipse-temurin-25 AS builder

WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn clean package

FROM eclipse-temurin:25-jre

WORKDIR /app

COPY --from=builder /app/target/backend-1.0-SNAPSHOT-jar-with-dependencies.jar ./backend-api.jar

EXPOSE 8081

CMD ["java", "-jar", "backend-api.jar"]
