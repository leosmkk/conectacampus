import { certificado } from '../../domain/certificado.js';

export const UpdateCertificate = (repository) => (id, input) => repository.update(id, certificado(input));
