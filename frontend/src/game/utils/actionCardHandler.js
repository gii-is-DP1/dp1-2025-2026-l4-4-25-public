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
export const handleActionCard = (card, targetPlayer, cardIndex, context) => {
  const {
    isSpectator,
    loggedInUser,
    currentPlayer,
    playerTools,
    setPlayerTools,
    addLog,
    addPrivateLog,
    nextTurn,
    setDeckCount
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
