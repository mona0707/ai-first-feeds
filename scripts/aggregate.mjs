import Parser from 'rss-parser';
import { writeFile } from 'node:fs/promises';

const parser = new Parser({
  timeout: 15000,
  maxRedirects: 5,
  headers: { 'User-Agent': 'ai-first-feeds (+github actions)' }
});

// feed list
const FEEDS = [
  { source: 'OpenAI News', url: 'https://openai.com/news/rss.xml' },
  { source: 'Anthropic News', url: 'https://rsshub.app/anthropic/news' },
  { source: 'Google AI Blog', url: 'http://ai.googleblog.com/atom.xml' },
  { source: 'DeepMind Blog', url: 'https://deepmind.com/blog/feed/basic' },
  { source: 'Microsoft Research', url: 'https://www.microsoft.com/en-us/research/feed/' },
  { source: 'arXiv cs.LG', url: 'https://export.arxiv.org/rss/cs.LG' },
  { source: 'arXiv cs.AI', url: 'https://export.arxiv.org/rss/cs.AI' },
  { source: 'arXiv cs.CL', url: 'https://export.arxiv.org/rss/cs.CL' },
  { source: 'Digital Agency (Japan)', url: 'https://www.digital.go.jp/rss/news.xml' }
];

function normDate(entry) {
  return new Date(entry.isoDate || entry.pubDate || entry.published || Date.now()).toISOString();
}

function clean(s) {
  return (s || '').replace(/\s+/g, ' ').trim();
}

const seen = new Set();
const items = [];

for (const f of FEEDS) {
  try {
    const feed = await parser.parseURL(f.url);
    for (const e of feed.items || []) {
      const url = e.link || e.guid || '';
      const key = (url || e.title || '').toLowerCase().trim();
      if (!key || seen.has(key)) continue;
      seen.add(key);

      items.push({
        source: f.source,
        title: clean(e.title),
        url,
        published_at: normDate(e),
        authors: e.creator ? [e.creator] : (e.authors?.map(a => a.name).filter(Boolean) || []),
        summary: clean(e.contentSnippet || e.summary || '')
      });
    }
  } catch (err) {
    console.error('feed error', f.source, f.url, String(err));
  }
}

items.sort((a, b) => (a.published_at < b.published_at ? 1 : -1));
const LIMITED = items.slice(0, 3000);
await writeFile('public/feed.json', JSON.stringify(LIMITED, null, 2), 'utf8');
console.log(`wrote ${LIMITED.length} items`);
