# Lobby Component - Modularización

## 📋 Resumen

El componente `lobby.js` (197 líneas) ha sido refactorizado en múltiples componentes más pequeños y manejables.

## 🎯 Estructura de Archivos

```
lobbies/
├── lobby-refactored.js           # Componente principal refactorizado
├── lobby.js                       # Componente original (197 líneas)
├── components/                    # Componentes UI modulares
│   ├── Logo.js                   # Logo superior izquierdo
│   ├── TopRightButtons.js        # Botones superiores (Friends, Profile)
│   ├── FriendsDropdown.js        # Dropdown de amigos
│   ├── InfoButton.js             # Botón de información
│   ├── PlayerActions.js          # Acciones de jugador (Create/Join)
│   ├── AdminActions.js           # Acciones de administrador
│   └── RankingButton.js          # Botón de ranking
├── hooks/
│   └── useLobbyUser.js           # Custom hook para usuario y auth
└── utils/
    └── lobbyHelpers.js           # Funciones de utilidad
```

## 🧩 Componentes Creados

### 1. **Logo.js**
- **Propósito**: Mostrar logo del juego en esquina superior izquierda
- **Props**: Ninguna
- **Tamaño**: ~22 líneas
- **Features**: Posicionamiento absoluto, estilos inline

### 2. **FriendsDropdown.js**
- **Propósito**: Mostrar lista de amigos con sus estados
- **Props**: 
  - `friends` - Array de objetos amigos
  - `onRequestClick` - Callback para solicitudes de amistad
  - `onFindPlayerClick` - Callback para buscar jugador
- **Tamaño**: ~36 líneas
- **Features**: Lista de amigos con indicadores de estado (colores)

### 3. **TopRightButtons.js**
- **Propósito**: Botones superiores derechos (Friends y Profile)
- **Props**:
  - `isAdmin` - Boolean para ocultar Friends si es admin
  - `showFriends` - Boolean para mostrar/ocultar dropdown
  - `onToggleFriends` - Callback para toggle dropdown
  - `friends` - Array de amigos (pasa a FriendsDropdown)
- **Tamaño**: ~35 líneas
- **Features**: Integra FriendsDropdown, navegación a Profile

### 4. **InfoButton.js**
- **Propósito**: Botón de información que navega a /info
- **Props**: Ninguna
- **Tamaño**: ~14 líneas
- **Features**: Link a página de información del juego

### 5. **PlayerActions.js**
- **Propósito**: Acciones principales del jugador (crear/unirse)
- **Props**:
  - `onCreateGame` - Callback para crear juego
- **Tamaño**: ~17 líneas
- **Features**: Botón Create Game (con callback), botón Join Game (Link)

### 6. **AdminActions.js**
- **Propósito**: Acciones exclusivas de administrador
- **Props**: Ninguna
- **Tamaño**: ~20 líneas
- **Features**: Links a Users y Edit Achievement

### 7. **RankingButton.js**
- **Propósito**: Botón de ranking en esquina inferior izquierda
- **Props**: Ninguna
- **Tamaño**: ~14 líneas
- **Features**: Navegación a página de ranking

## 🔧 Utils y Hooks

### **lobbyHelpers.js**
Funciones puras de utilidad:

```javascript
isUserAdmin(jwt)                          // Verifica si usuario es admin
getMockFriends()                          // Obtiene amigos simulados
createGameRequest(player, link, ...)      // Crea objeto de solicitud de juego
```

**Funciones:**
1. **`isUserAdmin(jwt)`**: Decodifica JWT y verifica rol ADMIN
2. **`getMockFriends()`**: Retorna array de amigos simulados (temporal)
3. **`createGameRequest(player, link, isPrivate, maxPlayers)`**: Construye objeto de solicitud

### **useLobbyUser.js**
Custom hook que encapsula:
- Verificación de rol de administrador
- Fetch del jugador actual (si no es admin)
- Gestión de lista de amigos (mock data)
- Manejo de errores y notificaciones

**Returns**:
```javascript
{
  isAdmin,      // Boolean - si es administrador
  player,       // Object - datos del jugador
  friends,      // Array - lista de amigos
  setFriends,   // Function - setter para amigos
  jwt           // String - token de autenticación
}
```

## 🔄 Flujo de Datos

