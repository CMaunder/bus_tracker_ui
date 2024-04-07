export const lastXMinutes = (minutes: number): string => {
  const d = new Date(Date.now() - minutes * 1000 * 60);
  return d.toISOString().slice(0, -5);
};
