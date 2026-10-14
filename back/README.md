# Backend — Lume API (Java + Spring Boot)

## 📌 Arquitetura e Especificação (Spring MVC)

Este módulo abrigará a API RESTful e WebSocket do ecossistema **Lume**, implementada em **Java 21** e **Spring Boot 3.x**.

### 🏛️ Padrão Arquitetural

O backend adota o padrão em camadas **Spring MVC**:
- **Controllers (`controller/`):** endpoints REST (`/api/v1/...`) e handlers WebSocket para streaming de áudio.
- **Services (`service/`):** regras de negócio, cálculo de ciclo menstrual, guardrails de saúde e integração com IA.
- **Repositories (`repository/`):** persistência via Spring Data JPA.
- **Entities/Models (`model/`):** mapeamento relacional de tabelas (`User`, `Cycle`, `DailyLog`, `Friendship`).
- **DTOs (`dto/`):** contratos de entrada e saída com validação (Jakarta Validation).

### 🛠️ Stack Tecnológica
- **Linguagem:** Java 21 LTS
- **Framework:** Spring Boot 3.x
  - `spring-boot-starter-web`
  - `spring-boot-starter-websocket` (comunicação de baixa latência para voz)
  - `spring-boot-starter-data-jpa`
  - `spring-boot-starter-security` + JWT
  - `spring-boot-starter-validation`
- **Banco de Dados:** PostgreSQL
- **Integração de IA:** Google Gemini Live API (áudio bidirecional) e Gemini Pro (chat texto)
- **Documentação:** OpenAPI / Swagger UI
