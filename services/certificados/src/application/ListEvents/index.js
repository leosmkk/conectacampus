import { certificado } from '../../domain/certificado.js';

export const ListEvents = (repository) => () => repository.events();
