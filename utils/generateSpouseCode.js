export const generateSpouseCode = () => {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString(); // 10-digit code
};
