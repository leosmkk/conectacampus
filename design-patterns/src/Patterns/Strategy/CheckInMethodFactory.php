<?php

namespace ConectaCampus\Patterns\Strategy;

use ConectaCampus\Patterns\Singleton\VariabilityConfig;
use InvalidArgumentException;

/**
 * Fábrica simples que traduz a chave de configuração (ex: "qrcode",
 * "manual", "nfc") na estratégia concreta correspondente. É a peça
 * que faltava na base original: sem ela, VariabilityConfig::
 * getCheckInMethod() era lido mas nunca usado para escolher nada.
 *
 * Não é um padrão adicional reivindicado no trabalho — é a cola entre
 * o Singleton (configuração da LPS) e o Strategy (algoritmo em si).
 */
class CheckInMethodFactory
{
    /**
     * @param \ConectaCampus\Domain\Cracha[] $crachas usado apenas quando $chave === 'nfc'
     */
    public static function criar(string $chave, array $crachas = []): CheckInMethod
    {
        switch ($chave) {
            case 'qrcode':
                return new QrCodeCheckIn();
            case 'manual':
                return new ManualCheckIn();
            case 'nfc':
                return new NfcCheckIn($crachas);
            default:
                throw new InvalidArgumentException(sprintf('Método de check-in desconhecido: "%s".', $chave));
        }
    }

    public static function apartirDaConfiguracao(VariabilityConfig $config, array $crachas = []): CheckInMethod
    {
        return self::criar($config->getCheckInMethod(), $crachas);
    }
}
