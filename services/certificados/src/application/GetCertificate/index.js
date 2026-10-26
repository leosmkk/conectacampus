import { certificado } from '../../domain/certificado.js';

export const GetCertificate = (repository) => (id) => repository.get(id);
