import type { APIRoute } from 'astro';
import { buildPublicSnapshot } from '../../../utils/public-snapshot-source';

export const GET: APIRoute = async ({ site }) => Response.json(await buildPublicSnapshot(site));
