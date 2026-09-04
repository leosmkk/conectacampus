<?php

/**
 * Demo.php — trabalho de Design Patterns (Opção 01) do ConectaCampus.
 *
 * Roda sem nenhuma dependência externa:
 *     php design-patterns/Demo.php
 *
 * Para ver a variabilidade da linha de produto em ação (bloco 4), rode
 * trocando as variáveis de ambiente, por exemplo:
 *     CHECKIN_METHOD=nfc CERTIFICADO_TEMPLATE=empresa php design-patterns/Demo.php
 *
 * Veja design-patterns/README.md para o mapeamento completo entre
 * padrão, arquivo e requisito do trabalho.
 */

require __DIR__ . '/autoload.php';

use ConectaCampus\Domain\Aluno;
use ConectaCampus\Domain\CentroAcademico;
use ConectaCampus\Domain\Certificado;
use ConectaCampus\Domain\Cracha;
use ConectaCampus\Domain\Evento;
use ConectaCampus\Domain\Modulo;
use ConectaCampus\Domain\Palestrante;
use ConectaCampus\Domain\Presenca;
use ConectaCampus\Domain\Tenant;
use ConectaCampus\Patterns\Singleton\ConnectionFactory;
use ConectaCampus\Patterns\Singleton\VariabilityConfig;
use ConectaCampus\Patterns\Strategy\CheckInContext;
use ConectaCampus\Patterns\Strategy\CheckInMethodFactory;
use ConectaCampus\Patterns\Strategy\ManualCheckIn;
use ConectaCampus\Patterns\Strategy\NfcCheckIn;
use ConectaCampus\Patterns\Strategy\QrCodeCheckIn;
use ConectaCampus\Patterns\TemplateMethod\GeradorAssociacao;
use ConectaCampus\Patterns\TemplateMethod\GeradorEmpresa;
use ConectaCampus\Patterns\TemplateMethod\GeradorUniversidade;

function titulo(string $texto): void
{
    echo "\n=== {$texto} ===\n";
}

// =====================================================================
// BLOCO 0 — Domínio: as classes principais sobre as quais os padrões
// vão operar (nada de arrays soltos representando aluno/evento/etc).
// =====================================================================
titulo('BLOCO 0 — Domínio');

$geo = new Modulo('geo', 'Geolocalização', 'Restringe check-in por proximidade do local', true);
$qrcode = new Modulo('qrcode', 'Check-in por QR Code', 'Habilita confirmação de presença via QR Code', true);
$advReports = new Modulo('advReports', 'Relatórios avançados', 'Painéis gerenciais de participação', true);
$dualSignature = new Modulo('dualSignature', 'Dupla assinatura', 'Aprovação de certificado em duas etapas', false);
$customField = new Modulo('customField', 'Campo personalizado', 'Campo extra configurável no cadastro', true);

$tenant = new Tenant('universidade-vale-verde', 'Universidade Vale Verde', '#0F8A6B');
foreach ([$geo, $qrcode, $advReports, $dualSignature, $customField] as $modulo) {
    $tenant->adicionarModulo($modulo);
}

echo "Tenant: {$tenant->getNome()}\n";
echo 'Módulos ativos: ' . implode(', ', array_map(function (Modulo $m) {
    return $m->getNome();
}, $tenant->modulosAtivos())) . "\n";
echo 'Possui QR Code? ' . ($tenant->possuiModulo('qrcode') ? 'sim' : 'não') . "\n";
echo 'Possui dupla assinatura? ' . ($tenant->possuiModulo('dualSignature') ? 'sim' : 'não') . "\n";

$centro = new CentroAcademico(
    'ca-1',
    'Centro Acadêmico de Engenharia de Software',
    'ca.eng.software@valeverde.edu',
    '(11) 4000-1000',
    'Mariana Alves',
    'Pedro Rocha',
    18,
    '2025-2026'
);

$palestrante = new Palestrante(
    'pal-1',
    'Dra. Camila Torres',
    'camila.torres@convidados.edu',
    '(11) 4000-2000',
    'Arquitetura de Software',
    'Doutora',
    'Instituto Federal do Vale',
    'Pesquisadora em linhas de produto de software e reúso.'
);

