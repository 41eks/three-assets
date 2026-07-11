import type { AssetEntry } from "../types/router";

export const assetsCache = new Map<string, ArrayBuffer>();

export function loadAssets(assets: AssetEntry[]): Promise<void> {
  const missingUris = assets
    .filter((a): a is string => typeof a === 'string' && !assetsCache.has(a));

  const fnPromises = assets
    .filter((a): a is () => Promise<any> => typeof a === 'function')
    .map(fn => fn());

  const uriPromises = missingUris.map(uri =>
    fetch(uri)
      .then(res => {
        if (!res.ok) throw new Error(`Failed to fetch ${uri}: ${res.statusText}`);
        return res.arrayBuffer();
      })
      .then(buffer => { assetsCache.set(uri, buffer); })
  );

  return Promise.all([...uriPromises, ...fnPromises]).then(() => undefined);
}
