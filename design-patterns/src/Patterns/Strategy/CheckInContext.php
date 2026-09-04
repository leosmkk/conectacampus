<?php

namespace ConectaCampus\Patterns\Strategy;

use ConectaCampus\Domain\Inscricao;
use ConectaCampus\Domain\ResultadoCheckIn;

/**
 * Contexto do Strategy: mantém a referência ao algoritmo de check-in
 * atualmente em uso e permite trocá-lo em runtime com setMetodo().
 * Sem esta classe, quem confirma presença precisaria conhecer e
 * instanciar a estratégia concreta diretamente — o que quebraria o
 * propósito do padrão.
 */
class CheckInContext
{
    /** @var CheckInMethod */
    private $metodo;

    public function __construct(CheckInMethod $metodo)
    {
        $this->metodo = $metodo;
    }

    public function setMetodo(CheckInMethod $metodo): void
    {
        $this->metodo = $metodo;
    }

    public function getMetodoAtual(): string
    {
        return $this->metodo->nome();
    }

    public function executar(Inscricao $inscricao, array $payload): ResultadoCheckIn
    {
        $resultado = $this->metodo->confirmarPresenca($inscricao, $payload);

        if ($resultado->foiBemSucedido()) {
            $inscricao->registrarPresenca($resultado->getPresenca());
        }

        return $resultado;
    }
}
