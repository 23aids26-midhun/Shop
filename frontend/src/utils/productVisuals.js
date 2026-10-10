// Gives every product a colourful illustrated picture (gradient + emoji)
// so the shop never shows empty boxes. If a product has a real image_url,
// ProductImage shows that photo instead.

const CATEGORY_THEMES = {
  electronics: { from: '#4B3DBD', to: '#8B7CF6', emoji: '🔌' },
  books: { from: '#E85D4C', to: '#F7A35C', emoji: '📚' },
  'home & kitchen': { from: '#12907E', to: '#5FD3B8', emoji: '🏠' },
  fashion: { from: '#C93C84', to: '#F58FBE', emoji: '👗' },
  beauty: { from: '#D6336C', to: '#FF8FAB', emoji: '💄' },
  fragrances: { from: '#8A4FD6', to: '#C9A6F5', emoji: '🌸' },
  furniture: { from: '#8B5E3C', to: '#D9A066', emoji: '🛋️' },
  groceries: { from: '#2F9E44', to: '#8CE99A', emoji: '🛒' },
  'home-decoration': { from: '#E8590C', to: '#FFA94D', emoji: '🖼️' },
  'kitchen-accessories': { from: '#1098AD', to: '#66D9E8', emoji: '🍴' },
  "women's fashion": { from: '#AE3EC9', to: '#E599F7', emoji: '👜' },
};
const FALLBACK_THEMES = [
  { from: '#2D6CDF', to: '#6FB1FC', emoji: '🛍️' },
  { from: '#B8860B', to: '#F2C94C', emoji: '🎁' },
  { from: '#6A3FB5', to: '#C08EF0', emoji: '✨' },
];

const KEYWORD_EMOJI = [
  [/mouse/i, '🖱️'], [/keyboard/i, '⌨️'], [/hub|usb/i, '🔌'],
  [/earbud|headphone|earphone/i, '🎧'], [/power ?bank|battery/i, '🔋'],
  [/watch/i, '⌚'], [/clean code/i, '💻'], [/atomic/i, '⚛️'],
  [/pragmatic/i, '🧠'], [/deep work/i, '🎯'], [/bottle/i, '🥤'],
  [/\bpan\b|\bpot\b/i, '🍳'], [/lamp|light/i, '💡'], [/kettle/i, '🫖'],
  [/mug|cup/i, '☕'], [/t-?shirt|shirt/i, '👕'], [/backpack|\bbag\b/i, '🎒'],
  [/wallet/i, '👛'], [/shoe|sneaker/i, '👟'], [/jacket|coat/i, '🧥'],
];

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

export function getCategoryTheme(categoryName = '') {
  const key = categoryName.toLowerCase();
  return CATEGORY_THEMES[key] || FALLBACK_THEMES[hash(key) % FALLBACK_THEMES.length];
}

export function getProductVisual(product) {
  const theme = getCategoryTheme(product.category_name || '');
  const match = KEYWORD_EMOJI.find(([re]) => re.test(product.name));
  return { from: theme.from, to: theme.to, emoji: match ? match[1] : theme.emoji };
}

// Real Unsplash photographs for every category chip, keyed by the
// lowercased category name/slug. These are stable, hotlink-safe URLs
// that show a real photo matching the category. CategoryStrip still
// falls back to the illustrated gradient tile if an image fails.
const CATEGORY_IMAGES = {
  'all-products':     'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=120&h=120&fit=crop&auto=format&q=80',
  'electronics':      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=120&h=120&fit=crop&auto=format&q=80',
  'books':            'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=120&h=120&fit=crop&auto=format&q=80',
  'fashion':          'https://images.unsplash.com/photo-1445205170230-053b83016050?w=120&h=120&fit=crop&auto=format&q=80',
  'beauty':           'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=120&h=120&fit=crop&auto=format&q=80',
  'fragrances':       'https://images.unsplash.com/photo-1541643600914-78b084683601?w=120&h=120&fit=crop&auto=format&q=80',
  'furniture':        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=120&h=120&fit=crop&auto=format&q=80',
  'groceries':        'https://images.unsplash.com/photo-1542838132-92c53300491e?w=120&h=120&fit=crop&auto=format&q=80',
  'home-kitchen':     'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=120&h=120&fit=crop&auto=format&q=80',
  'home-&-kitchen':   'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=120&h=120&fit=crop&auto=format&q=80',
  'home---kitchen':   'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=120&h=120&fit=crop&auto=format&q=80',
  'home-decoration':  'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=120&h=120&fit=crop&auto=format&q=80',
  'kitchen-accessories': 'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=120&h=120&fit=crop&auto=format&q=80',
  "women's-fashion":  'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=120&h=120&fit=crop&auto=format&q=80',
  'womens-fashion':   'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=120&h=120&fit=crop&auto=format&q=80',
};

export function getCategoryImage(categoryNameOrSlug = 'category') {
  if (!categoryNameOrSlug) return '';
  const key = categoryNameOrSlug.toLowerCase().replace(/[^a-z0-9-]+/g, '-');
  // Try exact match, then strip trailing/leading hyphens
  return CATEGORY_IMAGES[key]
    || CATEGORY_IMAGES[key.replace(/^-+|-+$/g, '')]
    || '';
}
