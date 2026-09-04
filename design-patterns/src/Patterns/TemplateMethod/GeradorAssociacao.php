<?php

namespace ConectaCampus\Patterns\TemplateMethod;

use ConectaCampus\Domain\Certificado;

/**
 * TEMPLATE METHOD (exemplo 3/3) — variação para o tenant Associação
 * Profissional (congressos). Não menciona matrícula no corpo, ao
 * contrário dos outros dois.
 */
class GeradorAssociacao extends GeradorCertificado
{
    protected function montarCabecalho(Certificado $certificado): string
    {
        return '=== Certificado de Participação (Associação Profissional) ===';
    }

    protected function montarCorpo(Certificado $certificado): string
    {
        $aluno = $certificado->getAluno();
        $evento = $certificado->getEvento();

        return sprintf(
            "Certificamos que %s participou do congresso \"%s\", com carga horária de %dh.",
            $aluno->getNome(),
            $evento->getTitulo(),
            $certificado->getCargaHoraria()
        );
    }

    protected function montarAssinatura(Certificado $certificado): string
    {
        return 'Diretoria da Associação — ' . $certificado->getEmitidoPor();
    }
}
