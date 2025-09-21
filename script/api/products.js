export const API_URL = 'https://v2.api.noroff.dev/online-shop';

export async function fetchProducts() {
  try {
    const response = await fetch(API_URL);
    const json = await response.json();
    return json.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function fetchingSingleProduct(id) {
    const url = `${API_URL}/${encodeURIComponent(id)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const json = await response.json();
    return json.data;
}
