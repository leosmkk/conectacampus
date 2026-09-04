<?php

namespace ConectaCampus\Domain;

/**
 * Um "cliente" da linha de produto de software ConectaCampus
 * (ex: Universidade Vale Verde, Instituto Nortech, Centro Universitário Ábaco).
 *
 * Cada tenant tem sua própria marca e seu próprio conjunto de módulos
 * ativos — é o que torna o ConectaCampus uma LPS whitelabel, e não um
 * sistema único com configuração global.
 */
class Tenant
{
    /** @var string */
    private $chave;

    /** @var string */
    private $nome;

    /** @var string */
    private $corPrimaria;

    /** @var Modulo[] */
    private $modulos = [];

    public function __construct(string $chave, string $nome, string $corPrimaria)
    {
        $this->chave = $chave;
        $this->nome = $nome;
        $this->corPrimaria = $corPrimaria;
    }

    public function adicionarModulo(Modulo $modulo): void
    {
        $this->modulos[$modulo->getChave()] = $modulo;
    }

    public function possuiModulo(string $chave): bool
    {
        return isset($this->modulos[$chave]) && $this->modulos[$chave]->estaAtivo();
    }

    /**
     * @return Modulo[]
     */
    public function modulosAtivos(): array
    {
        return array_values(array_filter($this->modulos, function (Modulo $modulo) {
            return $modulo->estaAtivo();
        }));
    }

    public function getChave(): string
    {
        return $this->chave;
    }

    public function getNome(): string
    {
        return $this->nome;
    }

    public function getCorPrimaria(): string
    {
        return $this->corPrimaria;
    }
}
