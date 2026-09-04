<?php

namespace ConectaCampus\Domain;

/**
 * Representa um módulo/feature flag da linha de produto do ConectaCampus
 * (ex: geo, qrcode, advReports, dualSignature, customField).
 *
 * Cada tenant liga/desliga módulos independentemente — é a unidade
 * básica de variabilidade da LPS.
 */
class Modulo
{
    /** @var string */
    private $chave;

    /** @var string */
    private $nome;

    /** @var string */
    private $descricao;

    /** @var bool */
    private $ativo;

    public function __construct(string $chave, string $nome, string $descricao, bool $ativo = false)
    {
        $this->chave = $chave;
        $this->nome = $nome;
        $this->descricao = $descricao;
        $this->ativo = $ativo;
    }

    public function ativar(): void
    {
        $this->ativo = true;
    }

    public function desativar(): void
    {
        $this->ativo = false;
    }

    public function estaAtivo(): bool
    {
        return $this->ativo;
    }

    public function getChave(): string
    {
        return $this->chave;
    }

    public function getNome(): string
    {
        return $this->nome;
    }

    public function getDescricao(): string
    {
        return $this->descricao;
    }
}
