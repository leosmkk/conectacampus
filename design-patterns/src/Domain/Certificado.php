<?php

namespace ConectaCampus\Domain;

use RuntimeException;

/**
 * Certificado emitido a partir de uma Inscrição com presença
 * confirmada. É o objeto que os três geradores de
 * ConectaCampus\Patterns\TemplateMethod renderizam de formas
 * diferentes conforme o tenant (universidade, empresa, associação).
 */
class Certificado
{
    /** @var string */
    private $codigo;

    /** @var Inscricao */
    private $inscricao;

    /** @var int */
    private $cargaHoraria;

    /** @var string */
    private $emitidoEm;

    /** @var string */
    private $emitidoPor;

    /** @var string */
    private $assinante;

    public function __construct(
        string $codigo,
        Inscricao $inscricao,
        int $cargaHoraria,
        string $emitidoEm,
        string $emitidoPor,
        string $assinante
    ) {
        if (!$inscricao->podeReceberCertificado()) {
            throw new RuntimeException(sprintf(
                'Não é possível emitir certificado: %s não tem presença registrada em "%s".',
                $inscricao->getAluno()->getNome(),
                $inscricao->getEvento()->getTitulo()
            ));
        }

        $this->codigo = $codigo;
        $this->inscricao = $inscricao;
        $this->cargaHoraria = $cargaHoraria;
        $this->emitidoEm = $emitidoEm;
        $this->emitidoPor = $emitidoPor;
        $this->assinante = $assinante;
    }

    public function getAluno(): Aluno
    {
        return $this->inscricao->getAluno();
    }

    public function getEvento(): Evento
    {
        return $this->inscricao->getEvento();
    }

    public function codigoValidacao(): string
    {
        return sprintf('CC-%s-%s', strtoupper($this->codigo), strtoupper(substr(md5($this->codigo), 0, 6)));
    }

    public function getCodigo(): string
    {
        return $this->codigo;
    }

    public function getInscricao(): Inscricao
    {
        return $this->inscricao;
    }

    public function getCargaHoraria(): int
    {
        return $this->cargaHoraria;
    }

    public function getEmitidoEm(): string
    {
        return $this->emitidoEm;
    }

    public function getEmitidoPor(): string
    {
        return $this->emitidoPor;
    }

    public function getAssinante(): string
    {
        return $this->assinante;
    }
}
