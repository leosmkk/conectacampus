import { certificado } from '../../domain/certificado.js';

export const ListCertificates = (repository) => () => repository.list();
