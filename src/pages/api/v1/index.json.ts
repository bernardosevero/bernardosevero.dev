import type { APIRoute } from 'astro';
import { buildPublicIndex } from '../../../utils/public-snapshot-source';

export const GET: APIRoute = ({ site }) => Response.json(buildPublicIndex(site));
