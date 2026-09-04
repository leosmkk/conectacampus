<?php

namespace ConectaCampus\Domain;

/**
 * Crachá NFC físico vinculado a um aluno, usado pela strategy
 * NfcCheckIn para confirmar presença por aproximação.
 */
class Cracha
{
    /** @var string */
    private $idCracha;

    /** @var Aluno */
    private $aluno;

    /** @var bool */
    private $ativo;

    public function __construct(string $idCracha, Aluno $aluno, bool $ativo = true)
    {
        $this->idCracha = $idCracha;
        $this->aluno = $aluno;
        $this->ativo = $ativo;
    }

    public function pertenceA(Aluno $aluno): bool
    {
        return $this->aluno->getMatricula() === $aluno->getMatricula();
    }

    public function estaAtivo(): bool
    {
        return $this->ativo;
    }

    public function desativar(): void
    {
        $this->ativo = false;
    }

    public function getIdCracha(): string
    {
        return $this->idCracha;
    }

    public function getAluno(): Aluno
    {
        return $this->aluno;
    }
}
