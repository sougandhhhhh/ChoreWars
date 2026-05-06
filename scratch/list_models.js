const apiKey = 'AIzaSyDXU4hBVht0QbbGMINBZh8a7slHFZlq4hQ';

async function listModels() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    console.log('Available Models:', JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Failed to list models', e);
  }
}

listModels();
