/** Base path for deploy ลง subpath (เช่น GitHub Pages: /Vd2) */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** ช่วยเติม basePath ให้ path ของ static assets */
export function asset(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${basePath}${p}`;
}
