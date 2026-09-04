<?php

namespace ConectaCampus\Domain;

/**
 * Value Object devolvido por qualquer estratégia de check-in
 * (ConectaCampus\Patterns\Strategy\CheckInMethod). Substitui o antigo
 * array solto @return array{sucesso: bool, mensagem: string} por um
 * tipo explícito.
 */
class ResultadoCheckIn
{
    /** @var bool */
    private $sucesso;

    /** @var string */
    private $mensagem;

    /** @var Presenca|null */
    private $presenca;

    private function __construct(bool $sucesso, string $mensagem, ?Presenca $presenca)
    {
        $this->sucesso = $sucesso;
        $this->mensagem = $mensagem;
        $this->presenca = $presenca;
    }

    public static function sucesso(string $mensagem, Presenca $presenca): self
    {
        return new self(true, $mensagem, $presenca);
    }

    public static function falha(string $mensagem): self
    {
        return new self(false, $mensagem, null);
    }

    public function foiBemSucedido(): bool
    {
        return $this->sucesso;
    }

    public function getMensagem(): string
    {
        return $this->mensagem;
    }

    public function getPresenca(): ?Presenca
    {
        return $this->presenca;
    }
}
