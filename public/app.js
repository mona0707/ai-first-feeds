(async function () {
  const res = await fetch('./feed.json', { cache: 'no-store' });
  const items = await res.json();

  const sel = document.getElementById('source');
  const q = document.getElementById('q');
  const list = document.getElementById('list');

  const sources = Array.from(new Set(items.map(i => i.source))).sort();
  sel.innerHTML = `<option value="">すべてのソース</option>` + sources.map(s => `<option>${s}</option>`).join('');

  function render() {
    const kw = (q.value || '').toLowerCase();
    const src = sel.value;
    const filtered = items.filter(i =>
      (!src || i.source === src) &&
      (!kw || (i.title + ' ' + (i.summary || '') + ' ' + i.source).toLowerCase().includes(kw))
    ).slice(0, 500);

    list.innerHTML = filtered.map(i => `
      <article class="card">
        <h3><a href="${i.url}" target="_blank" rel="noopener">${i.title}</a></h3>
        <div class="meta">
          <span>🕒 ${new Date(i.published_at).toLocaleString()}</span>
          <span>📌 ${i.source}</span>
          ${i.authors?.length ? `<span>✍️ ${i.authors.join(', ')}</span>` : ''}
        </div>
        ${i.summary ? `<p class="summary">${i.summary}</p>` : ''}
      </article>
    `).join('');
  }

  q.addEventListener('input', render);
  sel.addEventListener('change', render);
  render();
})();
