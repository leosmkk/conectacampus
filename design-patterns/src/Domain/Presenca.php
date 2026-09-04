<?php

namespace ConectaCampus\Domain;

/**
 * Registro de que um aluno compareceu a um evento, gerado por um
 * dos métodos de check-in (Strategy) através do CheckInContext.
 */
class Presenca
{
    /** @var string */
    private $dataHora;

    /** @var string */
    private $metodo;

    /** @var string */
    private $registradoPor;

    public function __construct(string $dataHora, string $metodo, string $registradoPor)
    {
        $this->dataHora = $dataHora;
        $this->metodo = $metodo;
        $this->registradoPor = $registradoPor;
    }

    public function resumo(): string
    {
        return sprintf('%s às %s (confirmado por %s)', $this->metodo, $this->dataHora, $this->registradoPor);
    }

    public function getDataHora(): string
    {
        return $this->dataHora;
    }

    public function getMetodo(): string
    {
        return $this->metodo;
    }

    public function getRegistradoPor(): string
    {
        return $this->registradoPor;
    }
}
