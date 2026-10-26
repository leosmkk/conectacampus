import { certificado } from '../../domain/certificado.js';

export const CreateCertificate = (repository) => (input) => repository.create(certificado(input));
