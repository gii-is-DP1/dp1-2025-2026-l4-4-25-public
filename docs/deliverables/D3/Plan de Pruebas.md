# Plan de Pruebas

**Asignatura:** Diseño y Pruebas (Grado en Ingeniería del Software, Universidad de Sevilla)  
**Curso académico: 2025/2026** <!-- p.ej., 2025/2026 -->  
**Grupo/Equipo: L4-4** <!-- p.ej., L4-03 Equipo 33 -->  
**Nombre del proyecto: Saboteur** <!-- p. ej. Petris -->  
**Repositorio: https://github.com/gii-is-DP1/dp1-2025-2026-l4-4-25** <!-- URL del repo -->  
**Integrantes (máx. 6):** 
Marcos Ángel Ayala Blanco marayabla@alum.us.es,
Luis Calderón Carmona luicalcar@alum.us.es,
Alejandro Caro Pérez alecarper@alum.us.es,
Lorenzo Valderrama Román lorvalrom@alum.us.es,
Carlos Borrego Ortiz carborort@alum.us.es,
Diego Rey Carmona diereycar@alum.us.es
<!-- Nombre Apellidos (US-Id / correo @us.es) -->


## 1. Introducción

Este documento describe el plan de pruebas para el proyecto juego de mesa **Saboteur** desarrollado en el marco de la asignatura **Diseño y Pruebas 1** por el grupo **L4-4**. El objetivo del plan de pruebas es garantizar que el software desarrollado cumple con los requisitos especificados en las historias de usuario y que se han realizado las pruebas necesarias para validar su funcionamiento.

## 2. Alcance

El alcance de este plan de pruebas incluye:

Pruebas unitarias:

Pruebas de controladores (Controllers): Verificación aislada de la capa web, seguridad y códigos de respuesta HTTP simulando las dependencias (Mocks).

Pruebas de integración:

Pruebas de servicios (Services) y repositorios: Verificación del correcto funcionamiento de la lógica de negocio y las transacciones con la base de datos dentro del contexto de Spring
## 3. Estrategia de Pruebas

### 3.1 Tipos de Pruebas

#### 3.1.1 Pruebas Unitarias
Estas pruebas verifican el funcionamiento aislado de componentes individuales, centrándose principalmente en la capa de Controladores. Se utiliza la anotación @WebMvcTest junto con Mocks (Mockito) para validar los endpoints HTTP, la serialización JSON y las entradas de datos sin cargar el contexto completo de Spring ni depender de la base de datos.

### 3.1.2 Pruebas de Integración
Estas pruebas evalúan la interacción correcta entre las capas del sistema, abarcando específicamente los Servicios y Repositorios. Mediante la anotación @SpringBootTest, se carga el contexto de la aplicación para validar el flujo real de datos y las reglas de negocio contra una base de datos en memoria (H2), asegurando la correcta persistencia y ejecución de transacciones.



## 4. Herramientas y Entorno de Pruebas

### 4.1 Herramientas
- **Maven**: Gestión de dependencias y ejecución de las pruebas.
- **JUnit**: Framework de pruebas unitarias.
- **Jacoco**: Generación de informes de cobertura de código. Si se ejecuta el comando de maven install, se copiará el informe de cobertura a la subcarpeta del repositorio /docs/deliverables/D3/coverage (puede visualizarse pulsando en el fichero index.html de dicho directorio).
- **Allure**: Generación de informes de estado de las últimas ejecuciones de las pruebas. Permite agrupar las pruebas por módulo/épica y feature. Si se ejecuta el comando de maven install, se copiará el informe de estado a la subcarpeta del repositorio /docs/deliverables/D3/status (puede visualizarse pulsando en el fichero index.html de dicho directorio).
- **Jest**: Framework para pruebas unitarias en javascript.
- **React-test**: Librería para la creación de pruebas unitarias de componentes React.

### 4.2 Entorno de Pruebas
Las pruebas se ejecutarán en el entorno de desarrollo y, eventualmente, en el entorno de pruebas del servidor de integración continua.

## 5. Planificación de Pruebas
### 5.1 Estado y trazadibilidad de Pruebas por Módulo y Épica

