FROM maven:3.9.9-eclipse-temurin-21-alpine AS build
WORKDIR /workspace
COPY pom.xml .
COPY src ./src
RUN mvn -q -DskipTests package

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S grammart && adduser -S grammart -G grammart
COPY --from=build /workspace/target/grammart-api-*.jar app.jar
USER grammart
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
