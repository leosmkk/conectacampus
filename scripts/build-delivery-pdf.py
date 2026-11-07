"""python3 scripts/build-delivery-pdf.py --output /caminho/entrega.pdf

Requer reportlab. Usa docs/arc42.md, links.json, canvas.md, video.md e prints locais.
"""
import argparse
import json
import math
import re
from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, Image, Flowable, KeepTogether

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--output', required=True)
args = parser.parse_args()
out = Path(args.output)
out.parent.mkdir(parents=True, exist_ok=True)
W = A4[0] - 88
GREEN = colors.HexColor('#0f6e5a')
INK = colors.HexColor('#202939')
MUTED = colors.HexColor('#596579')
PALE = colors.HexColor('#edf5f2')
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='Body', fontName='Helvetica', fontSize=10, leading=15, textColor=INK, spaceAfter=9))
styles.add(ParagraphStyle(name='SmallText', parent=styles['Body'], fontSize=8.5, leading=12))
styles.add(ParagraphStyle(name='Hero', parent=styles['Title'], fontSize=34, leading=39, textColor=GREEN, alignment=0, spaceAfter=20))
styles.add(ParagraphStyle(name='Section', fontName='Helvetica-Bold', fontSize=16, leading=21, textColor=GREEN, spaceBefore=16, spaceAfter=10, keepWithNext=True))
styles.add(ParagraphStyle(name='Subtitle2', parent=styles['Body'], fontSize=13, leading=19, textColor=MUTED))
styles.add(ParagraphStyle(name='DiagramText', parent=styles['SmallText'], alignment=TA_CENTER, fontSize=8, leading=11, textColor=INK))

def markup(text):
    text = escape(text)
    text = re.sub(r'(https://[^\s]+)', lambda match: f'<link color="#0f6e5a" href="{match.group(1).rstrip(".")}">{match.group(1).rstrip(".")}</link>' + ('.' if match.group(1).endswith('.') else ''), text)
    return text

def paragraph(text, style='Body'):
    return Paragraph(markup(text), styles[style])

def table(rows, widths=None):
    data = [[paragraph(str(value), 'SmallText') for value in row] for row in rows]
    result = Table(data, colWidths=widths or [145, W-145], hAlign='LEFT', repeatRows=1)
    result.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PALE), ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 10), ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 9), ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
        ('LINEBELOW', (0, 0), (-1, -1), .4, colors.HexColor('#d8e2df'))
    ]))
    return result

def markdown(path):
    blocks = []
    pending = []
    def flush():
        if pending:
            blocks.append(paragraph(' '.join(pending)))
            pending.clear()
    for line in path.read_text().splitlines():
        if not line.strip(): flush()
        elif line.startswith('# '):
            flush()
        elif line.startswith('## '):
            flush()
            blocks.append(paragraph(line[3:], 'Section'))
        elif re.match(r'^\d+\. ', line):
            flush()
            blocks.append(paragraph(line))
        else: pending.append(line)
    flush()
    return blocks

class Diagram(Flowable):
    def __init__(self, nodes, edges, height=480):
        super().__init__()
        self.width, self.height = W, height
        self.nodes, self.edges = nodes, edges

    def draw(self):
        canvas = self.canv
        positions = {}
        for key, (x, y, width, height, label) in self.nodes.items():
            positions[key] = (x*W, y*self.height, width*W, height, label)
        for start, end, label in self.edges:
            a, b = positions[start], positions[end]
            ax, ay = a[0]+a[2]/2, a[1]+a[3]/2
            bx, by = b[0]+b[2]/2, b[1]+b[3]/2
            dx, dy = bx-ax, by-ay
            def offset(rect):
                return min(rect[2]/2/abs(dx) if dx else math.inf, rect[3]/2/abs(dy) if dy else math.inf)
            af, bf = offset(a), offset(b)
            x1, y1 = ax+af*dx, ay+af*dy
            x2, y2 = bx-bf*dx, by-bf*dy
            canvas.setStrokeColor(MUTED)
            canvas.setLineWidth(.9)
            canvas.line(x1, y1, x2, y2)
            angle = math.atan2(y2-y1, x2-x1)
            for delta in [-.45, .45]:
                canvas.line(x2, y2, x2-6*math.cos(angle+delta), y2-6*math.sin(angle+delta))
            if label:
                midx, midy = (x1+x2)/2, (y1+y2)/2
                canvas.setFont('Helvetica', 7)
                tw = canvas.stringWidth(label, 'Helvetica', 7)
                canvas.setFillColor(colors.white)
                canvas.rect(midx-tw/2-3, midy-1, tw+6, 11, stroke=0, fill=1)
                canvas.setFillColor(MUTED)
                canvas.drawCentredString(midx, midy+2, label)
        for x, y, width, height, label in positions.values():
            canvas.setStrokeColor(GREEN)
            canvas.setFillColor(PALE)
            canvas.roundRect(x, y, width, height, 9, stroke=1, fill=1)
            text = Paragraph(label, styles['DiagramText'])
            _, ph = text.wrap(width-12, height-8)
            text.drawOn(canvas, x+6, y+(height-ph)/2)