```
lobby-refactored.js (Main Component)
├── useLobbyUser hook
│   ├── isUserAdmin() → determina si es admin
│   ├── Fetch player data (si no es admin)
│   └── getMockFriends() → inicializa amigos
├── handleCreateGame()
│   ├── generateRandomLink() → genera link único
│   ├── createGameRequest() → construye solicitud
│   └── POST /api/v1/games → crea juego
└── Child Components
    ├── Logo (static)
    ├── TopRightButtons (interactive)
    │   └── FriendsDropdown (conditional)
    ├── InfoButton (static)
    ├── PlayerActions (conditional - !isAdmin)
    ├── AdminActions (conditional - isAdmin)
    └── RankingButton (static)
```

## 📊 Comparación

| Métrica | Original | Refactorizado |
|---------|----------|---------------|
| Líneas totales | 197 | ~90 (main) + ~150 (components) |
| Archivos | 1 | 11 |
| Componentes | 1 monolítico | 8 modulares |
| Lógica de autenticación | Mezclada en useEffect | Separada en custom hook |
| Helpers | Inline | Funciones puras en utils |
| Reusabilidad | Baja | Alta |
| Testabilidad | Difícil | Fácil |

## ✅ Beneficios de la Refactorización

1. **Separación de Responsabilidades**: UI separada de lógica de negocio
2. **Composición**: Componentes pequeños y reutilizables
3. **Custom Hook**: Lógica de usuario encapsulada y testeable
4. **Helpers Puros**: Funciones sin efectos secundarios, fáciles de testear
5. **Condicionales Limpios**: Renderizado condicional más claro (isAdmin)
6. **Mantenibilidad**: Cambios localizados por responsabilidad

## 🚀 Uso

### Opción 1: Reemplazar archivo original
```javascript
// Renombrar o respaldar lobby.js
// Renombrar lobby-refactored.js a lobby.js
```

### Opción 2: Cambiar imports en rutas
```javascript
// En tu archivo de rutas
import Lobby from './lobbies/lobby-refactored';
```

## 🔍 Diferencias Clave con Original

### Original
```javascript
// Todo en un solo componente
- 197 líneas de código
- useEffect con múltiples responsabilidades
- Lógica de autenticación inline
- JSX profundamente anidado
- Helpers inline (isAdmin check)
```

### Refactorizado
```javascript
// Componentes modulares
- 90 líneas en componente principal
- Custom hook useLobbyUser
- Helpers en utils/lobbyHelpers.js
- Componentes pequeños y enfocados
- JSX plano y legible
```

## 🐛 Mejoras Implementadas

1. **Extracción de lógica de autenticación**: `isUserAdmin()` en helpers
2. **Custom hook**: `useLobbyUser` para gestión de usuario
3. **Helper para crear juego**: `createGameRequest()` reutilizable
4. **Componentes presentacionales**: Separación UI/lógica
5. **Mejor gestión de errores**: Centralizada en custom hook

## 🔜 Mejoras Futuras

1. **Implementar Friends Backend**: Reemplazar `getMockFriends()` con API real
2. **Friend Actions**: Implementar callbacks reales para solicitudes y búsqueda
3. **WebSocket para Friends**: Actualizaciones en tiempo real de estado de amigos
4. **Loading States**: Indicadores mientras se carga player data
5. **Error Boundaries**: Componente para capturar errores de UI
6. **Animations**: Transiciones suaves para dropdown de amigos

## 📝 Testing Recomendado

Después de integrar:
1. ✅ Login como jugador regular → Ver botones Create/Join
2. ✅ Login como admin → Ver botones Users/Edit Achievement
3. ✅ Abrir dropdown de Friends → Ver lista de amigos
4. ✅ Crear juego → Verificar navegación a CreateGame
5. ✅ Navegar a Profile, Info, Ranking → Verificar links
6. ✅ Verificar responsividad en diferentes resoluciones

## 🎨 Componentes por Tipo

### Componentes Estáticos (Sin Props Requeridos)
- Logo
- InfoButton
- AdminActions
- RankingButton

### Componentes Interactivos (Con Callbacks)
- TopRightButtons
- FriendsDropdown
- PlayerActions

### Componentes Condicionales
- PlayerActions (solo si !isAdmin)
- AdminActions (solo si isAdmin)
- FriendsDropdown (solo si showFriends)
