// src/utils/cardUtils.js

const localCardImages = import.meta.glob('../assets/newcards/*.{png,jpg,jpeg}', { eager: true, query: '?url', import: 'default' });

const localFallbackMap = {};
Object.entries(localCardImages).forEach(([path, url]) => {
  const parts = path.split('/');
  // Lowercase and strip everything non-alphanumeric for a forgiving search
  const filename = parts[parts.length - 1].toLowerCase().replace(/[^a-z0-9]/g, '');
  localFallbackMap[filename] = url;
});

export const getCardIcon = (card, mode = 'normal') => {
  if (!card) return null;

  const cardName = card.name?.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  if (cardName) {
    const matchingKey = Object.keys(localFallbackMap).find(filename => {
      const isCardMatch = filename.includes(cardName);
      
      let isModeMatch = true;
      if (mode === 'evolution' || card.evolutionLevel === 1) {
        isModeMatch = filename.includes('evo');
      } else if (mode === 'hero' || card.evolutionLevel === 2) {
        isModeMatch = filename.includes('hero') || filename.includes('champion');
      } else {
        isModeMatch = !filename.includes('evo') && !filename.includes('hero') && !filename.includes('champion');
      }
      
      return isCardMatch && isModeMatch;
    });

    if (matchingKey) {
      return localFallbackMap[matchingKey];
    }
  }
  
  if (mode === 'evolution' && card.iconUrls?.evolutionMedium) return card.iconUrls.evolutionMedium;
  if (mode === 'hero' && card.iconUrls?.heroMedium) return card.iconUrls.heroMedium;
  if (card.evolutionLevel === 1 && card.iconUrls?.evolutionMedium) return card.iconUrls.evolutionMedium;
  if (card.evolutionLevel === 2 && card.iconUrls?.heroMedium) return card.iconUrls.heroMedium;
  
  return card.iconUrls?.medium || card.iconUrls?.evolutionMedium || card.iconUrls?.heroMedium;
};
