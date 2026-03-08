import { CosmosClient } from '@azure/cosmos';
import type { Container } from '@azure/cosmos';

let _container: Container | null = null;

export function getContainer(): Container {
  if (!_container) {
    const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING!);
    const db = client.database(process.env.COSMOS_DATABASE || 'cruise-planner');
    _container = db.container(process.env.COSMOS_CONTAINER || 'entries');
  }
  return _container;
}
