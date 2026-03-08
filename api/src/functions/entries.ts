import { app } from '@azure/functions';
import type { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getContainer } from '../cosmos';

async function getEntries(_req: HttpRequest, _ctx: InvocationContext): Promise<HttpResponseInit> {
  const { resources } = await getContainer().items.readAll().fetchAll();
  return { jsonBody: resources };
}

async function createEntry(req: HttpRequest, _ctx: InvocationContext): Promise<HttpResponseInit> {
  const body = await req.json() as Record<string, unknown>;
  const entry = { ...body, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  const { resource } = await getContainer().items.create(entry);
  return { status: 201, jsonBody: resource };
}

app.http('getEntries', { methods: ['GET'], route: 'entries', handler: getEntries });
app.http('createEntry', { methods: ['POST'], route: 'entries', handler: createEntry });
