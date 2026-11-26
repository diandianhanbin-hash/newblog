export interface SearchEntry {
  title: string;
  url: string;
  sections: { title: string; id: string }[];
}

export interface SearchHit {
  title: string;
  url: string;
  section?: string;
}

const normalize = (value: string) => value.normalize('NFKC').toLocaleLowerCase('en');

export function search(entries: SearchEntry[], input: string): SearchHit[] {
  const query = normalize(input.trim());
  if (!query) return [];

  const titleStarts: SearchHit[] = [];
  const titles: SearchHit[] = [];
  const sections: SearchHit[] = [];

  for (const { title, url, sections: headings } of entries) {
    const normalizedTitle = normalize(title);
    if (normalizedTitle.startsWith(query)) titleStarts.push({ title, url });
    else if (normalizedTitle.includes(query)) titles.push({ title, url });

    for (const heading of headings) {
      if (normalize(heading.title).includes(query)) {
        sections.push({ title, section: heading.title, url: url + '#' + encodeURIComponent(heading.id) });
      }
    }
  }

  return [...titleStarts, ...titles, ...sections];
}
