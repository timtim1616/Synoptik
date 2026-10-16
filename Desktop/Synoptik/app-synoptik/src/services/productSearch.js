// src/services/productSearch.js
import { pb } from './pocketbase.js';

const searchCache = new Map();

/**
 * Récupère l'image produit via le relais PocketBase sans aucun appel à Wikipédia.
 * @param {string} brand - Marque de l'appareil
 * @param {string} model - Modèle de l'appareil
 */
export async function fetchProductInfo(brand = '', model = '') {
  const cleanBrand = (brand || '').trim();

  // Nettoyage des parenthèses superflues
  const cleanModel = (model || '')
    .replace(/\(.*?\)/g, '')
    .replace(/\s*\(.*?\)/g, '')
    .trim();

  const query = `${cleanBrand} ${cleanModel}`.trim();
  if (!query || cleanModel.length < 2) return null;

  const cacheKey = query.toLowerCase();
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey);
  }

  try {
    const baseUrl = pb.baseUrl || window.location.origin;
    const url = `${baseUrl}/api/product-search?q=${encodeURIComponent(query)}`;

    const res = await fetch(url);
    if (!res.ok) {
      searchCache.set(cacheKey, null);
      return null;
    }

    const data = await res.json();

    if (data && (data.imageUrl || data.thumbnailUrl)) {
      const result = {
        title: `${cleanBrand} ${cleanModel}`.trim(),
        imageUrl: data.thumbnailUrl || data.imageUrl,
        pageUrl: data.sourceUrl || `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      };

      searchCache.set(cacheKey, result);
      return result;
    }
  } catch (err) {
    console.warn('Recherche produit indisponible :', err);
  }

  searchCache.set(cacheKey, null);
  return null;
}