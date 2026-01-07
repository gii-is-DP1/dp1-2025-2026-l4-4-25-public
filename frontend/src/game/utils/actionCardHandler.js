import { toast } from 'react-toastify';

/**
 * Maneja el uso de cartas de acción sobre un jugador objetivo
 * @param {Object} card - La carta de acción a usar
 * @param {Object} targetPlayer - El jugador objetivo
 * @param {number} cardIndex - Índice de la carta en la mano
 * @param {Object} context - Contexto del juego con funciones y estados
 * @param {boolean} context.isSpectator - Si el usuario es espectador
 * @param {Object} context.loggedInUser - Usuario logueado
 * @param {string} context.currentPlayer - Nombre del jugador actual
 * @param {Object} context.playerTools - Estado de herramientas de todos los jugadores
 * @param {Function} context.setPlayerTools - Función para actualizar herramientas
 * @param {Function} context.addLog - Función para agregar mensajes al log
 * @param {Function} context.addPrivateLog - Función para agregar mensajes privados
 * @param {Function} context.nextTurn - Función para pasar al siguiente turno
 * @param {Function} context.setDeckCount - Función para actualizar contador del mazo
 * @param {string} context.selectedTool - Herramienta seleccionada para cartas de reparación doble
 */
export const handleActionCard = async (card, targetPlayer, cardIndex, context) => {
  const {
    isSpectator,
    loggedInUser,
    currentPlayer,
    playerTools,
    setPlayerTools,
    addLog,
    addPrivateLog,
    nextTurn,
    setDeckCount,
    activePlayers,
    patchActivePlayer,
    selectedTool,
  } = context;

  if (isSpectator) {
    addPrivateLog("ℹ️ Spectators cannot use action cards", "warning");
    return false; 
  }

  if (loggedInUser.username !== currentPlayer) {
    toast.warning("It's not your turn!");
    return false; 
  }
  
  const effectValue = card.effectValue;
  const targetUsername = targetPlayer.username;
  const currentTools = playerTools[targetUsername] || {};
  
  console.log('Effect value:', effectValue);

  const findActivePlayer = (username) => {
    if (!activePlayers || !Array.isArray(activePlayers)) {
      console.warn('activePlayers is not available or not an array');
      return null;
    }
    return activePlayers.find(p => p.username === username);
  };

  // Procesar efecto según effect_value
  switch (effectValue) {
    case 'DESTROY_PICKAXE':
      if (!currentTools.pickaxe) {
        toast.warning("Cannot break a pickaxe that is already broken!");
        return false; 
      }
      setPlayerTools(prev => ({
        ...prev,
        [targetUsername]: { ...prev[targetUsername], pickaxe: false }
      }));

      // Buscar el ActivePlayer y hacer patch
      const targetActivePlayer = findActivePlayer(targetUsername);
      if (targetActivePlayer && patchActivePlayer) {
        await patchActivePlayer(targetActivePlayer.id, {
          pickaxeState: false
        });
      }

      addLog(`⛏️ ${targetUsername}'s pickaxe has been broken!`);
      break;

    case 'DESTROY_LAMP':
      if (!currentTools.candle) {
        toast.warning("Cannot break a candle that is already broken!");
        return false; 
      }
      setPlayerTools(prev => ({
        ...prev,
        [targetUsername]: { ...prev[targetUsername], candle: false }
      }));

      const targetActivePlayerLamp = findActivePlayer(targetUsername);
      if (targetActivePlayerLamp && patchActivePlayer) {
        await patchActivePlayer(targetActivePlayerLamp.id, {
          candleState: false
        });
      }

      addLog(`🔦 ${targetUsername}'s candle has been broken!`);
      break;

    case 'DESTROY_CART':
      if (!currentTools.wagon) {
        toast.warning("Cannot break a wagon that is already broken!");
        return false; 
      }
      setPlayerTools(prev => ({
        ...prev,
        [targetUsername]: { ...prev[targetUsername], wagon: false }
      }));

      const targetActivePlayerWagon = findActivePlayer(targetUsername);
      if (targetActivePlayerWagon && patchActivePlayer) {
        await patchActivePlayer(targetActivePlayerWagon.id, {
          cartState: false
        });
      }

      addLog(`🪨 ${targetUsername}'s wagon has been broken!`);
      break;

    case 'REPAIR_PICKAXE':
      if (currentTools.pickaxe) {
        toast.warning("Cannot repair a pickaxe that is already working!");
        return false; 
      }
      setPlayerTools(prev => ({
        ...prev,
        [targetUsername]: { ...prev[targetUsername], pickaxe: true }
      }));

      const targetActivePlayerRepairPickaxe = findActivePlayer(targetUsername);
      if (targetActivePlayerRepairPickaxe && patchActivePlayer) {
        await patchActivePlayer(targetActivePlayerRepairPickaxe.id, {
          pickaxeState: true
        });
      }

      addLog(`⛏️ ${targetUsername}'s pickaxe has been repaired!`);
      break;

    case 'REPAIR_LAMP':
      if (currentTools.candle) {
        toast.warning("Cannot repair a candle that is already working!");
        return false; 
      }
      setPlayerTools(prev => ({
        ...prev,
        [targetUsername]: { ...prev[targetUsername], candle: true }
      }));

      const targetActivePlayerRepairLamp = findActivePlayer(targetUsername);
      if (targetActivePlayerRepairLamp && patchActivePlayer) {
        await patchActivePlayer(targetActivePlayerRepairLamp.id, {
          candleState: true
        });
      }

      addLog(`🔦 ${targetUsername}'s candle has been repaired!`);
      break;

    case 'REPAIR_CART':
      if (currentTools.wagon) {
        toast.warning("Cannot repair a wagon that is already working!");
        return false; 
      }
      setPlayerTools(prev => ({
        ...prev,
        [targetUsername]: { ...prev[targetUsername], wagon: true }
      }));

      const targetActivePlayerRepairCart = findActivePlayer(targetUsername);
      if (targetActivePlayerRepairCart && patchActivePlayer) {
        await patchActivePlayer(targetActivePlayerRepairCart.id, {
          cartState: true
        });
      }

      addLog(`🪨 ${targetUsername}'s wagon has been repaired!`);
      break;

    case 'REPAIR_PICKAXE_LAMP':
      // Ahora solo repara una herramienta según la selección del jugador
      if (selectedTool === 'pickaxe') {
        if (currentTools.pickaxe) {
          toast.warning("Cannot repair a pickaxe that is already working!");
          return false; 
        }
        setPlayerTools(prev => ({
          ...prev,
          [targetUsername]: { ...prev[targetUsername], pickaxe: true }
        }));

        const targetActivePlayerRepairPickaxe2 = findActivePlayer(targetUsername);
        if (targetActivePlayerRepairPickaxe2 && patchActivePlayer) {
          await patchActivePlayer(targetActivePlayerRepairPickaxe2.id, {
            pickaxeState: true
          });
        }

        addLog(`⛏️ ${targetUsername}'s pickaxe has been repaired!`);
      } else if (selectedTool === 'candle') {
        if (currentTools.candle) {
          toast.warning("Cannot repair a candle that is already working!");
          return false; 
        }
        setPlayerTools(prev => ({
          ...prev,
          [targetUsername]: { ...prev[targetUsername], candle: true }
        }));

        const targetActivePlayerRepairLamp2 = findActivePlayer(targetUsername);
        if (targetActivePlayerRepairLamp2 && patchActivePlayer) {
          await patchActivePlayer(targetActivePlayerRepairLamp2.id, {
            candleState: true
          });
        }

        addLog(`🔦 ${targetUsername}'s candle has been repaired!`);
      } else {
        toast.warning("Please select a tool to repair!");
        return false; 
      }
      break;

    case 'REPAIR_PICKAXE_CART':
      // Ahora solo repara una herramienta según la selección del jugador
      if (selectedTool === 'pickaxe') {
        if (currentTools.pickaxe) {
          toast.warning("Cannot repair a pickaxe that is already working!");
          return false; 
        }
        setPlayerTools(prev => ({
          ...prev,
          [targetUsername]: { ...prev[targetUsername], pickaxe: true }
        }));

        const targetActivePlayerRepairPickaxe3 = findActivePlayer(targetUsername);
        if (targetActivePlayerRepairPickaxe3 && patchActivePlayer) {
          await patchActivePlayer(targetActivePlayerRepairPickaxe3.id, {
            pickaxeState: true
          });
        }

        addLog(`⛏️ ${targetUsername}'s pickaxe has been repaired!`);
      } else if (selectedTool === 'wagon') {
        if (currentTools.wagon) {
          toast.warning("Cannot repair a wagon that is already working!");
          return false; 
        }
        setPlayerTools(prev => ({
          ...prev,
          [targetUsername]: { ...prev[targetUsername], wagon: true }
        }));

        const targetActivePlayerRepairCart2 = findActivePlayer(targetUsername);
        if (targetActivePlayerRepairCart2 && patchActivePlayer) {
          await patchActivePlayer(targetActivePlayerRepairCart2.id, {
            cartState: true
          });
        }

        addLog(`🪨 ${targetUsername}'s wagon has been repaired!`);
      } else {
        toast.warning("Please select a tool to repair!");
        return false; 
      }
      break;

    case 'REPAIR_CART_LAMP':
      // Ahora solo repara una herramienta según la selección del jugador
      if (selectedTool === 'wagon') {
        if (currentTools.wagon) {
          toast.warning("Cannot repair a wagon that is already working!");
          return false; 
        }
        setPlayerTools(prev => ({
          ...prev,
          [targetUsername]: { ...prev[targetUsername], wagon: true }
        }));

        const targetActivePlayerRepairCart3 = findActivePlayer(targetUsername);
        if (targetActivePlayerRepairCart3 && patchActivePlayer) {
          await patchActivePlayer(targetActivePlayerRepairCart3.id, {
            cartState: true
          });
        }

        addLog(`🪨 ${targetUsername}'s wagon has been repaired!`);
      } else if (selectedTool === 'candle') {
        if (currentTools.candle) {
          toast.warning("Cannot repair a candle that is already working!");
          return false; 
        }
        setPlayerTools(prev => ({
          ...prev,
          [targetUsername]: { ...prev[targetUsername], candle: true }
        }));

        const targetActivePlayerRepairLamp3 = findActivePlayer(targetUsername);
        if (targetActivePlayerRepairLamp3 && patchActivePlayer) {
          await patchActivePlayer(targetActivePlayerRepairLamp3.id, {
            candleState: true
          });
        }

        addLog(`🔦 ${targetUsername}'s candle has been repaired!`);
      } else {
        toast.warning("Please select a tool to repair!");
        return false; 
      }
      break;

    default:
      console.warn('Unknown effect_value:', effectValue);
      toast.warning('Unknown card effect');
      return false; 
  }

  if (window.removeCardAndDraw) {
    window.removeCardAndDraw(cardIndex);
  }

  setDeckCount(prev => Math.max(0, prev - 1));
  nextTurn();
  return true; 
};
