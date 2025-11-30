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
  } = context;

  if (isSpectator) {
    addPrivateLog("ℹ️ Spectators cannot use action cards", "warning");
    return;
  }

  if (loggedInUser.username !== currentPlayer) {
    toast.warning("It's not your turn!");
    return;
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
        return;
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
        return;
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
        return;
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
        return;
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
        return;
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
        return;
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
      if (currentTools.pickaxe && currentTools.candle) {
        toast.warning("Cannot repair tools that are already working!");
        return;
      }
      if (currentTools.pickaxe || currentTools.candle) {
        toast.warning("Both pickaxe and candle must be broken to use this card!");
        return;
      }
      setPlayerTools(prev => ({
        ...prev,
        [targetUsername]: { ...prev[targetUsername], pickaxe: true, candle: true }
      }));

      const targetActivePlayerRepairPickaxeLamp = findActivePlayer(targetUsername);
      if (targetActivePlayerRepairPickaxeLamp && patchActivePlayer) {
        await patchActivePlayer(targetActivePlayerRepairPickaxeLamp.id, {
          pickaxeState: true,
          candleState: true
        });
      }

      addLog(`⛏️🔦 ${targetUsername}'s pickaxe and candle have been repaired!`);
      break;

    case 'REPAIR_PICKAXE_CART':
      if (currentTools.pickaxe && currentTools.wagon) {
        toast.warning("Cannot repair tools that are already working!");
        return;
      }
      if (currentTools.pickaxe || currentTools.wagon) {
        toast.warning("Both pickaxe and wagon must be broken to use this card!");
        return;
      }
      setPlayerTools(prev => ({
        ...prev,
        [targetUsername]: { ...prev[targetUsername], pickaxe: true, wagon: true }
      }));

      const targetActivePlayerRepairPickaxeCart = findActivePlayer(targetUsername);
      if (targetActivePlayerRepairPickaxeCart && patchActivePlayer) {
        await patchActivePlayer(targetActivePlayerRepairPickaxeCart.id, {
          pickaxeState: true,
          cartState: true
        });
      }

      addLog(`⛏️🪨 ${targetUsername}'s pickaxe and wagon have been repaired!`);
      break;

    case 'REPAIR_CART_LAMP':
      if (currentTools.wagon && currentTools.candle) {
        toast.warning("Cannot repair tools that are already working!");
        return;
      }
      if (currentTools.wagon || currentTools.candle) {
        toast.warning("Both wagon and candle must be broken to use this card!");
        return;
      }
      setPlayerTools(prev => ({
        ...prev,
        [targetUsername]: { ...prev[targetUsername], wagon: true, candle: true }
      }));

      const targetActivePlayerRepairCartLamp = findActivePlayer(targetUsername);
      if (targetActivePlayerRepairCartLamp && patchActivePlayer) {
        await patchActivePlayer(targetActivePlayerRepairCartLamp.id, {
          cartState: true,
          candleState: true
        });
      }

      addLog(`🪨🔦 ${targetUsername}'s wagon and candle have been repaired!`);
      break;

    default:
      console.warn('Unknown effect_value:', effectValue);
      toast.warning('Unknown card effect');
      return;
  }

  if (window.removeCardAndDraw) {
    window.removeCardAndDraw(cardIndex);
  }

  setDeckCount(prev => Math.max(0, prev - 1));
  nextTurn();
};
