import { app } from '@azure/functions';
import type { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getContainer } from '../cosmos';

async function seedHandler(req: HttpRequest, _ctx: InvocationContext): Promise<HttpResponseInit> {
  const entries = await req.json() as Array<Record<string, unknown>>;
  for (const entry of entries) {
    await getContainer().items.upsert(entry);
  }
  return { status: 204 };
}

app.http('seed', { methods: ['POST'], route: 'seed', handler: seedHandler });
