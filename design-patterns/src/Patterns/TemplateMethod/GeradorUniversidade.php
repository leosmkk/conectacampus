<?php

namespace ConectaCampus\Patterns\TemplateMethod;

use ConectaCampus\Domain\Certificado;

/**
 * TEMPLATE METHOD (exemplo 1/3) — variação para o tenant Universidade.
 */
class GeradorUniversidade extends GeradorCertificado
{
    protected function montarCabecalho(Certificado $certificado): string
    {
        return '=== Certificado de Participação (Universidade) ===';
    }

    protected function montarCorpo(Certificado $certificado): string
    {
        $aluno = $certificado->getAluno();
        $evento = $certificado->getEvento();

        return sprintf(
            "Certificamos que %s (matrícula %s, curso %s) participou do evento \"%s\", com carga horária de %dh.",
            $aluno->getNome(),
            $aluno->getMatricula(),
            $aluno->getCurso(),
            $evento->getTitulo(),
            $certificado->getCargaHoraria()
        );
    }

    protected function montarAssinatura(Certificado $certificado): string
    {
        return 'Reitoria — ' . $certificado->getEmitidoPor();
    }
}
