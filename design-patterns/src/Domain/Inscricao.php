<?php

namespace ConectaCampus\Domain;

/**
 * Vínculo entre um Aluno e um Evento. É sobre esta classe que as
 * estratégias de check-in (Strategy) operam, e é a partir dela que
 * um Certificado pode ser emitido.
 */
class Inscricao
{
    /** @var string */
    private $id;

    /** @var Aluno */
    private $aluno;

    /** @var Evento */
    private $evento;

    /** @var string */
    private $dataInscricao;

    /** @var string */
    private $token;

    /** @var Presenca|null */
    private $presenca;

    public function __construct(string $id, Aluno $aluno, Evento $evento, string $dataInscricao)
    {
        $this->id = $id;
        $this->aluno = $aluno;
        $this->evento = $evento;
        $this->dataInscricao = $dataInscricao;
        $this->presenca = null;
        $this->token = $this->gerarToken();
    }

    /**
     * Token determinístico (matrícula + id do evento) para que o Demo
     * seja reproduzível sem depender de aleatoriedade.
     */
    public function gerarToken(): string
    {
        return strtoupper(substr(md5($this->aluno->getMatricula() . '-' . $this->evento->getId()), 0, 8));
    }

    public function tokenConfere(string $tokenInformado): bool
    {
        return hash_equals($this->token, $tokenInformado);
    }

    public function registrarPresenca(Presenca $presenca): void
    {
        $this->presenca = $presenca;
    }

    public function temPresenca(): bool
    {
        return $this->presenca !== null;
    }

    public function podeReceberCertificado(): bool
    {
        return $this->temPresenca();
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getAluno(): Aluno
    {
        return $this->aluno;
    }

    public function getEvento(): Evento
    {
        return $this->evento;
    }

    public function getDataInscricao(): string
    {
        return $this->dataInscricao;
    }

    public function getToken(): string
    {
        return $this->token;
    }

    public function getPresenca(): ?Presenca
    {
        return $this->presenca;
    }
}
