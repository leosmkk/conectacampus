<?php

namespace ConectaCampus\Domain;

/**
 * Base para os quatro perfis de usuário do ConectaCampus
 * (Aluno, CentroAcademico, Palestrante — e Universidade/Reitoria,
 * representada aqui por CentroAcademico com mandato institucional).
 *
 * Concentra os dados comuns a qualquer conta; cada perfil concreto
 * define o que é exibido como identidade (perfil/descricaoCurta).
 */
abstract class Usuario
{
    /** @var string */
    private $id;

    /** @var string */
    private $nome;

    /** @var string */
    private $email;

    /** @var string */
    private $telefone;

    public function __construct(string $id, string $nome, string $email, string $telefone)
    {
        $this->id = $id;
        $this->nome = $nome;
        $this->email = $email;
        $this->telefone = $telefone;
    }

    abstract public function perfil(): string;

    abstract public function descricaoCurta(): string;

    public function getId(): string
    {
        return $this->id;
    }

    public function getNome(): string
    {
        return $this->nome;
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function getTelefone(): string
    {
        return $this->telefone;
    }
}