def diagram_page(title, subtitle, nodes, edges, note):
    story.extend([PageBreak(), paragraph(title, 'Section'), paragraph(subtitle), Diagram(nodes, edges), paragraph(note, 'SmallText')])

links = json.loads((ROOT/'docs/links.json').read_text())
story = [Spacer(1, 48), paragraph('ConectaCampus', 'Hero'), paragraph('Arquitetura distribuída', 'Subtitle2'),
         paragraph('PJBL | Entrega 3 | 26 de outubro de 2026', 'Subtitle2'), Spacer(1, 28),
         paragraph('ARC42, C4, Architecture Canvas e evidências', 'Section'),
         paragraph('Implementação publicada no GitHub. A conclusão da entrega depende de implantação cloud, imagens Docker Hub, evidências públicas e vídeo do grupo.'),
         Spacer(1, 12), table([['Validação', 'Estado'], ['Testes locais e componentes', 'Aprovados'], ['Interface desktop e móvel', 'Aprovada em três testes de navegador'], ['Compilação React e Bicep', 'Aprovadas'], ['Auditoria de dependências', 'Sem alertas'], ['Integração real', links['status']['realInfrastructureIntegration']], ['Cloud, Docker Hub e vídeo', 'Pendentes']]),
         Spacer(1, 24), paragraph('Equipe', 'Section'), paragraph((ROOT/'GRUPO.md').read_text().strip().replace('\n\n', ', ')),
         PageBreak()]
story.extend(markdown(ROOT/'docs/arc42.md'))

diagram_page('C4: contexto', 'Nível 1. Pessoas, sistema e dependências externas.', {
    'person': (.3,.83,.4,60,'<b>Estudantes e organizadores</b><br/>[Pessoa]<br/>Agenda e certificados'),
    'system': (.3,.52,.4,75,'<b>ConectaCampus</b><br/>[Sistema]<br/>Eventos e certificados acadêmicos'),
    'mongo': (.01,.12,.29,70,'<b>MongoDB Atlas</b><br/>[Sistema externo]<br/>Dados de eventos'),
    'sql': (.355,.12,.29,70,'<b>Azure SQL</b><br/>[Sistema externo]<br/>Certificados e outbox'),
    'azure': (.70,.12,.29,70,'<b>Azure Functions e Storage</b><br/>[Sistema externo]<br/>Cálculo e mensageria')
}, [('person','system','HTTPS'),('system','mongo','Persistencia'),('system','sql','Persistencia'),('system','azure','HTTP e mensagens')], 'Escopo funcional: eventos e certificados. A infraestrutura Azure é planejada, ainda sem URL de produção validada.')

diagram_page('C4: containers', 'Nível 2. Chamadas síncronas e processamento assíncrono.', {
    'browser': (.0,.84,.27,48,'<b>Navegador</b><br/>[Cliente]'),
    'gateway': (.365,.84,.27,48,'<b>API Gateway</b><br/>[Nginx]'),
    'frontend': (.73,.84,.27,48,'<b>Microfrontend</b><br/>[React SPA]'),
    'bff': (.365,.64,.27,52,'<b>BFF</b><br/>[Node.js / Express]'),
    'eventos': (.0,.42,.27,58,'<b>Eventos</b><br/>[Node.js]<br/>CRUD MongoDB'),
    'certs': (.365,.42,.27,58,'<b>Certificados</b><br/>[Node.js]<br/>CRUD e publicador'),
    'function': (.73,.42,.27,58,'<b>Azure Functions</b><br/>[Node.js]<br/>HTTP e Queue Trigger'),
    'mongo': (.0,.17,.27,54,'<b>MongoDB Atlas</b><br/>[Banco de eventos]'),
    'sql': (.365,.17,.27,54,'<b>Azure SQL</b><br/>[Banco e outbox]'),
    'queue': (.73,.17,.27,54,'<b>Queue Storage</b><br/>[Fila campus-events]'),
    'table': (.73,.0,.27,44,'<b>Table Storage</b><br/>[Ledger]')
}, [('browser','gateway','HTTPS /api'),('gateway','frontend','SPA'),('gateway','bff','Proxy /api'),('bff','eventos','HTTP + token'),('bff','certs','HTTP + token'),('bff','function','HTTP + chave'),('eventos','mongo','Driver'),('certs','sql','TDS / TLS'),('certs','queue','Publica'),('queue','function','Trigger'),('function','table','Deduplica')], 'O código React roda no navegador e chama /api no gateway. Na nuvem, somente o gateway tem ingress público entre os containers. A Function HTTP usa chave de acesso.')

