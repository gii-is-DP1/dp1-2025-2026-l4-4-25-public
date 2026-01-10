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

## 1. Introducción

Este documento describe el uso que se ha echo de la IA en el proyecto. El objetivo es ser transparentes sobre el uso de IA realizado. Como recordatorio, al alumnado incluimos un resumen de lo indicado en el Syllabus de la asignatura:

### 📃Declaración de Política y Compromiso

> **Principios guía generales (resumen):**  
> - **Dimensión Cognitiva:** El trabajo con IA **no** debe reducir su capacidad de pensar con claridad; úsela para **facilitar**—no obstaculizar—el aprendizaje.  
> - **Dimensión Ética :** La utilización de IA debe ser **transparente** y **alineada** con la integridad académica.

**Normas específicas de la asignatura:**
- ✅ **IA para código:** Se permite usar tecnología generativa para **completar o generar ejemplos de código** en las tareas, pero **debe citarse explícitamente** la procedencia del mismo. Así mismo el alumno debe **entender** y poder **modificar bajo demanda** cualquier código entregado, siendo el responsable de cualquier comportamiento del código que ha conmitado, ante el profesor y sus compañeros. Recuerde: **Usted es responsable** de dicho código.
- ❌ **IA para narrativa:** Salvo indicación en contrario, **no** se permite usar IA generativa para **redactar narrativa** de las entregas. Se puede usar como **recurso** durante el proceso, **no** para **responder por usted** a los ejercicios.

**Marco ético US:** Consulte y cumpla lo indicado en **Guías de Ética e IA** de la US: https://guiasbus.us.es/ia/etica

**Rellenar este documento es Obligatorio:** La **documentación del uso de IA** es un **entregable** del proyecto.

## 📑 Resumen por Sprint (1–4)
### 💻Sprint 1 — Resumen de uso de IA

Usos registrados: <!-- nº -->

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

Usos registrados: <!-- nº -->

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

## Registro detallado de uso de AI por Sprint

**Use una fila por “uso realmente significativo”** (idea sugerida por la IA, trozo de código importante modificado, depuración de error que no eras capaz de resolver por tu cuenta, generación de pruebas para el código de producción, etc.). No incluya filas para detalles nímios como el autocompletado de variables o signaturas de métodos, o la generación de código simple (recorridos y procesamiento de estructuras de datos, formateo  y/o creación de estilos CSS, etc.).

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

### Sprint 3

| # | Fecha y hora | Sprint | Integrante(s) | **Herramienta & versión** | **Acceso** | **Enlace a conversación / Prompt** | **Finalidad** | **Artefactos afectados** | **Verificación humana** | **Riesgos & mitigaciones** | **Resultado** |
|---:|--------------|:-----:|---------------|----------------------------|------------|------------------------------------|---------------|---------------------------|--------------------------|-----------------------------|---------------|
| 3.1 | <!-- 04/09/2025 18:40 --> | 3 | <!-- Nombre --> | <!-- p.ej., ChatGPT (GPT-5, OpenAI, 2025) --> | <!-- web/plugin/integración --> | <!-- URL al chat o prompt resumido --> | <!-- idea / código / depuración / pruebas / documentación técnica* --> | <!-- ficheros, issue, PR, commit --> | <!-- pruebas, revisión por pares, reasoning propio --> | <!-- plagio, licencias, datos personales; mitigación --> | <!-- aceptado / rechazado / aceptado con cambios parciales --> |

### Sprint 4

| # | Fecha y hora | Sprint | Integrante(s) | **Herramienta & versión** | **Acceso** | **Enlace a conversación / Prompt** | **Finalidad** | **Artefactos afectados** | **Verificación humana** | **Riesgos & mitigaciones** | **Resultado** |
|---:|--------------|:-----:|---------------|----------------------------|------------|------------------------------------|---------------|---------------------------|--------------------------|-----------------------------|---------------|
| 4.1 | <!-- 04/09/2025 18:40 --> | 4 | <!-- Nombre --> | <!-- p.ej., ChatGPT (GPT-5, OpenAI, 2025) --> | <!-- web/plugin/integración --> | <!-- URL al chat o prompt resumido --> | <!-- idea / código / depuración / pruebas / documentación técnica* --> | <!-- ficheros, issue, PR, commit --> | <!-- pruebas, revisión por pares, reasoning propio --> | <!-- plagio, licencias, datos personales; mitigación --> | <!-- aceptado / rechazado / aceptado con cambios parciales --> |

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
|Copilot | 1.105.1 (2025) | Microsoft | Visual Studio Code | básico |N/A|
|Gemini | 2.5 Pro (2025) | Google | web | Pro |Generación de imagenes|

## Anexo B) Glosario de Finalidades

Idea/Exploración · Generación de Código funcional · Depuración / Diagnóstico · Generación de pruebas (unitarias/integración/e2e) · Diseño técnico · Documentación técnica (no narrativa) ·  Refactorización.