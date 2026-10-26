import { evento } from '../../domain/evento.js';

export const DeleteEvent = (repository) => (id) => repository.delete(id);
