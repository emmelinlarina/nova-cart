const API_URL = 'https://v2.api.noroff.dev/online-shop';

export async function fetchProducts() {
  try {
    const response = await fetch(API_URL);
    const json = await response.json();
    return json.data;
  } catch (error) {
    console.error('Error fetching procuts:', error);
    return [];
  }
}


