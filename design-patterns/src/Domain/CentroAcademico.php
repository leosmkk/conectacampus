<?php

namespace ConectaCampus\Domain;

/**
 * Perfil "centro acadêmico": organiza eventos e, quando o módulo
 * dualSignature está ativo, confirma a primeira etapa de aprovação
 * de certificados antes da assinatura da reitoria.
 */
class CentroAcademico extends Usuario
{
    /** @var string */
    private $presidente;

    /** @var string */
    private $vice;

    /** @var int */
    private $qtdIntegrantes;

    /** @var string */
    private $mandato;

    public function __construct(
        string $id,
        string $nome,
        string $email,
        string $telefone,
        string $presidente,
        string $vice,
        int $qtdIntegrantes,
        string $mandato
    ) {
        parent::__construct($id, $nome, $email, $telefone);
        $this->presidente = $presidente;
        $this->vice = $vice;
        $this->qtdIntegrantes = $qtdIntegrantes;
        $this->mandato = $mandato;
    }

    public function perfil(): string
    {
        return 'centro';
    }

    public function descricaoCurta(): string
    {
        return sprintf('%s — presidente: %s (mandato %s)', $this->getNome(), $this->presidente, $this->mandato);
    }

    public function getPresidente(): string
    {
        return $this->presidente;
    }

    public function getVice(): string
    {
        return $this->vice;
    }

    public function getQtdIntegrantes(): int
    {
        return $this->qtdIntegrantes;
    }

    public function getMandato(): string
    {
        return $this->mandato;
    }
}
