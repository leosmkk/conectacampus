import { TableClient } from '@azure/data-tables';

export async function tableLedger(connection) {
  const client = TableClient.fromConnectionString(connection, 'CampusEvents', { allowInsecureConnection: connection.includes('http://') });
  await client.createTable().catch((error) => { if (error.statusCode !== 409) throw error; });
  return createLedger(client);
}

export function createLedger(client) {
  return {
    async record(event) {
      try {
        await client.createEntity({ partitionKey: 'certificates', rowKey: event.id, type: event.type, subject: event.subject,
          occurredAt: event.occurredAt, processedAt: new Date().toISOString(), version: event.version });
        return { duplicate: false };
      } catch (error) {
        if (error.statusCode === 409) return { duplicate: true };
        throw error;
      }
    },
    async list() {
      const rows = [];
      for await (const entity of client.listEntities({ queryOptions: { filter: "PartitionKey eq 'certificates'" } })) {
        rows.push({ id: entity.rowKey, type: entity.type, subject: entity.subject, occurredAt: entity.occurredAt, processedAt: entity.processedAt });
        if (rows.length >= 100) break;
      }
      return rows;
    }
  };
}
