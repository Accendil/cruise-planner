import { app } from '@azure/functions';
import type { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getContainer } from '../cosmos';

async function findById(id: string): Promise<Record<string, unknown> | null> {
  const { resources } = await getContainer().items.query({
    query: 'SELECT * FROM c WHERE c.id = @id',
    parameters: [{ name: '@id', value: id }],
  }).fetchAll();
  return resources[0] ?? null;
}

async function updateEntry(req: HttpRequest, _ctx: InvocationContext): Promise<HttpResponseInit> {
  const id = req.params.id;
  const existing = await findById(id);
  if (!existing) return { status: 404 };
  const patch = await req.json() as Record<string, unknown>;
  const updated = { ...existing, ...patch, id };
  const { resource } = await getContainer().item(id, existing.phase as string).replace(updated);
  return { jsonBody: resource };
}

async function deleteEntry(req: HttpRequest, _ctx: InvocationContext): Promise<HttpResponseInit> {
  const id = req.params.id;
  const existing = await findById(id);
  if (!existing) return { status: 404 };
  await getContainer().item(id, existing.phase as string).delete();
  return { status: 204 };
}

app.http('updateEntry', { methods: ['PATCH'], route: 'entries/{id}', handler: updateEntry });
app.http('deleteEntry', { methods: ['DELETE'], route: 'entries/{id}', handler: deleteEntry });