$joao = new Aluno('al-1', 'João da Silva', 'joao.silva@valeverde.edu', '(11) 90000-0001', '2023011234', 'Engenharia de Software', 6);
$maria = new Aluno('al-2', 'Maria Souza', 'maria.souza@valeverde.edu', '(11) 90000-0002', '2023011235', 'Engenharia de Software', 4);
$pedro = new Aluno('al-3', 'Pedro Lima', 'pedro.lima@valeverde.edu', '(11) 90000-0003', '2022011050', 'Ciência da Computação', 8);

$evento = new Evento(
    'evt-1',
    'Semana de Engenharia de Software',
    'Congresso',
    '12 de setembro',
    '19:00',
    'Auditório Central',
    20,
    2, // vagasTotal: só 2, de propósito, para provar a regra de lotação
    $centro->getNome(),
    $palestrante
);

echo "\nEvento: {$evento->getTitulo()} ({$evento->getCargaHoraria()}h) — vagas: {$evento->getVagasTotal()}\n";

$inscricaoJoao = $evento->inscrever($joao);
echo "- {$joao->descricaoCurta()} inscrito. Token: {$inscricaoJoao->getToken()}\n";

$inscricaoMaria = $evento->inscrever($maria);
echo "- {$maria->descricaoCurta()} inscrita. Token: {$inscricaoMaria->getToken()}\n";

try {
    $evento->inscrever($pedro);
} catch (RuntimeException $e) {
    echo "- Inscrição de {$pedro->getNome()} recusada: {$e->getMessage()}\n";
}

echo "Vagas restantes: {$evento->vagasRestantes()} | Status: {$evento->status()}\n";

// =====================================================================
// BLOCO 1 — SINGLETON (2 exemplos)
// =====================================================================
titulo('BLOCO 1 — Singleton');

$config1 = VariabilityConfig::getInstance();
$config2 = VariabilityConfig::getInstance();

echo 'VariabilityConfig::getInstance() #1 -> id ' . spl_object_id($config1) . "\n";
echo 'VariabilityConfig::getInstance() #2 -> id ' . spl_object_id($config2) . "\n";
echo 'São a mesma instância? ' . ($config1 === $config2 ? 'Sim' : 'Não') . "\n";
echo "Tenant ativo: {$config1->getTenant()} | Check-in: {$config1->getCheckInMethod()} | Template de certificado: {$config1->getCertificadoTemplate()}\n";

$conn1 = ConnectionFactory::getInstance();
$conn2 = ConnectionFactory::getInstance();

echo "\nConnectionFactory::getInstance() #1 -> id " . spl_object_id($conn1) . "\n";
echo 'ConnectionFactory::getInstance() #2 -> id ' . spl_object_id($conn2) . "\n";
echo 'São a mesma instância? ' . ($conn1 === $conn2 ? 'Sim' : 'Não') . "\n";

$pdo = $conn1->getConnection();
if ($conn1->estaConectado()) {
    echo "Conexão estabelecida com {$conn1->getDsn()}\n";
} else {
    echo "Conexão indisponível neste ambiente ({$conn1->getDsn()}): {$conn1->getErro()}\n";
    echo "(esperado nesta máquina de demonstração — o importante é que o Singleton não quebrou o script)\n";
}

// =====================================================================
// BLOCO 2 — TEMPLATE METHOD (3 exemplos)
// =====================================================================
titulo('BLOCO 2 — Template Method');

// Presença registrada manualmente aqui só para o certificado poder ser
// emitido neste bloco; o Bloco 3 mostra o registro "de verdade" via Strategy.
$inscricaoJoao->registrarPresenca(new Presenca(date('H:i'), 'Template Method demo', 'Secretaria Acadêmica'));

$certificado = new Certificado(
    'EVT1-JOAO',
    $inscricaoJoao,
    $evento->getCargaHoraria(),
    date('d/m/Y'),
    'Secretaria Acadêmica',
    'Gerência de RH'
);

$geradores = [
    'Universidade' => new GeradorUniversidade(),
    'Empresa' => new GeradorEmpresa(),
    'Associação' => new GeradorAssociacao(),
];

