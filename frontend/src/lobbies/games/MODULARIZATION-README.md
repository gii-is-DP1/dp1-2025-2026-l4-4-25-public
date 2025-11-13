# CreateGame Component - Modularización

## 📋 Resumen

El componente `CreateGame.js` (605 líneas) ha sido refactorizado en múltiples componentes más pequeños y manejables, siguiendo el mismo patrón usado para Board.js.

## 🎯 Estructura de Archivos

```
lobbies/games/
├── CreateGame-refactored.js      # Componente principal refactorizado
├── CreateGame.js                  # Componente original (605 líneas)
├── components/                    # Componentes UI modulares
│   ├── LobbyInfo.js              # Información del lobby
│   ├── JoinRequestsPanel.js      # Panel de solicitudes de unión
│   ├── GameSettings.js           # Configuración del juego
│   ├── PlayersListLobby.js       # Lista de jugadores en lobby
│   ├── InviteFriends.js          # Sección invitar amigos
│   └── LobbyControls.js          # Controles (Start, Save, Cancel, Exit)
├── hooks/
│   └── useLobbyData.js           # Custom hook para lógica de datos
└── utils/
    └── lobbyUtils.js             # Funciones de utilidad
```

## 🧩 Componentes Creados

### 1. **LobbyInfo.js**
- **Propósito**: Mostrar título y información general del lobby
- **Props**: `gameId`
- **Tamaño**: ~10 líneas

### 2. **JoinRequestsPanel.js**
- **Propósito**: Panel para aceptar/rechazar solicitudes de unión (solo creador)
- **Props**: 
  - `joinRequests` - Array de solicitudes pendientes
  - `onAccept` - Callback para aceptar
  - `onDeny` - Callback para rechazar
- **Tamaño**: ~25 líneas
- **Lógica**: Se oculta si no hay solicitudes o si no es creador

### 3. **GameSettings.js**
- **Propósito**: Controles para configurar número de jugadores y privacidad
- **Props**:
  - `numPlayers` - Número actual de jugadores
  - `onNumPlayersChange` - Callback para cambiar número
  - `isPrivate` - Estado de privacidad
  - `onPrivacyChange` - Callback para cambiar privacidad
  - `isCreator` - Boolean para mostrar/ocultar
- **Tamaño**: ~55 líneas
- **Features**: Select 3-12 jugadores, toggle privado/público

### 4. **PlayersListLobby.js**
- **Propósito**: Lista visual de jugadores en el lobby con opción de expulsar
- **Props**:
  - `activePlayers` - Array de usernames
  - `maxPlayers` - Máximo permitido
  - `creatorUsername` - Username del creador
  - `isCreator` - Boolean para mostrar botón expulsar
  - `onExpelPlayer` - Callback para expulsar
- **Tamaño**: ~32 líneas
- **Features**: Muestra avatar, nombre, botón expulsar (solo creador, no puede expulsarse a sí mismo)

### 5. **InviteFriends.js**
- **Propósito**: Sección para invitar amigos
- **Props**: Ninguna (componente estático por ahora)
- **Tamaño**: ~17 líneas
- **Nota**: Preparado para futura implementación de invitaciones

### 6. **LobbyControls.js**
- **Propósito**: Controles principales del lobby (botones de acción)
- **Props**:
  - `isCreator` - Boolean para cambiar interfaz
  - `gameId` - ID del juego
  - `canStart` - Boolean para habilitar botón Start
  - `onSave` - Callback para guardar cambios
  - `onStart` - Callback para iniciar juego
  - `onCancel` - Callback para cancelar/eliminar juego
  - `onExitLobby` - Callback para salir del lobby (no creador)
- **Tamaño**: ~42 líneas
- **Features**: UI diferente para creador vs. invitado, spinner de espera

## 🔧 Utils y Hooks

### **lobbyUtils.js**
Funciones puras de utilidad:

