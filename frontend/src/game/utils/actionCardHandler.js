import { toast } from 'react-toastify';

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

      const targetActivePlayer = findActivePlayer(targetUsername);
      if (targetActivePlayer && patchActivePlayer) {
        await patchActivePlayer(targetActivePlayer.id, {
          pickaxeState: false
        });
      }

      await addLog(`⛏️ ${loggedInUser.username} broke ${targetUsername}'s pickaxe!`);
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

      await addLog(`🔦 ${loggedInUser.username} broke ${targetUsername}'s candle!`);
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

      await addLog(`🪨 ${loggedInUser.username} broke ${targetUsername}'s wagon!`);
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

      await addLog(`⛏️ ${loggedInUser.username} repaired ${targetUsername}'s pickaxe!`);
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

      await addLog(`🔦 ${loggedInUser.username} repaired ${targetUsername}'s candle!`);
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

      await addLog(`🪨 ${loggedInUser.username} repaired ${targetUsername}'s wagon!`);
      break;

    case 'REPAIR_PICKAXE_LAMP':
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

        await addLog(`⛏️ ${loggedInUser.username} repaired ${targetUsername}'s pickaxe!`);
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

        await addLog(`🔦 ${loggedInUser.username} repaired ${targetUsername}'s candle!`);
      } else {
        toast.warning("Please select a tool to repair!");
        return false; 
      }
      break;

    case 'REPAIR_PICKAXE_CART':
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

        await addLog(`⛏️ ${loggedInUser.username} repaired ${targetUsername}'s pickaxe!`);
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

        await addLog(`🪨 ${loggedInUser.username} repaired ${targetUsername}'s wagon!`);
      } else {
        toast.warning("Please select a tool to repair!");
        return false; 
      }
      break;

    case 'REPAIR_CART_LAMP':
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

        await addLog(`🪨 ${loggedInUser.username} repaired ${targetUsername}'s wagon!`);
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

        await addLog(`🔦 ${loggedInUser.username} repaired ${targetUsername}'s candle!`);
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
