import sql from 'mssql';
import { randomUUID } from 'node:crypto';
import { certificateEvent, ValidationError } from '../domain/certificado.js';

function validId(id) {
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(id)) throw new ValidationError('Identificador inválido.');
  return id;
}

export function sqlRepository(pool) {
  async function mutate(action, id, data) {
    validId(id);
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    try {
      const req = new sql.Request(transaction).input('id', sql.UniqueIdentifier, id);
      if (data) {
        req.input('title', sql.NVarChar(200), data.title).input('student', sql.NVarChar(200), data.student)
          .input('completedAt', sql.Char(10), data.completedAt).input('hours', sql.Int, data.hours).input('status', sql.VarChar(20), data.status);
      }
      const statements = {
        created: 'INSERT INTO dbo.Certificates (id,title,student,completedAt,hours,status) OUTPUT INSERTED.* VALUES (@id,@title,@student,@completedAt,@hours,@status)',
        updated: 'UPDATE dbo.Certificates SET title=@title,student=@student,completedAt=@completedAt,hours=@hours,status=@status OUTPUT INSERTED.* WHERE id=@id',
        deleted: 'DELETE FROM dbo.Certificates OUTPUT DELETED.* WHERE id=@id'
      };
      const result = (await req.query(statements[action])).recordset[0];
      if (result) {
        const eventId = randomUUID();
        const event = certificateEvent(`certificate.${action}`, id, result, eventId, new Date().toISOString());
        await new sql.Request(transaction).input('eventId', sql.UniqueIdentifier, eventId).input('payload', sql.NVarChar(sql.MAX), JSON.stringify(event))
          .query('INSERT INTO dbo.Outbox (id,payload) VALUES (@eventId,@payload)');
      }
      await transaction.commit();
      return result ?? null;
    } catch (error) {
      await transaction.rollback().catch(() => {});
      throw error;
    }
  }
  return {
    async list() { return (await pool.request().query('SELECT TOP (1000) * FROM dbo.Certificates ORDER BY completedAt DESC, id')).recordset; },
    async get(id) { return (await pool.request().input('id', sql.UniqueIdentifier, validId(id)).query('SELECT * FROM dbo.Certificates WHERE id=@id')).recordset[0] ?? null; },
    create: (data) => mutate('created', randomUUID(), data),
    update: (id, data) => mutate('updated', id, data),
    delete: (id) => mutate('deleted', id),
    async events() {
      return (await pool.request().query('SELECT TOP (100) id,payload,createdAt,publishedAt FROM dbo.Outbox ORDER BY createdAt DESC'))
        .recordset.map(({ payload, ...row }) => ({ ...row, event: JSON.parse(payload) }));
    },
    async pending() { return (await pool.request().query('SELECT TOP (20) id,payload FROM dbo.Outbox WHERE publishedAt IS NULL ORDER BY createdAt')).recordset; },
    async published(id) { await pool.request().input('id', sql.UniqueIdentifier, id).query('UPDATE dbo.Outbox SET publishedAt=SYSUTCDATETIME() WHERE id=@id AND publishedAt IS NULL'); }
  };
}
