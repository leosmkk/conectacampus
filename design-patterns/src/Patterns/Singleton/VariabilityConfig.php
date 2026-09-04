<?php

namespace ConectaCampus\Patterns\Singleton;

/**
 * SINGLETON (exemplo 1/2)
 *
 * Ponto único de leitura da variabilidade da Linha de Produto de
 * Software ConectaCampus: qual método de check-in está ativo (Ativo 4),
 * qual template de certificado usar (Ativo 5) e qual tenant está
 * "logado" nesta execução. Faz sentido ser único porque, dentro de uma
 * mesma requisição/processo, todas as partes do sistema devem enxergar
 * a mesma configuração — nunca duas leituras divergentes.
 */
class VariabilityConfig
{
    /** @var VariabilityConfig|null */
    private static $instance = null;

    /** @var string */
    private $checkInMethod;

    /** @var string */
    private $certificadoTemplate;

    /** @var string */
    private $tenant;

    private function __construct()
    {
        $this->checkInMethod = getenv('CHECKIN_METHOD') ?: 'qrcode';
        $this->certificadoTemplate = getenv('CERTIFICADO_TEMPLATE') ?: 'universidade';
        $this->tenant = getenv('TENANT') ?: 'universidade-vale-verde';
    }

    public static function getInstance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    public function getCheckInMethod(): string
    {
        return $this->checkInMethod;
    }

    public function getCertificadoTemplate(): string
    {
        return $this->certificadoTemplate;
    }

    public function getTenant(): string
    {
        return $this->tenant;
    }

    private function __clone()
    {
    }

    public function __wakeup()
    {
        throw new \Exception('Não é permitido desserializar um Singleton.');
    }
}
