export async function sendChatMessage({
  question,
  county = null,
  state = null,
  fips = null,
  history = [],
  signal,
}) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, county, state, fips, history }),
    signal,
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(details || 'Chat request failed');
  }

  const payload = await response.json();
  return {
    answer: payload.answer || '',
    citations: Array.isArray(payload.citations) ? payload.citations : [],
    debugContext: payload.debug_context || {},
  };
}
