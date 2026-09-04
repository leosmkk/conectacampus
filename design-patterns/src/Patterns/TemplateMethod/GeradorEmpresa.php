<?php

namespace ConectaCampus\Patterns\TemplateMethod;

use ConectaCampus\Domain\Certificado;

/**
 * TEMPLATE METHOD (exemplo 2/3) — variação para o tenant Empresa
 * (treinamento corporativo). Único dos três que sobrescreve o hook
 * montarRodape(), demonstrando que ele é opcional.
 */
class GeradorEmpresa extends GeradorCertificado
{
    protected function montarCabecalho(Certificado $certificado): string
    {
        return '=== Certificado de Conclusão (Empresa) ===';
    }

    protected function montarCorpo(Certificado $certificado): string
    {
        $aluno = $certificado->getAluno();
        $evento = $certificado->getEvento();

        return sprintf(
            "Certificamos que %s (matrícula interna %s) concluiu o treinamento \"%s\", com carga horária de %dh.",
            $aluno->getNome(),
            $aluno->getMatricula(),
            $evento->getTitulo(),
            $certificado->getCargaHoraria()
        );
    }

    protected function montarAssinatura(Certificado $certificado): string
    {
        return $certificado->getAssinante() . ' — RH';
    }

    protected function montarRodape(Certificado $certificado): string
    {
        return sprintf(
            'Válido apenas para fins internos de treinamento. Código: %s',
            $certificado->codigoValidacao()
        );
    }
}
