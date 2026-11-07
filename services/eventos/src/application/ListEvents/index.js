import { evento } from '../../domain/evento.js';

export const ListEvents = (repository) => () => repository.list();
