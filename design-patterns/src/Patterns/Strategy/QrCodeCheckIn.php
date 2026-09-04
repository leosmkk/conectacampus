<?php

namespace ConectaCampus\Patterns\Strategy;

use ConectaCampus\Domain\Inscricao;
use ConectaCampus\Domain\Presenca;
use ConectaCampus\Domain\ResultadoCheckIn;

/**
 * STRATEGY (exemplo 1/3) — confirma presença comparando o token do QR
 * Code lido no evento com o token gerado na inscrição.
 */
class QrCodeCheckIn implements CheckInMethod
{
    public function nome(): string
    {
        return 'QR Code';
    }

    public function confirmarPresenca(Inscricao $inscricao, array $payload): ResultadoCheckIn
    {
        $tokenLido = $payload['token'] ?? '';

        if (!$inscricao->tokenConfere($tokenLido)) {
            return ResultadoCheckIn::falha('QR Code inválido ou expirado.');
        }

        $presenca = new Presenca(date('H:i'), $this->nome(), 'totem de check-in');

        return ResultadoCheckIn::sucesso('Presença confirmada via QR Code.', $presenca);
    }
}
