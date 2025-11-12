/**
 * Calcula el progreso de un logro
 * @param {Object} achievement - Objeto del logro
 * @returns {number} - Porcentaje de progreso (0-100)
 */
export const calculateAchievementProgress = (achievement) => {
  if (!achievement) return 0;
  
  // Implementar lógica según estructura de achievement
  // Por ahora retorna 0, pero puede calcularse basado en achievement.score, etc.
  return achievement.score || 0;
};

/**
 * Filtra logros por estado (completados, pendientes, etc.)
 * @param {Array} achievements - Array de logros
 * @param {string} status - Estado a filtrar ('completed', 'pending', 'all')
 * @returns {Array} - Logros filtrados
 */
export const filterAchievementsByStatus = (achievements, status = 'all') => {
  if (!achievements || status === 'all') return achievements;
  
  return achievements.filter(ach => {
    const progress = calculateAchievementProgress(ach);
    if (status === 'completed') return progress >= 100;
    if (status === 'pending') return progress < 100;
    return true;
  });
};

/**
 * Ordena logros por progreso
 * @param {Array} achievements - Array de logros
 * @param {string} order - 'asc' o 'desc'
 * @returns {Array} - Logros ordenados
 */
export const sortAchievementsByProgress = (achievements, order = 'desc') => {
  if (!achievements) return [];
  
  return [...achievements].sort((a, b) => {
    const progressA = calculateAchievementProgress(a);
    const progressB = calculateAchievementProgress(b);
    
    return order === 'desc' ? progressB - progressA : progressA - progressB;
  });
};
