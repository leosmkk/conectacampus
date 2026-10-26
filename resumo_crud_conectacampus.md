# Resumo das operações CRUD — ConectaCampus

## Comparação dos arquivos

| Característica | `pesquisar.js` | `inserir.js` | `alterar.js` | `excluir.js` |
|---|---|---|---|---|
| Operação CRUD | Read | Create | Update | Delete |
| Método HTTP | GET | POST | PUT | DELETE |
| Recebe ID? | Opcional | Não | Sim | Sim |
| Recebe JSON no body? | Não | Sim | Sim | Não |
| Método MongoDB | `find()` / `findOne()` | `insertOne()` | `updateOne()` | `deleteOne()` |
| Modifica o banco? | Não | Sim | Sim | Sim |
| Sucesso HTTP | 200 | 201 | 200 | 200 |
| Usa `getTipo()`? | Sim | Sim | Sim | Sim |
| Usa `getDatabase()`? | Sim | Sim | Sim | Sim |

## Exemplos dos métodos MongoDB

```javascript
// Consultar documentos
collection.find({});

// Inserir um documento
collection.insertOne(body);

// Atualizar um documento
collection.updateOne(
  { _id: new ObjectId(id) },
  { $set: body }
);

// Excluir um documento
collection.deleteOne({
  _id: new ObjectId(id)
});
```
