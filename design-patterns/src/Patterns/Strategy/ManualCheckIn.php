<?php

namespace ConectaCampus\Patterns\Strategy;

use ConectaCampus\Domain\Inscricao;
use ConectaCampus\Domain\Presenca;
use ConectaCampus\Domain\ResultadoCheckIn;

/**
 * STRATEGY (exemplo 2/3) — confirma presença por lançamento manual de
 * um operador (ex: Centro Acadêmico na entrada do evento), sem
 * depender de nenhum dado da própria inscrição.
 */
class ManualCheckIn implements CheckInMethod
{
    public function nome(): string
    {
        return 'Manual';
    }

    public function confirmarPresenca(Inscricao $inscricao, array $payload): ResultadoCheckIn
    {
        $operador = trim($payload['confirmado_por'] ?? '');

        if ($operador === '') {
            return ResultadoCheckIn::falha('Check-in manual requer identificar quem confirmou a presença.');
        }

        $presenca = new Presenca(date('H:i'), $this->nome(), $operador);

        return ResultadoCheckIn::sucesso(
            sprintf('Presença confirmada manualmente por %s.', $operador),
            $presenca
        );
    }
}
