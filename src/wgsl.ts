declare const __PLASIUS_IMPORT_META_URL__: string;

const wgslBaseUrl =
  typeof __PLASIUS_IMPORT_META_URL__ === "string" && __PLASIUS_IMPORT_META_URL__
    ? __PLASIUS_IMPORT_META_URL__
    : typeof document !== "undefined" && document.baseURI
      ? document.baseURI
      : typeof location !== "undefined"
        ? location.href
        : "file:///";

export const terrainWgslUrl = new URL("./terrain.wgsl", wgslBaseUrl);
export const fieldWgslUrl = new URL("./field.wgsl", wgslBaseUrl);
export const fractalPrepassWgslUrl = new URL("./fractal-prepass.wgsl", wgslBaseUrl);

export async function loadTerrainWgsl(options: {
  url?: URL | string;
  fetcher?: typeof fetch | null;
} = {}) {
  const { url = terrainWgslUrl, fetcher = globalThis.fetch } = options;
  const resolved = url instanceof URL ? url : new URL(url, terrainWgslUrl);

  if (!fetcher || resolved.protocol === "file:") {
    const { readFile } = await import("node:fs/promises");
    const { fileURLToPath } = await import("node:url");
    return readFile(fileURLToPath(resolved), "utf8");
  }

  const response = await fetcher(resolved);
  if (!response.ok) {
    const statusText = response.statusText ? ` ${response.statusText}` : "";
    throw new Error(`Failed to load WGSL (${response.status}${statusText})`);
  }
  return response.text();
}

export async function loadFieldWgsl(options: {
  url?: URL | string;
  fetcher?: typeof fetch | null;
} = {}) {
  const { url = fieldWgslUrl, fetcher = globalThis.fetch } = options;
  const resolved = url instanceof URL ? url : new URL(url, fieldWgslUrl);

  if (!fetcher || resolved.protocol === "file:") {
    const { readFile } = await import("node:fs/promises");
    const { fileURLToPath } = await import("node:url");
    return readFile(fileURLToPath(resolved), "utf8");
  }

  const response = await fetcher(resolved);
  if (!response.ok) {
    const statusText = response.statusText ? ` ${response.statusText}` : "";
    throw new Error(`Failed to load WGSL (${response.status}${statusText})`);
  }
  return response.text();
}

export async function loadFractalPrepassWgsl(options: {
  url?: URL | string;
  fetcher?: typeof fetch | null;
} = {}) {
  const { url = fractalPrepassWgslUrl, fetcher = globalThis.fetch } = options;
  const resolved = url instanceof URL ? url : new URL(url, fractalPrepassWgslUrl);

  if (!fetcher || resolved.protocol === "file:") {
    const { readFile } = await import("node:fs/promises");
    const { fileURLToPath } = await import("node:url");
    return readFile(fileURLToPath(resolved), "utf8");
  }

  const response = await fetcher(resolved);
  if (!response.ok) {
    const statusText = response.statusText ? ` ${response.statusText}` : "";
    throw new Error(`Failed to load WGSL (${response.status}${statusText})`);
  }
  return response.text();
}
