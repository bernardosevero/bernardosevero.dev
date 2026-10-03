// Verified public hosts and the analytics destination type each one reports.
const destinationTypes = new Map([
  ['github.com', 'source_repository'],
  ['www.alura.com.br', 'published_formation'],
  ['dsa-learning.bernardosevero.dev', 'live_application'],
]);

export function getDestinationType(value: string): string | undefined {
  const url = URL.parse(value);
  if (url?.protocol !== 'https:') return undefined;
  return destinationTypes.get(url.hostname);
}

interface ProjectDestinations {
  liveUrl?: string | undefined;
  links: Array<{ url: string }>;
}

/** The project's main destination: the live app, otherwise the first listed link. */
export function primaryProjectUrl({ liveUrl, links }: ProjectDestinations): string | undefined {
  return liveUrl ?? links[0]?.url;
}