diagram_page('C4: componentes', 'Nível 3. Interior do microserviço de certificados.', {
    'api': (.0,.81,.28,60,'<b>API Express</b><br/>[Componente]<br/>Rotas e Swagger'),
    'slices': (.36,.81,.29,60,'<b>Application slices</b><br/>Create, Get, List,<br/>Update e Delete'),
    'domain': (.73,.81,.27,60,'<b>Domain</b><br/>[Componente]<br/>Validação e contrato'),
    'repo': (.36,.50,.29,68,'<b>SqlRepository</b><br/>[Adapter]<br/>Porta injetada nos slices'),
    'sql': (.0,.50,.28,68,'<b>Azure SQL</b><br/>[Externo]<br/>Certificate + Outbox'),
    'pub': (.73,.50,.27,68,'<b>PublishEvents</b><br/>[Componente]<br/>Lê pendentes e envia'),
    'queue': (.73,.20,.27,60,'<b>Queue Storage</b><br/>[Externo]<br/>campus-events'),
    'function': (.36,.20,.29,60,'<b>Queue Trigger</b><br/>[Externo]<br/>ProcessEvent'),
    'ledger': (.0,.20,.28,60,'<b>TableLedger</b><br/>[Externo]<br/>Chave única de evento')
}, [('api','slices','Invoca'),('slices','domain','Valida'),('slices','repo','Repository'),('repo','sql','Transacao'),('pub','repo','Pendentes'),('pub','queue','Envia base64'),('queue','function','Mensagem'),('function','ledger','Registra')], 'O publicador confirma publishedAt depois do envio. Uma falha intermediária gera reentrega. O consumidor trata conflito de chave como duplicata. A consistência é eventual.')

story.extend([PageBreak(), paragraph('Architecture Canvas', 'Section')])
canvas_rows = []
for line in (ROOT/'docs/canvas.md').read_text().splitlines():
    if line.startswith('|') and not line.startswith('| ---'):
        canvas_rows.append([cell.strip() for cell in line.strip('|').split('|')])
story.append(table(canvas_rows))
story.extend([PageBreak(), paragraph('Links e estado da entrega', 'Section')])
rows = [['Destino', 'Link ou estado']]
rows.extend([[key, url] for key, url in links['repositories'].items()])
rows.append(['Integração', links['integrationBranch']])
if links.get('pullRequest'): rows.append(['Proposta de alteração', links['pullRequest']])
if links.get('ciRun'): rows.append(['Pipeline', links['ciRun']])
for key in ['dockerHub','frontend','gateway','swaggerBff','swaggerMongo','swaggerSqlAndEvents','youtube']:
    rows.append([key, links.get(key) or 'Pendente de publicação e validação'])
story.append(table(rows))
story.extend([Spacer(1, 16), paragraph('Caminhos após a publicação', 'Section'), paragraph('No gateway público: /api/docs/ para BFF, /api/docs/?url=/api/specs/eventos para Mongo e /api/docs/?url=/api/specs/certificados para SQL e eventos. O contrato assíncrono está em docs/asyncapi.yaml.')])

for title, filename, caption in [
    ('Frontend em funcionamento', 'frontend-local.png', 'Prévia local em memória. Não comprova implantação cloud.'),
    ('CRUD de certificados', 'certificados-local.png', 'Prévia local após emissão. O teste de navegador verificou criação, alteração, download e exclusão.'),
    ('Swagger BFF', 'swagger-bff-local.png', 'Captura local da documentação de agregação e CRUD.'),
    ('Swagger microserviço MongoDB', 'swagger-eventos-local.png', 'Captura local pelo BFF. Integração real aprovada no pipeline GitHub Actions.'),
    ('Swagger microserviço SQL e eventos', 'swagger-certificados-local.png', 'Captura local do contrato do serviço SQL e endpoint de eventos.')
]:
    path = ROOT/'docs/evidence'/filename
    if not path.exists(): continue
    image = Image(str(path))
    ratio = min(W/image.imageWidth, 610/image.imageHeight)
    image.drawWidth, image.drawHeight = image.imageWidth*ratio, image.imageHeight*ratio
    story.extend([PageBreak(), paragraph(title, 'Section'), paragraph(caption, 'SmallText'), Spacer(1, 10), image])

story.extend([PageBreak(), paragraph('Vídeo e conclusão da entrega', 'Section'), paragraph('Publicação pendente. O vídeo deve ser não listado e mostrar URLs cloud. Cada integrante precisa gravar sua fala real.'), *markdown(ROOT/'docs/video.md'),
    paragraph('Evidências ainda necessárias', 'Section'), paragraph('Print do API Gateway no Azure, frontend cloud, Swagger cloud, imagens publicadas no Docker Hub e link YouTube. Atualize docs/links.json, substitua as capturas locais por evidências públicas e regenere o PDF após a verificação final.')])

def page_decoration(canvas, doc):
    canvas.setStrokeColor(colors.HexColor('#d8e2df'))
    canvas.line(44, 38, A4[0]-44, 38)
    canvas.setFillColor(MUTED)
    canvas.setFont('Helvetica', 8)
    canvas.drawString(44, 25, 'ConectaCampus | PJBL | Documentação técnica')
    canvas.drawRightString(A4[0]-44, 25, str(doc.page))

SimpleDocTemplate(str(out), pagesize=A4, rightMargin=44, leftMargin=44, topMargin=40, bottomMargin=52,
                  title='ConectaCampus PJBL: ARC42, C4 e Canvas', author='Grupo ConectaCampus').build(story, onFirstPage=page_decoration, onLaterPages=page_decoration)
print(f'PDF criado: {out}')
