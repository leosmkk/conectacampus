import { certificado } from '../../domain/certificado.js';

export const DeleteCertificate = (repository) => (id) => repository.delete(id);
