<?php

namespace ConectaCampus\Patterns\TemplateMethod;

use ConectaCampus\Domain\Certificado;

/**
 * TEMPLATE METHOD (classe base dos 3 exemplos)
 *
 * Define o esqueleto fixo de geração de um certificado — cabeçalho,
 * corpo, assinatura e rodapé, sempre nessa ordem — e delega às
 * subclasses apenas o que varia entre Universidade, Empresa e
 * Associação Profissional. gerar() é `final`: nenhuma subclasse pode
 * reordenar ou pular uma etapa obrigatória, só personalizá-la.
 */
abstract class GeradorCertificado
{
    final public function gerar(Certificado $certificado): string
    {
        return implode("\n", [
            $this->montarCabecalho($certificado),
            $this->montarCorpo($certificado),
            $this->montarAssinatura($certificado),
            $this->montarRodape($certificado),
        ]);
    }

    abstract protected function montarCabecalho(Certificado $certificado): string;

    abstract protected function montarCorpo(Certificado $certificado): string;

    abstract protected function montarAssinatura(Certificado $certificado): string;

    /**
     * Hook: passo opcional. A implementação padrão só imprime o código
     * de validação; subclasses podem sobrescrever quando precisarem de
     * um rodapé diferente (ex: GeradorEmpresa).
     */
    protected function montarRodape(Certificado $certificado): string
    {
        return sprintf('Código de validação: %s', $certificado->codigoValidacao());
    }
}
