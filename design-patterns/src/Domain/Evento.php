<?php

namespace ConectaCampus\Domain;

use RuntimeException;

/**
 * Evento acadêmico (congresso, palestra, oficina, mostra, competição
 * ou roda de conversa). Concentra a regra de vagas e a lista de
 * inscrições — nenhuma outra classe decide se um aluno pode entrar.
 */
class Evento
{
    /** @var string */
    private $id;

    /** @var string */
    private $titulo;

    /** @var string */
    private $categoria;

    /** @var string */
    private $dataLabel;

    /** @var string */
    private $hora;

    /** @var string */
    private $local;

    /** @var int */
    private $cargaHoraria;

    /** @var int */
    private $vagasTotal;

    /** @var int */
    private $vagasUsadas;

    /** @var string */
    private $organizador;

    /** @var Palestrante */
    private $palestrante;

    /** @var Inscricao[] */
    private $inscricoes = [];

    public function __construct(
        string $id,
        string $titulo,
        string $categoria,
        string $dataLabel,
        string $hora,
        string $local,
        int $cargaHoraria,
        int $vagasTotal,
        string $organizador,
        Palestrante $palestrante
    ) {
        $this->id = $id;
        $this->titulo = $titulo;
        $this->categoria = $categoria;
        $this->dataLabel = $dataLabel;
        $this->hora = $hora;
        $this->local = $local;
        $this->cargaHoraria = $cargaHoraria;
        $this->vagasTotal = $vagasTotal;
        $this->vagasUsadas = 0;
        $this->organizador = $organizador;
        $this->palestrante = $palestrante;
    }

    public function temVaga(): bool
    {
        return $this->vagasUsadas < $this->vagasTotal;
    }

    public function vagasRestantes(): int
    {
        return $this->vagasTotal - $this->vagasUsadas;
    }

    public function status(): string
    {
        if ($this->vagasRestantes() <= 0) {
            return 'lotado';
        }

        return 'vagas';
    }

    public function inscrever(Aluno $aluno): Inscricao
    {
        if (!$this->temVaga()) {
            throw new RuntimeException(sprintf('Evento "%s" está lotado.', $this->titulo));
        }

        if ($this->buscarInscricaoDe($aluno) !== null) {
            throw new RuntimeException(sprintf('%s já está inscrito em "%s".', $aluno->getNome(), $this->titulo));
        }

        $inscricao = new Inscricao(
            $this->id . '-' . $aluno->getMatricula(),
            $aluno,
            $this,
            date('Y-m-d')
        );

        $this->inscricoes[] = $inscricao;
        $this->vagasUsadas++;

        return $inscricao;
    }

    public function buscarInscricaoDe(Aluno $aluno): ?Inscricao
    {
        foreach ($this->inscricoes as $inscricao) {
            if ($inscricao->getAluno()->getMatricula() === $aluno->getMatricula()) {
                return $inscricao;
            }
        }

        return null;
    }

    public function totalPresentes(): int
    {
        $total = 0;
        foreach ($this->inscricoes as $inscricao) {
            if ($inscricao->temPresenca()) {
                $total++;
            }
        }

        return $total;
    }

    /**
     * @return Inscricao[]
     */
    public function getInscricoes(): array
    {
        return $this->inscricoes;
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getTitulo(): string
    {
        return $this->titulo;
    }

    public function getCategoria(): string
    {
        return $this->categoria;
    }

    public function getDataLabel(): string
    {
        return $this->dataLabel;
    }

    public function getHora(): string
    {
        return $this->hora;
    }

    public function getLocal(): string
    {
        return $this->local;
    }

    public function getCargaHoraria(): int
    {
        return $this->cargaHoraria;
    }

    public function getVagasTotal(): int
    {
        return $this->vagasTotal;
    }

    public function getOrganizador(): string
    {
        return $this->organizador;
    }

    public function getPalestrante(): Palestrante
    {
        return $this->palestrante;
    }
}
