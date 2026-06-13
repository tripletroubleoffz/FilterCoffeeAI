import { parseRss } from '../lib/worker';

describe('Feed Ingestion Worker', () => {
  it('should securely parse standard RSS items and sanitize XSS', async () => {
    const maliciousRss = `
      <?xml version="1.0" encoding="UTF-8" ?>
      <rss version="2.0">
      <channel>
        <title>Malicious News</title>
        <link>http://example.com</link>
        <description>Bad stuff</description>
        <item>
          <title>Test Article</title>
          <link>http://example.com/test</link>
          <description><![CDATA[<script>alert("XSS")</script>This is <b onmouseover="alert(1)">clean</b> text.]]></description>
          <pubDate>Mon, 12 Jun 2026 10:00:00 GMT</pubDate>
        </item>
      </channel>
      </rss>
    `;

    const items = await parseRss(maliciousRss);
    expect(items.length).toBe(1);
    expect(items[0].title).toBe('Test Article');
    expect(items[0].url).toBe('http://example.com/test');
    expect(items[0].content).toBe('This is clean text.'); // The scripts and malicious attributes should be stripped
  });

  it('should parse Atom feeds (like GitHub)', async () => {
    const atomFeed = `
      <?xml version="1.0" encoding="utf-8"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <title>GitHub Blog</title>
        <link href="https://github.blog/"/>
        <entry>
          <title>New GitHub Feature</title>
          <link href="https://github.blog/feature"/>
          <content type="html">Amazing new feature</content>
          <published>2026-06-12T10:00:00Z</published>
        </entry>
      </feed>
    `;

    const items = await parseRss(atomFeed);
    expect(items.length).toBe(1);
    expect(items[0].title).toBe('New GitHub Feature');
    expect(items[0].url).toBe('https://github.blog/feature');
    expect(items[0].content).toBe('Amazing new feature');
  });

  it('should handle broken/malformed XML gracefully', async () => {
    const brokenFeed = `<rss><channel><title>Broken`;
    const items = await parseRss(brokenFeed);
    expect(items.length).toBe(0);
  });
});
