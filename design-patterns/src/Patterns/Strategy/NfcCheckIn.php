<?php

namespace ConectaCampus\Patterns\Strategy;

use ConectaCampus\Domain\Cracha;
use ConectaCampus\Domain\Inscricao;
use ConectaCampus\Domain\Presenca;
use ConectaCampus\Domain\ResultadoCheckIn;

/**
 * STRATEGY (exemplo 3/3) — confirma presença por aproximação de
 * crachá NFC. Diferente das outras duas, mantém estado próprio (a
 * lista de crachás cadastrados) para localizar o crachá lido.
 */
class NfcCheckIn implements CheckInMethod
{
    /** @var Cracha[] */
    private $crachas;

    /**
     * @param Cracha[] $crachas
     */
    public function __construct(array $crachas)
    {
        $this->crachas = $crachas;
    }

    public function nome(): string
    {
        return 'NFC';
    }

    public function confirmarPresenca(Inscricao $inscricao, array $payload): ResultadoCheckIn
    {
        $idLido = $payload['id_cracha'] ?? '';
        $aluno = $inscricao->getAluno();

        foreach ($this->crachas as $cracha) {
            if ($cracha->getIdCracha() === $idLido && $cracha->estaAtivo() && $cracha->pertenceA($aluno)) {
                $presenca = new Presenca(date('H:i'), $this->nome(), 'leitor NFC');

                return ResultadoCheckIn::sucesso('Presença confirmada via crachá NFC.', $presenca);
            }
        }

        return ResultadoCheckIn::falha('Crachá NFC não reconhecido para este aluno.');
    }
}