```javascript
canStartGame(currentPlayers, minPlayers)       // Verifica si puede comenzar
extractJoinRequests(messages)                  // Filtra solicitudes del chat
getUniqueActivePlayers(activePlayers)          // Elimina duplicados
isPlayerInLobby(activePlayers, username)       // Verifica presencia
removePlayerFromLobby(activePlayers, username) // Elimina jugador
```

### **useLobbyData.js**
Custom hook que encapsula:
- Fetch periódico del estado del juego (cada 3s)
- Fetch de solicitudes de unión (cada 5s, solo creador)
- Funciones para:
  - `postFirstMessage()` - Mensaje de bienvenida
  - `updateGame()` - PATCH al juego
  - `deleteGame()` - DELETE del juego
  - `sendMessage()` - POST mensaje al chat
  - `deleteMessages()` - DELETE múltiples mensajes

**Returns**:
```javascript
{
  game, setGame,
  joinRequests, setJoinRequests,
  postFirstMessage, updateGame, deleteGame,
  sendMessage, deleteMessages
}
```

## 🔄 Flujo de Datos

```
CreateGame-refactored.js (Main Component)
├── useLobbyData hook
│   ├── Fetch game state (polling cada 3s)
│   ├── Fetch join requests (polling cada 5s)
│   └── API operations (PATCH, DELETE, POST)
├── useWebSocket hook
│   └── Real-time updates (/topic/game/{id})
└── Child Components
    ├── LobbyInfo (display)
    ├── JoinRequestsPanel (interactive)
    ├── GameSettings (interactive)
    ├── PlayersListLobby (interactive)
    ├── InviteFriends (static)
    └── LobbyControls (interactive)
```

## 📊 Comparación

| Métrica | Original | Refactorizado |
|---------|----------|---------------|
| Líneas totales | 605 | ~350 (main) + ~180 (components) |
| Archivos | 1 | 10 |
| Componentes | 1 monolítico | 7 modulares |
| Responsabilidades | Todas mezcladas | Separadas por dominio |
| Reusabilidad | Baja | Alta |
| Testabilidad | Difícil | Fácil (componentes aislados) |

## ✅ Beneficios de la Refactorización

1. **Separación de Responsabilidades**: Cada componente tiene un propósito único
2. **Facilidad de Mantenimiento**: Cambios localizados en componentes específicos
3. **Reusabilidad**: Componentes pueden usarse en otros contextos
4. **Testabilidad**: Componentes pequeños son más fáciles de testear
5. **Legibilidad**: Código más claro y autodocumentado
6. **Colaboración**: Múltiples desarrolladores pueden trabajar en paralelo

## 🚀 Uso

### Opción 1: Usar el archivo refactorizado
Reemplazar el contenido de `CreateGame.js` con `CreateGame-refactored.js`

### Opción 2: Mantener ambos versiones
Mantener el original y probar el refactorizado:

```javascript
// En routes o donde se importe
import CreateGame from './lobbies/games/CreateGame-refactored';
```

## 🐛 Notas sobre Lint Warnings

El archivo refactorizado tiene algunos warnings que son inofensivos:
- Variables no usadas (`player`, `patchgame`, `socketMessage`): Pueden limpiarse o son necesarias para futura funcionalidad
- Dependencias faltantes en useEffect: El código original también las tenía, se mantienen para no cambiar comportamiento

## 🔜 Mejoras Futuras

1. **InviteFriends**: Implementar lógica real de invitaciones
2. **WebSocket Integration**: Mejor integración con actualizaciones en tiempo real
3. **Error Handling**: Toast messages más específicos
4. **Loading States**: Indicadores de carga para operaciones async
5. **Optimistic UI**: Actualizar UI antes de respuesta del servidor

## 📝 Testing Recomendado

Después de integrar:
1. ✅ Crear lobby como creador
2. ✅ Unirse como invitado
3. ✅ Aceptar/rechazar solicitudes de unión
4. ✅ Cambiar configuración (jugadores, privacidad)
5. ✅ Expulsar jugadores
6. ✅ Salir del lobby
7. ✅ Iniciar juego
8. ✅ Cancelar juego
