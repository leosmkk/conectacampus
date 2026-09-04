<?php

namespace ConectaCampus\Domain;

/**
 * Perfil "palestrante": conduz eventos e acompanha o próprio painel
 * de participação.
 */
class Palestrante extends Usuario
{
    /** @var string */
    private $areaAtuacao;

    /** @var string */
    private $titulacao;

    /** @var string */
    private $instituicaoOrigem;

    /** @var string */
    private $miniBio;

    public function __construct(
        string $id,
        string $nome,
        string $email,
        string $telefone,
        string $areaAtuacao,
        string $titulacao,
        string $instituicaoOrigem,
        string $miniBio
    ) {
        parent::__construct($id, $nome, $email, $telefone);
        $this->areaAtuacao = $areaAtuacao;
        $this->titulacao = $titulacao;
        $this->instituicaoOrigem = $instituicaoOrigem;
        $this->miniBio = $miniBio;
    }

    public function perfil(): string
    {
        return 'palestrante';
    }

    public function descricaoCurta(): string
    {
        return sprintf('%s, %s em %s (%s)', $this->getNome(), $this->titulacao, $this->areaAtuacao, $this->instituicaoOrigem);
    }

    public function getAreaAtuacao(): string
    {
        return $this->areaAtuacao;
    }

    public function getTitulacao(): string
    {
        return $this->titulacao;
    }

    public function getInstituicaoOrigem(): string
    {
        return $this->instituicaoOrigem;
    }

    public function getMiniBio(): string
    {
        return $this->miniBio;
    }
}