foreach ($geradores as $rotulo => $gerador) {
    echo "\n--- Gerador: {$rotulo} ---\n";
    echo $gerador->gerar($certificado) . "\n";
}

// =====================================================================
// BLOCO 3 — STRATEGY (3 exemplos)
// =====================================================================
titulo('BLOCO 3 — Strategy');

$crachaJoao = new Cracha('NFC-001', $joao, true);
$crachaMaria = new Cracha('NFC-002', $maria, true);

$context = new CheckInContext(new QrCodeCheckIn());

echo "Método atual do contexto: {$context->getMetodoAtual()}\n";

$r1 = $context->executar($inscricaoJoao, ['token' => $inscricaoJoao->getToken()]);
echo '- QR Code (João, token correto): ' . ($r1->foiBemSucedido() ? 'OK' : 'FALHA') . " — {$r1->getMensagem()}\n";

$r2 = $context->executar($inscricaoMaria, ['token' => 'TOKEN-ERRADO']);
echo '- QR Code (Maria, token errado): ' . ($r2->foiBemSucedido() ? 'OK' : 'FALHA') . " — {$r2->getMensagem()}\n";

$context->setMetodo(new ManualCheckIn());
echo "\nMétodo atual do contexto: {$context->getMetodoAtual()}\n";

$r3 = $context->executar($inscricaoJoao, ['confirmado_por' => 'Centro Acadêmico']);
echo '- Manual (João, operador informado): ' . ($r3->foiBemSucedido() ? 'OK' : 'FALHA') . " — {$r3->getMensagem()}\n";

$r4 = $context->executar($inscricaoMaria, ['confirmado_por' => '']);
echo '- Manual (Maria, sem operador): ' . ($r4->foiBemSucedido() ? 'OK' : 'FALHA') . " — {$r4->getMensagem()}\n";

$context->setMetodo(new NfcCheckIn([$crachaJoao, $crachaMaria]));
echo "\nMétodo atual do contexto: {$context->getMetodoAtual()}\n";

$r5 = $context->executar($inscricaoJoao, ['id_cracha' => 'NFC-001']);
echo '- NFC (João, crachá correto): ' . ($r5->foiBemSucedido() ? 'OK' : 'FALHA') . " — {$r5->getMensagem()}\n";

$r6 = $context->executar($inscricaoMaria, ['id_cracha' => 'NFC-999']);
echo '- NFC (Maria, crachá desconhecido): ' . ($r6->foiBemSucedido() ? 'OK' : 'FALHA') . " — {$r6->getMensagem()}\n";

echo "\nTotal de presentes confirmados no evento: {$evento->totalPresentes()}\n";

// =====================================================================
// BLOCO 4 — Integração: a LPS escolhendo o algoritmo e o template
// =====================================================================
titulo('BLOCO 4 — Integração com a variabilidade da LPS');

$config = VariabilityConfig::getInstance();
$metodoDaConfig = CheckInMethodFactory::apartirDaConfiguracao($config, [$crachaJoao, $crachaMaria]);

echo "CHECKIN_METHOD atual: {$config->getCheckInMethod()} -> estratégia resolvida: {$metodoDaConfig->nome()}\n";

$geradorPorTemplate = [
    'universidade' => $geradores['Universidade'],
    'empresa' => $geradores['Empresa'],
    'associacao' => $geradores['Associação'],
];
$templateAtual = $config->getCertificadoTemplate();
$geradorEscolhido = $geradorPorTemplate[$templateAtual] ?? $geradores['Universidade'];

echo "CERTIFICADO_TEMPLATE atual: {$templateAtual} -> gerador resolvido: " . get_class($geradorEscolhido) . "\n";
echo "\nCertificado emitido com o gerador escolhido pela configuração:\n";
echo $geradorEscolhido->gerar($certificado) . "\n";

echo "\nExperimente rodar novamente com:\n";
echo "  CHECKIN_METHOD=nfc CERTIFICADO_TEMPLATE=empresa php design-patterns/Demo.php\n";
echo "para ver o Bloco 4 escolher outra estratégia e outro gerador sem alterar uma linha de código.\n";
