export const calculateAchievementProgress = (achievement) => {
  if (!achievement) return 0;
  return achievement.score || 0;
};

export const filterAchievementsByStatus = (achievements, status = 'all') => {
  if (!achievements || status === 'all') return achievements;
  
  return achievements.filter(ach => {
    const progress = calculateAchievementProgress(ach);
    if (status === 'completed') return progress >= 100;
    if (status === 'pending') return progress < 100;
    return true;
  });
};

export const sortAchievementsByProgress = (achievements, order = 'desc') => {
  if (!achievements) return [];
  
  return [...achievements].sort((a, b) => {
    const progressA = calculateAchievementProgress(a);
    const progressB = calculateAchievementProgress(b);
    
    return order === 'desc' ? progressB - progressA : progressA - progressB;
  });
};
