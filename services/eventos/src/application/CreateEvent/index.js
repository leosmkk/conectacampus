import { evento } from '../../domain/evento.js';

export const CreateEvent = (repository) => (input) => repository.create(evento(input));
