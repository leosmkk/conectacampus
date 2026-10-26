import { evento } from '../../domain/evento.js';

export const UpdateEvent = (repository) => (id, input) => repository.update(id, evento(input));
