import wilayasRaw from '../../client/data/algeria-geo/wilayas.json';
import communesRaw from '../../client/data/algeria-geo/communes.json';

type WilayaRaw = {
  id: number | string;
  code?: number | string;
  name: string;
  arabic_name?: string;
};

type CommuneRaw = {
  id: number | string;
  wilaya_id: number | string;
  post_code?: number | string;
  name: string;
  arabic_name?: string;
};

const wilayaNameById = new Map<number, string>();
for (const w of wilayasRaw as WilayaRaw[]) {
  const idNum = Number((w as any)?.id);
  const name = String((w as any)?.name || '').trim();
  if (Number.isFinite(idNum) && idNum > 0 && name) wilayaNameById.set(idNum, name);
}

const communeNameById = new Map<number, string>();
const communesByWilayaId = new Map<number, string[]>();
for (const c of communesRaw as CommuneRaw[]) {
  const idNum = Number((c as any)?.id);
  const wilayaIdNum = Number((c as any)?.wilaya_id);
  const name = String((c as any)?.name || '').trim();
  if (!Number.isFinite(idNum) || idNum <= 0 || !name) continue;
  communeNameById.set(idNum, name);

  if (Number.isFinite(wilayaIdNum) && wilayaIdNum > 0) {
    const arr = communesByWilayaId.get(wilayaIdNum);
    if (arr) arr.push(name);
    else communesByWilayaId.set(wilayaIdNum, [name]);
  }
}

for (const [key, arr] of communesByWilayaId.entries()) {
  arr.sort((a, b) => a.localeCompare(b));
  communesByWilayaId.set(key, arr);
}

export function getAlgeriaWilayaNameById(wilayaId: string | number | null | undefined): string | null {
  if (wilayaId === null || wilayaId === undefined || wilayaId === '') return null;
  const idNum = Number(wilayaId);
  if (!Number.isFinite(idNum) || idNum <= 0) return null;
  return wilayaNameById.get(idNum) || null;
}

export function getAlgeriaCommuneNameById(communeId: string | number | null | undefined): string | null {
  if (communeId === null || communeId === undefined || communeId === '') return null;
  const idNum = Number(communeId);
  if (!Number.isFinite(idNum) || idNum <= 0) return null;
  return communeNameById.get(idNum) || null;
}

export function getDefaultCommuneNameForWilayaId(wilayaId: string | number | null | undefined): string | null {
  if (wilayaId === null || wilayaId === undefined || wilayaId === '') return null;
  const idNum = Number(wilayaId);
  if (!Number.isFinite(idNum) || idNum <= 0) return null;
  const arr = communesByWilayaId.get(idNum);
  return arr && arr.length ? arr[0] : null;
}
