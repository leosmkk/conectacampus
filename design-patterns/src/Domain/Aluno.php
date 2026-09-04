<?php

namespace ConectaCampus\Domain;

/**
 * Perfil "aluno": quem se inscreve em eventos e recebe certificados.
 */
class Aluno extends Usuario
{
    /** @var string */
    private $matricula;

    /** @var string */
    private $curso;

    /** @var int */
    private $semestre;

    public function __construct(
        string $id,
        string $nome,
        string $email,
        string $telefone,
        string $matricula,
        string $curso,
        int $semestre
    ) {
        parent::__construct($id, $nome, $email, $telefone);
        $this->matricula = $matricula;
        $this->curso = $curso;
        $this->semestre = $semestre;
    }

    public function perfil(): string
    {
        return 'aluno';
    }

    public function descricaoCurta(): string
    {
        return sprintf('%s (%sº semestre de %s)', $this->getNome(), $this->semestre, $this->curso);
    }

    public function getMatricula(): string
    {
        return $this->matricula;
    }

    public function getCurso(): string
    {
        return $this->curso;
    }

    public function getSemestre(): int
    {
        return $this->semestre;
    }
}