El informe de estado de las pruebas (con trazabilidad de éstas hacia los módulos y las épicas/historias de usaurio) se encuentra [aquí](
https://gii-is-dp1.github.io/group-project-seed/deliverables/D3/status/#behaviors).

### 5.2 Cobertura de Pruebas

El informe de cobertura de pruebas se puede consultar [aquí](
https://gii-is-dp1.github.io/group-project-seed/deliverables/D3/coverage/).



*Nota importante para el alumno*: A la hora de entregar el proyecto, debes modificar la url para que esté asociada al respositorio concreto de tu proyecto. Date cuenta de que ahora mismo apunta al repositorio _gii-is-DP1/group-project-seed_.


| Historia de Usuario | Prueba | Descripción | Estado | Tipo |
| :--- | :--- | :--- | :--- | :--- |
| HU-34 CRUD de Logros | [AchievementRepositoryTests](https://github.com/gii-is-DP1/dp1-2025-2026-l4-4-25/tree/main/src/test/java/es/us/dp1/l4_04_24_25/saboteur/achievement/AchievementRepositoryTests.java) | Verifica la persistencia de logros y consultas personalizadas (buscar por título, buscar por ID de creador) contra la base de datos H2. | Implementada | Integración (Sociable) |
| HU-34 CRUD de Logros | [AchievementRestControllerTests](https://github.com/gii-is-DP1/dp1-2025-2026-l4-4-25/tree/main/src/test/java/es/us/dp1/l4_04_24_25/saboteur/achievement/AchievementRestControllerTests.java) | Verifica los endpoints HTTP de logros, validación de entradas (títulos vacíos), seguridad (admin) y respuestas JSON usando Mocks. | Implementada | Unitaria (Solitaria) |
| HU-34 CRUD de Logros | [AchievementServiceTests](https://github.com/gii-is-DP1/dp1-2025-2026-l4-4-25/tree/main/src/test/java/es/us/dp1/l4_04_24_25/saboteur/achievement/AchievementServiceTests.java) | Valida la lógica de negocio para **desbloquear logros** según métricas (victorias, pepitas, partidas jugadas) y la gestión CRUD. | Implementada | Integración (Sociable) |
| HU-18 Registro de Acciones | [ActionRestControllerTests](https://github.com/gii-is-DP1/dp1-2025-2026-l4-4-25/tree/main/src/test/java/es/us/dp1/l4_04_24_25/saboteur/action/ActionRestControllerTests.java) | Verifica los endpoints para cartas de Acción, asegurando que se procesan correctamente las peticiones de uso de cartas. | Implementada | Unitaria (Solitaria) |
| HU-18 Registro de Acciones | [ActionServiceTests](https://github.com/gii-is-DP1/dp1-2025-2026-l4-4-25/tree/main/src/test/java/es/us/dp1/l4_04_24_25/saboteur/action/ActionServiceTests.java) | Valida la lógica de las cartas de Acción, sus efectos y restricciones de uso dentro del flujo del juego. | Implementada | Integración (Sociable) |
| CRUD de ActivePlayer | [ActivePlayerRestControllerTests](https://github.com/gii-is-DP1/dp1-2025-2026-l4-4-25/tree/main/src/test/java/es/us/dp1/l4_04_24_25/saboteur/activePlayer/ActivePlayerRestControllerTests.java) | Verifica los endpoints relacionados con el estado del jugador dentro de una partida (rol, mano de cartas, herramientas). | Implementada | Unitaria (Solitaria) |
| CRUD de ActivePlayer | [ActivePlayerServiceTests](https://github.com/gii-is-DP1/dp1-2025-2026-l4-4-25/tree/main/src/test/java/es/us/dp1/l4_04_24_25/saboteur/activePlayer/ActivePlayerServiceTests.java) | Valida la lógica de estado del jugador activo, gestión de roles (Saboteador/Minero) y manipulación de su mazo/descartes. | Implementada | Integración (Sociable) |
| HU-24 Registro de Jugador | [AuthControllerTests](https://github.com/gii-is-DP1/dp1-2025-2026-l4-4-25/tree/main/src/test/java/es/us/dp1/l4_04_24_25/saboteur/auth/AuthControllerTests.java) | Verifica los endpoints de registro (signup) e inicio de sesión (login), y la generación de tokens JWT. | Implementada | Unitaria (Solitaria) |
| HU-24 Registro de Jugador | [AuthServiceTests](https://github.com/gii-is-DP1/dp1-2025-2026-l4-4-25/tree/main/src/test/java/es/us/dp1/l4_04_24_25/saboteur/auth/AuthServiceTests.java) | Valida la lógica de seguridad, codificación de contraseñas y creación de nuevos usuarios con roles iniciales. | Implementada | Integración (Sociable) |
| Gestión de Tablero | [BoardRestControllerTests](https://github.com/gii-is-DP1/dp1-2025-2026-l4-4-25/tree/main/src/test/java/es/us/dp1/l4_04_24_25/saboteur/board/BoardRestControllerTests.java) | Verifica los endpoints para obtener el estado del tablero y sus casillas asociadas. | Implementada | Unitaria (Solitaria) |
| Gestión de Tablero | [BoardServiceTests](https://github.com/gii-is-DP1/dp1-2025-2026-l4-4-25/tree/main/src/test/java/es/us/dp1/l4_04_24_25/saboteur/board/BoardServiceTests.java) | Valida la creación y gestión del tablero de juego, incluyendo la disposición inicial de cartas. | Implementada | Integración (Sociable) |
| Gestión de Cartas | [CardRestControllerTests](https://github.com/gii-is-DP1/dp1-2025-2026-l4-4-25/tree/main/src/test/java/es/us/dp1/l4_04_24_25/saboteur/card/CardRestControllerTests.java) | Verifica los endpoints polimórficos para recuperar cualquier tipo de carta por su ID. | Implementada | Unitaria (Solitaria) |
| Gestión de Cartas | [CardServiceTests](https://github.com/gii-is-DP1/dp1-2025-2026-l4-4-25/tree/main/src/test/java/es/us/dp1/l4_04_24_25/saboteur/card/CardServiceTests.java) | Valida la lógica base de las cartas y su persistencia, sirviendo como base para Túneles y Acciones. | Implementada | Integración (Sociable) |
| HU-44 Chat en partida | [ChatRestControllerTests](https://github.com/gii-is-DP1/dp1-2025-2026-l4-4-25/tree/main/src/test/java/es/us/dp1/l4_04_24_25/saboteur/chat/ChatRestControllerTests.java) | Verifica los endpoints para crear y recuperar chats asociados a una partida. | Implementada | Unitaria (Solitaria) |
| HU-44 Chat en partida | [ChatServiceTests](https://github.com/gii-is-DP1/dp1-2025-2026-l4-4-25/tree/main/src/test/java/es/us/dp1/l4_04_24_25/saboteur/chat/ChatServiceTests.java) | Valida la lógica de creación de chats y su asociación correcta a una instancia de juego. | Implementada | Integración (Sociable) |
| Gestión de Mazos | [DeckRestControllerTests](https://github.com/gii-is-DP1/dp1-2025-2026-l4-4-25/tree/main/src/test/java/es/us/dp1/l4_04_24_25/saboteur/deck/DeckRestControllerTests.java) | Verifica los endpoints para gestionar el mazo de robo y descartes. | Implementada | Unitaria (Solitaria) |
| Gestión de Mazos | [DeckServiceTests](https://github.com/gii-is-DP1/dp1-2025-2026-l4-4-25/tree/main/src/test/java/es/us/dp1/l4_04_24_25/saboteur/deck/DeckServiceTests.java) | Valida la lógica de barajado, reparto de cartas y gestión de pilas de descarte. | Implementada | Integración (Sociable) |
| HU-01 Crear Partida | [GameRestControllerTests](https://github.com/gii-is-DP1/dp1-2025-2026-l4-4-25/tree/main/src/test/java/es/us/dp1/l4_04_24_25/saboteur/game/GameRestControllerTests.java) | Verifica endpoints de gestión de partidas (lobby), filtros (públicas/privadas), y manejo de errores (404). | Implementada | Unitaria (Solitaria) |
| HU-01 Crear Partida | [GameServiceTests](https://github.com/gii-is-DP1/dp1-2025-2026-l4-4-25/tree/main/src/test/java/es/us/dp1/l4_04_24_25/saboteur/game/GameServiceTests.java) | Valida el ciclo de vida de la partida, reglas de negocio (**máx 3 rondas**, máx jugadores) y lógica de unión. | Implementada | Integración (Sociable) |
| Historial de Partida | [LogRestControllerTests](https://github.com/gii-is-DP1/dp1-2025-2026-l4-4-25/tree/main/src/test/java/es/us/dp1/l4_04_24_25/saboteur/log/LogRestControllerTests.java) | Verifica los endpoints para consultar el historial de acciones o logs del juego. | Implementada | Unitaria (Solitaria) |
| Historial de Partida | [LogServiceTests](https://github.com/gii-is-DP1/dp1-2025-2026-l4-4-25/tree/main/src/test/java/es/us/dp1/l4_04_24_25/saboteur/log/LogServiceTests.java) | Valida la persistencia de eventos del juego para auditoría o historial. | Implementada | Integración (Sociable) |
| HU-44 Chat en partida | [MessageRestControllerTests](https://github.com/gii-is-DP1/dp1-2025-2026-l4-4-25/tree/main/src/test/java/es/us/dp1/l4_04_24_25/saboteur/message/MessageRestControllerTests.java) | Verifica el envío de mensajes en el chat y su correcta asociación al emisor. | Implementada | Unitaria (Solitaria) |
| HU-44 Chat en partida | [MessageServiceTests](https://github.com/gii-is-DP1/dp1-2025-2026-l4-4-25/tree/main/src/test/java/es/us/dp1/l4_04_24_25/saboteur/message/MessageServiceTests.java) | Valida la lógica de guardado de mensajes y timestamps dentro de un chat específico. | Implementada | Integración (Sociable) |
| HU-04 Perfil de usuario | [PlayerRepositoryTests](https://github.com/gii-is-DP1/dp1-2025-2026-l4-4-25/tree/main/src/test/java/es/us/dp1/l4_04_24_25/saboteur/player/PlayerRepositoryTests.java) | Verifica la persistencia de la entidad Player (perfil global del usuario jugador) en la base de datos. | Implementada | Integración (Sociable) |
| HU-04 Perfil de usuario | [PlayerRestControllerTests](https://github.com/gii-is-DP1/dp1-2025-2026-l4-4-25/tree/main/src/test/java/es/us/dp1/l4_04_24_25/saboteur/player/PlayerRestControllerTests.java) | Verifica los endpoints para consultar perfiles de jugadores y sus estadísticas globales. | Implementada | Unitaria (Solitaria) |
| HU-04 Perfil de usuario | [PlayerServiceTests](https://github.com/gii-is-DP1/dp1-2025-2026-l4-4-25/tree/main/src/test/java/es/us/dp1/l4_04_24_25/saboteur/player/PlayerServiceTests.java) | Valida la lógica de negocio asociada al perfil del jugador fuera de la partida. | Implementada | Integración (Sociable) |
| Gestión de Solicitudes | [RequestRestControllerTests](https://github.com/gii-is-DP1/dp1-2025-2026-l4-4-25/tree/main/src/test/java/es/us/dp1/l4_04_24_25/saboteur/request/RequestRestControllerTests.java) | Verifica endpoints para enviar, aceptar o rechazar solicitudes (ej. amistad). | Implementada | Unitaria (Solitaria) |
| Gestión de Solicitudes | [RequestServiceTests](https://github.com/gii-is-DP1/dp1-2025-2026-l4-4-25/tree/main/src/test/java/es/us/dp1/l4_04_24_25/saboteur/request/RequestServiceTests.java) | Valida la lógica de estado de las solicitudes (PENDIENTE, ACEPTADA, RECHAZADA). | Implementada | Integración (Sociable) |
| HU-12 Indicador de Ronda | [RoundRestControllerTests](https://github.com/gii-is-DP1/dp1-2025-2026-l4-4-25/tree/main/src/test/java/es/us/dp1/l4_04_24_25/saboteur/round/RoundRestControllerTests.java) | Verifica endpoints para consultar el estado de la ronda actual. | Implementada | Unitaria (Solitaria) |
| HU-12 Indicador de Ronda | [RoundServiceTests](https://github.com/gii-is-DP1/dp1-2025-2026-l4-4-25/tree/main/src/test/java/es/us/dp1/l4_04_24_25/saboteur/round/RoundServiceTest.java) | Valida la lógica de cambio de ronda, reparto de nuevas manos y asignación de roles. | Implementada | Integración (Sociable) |
| CRUD de Square | [SquareRestControllerTests](https://github.com/gii-is-DP1/dp1-2025-2026-l4-4-25/tree/main/src/test/java/es/us/dp1/l4_04_24_25/saboteur/square/SquareRestControllerTests.java) | Verifica endpoints para actualizar casillas y comprueba la emisión de **notificaciones WebSocket**. | Implementada | Unitaria (Solitaria) |
| CRUD de Square | [SquareServiceTests](https://github.com/gii-is-DP1/dp1-2025-2026-l4-4-25/tree/main/src/test/java/es/us/dp1/l4_04_24_25/saboteur/square/SquareServiceTests.java) | Valida la lógica de coordenadas, colocación de cartas en casillas y restricciones de tablero. | Implementada | Integración (Sociable) |
| Estadísticas de Juego | [StatisticServiceTests](https://github.com/gii-is-DP1/dp1-2025-2026-l4-4-25/tree/main/src/test/java/es/us/dp1/l4_04_24_25/saboteur/statistic/StatisticServiceTests.java) | Valida el cálculo y agregación de estadísticas de juego (partidas ganadas, perdidas, tiempo jugado). | Implementada | Integración (Sociable) |
| CRUD de Tunnel | [TunnelRestControllerTests](https://github.com/gii-is-DP1/dp1-2025-2026-l4-4-25/tree/main/src/test/java/es/us/dp1/l4_04_24_25/saboteur/tunnel/TunnelRestControllerTests.java) | Verifica endpoints para cartas de Túnel. | Implementada | Unitaria (Solitaria) |
| CRUD de Tunnel | [TunnelServiceTests](https://github.com/gii-is-DP1/dp1-2025-2026-l4-4-25/tree/main/src/test/java/es/us/dp1/l4_04_24_25/saboteur/tunnel/TunnelServiceTests.java) | Valida la lógica de conexión de túneles (verificar si encajan las salidas) y rotación de cartas. | Implementada | Integración (Sociable) |
| HU-29 Gestión de Usuarios | [AuthoritiesServiceTests](https://github.com/gii-is-DP1/dp1-2025-2026-l4-4-25/tree/main/src/test/java/es/us/dp1/l4_04_24_25/saboteur/user/AuthoritiesServiceTests.java) | Verifica la gestión de permisos y roles de usuario (ADMIN, PLAYER). | Implementada | Integración (Sociable) |
| HU-29 Gestión de Usuarios | [UserControllerTests](https://github.com/gii-is-DP1/dp1-2025-2026-l4-4-25/tree/main/src/test/java/es/us/dp1/l4_04_24_25/saboteur/user/UserControllerTests.java) | Verifica CRUD de usuarios, validaciones de unicidad (email/username) y seguridad en endpoints de administración. | Implementada | Unitaria (Solitaria) |
| HU-29 Gestión de Usuarios | [UserServiceTests](https://github.com/gii-is-DP1/dp1-2025-2026-l4-4-25/tree/main/src/test/java/es/us/dp1/l4_04_24_25/saboteur/user/UserServiceTests.java) | Valida lógica de registro, actualización de contraseñas y búsqueda de usuarios por criterios. | Implementada | Integración (Sociable) |
## 6. Criterios de Aceptación

- Todas las pruebas unitarias deben pasar con éxito antes de la entrega final del proyecto.
- La cobertura de código debe ser al menos del 70%.
- No debe haber fallos críticos en las pruebas de integración y en la funcionalidad.

## 7. Conclusión

Este plan de pruebas establece la estructura y los criterios para asegurar la calidad del software desarrollado. Es responsabilidad del equipo de desarrollo y pruebas seguir este plan para garantizar la entrega de un producto funcional y libre de errores.
