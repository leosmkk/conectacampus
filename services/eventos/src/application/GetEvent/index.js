import { evento } from '../../domain/evento.js';

export const GetEvent = (repository) => (id) => repository.get(id);
