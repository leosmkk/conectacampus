# Prompts utilizados

### Criação do Frontend

Crie um protótipo web interativo (HTML/CSS/JS) chamado "ConectaCampus" — uma plataforma
multi-tenant de gestão de eventos acadêmicos.

MARCA: genérica, sem nenhuma associação com universidade real. Nome do produto:
"ConectaCampus".

TRÊS CLIENTES FICTÍCIOS (tenants), cada um com cor e logo próprios:
 1.⁠ ⁠Instituto Nortech — cor #B4234B (rosa/vinho), logo: um "N" minimalista em traço.
 2.⁠ ⁠Universidade Vale Verde — cor #0F8A6B (verde), logo: silhueta de montanhas/vale.
 3.⁠ ⁠Centro Universitário Ábaco — cor #6D28D9 (violeta), logo: contas de ábaco (bolinhas
em duas hastes horizontais).

ESTILO DE HEADER:
•⁠  ⁠Barra sólida, grossa (~72px), na COR DO TENANT selecionado (não branca) — a cor muda
dinamicamente ao trocar de cliente.
•⁠  ⁠Logo do cliente numa badge branca arredondada, bem à esquerda, ícone colorido na cor
do tenant dentro da badge branca.
•⁠  ⁠Nome do cliente ao lado do logo, texto branco, bold.
•⁠  ⁠Logo em seguida (mesma linha, mesma altura do header): abas de navegação em texto
branco, com sublinhado colorido (branco) na aba ativa — sem fundo/pill, só texto +
sublinhado, como abas de sistema.
•⁠  ⁠No canto direito do mesmo header: dois seletores translúcidos (fundo branco 15%
opacidade) — um pra trocar de tenant (simulador) e outro pra trocar de perfil de
usuário (Aluno / Centro Acadêmico / Universidade / Palestrante).

CONTEÚDO: fonte Manrope (títulos) + Inter (corpo). Fundo da página neutro claro
(#F4F3FA). Cards brancos com cantos arredondados (20px) e sombra suave. Nada de
emoji nos ícones — usar ícones em SVG line/stroke, estilo minimalista (tipo Heroicons
outline).

LÓGICA DE VARIABILIDADE (isso é o coração do protótipo):
•⁠  ⁠Cada tenant tem flags de módulo: geo (geolocalização), qrcode (validação de presença),
advReports (filtros avançados de relatório), dualSignature (certificado com aprovação
em duas etapas), customField (campo extra no cadastro de evento).
•⁠  ⁠Nortech: todos os módulos desligados (plano básico).
•⁠  ⁠Vale Verde: geo e customField ligados.
•⁠  ⁠Ábaco: geo, qrcode, advReports e dualSignature ligados.
•⁠  ⁠Trocar de tenant no seletor do header muda a cor, o logo e os módulos ativos
instantaneamente.
•⁠  ⁠Trocar de perfil no seletor muda os itens de navegação disponíveis.
•⁠  ⁠Itens de navegação que dependem de um módulo desligado aparecem com um ícone de
cadeado e, ao clicar, mostram um estado "recurso não incluído neste plano" em vez
da tela normal.

AS 13 TELAS (cada uma reage ao tenant/perfil ativo):
 1.⁠ ⁠Login — núcleo, igual pra todos, mas com o logo/cor do tenant.
 2.⁠ ⁠Cadastro de aluno — núcleo.
 3.⁠ ⁠Minha conta — campos mudam conforme o perfil logado (aluno vê matrícula/curso;
centro acadêmico vê presidente/integrantes; universidade vê CNPJ/responsável;
palestrante vê área de atuação).
 4.⁠ ⁠Home/painel do aluno — card de destaque com a cor e o logo do tenant (whitelabel).
 5.⁠ ⁠Agenda de eventos — núcleo, com filtros (inscrito/vagas/lotados/todos).
 6.⁠ ⁠Detalhe do evento — mostra mapa (Google Maps) só se o módulo "geo" estiver ativo;
senão mostra só o endereço em texto.
 7.⁠ ⁠Certificados — fluxo padrão (botão "gerar certificado") ou, se "dualSignature"
ativo, mostra um stepper de 3 etapas (Centro Acadêmico confirma → Reitoria assina
→ aluno baixa).
 8.⁠ ⁠Cadastrar evento (perfil Centro Acadêmico) — formulário padrão + campo extra
"empresa parceira/patrocinadora" só se "customField" ativo.
 9.⁠ ⁠Validar presença via QR Code (perfil Centro Acadêmico) — tela de leitura funcional
se "qrcode" ativo; senão, tela de "recurso bloqueado".
10.⁠ ⁠Relatórios gerenciais — filtro de período sempre visível; filtros de usuário e
status só aparecem se "advReports" ativo.
11.⁠ ⁠Aprovação da Reitoria (perfil Universidade) — tela EXCLUSIVA, só existe/aparece no
menu quando "dualSignature" está ativo (ou seja, só pro cliente Ábaco por padrão).
12.⁠ ⁠Central de módulos (perfil Universidade) — tela com toggles (switches) para cada
um dos 5 módulos acima; ao ligar/desligar, as outras telas e o menu devem reagir
em tempo real (é a materialização visual do conceito de feature flag).
13.⁠ ⁠Painel do palestrante — tela simples mostrando só os próprios eventos e local no
mapa, demonstrando menu restrito por perfil.

Entregar como um único arquivo HTML/CSS/JS autocontido, sem frameworks pesados.