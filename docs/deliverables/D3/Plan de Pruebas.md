# Plan de Pruebas

**Asignatura:** Diseño y Pruebas (Grado en Ingeniería del Software, Universidad de Sevilla)  
**Curso académico: 2025/2026** <!-- p.ej., 2025/2026 -->  
**Grupo/Equipo: L4-4** <!-- p.ej., L4-03 Equipo 33 -->  
**Nombre del proyecto: Saboteur** <!-- p. ej. Petris -->  
**Repositorio: https://github.com/gii-is-DP1/dp1-2025-2026-l4-4-25** <!-- URL del repo -->  
**Integrantes (máx. 6): 
Marcos Ángel Ayala Blanco marayabla@alum.us.es
Luis Calderón Carmona luicalcar@alum.us.es
Alejandro Caro Pérez alecarper@alum.us.es
Lorenzo Valderrama Román lorvalrom@alum.us.es
Carlos Borrego Ortiz carborort@alum.us.es
Diego Rey Carmona diereycar@alum.us.es
** <!-- Nombre Apellidos (US-Id / correo @us.es) -->


## 1. Introducción

Este documento describe el plan de pruebas para el proyecto juego de mesa **Saboteur** desarrollado en el marco de la asignatura **Diseño y Pruebas 1** por el grupo **L4-4**. El objetivo del plan de pruebas es garantizar que el software desarrollado cumple con los requisitos especificados en las historias de usuario y que se han realizado las pruebas necesarias para validar su funcionamiento.

## 2. Alcance

El alcance de este plan de pruebas incluye:

- Pruebas unitarias.
  - Pruebas unitarias de backend de las clases servicios
  

## 3. Estrategia de Pruebas

### 3.1 Tipos de Pruebas

#### 3.1.1 Pruebas Unitarias
Las pruebas unitarias se realizan para verificar el correcto funcionamiento de los componentes individuales del software. Se utilizan herramientas de automatización de pruebas como **JUnit** en backend.



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


