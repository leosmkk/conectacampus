<?php

namespace ConectaCampus\Patterns\Strategy;

use ConectaCampus\Domain\Inscricao;
use ConectaCampus\Domain\ResultadoCheckIn;

/**
 * STRATEGY (contrato dos 3 exemplos)
 *
 * Cada implementação é um algoritmo intercambiável de confirmação de
 * presença (Ativo 4 / RF23-RF26). O CheckInContext decide, em tempo
 * de execução, qual delas usar — o chamador nunca depende da classe
 * concreta.
 */
interface CheckInMethod
{
    public function confirmarPresenca(Inscricao $inscricao, array $payload): ResultadoCheckIn;

    public function nome(): string;
}
