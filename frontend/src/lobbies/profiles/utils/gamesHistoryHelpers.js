export const formatGameTime = (timeString) => {
  if (!timeString) return "NOT AVAILABLE";
  
  const match = timeString.match(/PT(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return timeString;
  
  const mins = match[1] ? parseInt(match[1]) : 0;
  const secs = match[2] ? parseInt(match[2]) : 0;
  
  return `${mins} min ${secs} s`;
};

export const sortGamesByDate = (games) => {
  if (!games) return [];
  
  return [...games].sort((a, b) => {
    if (a.endDate && b.endDate) {
      return new Date(b.endDate) - new Date(a.endDate);
    }
    return b.id - a.id;
  });
};