| Historia de Usuario | Prueba | Descripción | Estado |Tipo |
|---------------------|--------|-------------|--------|--------|
| HU-34 CRUD de Logros:  | [AchievementServiceTests](https://github.com/gii-is-DP1/dp1-2025-2026-l4-4-25/tree/main/src/test/java/es/us/dp1/l4_04_24_25/saboteur/achievement/AchievementServiceTests.java) | Verifica la gestión completa de logros (CRUD), la unicidad por título, y las búsquedas por título y creador.|Implementada| Unitaria en backend a nivel de Servicio, prueba social. |
| HU-18 Registro de Acciones | [ActionServiceTests](https://github.com/gii-is-DP1/dp1-2025-2026-l4-4-25/tree/main/src/test/java/es/us/dp1/l4_04_24_25/saboteur/action/ActionServiceTests.java) | Verifica la gestión (CRUD) y la funcionalidad de búsqueda de cartas de Acción según su tipo (nameAction), valor de efecto (effectValue) y el objeto afectado (objectAffect). |Implementada| Unitaria en backend a nivel de Servicio, prueba social.|
| CRUD de ActivePlayer | [ActivePlayerServiceTests](https://github.com/gii-is-DP1/dp1-2025-2026-l4-4-25/tree/main/src/test/java/es/us/dp1/l4_04_24_25/saboteur/ActivePlayer/ActivePlayerServiceTests.java) | Verifica el ciclo de vida (CRUD) del participante activo en partida, así como la gestión de sus estados de juego (pickaxeState, candleState, rol) |Implementada| Unitaria en backend a nivel de Servicio, prueba social. | |
| HU-24 Registros de Jugador: | [AuthServiceTests](https://github.com/gii-is-DP1/dp1-2025-2026-l4-4-25/tree/main/src/test/java/es/us/dp1/l4_04_24_25/saboteur/auth/AuthServiceTests.java) |Verifica que un nuevo usuario puede registrarse en el sistema. | Implementada |Unitaria en backend a nivel de Servicio, prueba social. |
| HU-44 Chat entre los jugadores en la partida | [ChatServiceTests](https://github.com/gii-is-DP1/dp1-2025-2026-l4-4-25/tree/main/src/test/java/es/us/dp1/l4_04_24_25/saboteur/chat/ChatServiceTests.java)| Verifica la gestión (CRUD) y la jerarquía de la entidad base Card, asegurando que el polimorfismo con Action y Tunnel funcione correctamente. | Implementada |Unitaria en backend a nivel de Servicio, prueba social.|
| HU-44 Chat entre los jugadores de la partida: | [MessageServiceTests](https://github.com/gii-is-DP1/dp1-2025-2026-l4-4-25/tree/main/src/test/java/es/us/dp1/l4_04_24_25/saboteur/message/MessageServiceTests.java) | Verifica la gestión (CRUD) de los mensajes, la búsqueda por ID de chat y la vinculación correcta al ActivePlayer emisor.| Implementada |Unitaria en backend a nivel de Servicio, prueba social.|
| HU-24 Registros de Jugador: | [AuthServiceTests](https://github.com/gii-is-DP1/dp1-2025-2026-l4-4-25/tree/main/src/test/java/es/us/dp1/l4_04_24_25/saboteur/auth/AuthServiceTests.java) |Verifica que un nuevo usuario puede registrarse en el sistema. | Implementada |Unitaria en backend a nivel de Servicio, prueba social. |
| HU-12 Indicador de Ronda | [RoundServiceTests](https://github.com/gii-is-DP1/dp1-2025-2026-l4-4-25/tree/main/src/test/java/es/us/dp1/l4_04_24_25/saboteur/round/RoundServiceTest.java) | Verifica la gestión (CRUD) de las rondas, la validación de restricciones (roundNumber) y las búsquedas por estado de la partida y número de ronda.| Implementada |Unitaria en backend a nivel de Servicio, prueba social.|
| CRUD de Square |[SquareServiceTests](https://github.com/gii-is-DP1/dp1-2025-2026-l4-4-25/tree/main/src/test/java/es/us/dp1/l4_04_24_25/saboteur/square/SquareServiceTests.java) | Verifica la gestión (CRUD) de las casillas, la validación de coordenadas, y las búsquedas por tipo (type) y estado de ocupación.| Implementada |Unitaria en backend a nivel de Servicio, prueba social.|
| CRUD de Tunnel|[TunnelServiceTests](https://github.com/gii-is-DP1/dp1-2025-2026-l4-4-25/tree/main/src/test/java/es/us/dp1/l4_04_24_25/saboteur/tunnel/TunnelServiceTests.java) | Verifica la gestión (CRUD) de cartas de Túnel, asegurando que la restricción de conexión (al menos una de cuatro salidas activa) se cumpla en la persistencia.| Implementada |Unitaria en backend a nivel de Servicio, prueba social.|
| HU-29 Gestión de Usuarios (CRUD avanzado) | [UserServiceTests](https://github.com/gii-is-DP1/dp1-2025-2026-l4-4-25/tree/main/src/test/java/es/us/dp1/l4_04_24_25/saboteur/user/UserServiceTests.java) | Verifica la gestión completa de usuarios (CRUD), la unicidad de username/email, la búsqueda por autoridad, y la funcionalidad de obtención de usuario actual.| Implementada |Unitaria en backend a nivel de Servicio, prueba social.|




## 6. Criterios de Aceptación

- Todas las pruebas unitarias deben pasar con éxito antes de la entrega final del proyecto.
- La cobertura de código debe ser al menos del 70%.
- No debe haber fallos críticos en las pruebas de integración y en la funcionalidad.

## 7. Conclusión

Este plan de pruebas establece la estructura y los criterios para asegurar la calidad del software desarrollado. Es responsabilidad del equipo de desarrollo y pruebas seguir este plan para garantizar la entrega de un producto funcional y libre de errores.