# 📃Documentación del Uso de IA en el Proyecto 📃
**Asignatura:** Diseño y Pruebas (Grado en Ingeniería del Software, Universidad de Sevilla)  
**Curso académico:** 2025/2026 
**Grupo/Equipo:** L4-4  
**Nombre del proyecto:** Saboteur 
**Repositorio:** (https://github.com/gii-is-DP1/dp1-2025-2026-l4-4-25/tree/main)
**Integrantes (máx. 6):** <!-- Nombre Apellidos (US-Id / correo @us.es) -->

Alejandro Caro Pérez (FQY7185 / alecarper@alum.us.es)

Lorenzo Valderrama Román (WRG8176 / lorvalrom@alum.us.es)

Diego Rey Carmona (RHQ7780 / diereycar@alum.us.es)

Marcos Ángel Ayala Blanco (GBK4935 / marayabla@alum.us.es)

Carlos Borrego Ortiz (HKP3295 / carborort@alum.us.es)

Luis Calderón Carmona (JGR9196/ luicalcar@alum.us.es)

## 📑 Resumen por Sprint (1–4)
### 💻Sprint 1 — Resumen de uso de IA

Usos registrados: 2

**Ámbitos principales:** Generación de assets visuales (favicon, imágenes para el background de distintas pantallas de la aplicación, logo, imágenes de avatares por defecto...), explicación de distintos fragmentos de código (tanto backend como frontend) para ponernos en el contexto programático de la aplicación y generación de código CSS para el cambio de estilo de algunos componentes de la aplicación. 

**Valor aportado:** Obtención rápida de elementos visuales y cambios efectivos en el estilo de las pantallas y componentes de la aplicación. 

**Riesgos relevantes y mitigaciones:** 
- **Riesgos:** Derechos de autor (las imágenes generadas por la IA pueden no ser totalmente libres o podrían parecerse a otras) y código CSS mal generado, no siguiendo el estilo que el equipo quería para la aplicación.
- **Mitigaciones:** Se verificó que las imágenes fueran generadas desde cero y no coincidieran con obras reales y se detalló mediante un prompt más específico la temática visual más cercana a lo que el equipo quería proporcionando a la IA varios archivos CSS del proyecto y las imágenes de los mockups que el equipo realizó previamente en Figma. 

**Lecciones aprendidas:** Refinar mucho los prompts para obtener resultados más específicos y conseguir que la IA se situe en el contexto del proyecto (adjuntando a nuestra conversación varios archivos originales del proyecto) para que las respuestas que ofrezca sean más acertadas y más precisas. 

Checklist de cumplimiento de uso ético de la IA del sprint X:

- [x] Toda interacción significativa está en el Registro Detallado con enlace a conversación.

- [x] No se usó IA para narrativa (o hay autorización documentada).

- [x] Toda pieza aceptada fue comprendida y verificada por humanos (tests/revisión).

- [x] Citas/Atribuciones incluidas cuando corresponde.

- [x] Se usó la IA sin dar datos personales/sensibles que puedieran quedar expuestos a herramientas externas.

### 💻Sprint 2 — Resumen de uso de IA

Usos registrados: 11

**Ámbitos principales:** 
- **Depuración / Diagnóstico:**
    - **Errores Backend:** JPA Herencia, Servicios,     Controladores
    - **Errores Frontend:** Estados de React, API calls, CORS, Blob URLs (para la importación de archivos desde el equipo), Validaciones, Router y React Navigation.
- **Generación de Código funcional:**
    - **Frontend:** useEffects, handleSubmit y validadores.
    - **Backend:** UserService para ajustar el relleno de las tablas al registrarse por primera vez o al crear un usuario siendo administrador. Además de generación de algunos tests unitarios (dando como contexto los tests generados manualmente).
- **Explicación de conceptos:** Herencia vs Composición, JPA, localStorage, Serializer, DTO, JWT.
- **Diseño Técnico:** Refactorización modelo Player/ActivePlayer, lógica de creación de usuarios. 


**Valor aportado:** Resolución más rápida y comprensiva de errores complejos y bloqueantes (especialmente relacionados con la herencia JPA y la interacción frontend - backend), clarificación de conceptos técnicos clave, generación y corrección de código específico para backend y frontend, aseguramiento de prácticas de seguridad (hashing de contraseñas).

**Riesgos relevantes y mitigaciones:**
- **Riesgos:** 
    - Riesgo de aplicar soluciones sin comprender la causa raíz
    - Riesgo de introducir código inseguro (ej: doble hashing (se dio en un caso), no hashing)
    - Riesgo de generar dependencias incorrectas
- **Mitigaciones:** 
    - Discusión iterativa con la IA hasta entender el problema, realizar pruebas exhaustivas y no tomar como válida la primera respuesta del agente IA si no se comprende a la perfección.
    - Verificación explícita de la lógica de seguridad con la IA y pruebas funcionales. 
    - Debate sobre el diseño de la arquitectura con la IA y contar siempre con la validación del equipo.



**Lecciones aprendidas:** La IA es muy eficaz como herramienta de depuración interactiva (es como un "pair programmer virtual"). Proporcionar un contexto completo (código de componentes del proyecto, errores exactos, logs, información del "dev tools" del navegador...) es crucial para reducir el número de errores o "alucinaciones" en la respuesta de la IA. Cada sugerencia de diseño debe ser evaluada críticamente por los miembros del equipo. Además, la IA ayuda a identificar inconsistencias entre diferentes partes del sistema (Ejemplo de un caso dado durante la realización del proyecto: creación de usuario en "AuthService" vs "UserService")


Checklist de cumplimiento de uso ético de la IA del sprint X:

- [x] Toda interacción significativa está en el Registro Detallado con enlace a conversación.

- [x] No se usó IA para narrativa (o hay autorización documentada).

- [x] Toda pieza aceptada fue comprendida y verificada por humanos (tests/revisión).

- [x] Citas/Atribuciones incluidas cuando corresponde.

- [x] Se usó la IA sin dar datos personales/sensibles que puedieran quedar expuestos a herramientas externas.

### 💻 Sprint 3 — Resumen de uso de IA

Usos registrados: 9

**Ámbitos principales:**

- **Frontend — Animaciones / UI:**
Creación y ajuste de animaciones (explosión/destrucción de túnel, pantalla de carga, notificación de rol al iniciar partida) y ficheros CSS/JS asociados. (3.1, 3.2, 3.6)
- **Comunicación en tiempo real:**
Implementación y ayuda en la integración de WebSockets para sincronización entre jugadores. (3.3)
- **Algoritmos de juego (Lógica de tablero):**
Implementación y validación del algoritmo BFS para detectar conectividad desde el inicio hasta la pepita o entre caminos. (3.4)
- **Backend — Modelado de datos / Compilación:**
Ayuda en la inclusión de la tabla intermedia Request para solicitudes de amistad y resolución de errores de compilación por el mismo. (3.5)
- **Pruebas automatizadas:**
Generación y ajuste de tests unitarios para aumentar cobertura. (3.7, 3.8)

**Valor aportado:**

- Aceleración en la implementación de animaciones y elementos visuales complejos.
- Resolución de bloqueos técnicos en WebSocket y compilación backend.
-Mejora de la robustez del juego mediante la incorporación del BFS para comprobar conectividad y con pruebas unitarias que elevaron la cobertura.

**Riesgos relevantes y mitigaciones:**
· **Riesgos**
- Código generado incorrecto o incompleto que afecte la jugabilidad o el estilo visual (animaciones/CSS).
- Introducción de fallos por copiar/pegar soluciones automáticas (lógica de juego, WebSockets, DB).
- Tests mal configurados.

· **Mitigaciones**

- Revisión manual y pruebas en entorno local antes de merge (se verificó cada artefacto con casos reales probandolos en el juego).
- No se acepta el código de IA sin adaptar: contextuar en la conversación, pedir explicaciones y entender la lógica propuesta en todos los casos.
- Uso de pruebas unitarias y ejecuciones de integración para validar cambios (maven run, ejecución de suites de tests).
- Comparación cruzada con otras herramientas (ej. Ask/Copilot) cuando procedió.

**Lecciones aprendidas (Sprint 3)**

- La IA es especialmente eficiente para prototipado rápido de UI (animaciones, pantallas), pero requiere adaptación manual para asegurar rendimiento y de coherencia visual.
- Cuando la IA sugiere cambios que afectan al flujo del juego (WebSocket, BFS, DB), es imprescindible probar escenarios multi-jugador y casos límite para el buen funcionamiento del mismo.
- Mantener un flujo de revisión humano para evita introducir regresiones provenientes de sugerencias automáticas.
- Las pruebas unitarias generadas por IA son un buen punto de partida, aunque hay que ampliarlas y parametrizarlas para casos del dominio.

Checklist de cumplimiento de uso ético de la IA (Sprint 3)

- [x]Toda interacción significativa está en el Registro Detallado con enlace a conversación (cuando aplica).
- [x] No se usó IA para narrativa sin autorización.
- [x] Toda pieza aceptada fue comprendida y verificada por los desarrolladores.
- [x] Citas / Atribuciones incluidas cuando corresponde (en la tabla original aparecen enlaces a las mismas).
- [x] No se compartieron datos personales/sensibles con herramientas externas.

### 💻 Sprint 4 — Resumen de uso de IA
Usos registrados: 8

**Ámbitos principales:**

Depuración / Diagnóstico de Sincronización: Resolución de problemas críticos en WebSockets (mismatch de IDs de partida en los topics) y persistencia del estado del mazo (deckCount) tras recarga de página (F5).

Diseño Técnico y Backend: Refactorización de la lógica de búsqueda de jugadores activos mediante consultas JPA filtrando por partidas en estado ONGOING.

Frontend — UI y Refactorización: Creación del panel de gestión de partidas para el administrador (filtros y estilos unificados) y refactorización estética del Ranking mediante layouts de CSS Grid.

Branding y Experiencia de Usuario (UX): Generación de secuencias de inicio personalizadas, incluyendo banners ASCII en consola y lógica de carga en Java/JS.

**Valor aportado:**

Garantía de robustez en la comunicación en tiempo real (evitando que los mensajes de una partida afecten a otra), mejora de la integridad de los datos ante acciones del usuario como refrescar el navegador, y unificación visual definitiva de los componentes administrativos y de estadísticas.

**Riesgos relevantes y mitigaciones:**

Riesgos: Desincronización de WebSockets por persistencia de datos históricos en el backend e inconsistencias visuales en el ranking al manejar múltiples métricas. Errores de codificación (encoding) en los banners ASCII de inicio.

Mitigaciones: Implementación de filtrados estrictos por estado de partida y marcas de tiempo (_ts) en mensajes de socket para forzar re-renderizados en React. Uso de herramientas de desarrollador (DevTools) y encapsulamiento de estilos CSS para evitar conflictos globales.

**Lecciones aprendidas:**
La IA ha sido vital para diagnosticar errores de flujo complejos (como el envío de mensajes a topics de partidas anteriores). Hemos aprendido que el backend debe ser la única "fuente de verdad" incluso para contadores temporales y que la limpieza de suscripciones en el frontend es crítica para el rendimiento. También se destaca la importancia de optimizar las consultas JPA para ignorar datos históricos de jugadores que participan en múltiples partidas.

Checklist de cumplimiento de uso ético de la IA del sprint 4:

- [x] Toda interacción significativa está en el Registro Detallado con enlace a conversación.

- [x] No se usó IA para narrativa (o hay autorización documentada).

- [x] Toda pieza aceptada fue comprendida y verificada por humanos (tests/revisión).

- [x] Citas/Atribuciones incluidas cuando corresponde.

- [x] Se usó la IA sin dar datos personales/sensibles que pudieran quedar expuestos a herramientas externas.

## Registro detallado de uso de AI por Sprint
### Sprint 1 registro detallado de uso de IA por sprint

| # | Fecha y hora | Sprint | Integrante(s) | **Herramienta & versión** | **Acceso** | **Enlace a conversación / Prompt** | **Finalidad** | **Artefactos afectados** | **Verificación humana** | **Riesgos & mitigaciones** | **Resultado** |
|---:|--------------|:-----:|---------------|----------------------------|------------|------------------------------------|---------------|---------------------------|--------------------------|-----------------------------|---------------|
| 1.1 | 24/09/2025 17:00 | 1 | Luis y Alejandro | ChatGPT (GPT-5, OpenAI, 2025) y Gemini 2.5 PRO| Web|Conversaciones sobre generación de assets visuales: <br>https://chatgpt.com/share/6900f021-feac-800a-bb4f-addbe6f158fa <br>https://chatgpt.com/s/m_6900ef202be481919a578771e4e8f215 <br>https://gemini.google.com/share/c95860039724 <br>https://gemini.google.com/share/2eeabc5a79fc (esta última conversación es referente a los mockups)| Creación de componentes visuales | "Assets" de imágenes del proyecto | Revisión por parte de todo el equipo L4-4 | Posibles similitudes con otras imágenes (Copyright). Mitigado mediante la comprobación exhaustiva de la originalidad del contenido | Aceptado |
| 1.2 | 25/09/2025 16:00 | 1 | Todos los integrantes del grupo L4-4 | ChatGPT (GPT-5, OpenAI, 2025) y Gemini 2.5 PRO | Web | "_Actúa como arquitecto de software. Basándote en el contexto, diapositivas y código del proyecto adjuntados en esta conversación, analiza la plantilla "semilla" del proyecto y explica de forma precisa: <br> 1.**Arquitectura:** Funcionamiento y capas Frontend/Backend.<br> 2.**Datos Backend:** Organización y estructura. <br> 3.**Código:** Estilo y convenciones._" | Comprensión del código de la versión inicial del proyecto| Ninguno | Revisión por parte de todo el equipo L4-4 | El riesgo principal es la falta de veracidad y comprobación en la información, pudiendo desencadenar que la información proporcionada sea incorrecta. Se ha mitigado usando las diapositivas de la asignatura para contrastar la información dada por la IA y adjuntándole a esta todas las diapositivas para que desarrollara las respuestas en un contexto adecuado. | Aceptado |


### Sprint 2

| # | Fecha y hora | Sprint | Integrante(s) | **Herramienta & versión** | **Acceso** | **Enlace a conversación / Prompt** | **Finalidad** | **Artefactos afectados** | **Verificación humana** | **Riesgos & mitigaciones** | **Resultado** |
|---:|--------------|:-----:|---------------|----------------------------|------------|------------------------------------|---------------|---------------------------|--------------------------|-----------------------------|---------------|
| 2.1 | 08/10/2025 18:00  | 2 | Marcos |  ChatGPT (GPT-5, OpenAI, 2025) y Gemini 2.5 PRO | Web | https://chatgpt.com/share/69022d86-17ac-8004-b134-59c0fc0a6920 <br> (Destacar que el principio de esta conversación trata de análisis de errores, lo verdaderamente interesante ocurre varios _prompts_ más adelante donde se habla de la edición del perfil de usuario)| Depuración, análisis de errores y corrección, elaboración de las pantallas [Profile.js](/frontend/src/lobbies/profiles/Profile.js) y [EditProfile.js](/frontend/src/lobbies/profiles/EditProfile.js) tomando como referencia el proyecto _Citadels_ del _Hall of Fame_ proporcionado por los profesores. Cabe destacar la elaboración de componentes _dropdown_ para escoger avatares predeterminados y la implementación de la opción de subir una imagen que el dispositivo tenga en local para usarla como avatar| Componentes frontend:  pantallas Profile y EditProfile | Pruebas mediante la ejecución de la aplicación sin errores y observando la herramienta de desarrolladores en la web (_dev tools_). <br> Probar reiteradamente la funcionalidad de elección de avatares predeterminados o propios subiendo un archivo |**Riesgos**: <br> Generación de código incorrecto. <br> Aparición de nuevos errores generados por el código proporcionado por la IA (trabajo extra de depuración). <br> Incapacidad de importación de archivos en la aplicación <br> **Mitigaciones:** No copiar y pegar directamente el código proporcionado con la IA, analizar entre varios compañeros la coherencia del código, dar contexto previo en la conversación para reducir número de errores...  | Aceptado|
| 2.2 | 10/10/2025 17:00  | 2 | Marcos |   Gemini 2.5 PRO | Web | "_Quiero crear User, Player y ActivePlayer al registrar. ¿Lo hago en UserService? Código: [UserService.java](/src/main/java/es/us/dp1/l4_04_24_25/saboteur/user/UserService.java), [ActivePlayer.java](/src/main/java/es/us/dp1/l4_04_24_25/saboteur/activePlayer/ActivePlayer.java), [AuthService.java](/src/main/java/es/us/dp1/l4_04_24_25/saboteur/auth/AuthService.java)_" | Diseño técnico, explicación concepto | UserService.java, ActivePlayer.java, GameService.java, AuthService.java | Pruebas mediante la ejecución de la aplicación sin errores, observando la herramienta de desarrolladores en la web (_dev tools_), realizando peticiones en Swagger y comprobando el contenido de la base de datos H2 |**Riesgos**: <br> Generación de código incorrecto. <br> Aparición de nuevos errores generados por el código proporcionado por la IA (trabajo extra de depuración). <br> **Mitigaciones:** No copiar y pegar directamente el código proporcionado con la IA, analizar entre varios compañeros la coherencia del código, dar contexto previo en la conversación para reducir número de errores...  | Aceptado|
| 2.3| 10/10/2025 18:00  | 2 | Luis |  Gemini 2.5 PRO | Web | https://gemini.google.com/share/cb85daebf3c6 | Resolución de dudas sobre el código, explicación de errores, ayuda a con su corrección y generación de nuevas funciones | Pruebas mediante la ejecución de la aplicación sin errores y observando la herramienta de desarrolladores en la web (_dev tools_)|**Riesgos**: <br> Generación de código incorrecto. <br> Aparición de nuevos errores generados por el código proporcionado por la IA (trabajo extra de depuración). <br> **Mitigaciones:** No copiar y pegar directamente el código proporcionado con la IA, analizar entre varios compañeros la coherencia del código, dar contexto previo en la conversación para reducir número de errores...  | Aceptado|
| 2.4 | 12/10/2025 16:30  | 2 | Marcos |  ChatGPT (GPT-5, OpenAI, 2025) y Gemini 2.5 PRO | Web | "_A qué se debe el error 404 en Lobby al buscar Player una vez que se inicia sesión. Código: [Lobby.js](/frontend/src/lobbies/lobby.js), [código de error]_" | Depuración, análisis de errores y corrección | Lobby.js, UserService.java | Pruebas mediante la ejecución de la aplicación sin errores, observando la herramienta de desarrolladores en la web (_dev tools_) y la interfaz gráfica de la base de datos H2 para comprobar que los datos se guardan correctamente|**Riesgos**: Asesoramiento incorrecto sobre el error <br> Generación de código incorrecto. <br> Aparición de nuevos errores generados por el código proporcionado por la IA (trabajo extra de depuración). <br> **Mitigaciones:** Iterar varias veces sobre el _prompt_ dando mayor contexto de la situación. <br> No copiar y pegar directamente el código proporcionado con la IA, analizar entre varios compañeros la coherencia del código, dar contexto previo en la conversación para reducir número de errores...  | Aceptado|
| 2.5| 12/10/2025 18:00  | 2 | Luis |  Gemini 2.5 PRO | Web | https://gemini.google.com/share/75ddff6ad591 | Solución de generación infinita de peticiones GET | Pruebas mediante la ejecución de la aplicación sin errores y observando la herramienta de desarrolladores en la web (_dev tools_), en concreto el apartado _Network_ |**Riesgos**: <br> Generación de código incorrecto. <br> Aparición de nuevos errores generados por el código proporcionado por la IA (trabajo extra de depuración). <br> **Mitigaciones:** No copiar y pegar directamente el código proporcionado con la IA, analizar entre varios compañeros la coherencia del código, dar contexto previo en la conversación para reducir número de errores...  | Aceptado|
| 2.6 | 12/10/2025 18:30  | 2 | Carlos |  ChatGPT (GPT-5, OpenAI, 2025) | Web | https://chatgpt.com/share/68fb8178-63fc-8005-a85a-faf026606f67 <br> https://chatgpt.com/share/68ff6250-d9ac-8005-9ed9-a37aca20c325 | Información sobre el código, análisis, explicación y resolución de errores. <br> Uso de _Serializers_ para eliminar bucles infinitos. <br> Manejo de controladores y servicios para lograr un correcto funcionamiento de los métodos HTTP| Componentes backend (ej. modelos, servicios y controladores como _Board_, _BoardService_ y _BoardRestController_ entre otros ) | Pruebas mediante la ejecución de la aplicación sin errores, utilizando _Swagger_ y observando la interfaz de la base de datos _H2_ |**Riesgos**: <br> Generación de código incorrecto. <br> Aparición de nuevos errores generados por el código proporcionado por la IA (trabajo extra de depuración). <br> **Mitigaciones:** No copiar y pegar directamente el código proporcionado con la IA, analizar entre varios compañeros la coherencia del código, dar contexto previo en la conversación para reducir número de errores, iterar varias veces la misma pregunta...  | Aceptado|
| 2.7 | 14/10/2025 17:00  | 2 | Diego |  ChatGPT (GPT-5, OpenAI, 2025) y Gemini 2.5 PRO | Web | _"Basándote en los métodos POST de otros controladores adjuntados como GameRestController o PlayerRestController, necesitoq ue me ayudes a implementar el método POST en el CardRestController, ya que aparentemente está igual que el resto de métodos pero me está dando error al ejecutar la aplicación. Debe usar BeanUtils.copyProperties para mapear desde un DTO (en lugar de un constructor) y gestionar la relación Deck manualmente."_<br> _"Necesito que me ayudes ahora a implementar el método PATCH (@PatchMapping). Debe aceptar un Map<String, Object>, buscar la entidad Round por ID y aplicar las actualizaciones parciales usando objectMapper.updateValue antes de guardar."_ | Información sobre el código, análisis, explicación y resolución de errores. <br> Ayuda con la implementación <br> Manejo de controladores y servicios para lograr un correcto funcionamiento de los métodos HTTP| Componentes backend, en concreto _Card_ y _CardRestController_ | Pruebas mediante la ejecución de la aplicación sin errores, utilizando _Swagger_ y observando la interfaz de la base de datos _H2_ |**Riesgos**: <br> Generación de código incorrecto. <br> Aparición de nuevos errores generados por el código proporcionado por la IA (trabajo extra de depuración). <br> **Mitigaciones:** No copiar y pegar directamente el código proporcionado con la IA, analizar entre varios compañeros la coherencia del código, dar contexto previo en la conversación para reducir número de errores, iterar varias veces la misma pregunta...  | Aceptado|
| 2.8 | 14/10/2025 19:00  | 2 | Marcos |   Gemini 2.5 PRO | Web | "_Error al pasar a la pantalla de edición de usuario en el CRUD del admin:Failed to convert String 'undefined' to Integer 'id'. Código: [UserEditAdmin.js](/frontend/src/admin/users/UserEditAdmin.js), [UserListAdmin.js](/frontend/src/admin/users/UserListAdmin.js), [App.js](/frontend/src/App.js)_" | Depuración <br> Diagnóstico <br> Generación de código | [UserEditAdmin.js]((/frontend/src/admin/users/UserEditAdmin.js)), [UserListAdmin.js](/frontend/src/admin/users/UserListAdmin.js), [App.js](/frontend/src/App.js) | Pruebas mediante la ejecución de la aplicación sin errores, observando la herramienta de desarrolladores en la web (_dev tools_) |**Riesgos**: <br> Generación de código incorrecto. <br> Aparición de nuevos errores generados por el código proporcionado por la IA (trabajo extra de depuración). <br> **Mitigaciones:** No copiar y pegar directamente el código proporcionado con la IA, analizar entre varios compañeros la coherencia del código, dar contexto previo en la conversación para reducir número de errores...  | Aceptado|
| 2.9 | 14/10/2025 19:30  | 2 | Lorenzo |  ChatGPT (GPT-5, OpenAI, 2025) | Web | https://chatgpt.com/share/68ff6342-53f0-8012-b5e5-a177beabdf3b <br> https://chatgpt.com/share/68ff6380-6314-8012-8ffb-99bde665a53d | Información sobre el código, análisis de errores y corrección | Componentes backend (ej. DeckRestController) | Pruebas mediante la ejecución de la aplicación sin errores, utilizando _Swagger_ y observando la interfaz de la base de datos _H2_ |**Riesgos**: <br> Generación de código incorrecto. <br> Aparición de nuevos errores generados por el código proporcionado por la IA (trabajo extra de depuración). <br> **Mitigaciones:** No copiar y pegar directamente el código proporcionado con la IA, analizar entre varios compañeros la coherencia del código, dar contexto previo en la conversación para reducir número de errores...  | Aceptado|
| 2.10 | 20/10/2025 16:00  | 2 | Marcos y Luis |  Gemini 2.5 PRO | Web |  https://gemini.google.com/share/67c5ade3a85e | Depuración y solución de todos los errores presentados al ir integrando backend con frontend | Componentes backend (ej. [UserService.java](/src/main/java/es/us/dp1/l4_04_24_25/saboteur/user/UserService.java), [GameRestController.java](/src/main/java/es/us/dp1/l4_04_24_25/saboteur/game/GameRestController.java), [GameService.java](/src/main/java/es/us/dp1/l4_04_24_25/saboteur/game/GameService.java), etc) y frontend (ej. [CreateGame.js](/frontend/src/lobbies/games/CreateGame.js), [ListGames.js](/frontend/src/lobbies/games/ListGames.js), [Board.js](/frontend/src/game/board.js),  [UserEditAdmin.js](/frontend/src/admin/users/UserEditAdmin.js), [UserListAdmin.js](/frontend/src/admin/users/UserListAdmin.js), [Profile.js](/frontend/src/lobbies/profiles/Profile.js), etc) | Pruebas mediante la ejecución de la aplicación sin errores, utilizando _Swagger_, observando la interfaz de la base de datos _H2_  y haciendo mucho uso de los _dev tools_|**Riesgos**: <br> Generación de código incorrecto. <br> Aparición de nuevos errores generados por el código proporcionado por la IA (trabajo extra de depuración). <br> Falta de precisión en la explicación del error. <br> **Mitigaciones:** No copiar y pegar directamente el código proporcionado con la IA, analizar entre varios compañeros la coherencia del código, dar contexto previo en la conversación para reducir número de errores...  | Aceptado|
| 2.11 | 20/10/2025 15:00  | 2 | Alejandro |  ChatGPT | Web | "Necesito que me hagas el estilo de los filtros y de la pantalla de ListGame que se ajusten al juego Saboteur y a las demas pantalla para que haya linealidad entre los diseños" | Archivo CSS sobre una de als pantallas importantes del juego, también su uso ha servido para otras pantallas | Componente frontend CSS (en la carpeta static) sobre el Listgame.css | Pruebas mediante la ejecución y visualización de dicha pantalla |**Riesgos**: <br> Generación de código incorrecto. <br> Aparición de nuevos errores generados por el código proporcionado por la IA (trabajo extra de depuración). <br> Falta de precisión en la explicación del error. <br> **Mitigaciones:** No copiar y pegar directamente el código proporcionado con la IA, analizar entre varios compañeros la coherencia del código, dar contexto previo en la conversación para reducir número de errores...  | Aceptado|

### Sprint 3

| # | Fecha y hora | Sprint | Integrante(s) | **Herramienta & versión** | **Acceso** | **Enlace a conversación / Prompt** | **Finalidad** | **Artefactos afectados** | **Verificación humana** | **Riesgos & mitigaciones** | **Resultado** |
|---:|--------------|:-----:|---------------|----------------------------|------------|------------------------------------|---------------|---------------------------|--------------------------|-----------------------------|---------------|
| 3.1 | 13/11/2025 12:00  | 3 | Alejandro y Carlos |  Copilot PRO | Visual Studio | Se proporciona el Prompt: *"Necesitamos una animación que simule una explosión de manera realista en coherencia con nuestro juego Saboteur, dicha función se encuentra ya definida en board.js con la siguiente función --> activateCollapseMode que se activa cuando un jugador quiere realizar dicha acción y no ha habido restricciones que lo hubiesen impedido, esta animación no puede durar más de 5 segundos."* | Creación de la animación de destrucción de un camino tunel en la función ya definida | Archivo CSS sobre el Game [game.css], linea 680. | Se ha verificado mediante varias pruebas dentro del juego, probando todas las posibles casuísticas para la comprobación del buen funcionamiento del estilo / animación pedida |**Riesgos**: <br> Generación de código incorrecto que puediese dañar el estilo y visualización del propio tablero (y de la jugabilidad) <br> **Mitigaciones:** No copiar y pegar directamente el código proporcionado con la IA, analizar la coherencia del código, dar contexto previo en la conversación para reducir número de errores...  | Aceptado|
| 3.2 | 13/11/2025 17:00  | 3 | Alejandro |  Copilot PRO | Visual Studio | Se proporciona el Prompt: *"Necesitamos una animación para la pantalla de inicio (pantalla de carga de unos 10 segundos con animaciones de nuetsro juego), creame el archivo js y el css correspondiente, este será para cuando un usuario se registre o inicie sesión, añadiendole una canción en formato mp3 que adjuntaremos nosotros posteriormente "* | Creación de la animación para el inicio de sesión o la entrada en nuestra sesión, se puede visualizar en los siguientes modulos --> [WelcomeScreen.js] y [WelcomeScreen.css] | Se ha verificado mediante varias pruebas dentro del juego, probando todas las posibles casuísticas para la comprobación del buen funcionamiento de esta pantalla de inicio y su correspondiente animación pedida |**Riesgos**: <br> Generación de código incorrecto que puediese dañar el acceso principal al Juego Saboteur una vez iniciado sesión <br> **Mitigaciones:** No copiar y pegar directamente el código proporcionado con la IA, analizar la coherencia del código, dar contexto previo en la conversación para reducir número de errores...  | Aceptado|
| 3.3 | 15/11/2025 16:30  | 3 | Marcos |  ChatGPT | Web | https://chatgpt.com/share/69286ac4-a48c-8004-a43d-066e0929bdf8 https://chatgpt.com/share/69286b1a-8768-8004-acac-12d44f262d1b | Ayuda en la implementación del WebSocket en nuestro sistema | Se ha verificado mediante varias pruebas dentro del juego, probando todas las posibles casuísticas para la comprobación del buen funcionamiento de la actualización en varios jugadores dentro de una partida |**Riesgos**: <br> Generación de código incorrecto. <br> Aparición de nuevos errores generados por el código proporcionado por la IA (trabajo extra de depuración). <br> Falta de precisión en la explicación del error. <br>  **Mitigaciones:** No copiar y pegar directamente el código proporcionado con la IA, analizar la coherencia del código, dar contexto previo en la conversación para reducir número de errores...  | Aceptado |
| 3.4 | 15/11/2025 18:00  | 3 | Carlos |  ChatGPT | Web | https://chatgpt.com/share/69286fff-e75c-800a-b3f8-5867de9c187f | Ayuda en la implementación del algoritmo de BFS que ayuda a saber si desde el inicio hay un camino conectado hasta la pepita | Se ha verificado mediante varias pruebas dentro del juego, probando todas las posibles casuísticas en la colocación de las cartas (sobre todo cuando destruyes un camino). También se ha contrastado con el modo Ask de Copilot en Visual Studio | **Riesgos**: <br> Generación de código incorrecto. <br> Aparición de nuevos errores generados por el código proporcionado por la IA (trabajo extra de depuración). <br> Falta de precisión en la explicación del error. <br>  **Mitigaciones:** No copiar y pegar directamente el código proporcionado con la IA, analizar la coherencia del código, dar contexto previo en la conversación para reducir número de errores...  | Aceptado |
| 3.5 | 16/11/2025 16:00  | 3 | Lorenzo |  Copilot PRO | Visual Studio | Se adjunta el prompt correspondiente: *"He añadido una tabla intermedia para las solicitudes de amistad llamadas Request. El problema reside en el datasql porque me da error al compilar"* | Ayuda para la implementación de una tabla en las solicitudes de amistad de la Sección de amigos | Se ha verificado añadiendo request (peticiones de amistad), haciendo *maven run* ya que no compilaba el código que anteriormente estaba hecho | **Riesgos**: <br> Generación de código incorrecto. <br> Aparición de nuevos errores generados por el código proporcionado por la IA (trabajo extra de depuración). <br> Falta de precisión en la explicación del error. <br>  **Mitigaciones:** No copiar y pegar directamente el código proporcionado con la IA, analizar la coherencia del código, dar contexto previo en la conversación para reducir número de errores...  | Aceptado |
| 3.6 | 20/11/2025 16:30  | 3 | Alejandro |  Copilot PRO | Visual Studio | Se adjunta el prompt correspondiente: *"Creame una animación que al entrar en la partida me indique el rol que se me ha asignado a la misma con una pestaña despregable de pocos segundos en el que salga la foto del rol y debajo el nombre"* | Ayuda para la creación de una animación bastante vistosa para el reparto de roles justo al empezar una partida y navegar al /board --> La lógica se encuentra en [board.js] y [game.css] | Se ha verificado con el inicio de las partidas en varias ocasiones dando los resultados esperando tras varios cambios manuales en la configuración del código aportado | **Riesgos**: <br> Generación de código incorrecto. <br> Aparición de nuevos errores generados por el código proporcionado por la IA (trabajo extra de depuración). <br> Falta de precisión en la explicación del error. <br>  **Mitigaciones:** No copiar y pegar directamente el código proporcionado con la IA, analizar la coherencia del código, dar contexto previo en la conversación para reducir número de errores...  | Aceptado |
| 3.7 | 24/11/2025 16:45  | 3 | Diego |  Gemini Pro | Web | https://gemini.google.com/share/6d1febf92d34 & https://gemini.google.com/share/ec6468412ff4 | Realización de pruebas unitarias del sistema | Se ha verificado ejecutando las pruebas y obteniendo el informa del porcentaje de cobertura de nuestro sistema  | **Riesgos**: <br> Generación de código incorrecto. <br> Aparición de nuevos errores generados por el código proporcionado por la IA (trabajo extra de depuración). <br> Falta de precisión en la explicación del error. <br>  **Mitigaciones:** No copiar y pegar directamente el código proporcionado con la IA, analizar la coherencia del código, dar contexto previo en la conversación para reducir número de errores...  | Aceptado |
| 3.8 | 26/11/2025 17:00  | 3 | Diego |  Gemini Pro | Web | https://gemini.google.com/share/b201a020d461 | Realización de pruebas unitarias del sistema para alcanzar el máximo posible de cobertura. | Se ha verificado ejecutando las pruebas y obteniendo el informa del porcentaje de cobertura de nuestro sistema | **Riesgos**: <br> Generación de código incorrecto. <br> Aparición de nuevos errores generados por el código proporcionado por la IA (trabajo extra de depuración). <br> Falta de precisión en la explicación del error. <br>  **Mitigaciones:** No copiar y pegar directamente el código proporcionado con la IA, analizar la coherencia del código, dar contexto previo en la conversación para reducir número de errores...  | Aceptado |
| 3.9 | 29/11/2025 16:00  | 3 | Alejandro |  Copilot | Visual Studio Ask | Se proporciona el siguiente Prompt: "Quiero que no se me duplique los amigos dentro de la sección amigos cuando se invita y se hace el patch" | Eliminación de datos duplicados dentro de la Sección amigos al hacer el GET de amigos | Se ha verificado probando varias veces y con varios usuarios (FriendsDropDown.js), también se ha cambiado el List<Player> del backend por el Set<Player>, decisión de Lorenzo | **Riesgos**: <br> Generación de código incorrecto. <br> Aparición de nuevos errores (duplicado) generados por el código proporcionado por la IA (trabajo extra de depuración).  **Mitigaciones:** No copiar y pegar directamente el código proporcionado con la IA, analizar la coherencia del código, dar contexto previo en la conversación para reducir número de errores...  | Aceptado |


### Sprint 4

| # | Fecha y hora | Sprint | Integrante(s) | **Herramienta & versión** | **Acceso** | **Enlace a conversación / Prompt** | **Finalidad** | **Artefactos afectados** | **Verificación humana** | **Riesgos & mitigaciones** | **Resultado** |
|---:|--------------|:-----:|---------------|----------------------------|------------|------------------------------------|---------------|---------------------------|--------------------------|-----------------------------|---------------|
| 4.1 | 31/12/2025 17:00 | 4 | Alejandro | Copilot PRO | Plugin VS | "Creame la visualización del código sobre el panel para visualizar y gestionar las partidas..." | Diseño técnico y UI | AdminGames.js, AdminGamesUnified.css | Verificación visual y funcional de filtros.| Estilo inconsistente. Mitigado adaptando CSS previo.| Aceptado con cambios parciales |
| 4.2 | 02/01/2026 11:30 | 4 | Alejandro | Copilot / ChatGPT | Web/Plugin | "El tema del mazo de las cartas se resetea al recargar la pagina... deckcount no guarda el estado" | Depuración y Lógica | board.js, Round.java, gameUtils.js | Pruebas de recarga de página (F5) en partida.| Cálculos erróneos según num. jugadores. Mitigado con lógica de validación en el init.| Aceptado|
| 4.3 | 05/01/2026 14:15 | 4 | Marcos y Alejandro | Copilot / Gemini 2.5 Pro | Web/Plugin | "En la segunda partida el deck count de cada jugador se queda en 6 y no decrementa... WS Message received on /topic/game/151/deck pero la partida es 153" | Depuración de WebSockets | useWebSocket.js, DeckRestController.java, ActivePlayerService.java | Inspección de consola de desarrollador y logs de backend.| Mensajes a canales antiguos. Mitigado filtrando por partidas ONGOING.| Aceptado|
| 4.4 | 07/01/2026 18:00 | 4 | Alejandro | ChatGPT (GPT-5) | Web| "Genera un banner ASCII artístico con el nombre del proyecto y diseña la lógica en Java para una clase StartupSequence que limpie la consola y simule una secuencia de carga antes de iniciar el backend." | Branding / UX | banner.txt, startup.js, StartupSequence.java | Comprobación visual en los logs de arranque.|Errores de compilación en Java por sintaxis incorrecta en la secuencia de inicio o problemas de codificación (encoding) en el banner ASCII.| Aceptado|
| 4.5 | 04/01/2026 19:30 | 4 | Diego | ChatGPT | Web| "Las métricas de los jugadores aparecen amontonadas en una sola columna. Ayúdame a refactorizar el componente Ranking.js para separar las estadísticas"| UI / Refactor|Ranking.js, Ranking.css|Corrección y mejora del estilo del Ranking de jugadores |Riesgos: Conflictos de selectores CSS globales que afecten a otras tablas del proyecto. Mitigaciones: Uso de prefijos específicos y encapsulamiento de estilos para el componente Ranking.| Aceptado|
| 4.6 | 04/01/2026 19:30 | 4 | Lorenzo | Perplexity AI (Pro, 2026) | Web| (https://www.perplexity.ai/search/estoy-haciendo-un-juego-y-quie-_oq80zzwRwakWSItJvndgw)| Depuración / Diseño técnico|ActivePlayerService.java y GameRepository.java|Revisión de código por pares y pruebas funcionales iniciando dos partidas consecutivas con el mismo usuario.|Riesgos: Conflictos de selectores CSS globales que afecten a otras tablas del proyecto. Mitigaciones: Uso de prefijos específicos y encapsulamiento de estilos para el componente Ranking.| Aceptado|
| 4.7 | 10/01/2026 19:30 | 4 | Alejandro | Gemini Pro | Web| (https://gemini.google.com/share/d6f45bed2817)| UI / Ambientación|BackgroundMusic.js, SaboteurCursor.js|"Componentes de música (YouTube API) y cursor interactivo con partículas de oro."|Riesgos: Carga de scripts externos. Mitigación: Uso de useEffect y refs para limpieza.|Aceptado|
| 4.8 | 08/01/2026 10:30 | 4 | Marcos y Diego | Gemini Pro | Web| (https://gemini.google.com/share/09ae3d328ee8)| Aprendizaje para Generación de pruebas Frontend / Diseño técnico|Ranking.test.js, Lobby.test.js|Ejecución de la suite mediante npm test y validación manual de las aserciones de UI.|Riesgos: Creación de tests superficiales que solo validen el renderizado. Mitigaciones: Estudio detallado de la lógica de simulación de eventos|Aceptado|


    

## Conclusiones finales sobre el uso de la IA en el proyecto
La reflexión principal que obtenemos sobre el uso de la IA en el proyecto es que puede a llegar a ser una herramienta realmente útil a la hora de desarrollar la aplicación. Su uso ha sido muy relevante principalmente en la explicación de código, análisis de errores y ayuda a la resolución de estos. También ha jugado un papel muy importante en la generación de _assets_ visuales del proyecto (imágenes de background, avatares predefinidos, logos...) y en los estilos CSS, ya que hemos observado que la IA resolvió esta parte del proyecto de forma bastante rápida y eficiente (aunque existieron ocasiones en las que tuvimos que iterar varias veces para obtener código CSS adecuado, aunque estos casos fueron mínimos). En términos de backend, también ha sido de gran ayuda para la generación de algunos tests, aunque la mayoría han tenido que ser modificados, pero nos han ayudado a entender mejor su funcionalidad. 
Sin embargo, como aspectos negativos encontrados en el uso de esta herramienta, cabe destacar que hay que mantener un gran nivel de excepción con respecto al código proporcionado. Es decir, es muy mala idea "copiar y pegar" el código que nos proporciona tras el prompt, ya que si corresponde a código de funciones importantes (ej.useEffects, handleSubmit, llamadas a API, enrutamientos, métodos HTTP, repositorios, servicios...) es muy probable que genere más errores y que la complejidad del entendimiento del código aumente y el trabajo del equipo se eleve al tener que reparar todos los nuevos errores surgidos tras confiar ciegamente en esta herramienta. Por ello, hemos aprendido a elaborar _prompts_ más específicos, que transmitan a la IA el contexto exacto de nuestra aplicación con todos los detalles sobre la situación que queremos abordar, además, de guardar paciencia e iterar varias veces la respuesta si no estamos conformes y revisar los fragmentos de código proporcionados que puedan ser críticos por todos (o la mayor parte) los miembros del equipo. 
En resumen, consideramos la IA una herramienta eficaz si es usada en los siguientes casos:
- Como asistente de depuración interactivo, explicador de conceptos y errores. Por ejemplo, fue útil para diagnosticar errores complejos que involucraban interacciones entre frontend y backend, además de trabajar muy bien con la herramienta de desarrolladores e indicarnos los fragmentos de código en frontend donde se debían poner "console.log" para depurar y observar que ocurría.
- Para permitir ahorrar tiempo bastante significativo en tareas arduas de diseño e identificación de errores.
- Para facilitar la comprensión de conceptos clave de la aplicación
- Generación de _snippets_ epecíficos (ej. CSS para _scroll_, _layout_, _validadores de formulario_...), pero siempre requiriendo adaptación y verificación humana.
- Aclarar discusiones sobre Diseño y Arquitectura (ej. relaciones del modelo de datos, ubicación de la lógica de negocio, consistencia...)

A pesar de estos puntos fuertes, también hemos aprendido las limitaciones y riesgos observados tras su uso. En nuestras conversaciones hemos observado que la IA a veces puede dar "parches" rápidos en lugar de dar solución arquitectónica correcta. Es crucial mantener un espírito crítico y preguntar "por qué" ante todo lo que nos devuelve un _prompt_. Llegamos a la conclusión de que la IA no puede ejecutar el código (eso es tarea nuestra), por lo que su diagnóstico depende totalmente de la precisión del contexto (código, logs, errores). La IA puede no detectar inconsistencias lógicas entre diferentes partes del sistema si no se le pregunta explícitamente (ej. Nos ocurrió esto cuando tratábamos de solucionar errores con dos formas (servicios) distintas de creación de usuario: mediante el registro con "AuthService" y con el CRUD del admin con "UserService"). Mientras más usábamos la herramienta más coincidíamos en que había que usarla como depurador interactivo o para simular "pair programming", para errores, exploración de soluciones y explicación de conceptos, siempre verificando las sugerencias y entendiéndolas antes de integrarlas.

Por último, cabe destacar que, su uso se alineó con la política de la asignatura: como **herramienta de apoyo** y no como reemplazo del razonamiento. Se ha mantenido siempre la responsabilidad sobre el código, verificando y adaptando las sugerencias. El enfoque fue resolver problemas concretos y entender las soluciones, no generar código "a ciegas". 

## Anexo A) Inventario de Herramientas de IA
|Herramienta|Versión/Modelo|Proveedor|Acceso (web/plugin/API)| Licencia/Plan | Observaciones|
|-----------|--------------|---------|-----------------------|---------------|--------------|
|ChatGPT (GPT-5)| 5 (2025) | OpenAI | web | pro/básico |N/A|
|Copilot | 1.105.1 (2025) | Microsoft | Visual Studio Code | PRO |N/A|
|Gemini | 2.5 Pro (2025) | Google | web | Pro | Generación de imagenes y ayuda en el código|

## Anexo B) Glosario de Finalidades

Idea/Exploración · Generación de Código funcional · Depuración / Diagnóstico · Generación de pruebas (unitarias/integración/e2e) · Diseño técnico · Documentación técnica (no narrativa) ·  Refactorización.