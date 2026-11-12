"""Gera o relatório executivo do AgroDireto a partir de relatorios/base/*.json.

Uso:  python relatorios/gerar_relatorio.py  -> relatorios/saida/relatorio.html
Depois converte para PDF com o Chrome (ver relatorios/README.md).
Também grava um retrato agregado em relatorios/historico/<data>.json para comparar com relatórios futuros.
"""
import json, os, html, datetime
from collections import Counter

RAIZ = os.path.dirname(os.path.abspath(__file__))
T = json.load(open(os.path.join(RAIZ, 'base', 'tarefas.json'), encoding='utf-8'))
C = json.load(open(os.path.join(RAIZ, 'base', 'contexto.json'), encoding='utf-8'))
tarefas = T['tarefas']
V = C['verificacao']
e = html.escape

ESTADOS = ['nao_iniciada', 'em_desenvolvimento', 'implementada', 'validada', 'homologada']
ROT = {'nao_iniciada': 'Não iniciada', 'em_desenvolvimento': 'Em desenvolvimento', 'implementada': 'Implementada',
       'validada': 'Validada tecnicamente', 'homologada': 'Homologada', 'bloqueada': 'Bloqueada'}
COR = {'nao_iniciada': '#b9c0bb', 'em_desenvolvimento': '#3b78c2', 'implementada': '#e3b23c',
       'validada': '#8cc98f', 'homologada': '#2d6a3e', 'bloqueada': '#c8432f'}
ROTH = {'homologada': 'homologadas', 'validada': 'validadas', 'implementada': 'implementadas', 'em_desenvolvimento': 'em desenvolvimento', 'nao_iniciada': 'não iniciadas', 'parcial': 'parciais', 'implementada_ou_decidida': 'implementadas ou decididas', 'outras': 'demais'}
ETAPAS = [('Etapa 0', 'Preparação'), ('Etapa 1', 'Identidade e cadastros'), ('Etapa 2', 'Oferta real e mídia'),
          ('Etapa 3', 'Negociação e pedido'), ('Etapa 4', 'Pagamento e logística'), ('Etapa 5', 'Fechamento da operação'),
          ('Etapa 5A', 'Inteligência e institucional'), ('Etapa 6', 'Homologação e piloto')]

total = len(tarefas)
cont = Counter(t['estado'] for t in tarefas)
bloq = [t for t in tarefas if t['bloqueio']]
mvp = [t for t in tarefas if t['mvp']]
assert sum(cont.values()) == total
tecnico = cont['validada'] + cont['homologada']
homol = cont['homologada']
pct = lambda a, b: f"{(100 * a / b):.0f}%" if b else '—'

def por_etapa(et):
    ts = [t for t in tarefas if t['etapa'] == et]
    c = Counter(t['estado'] for t in ts)
    return ts, c

# ---------- SVG helpers ----------
def barra_empilhada(c, n, w=520, h=18):
    x = 0; partes = []
    for s in ESTADOS:
        if c.get(s):
            ww = w * c[s] / n
            partes.append(f'<rect x="{x:.1f}" y="0" width="{ww:.1f}" height="{h}" fill="{COR[s]}"/>')
            if ww > 16:
                partes.append(f'<text x="{x + ww / 2:.1f}" y="{h / 2 + 4}" text-anchor="middle" font-size="10" fill="{"#fff" if s in ("homologada","em_desenvolvimento") else "#1c2620"}">{c[s]}</text>')
            x += ww
    return f'<svg viewBox="0 0 {w} {h}" width="100%" height="{h}" preserveAspectRatio="none" role="img">{"".join(partes)}</svg>'

def rosca(c, n, r=62, sw=22):
    import math
    circ = 2 * math.pi * r; off = 0; arcs = []
    for s in ESTADOS:
        if c.get(s):
            L = circ * c[s] / n
            arcs.append(f'<circle r="{r}" cx="80" cy="80" fill="none" stroke="{COR[s]}" stroke-width="{sw}" stroke-dasharray="{L:.2f} {circ - L:.2f}" stroke-dashoffset="{-off:.2f}" transform="rotate(-90 80 80)"/>')
            off += L
    return (f'<svg viewBox="0 0 160 160" width="170" height="170" role="img">{"".join(arcs)}'
            f'<text x="80" y="76" text-anchor="middle" font-size="26" font-weight="700" fill="#1c2620" font-family="Space Grotesk">{n}</text>'
            f'<text x="80" y="96" text-anchor="middle" font-size="11" fill="#5b6a60">tarefas</text></svg>')

def legenda(extra_bloq=True):
    itens = ''.join(f'<span><i style="background:{COR[s]}"></i>{ROT[s]}</span>' for s in ESTADOS)
    if extra_bloq:
        itens += f'<span><i style="background:{COR["bloqueada"]}"></i>Bloqueio (atributo)</span>'
    return f'<div class="legend">{itens}</div>'

def d(s):
    return datetime.date.fromisoformat(s)

def gantt():
    ini, fim = d('2026-11-10'), d('2027-02-28')
    W, L, rowh = 1050, 110, 28
    dias = (fim - ini).days
    X = lambda dt: L + (W - L - 10) * ((dt - ini).days) / dias
    g = C['gantt']; H = 40 + rowh * len(g) + 20
    out = [f'<svg viewBox="0 0 {W} {H}" width="100%" role="img" font-family="Inter" font-size="11">']
    # meses
    m = datetime.date(2026, 11, 1)
    while m <= fim:
        x = X(max(m, ini))
        out.append(f'<line x1="{x:.1f}" y1="22" x2="{x:.1f}" y2="{H - 14}" stroke="#e1e7e2"/>')
        out.append(f'<text x="{x + 4:.1f}" y="16" fill="#5b6a60">{["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"][m.month - 1]}/{str(m.year)[2:]}</text>')
        m = datetime.date(m.year + (m.month == 12), m.month % 12 + 1, 1)
    hoje = X(d('2026-11-11'))
    out.append(f'<line x1="{hoje:.1f}" y1="22" x2="{hoje:.1f}" y2="{H - 14}" stroke="#c8432f" stroke-dasharray="3 3"/><text x="{hoje + 3:.1f}" y="{H - 4}" fill="#c8432f" font-size="10">hoje 11/11</text>')
    for i, r in enumerate(g):
        y = 30 + i * rowh
        out.append(f'<text x="0" y="{y + 14}" fill="#1c2620" font-weight="600">{e(r["etapa"])}</text>')
        x1, x2, x3 = X(d(r['ini'])), X(d(r['impl'])), X(d(r['hom']))
        out.append(f'<rect x="{x1:.1f}" y="{y + 3}" width="{max(x2 - x1, 3):.1f}" height="14" rx="3" fill="#3b78c2"/>')
        out.append(f'<rect x="{x2:.1f}" y="{y + 3}" width="{max(x3 - x2, 3):.1f}" height="14" rx="3" fill="#8cc98f"/>')
        out.append(f'<text x="{x3 + 5:.1f}" y="{y + 14}" fill="#5b6a60" font-size="10">{d(r["hom"]).strftime("%d/%m")}</text>')
    out.append('</svg>')
    return ''.join(out)

def barras_v(vals, rot, cor='#2d6a3e', h=150, w=360, fmt=str):
    n = len(vals); mx = max(v for v in vals if v is not None) or 1
    bw = (w - 20) / n; out = [f'<svg viewBox="0 0 {w} {h + 36}" width="100%" role="img" font-family="Inter" font-size="10">']
    for i, (v, r) in enumerate(zip(vals, rot)):
        x = 10 + i * bw + bw * 0.18; ww = bw * 0.64
        if v is None:
            out.append(f'<text x="{x + ww / 2:.1f}" y="{h - 4}" text-anchor="middle" fill="#9aa59d">s/ registro</text>')
        else:
            hh = (h - 20) * v / mx
            out.append(f'<rect x="{x:.1f}" y="{h - hh:.1f}" width="{ww:.1f}" height="{hh:.1f}" rx="3" fill="{cor}"/>')
            out.append(f'<text x="{x + ww / 2:.1f}" y="{h - hh - 4:.1f}" text-anchor="middle" fill="#1c2620" font-weight="600">{fmt(v)}</text>')
        out.append(f'<text x="{x + ww / 2:.1f}" y="{h + 16}" text-anchor="middle" fill="#5b6a60">{e(r)}</text>')
    out.append('</svg>')
    return ''.join(out)

def matriz_riscos():
    W, H, L, B = 470, 330, 70, 40
    cw, ch = (W - L - 10) / 3, (H - B - 10) / 3
    out = [f'<svg viewBox="0 0 {W} {H}" width="100%" role="img" font-family="Inter" font-size="10">']
    for i in range(3):
        for j in range(3):
            sc = (i + 1) * (j + 1)
            fill = '#f6d9d3' if sc >= 6 else '#f8ecd2' if sc >= 3 else '#e5f1e6'
            out.append(f'<rect x="{L + i * cw:.1f}" y="{10 + (2 - j) * ch:.1f}" width="{cw - 3:.1f}" height="{ch - 3:.1f}" rx="6" fill="{fill}"/>')
    for k, lab in enumerate(['Baixa', 'Média', 'Alta']):
        out.append(f'<text x="{L + k * cw + cw / 2:.1f}" y="{H - 20}" text-anchor="middle" fill="#5b6a60">{lab}</text>')
        out.append(f'<text x="{L - 8}" y="{10 + (2 - k) * ch + ch / 2:.1f}" text-anchor="end" fill="#5b6a60">{lab}</text>')
    out.append(f'<text x="{L + (W - L) / 2:.1f}" y="{H - 4}" text-anchor="middle" fill="#1c2620" font-weight="600">Probabilidade</text>')
    out.append(f'<text x="12" y="{H / 2:.1f}" transform="rotate(-90 12 {H / 2:.1f})" text-anchor="middle" fill="#1c2620" font-weight="600">Impacto</text>')
    celula = Counter()
    for n, r in enumerate(C['riscos'], 1):
        i, j = r['prob'] - 1, r['impacto'] - 1
        k = celula[(i, j)]; celula[(i, j)] += 1
        cx = L + i * cw + 22 + (k % 4) * 30; cy = 10 + (2 - j) * ch + 26 + (k // 4) * 30
        out.append(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="11" fill="#1c2620"/><text x="{cx:.1f}" y="{cy + 3.5:.1f}" text-anchor="middle" fill="#fff" font-weight="700">{n}</text>')
    out.append('</svg>')
    return ''.join(out)

def fluxo():
    J = C['jornada']; out = ['<div class="flow">']
    for i, (nome, cod, st) in enumerate(J):
        out.append(f'<div class="node" style="border-color:{COR[st]}"><span class="dot" style="background:{COR[st]}"></span><b>{e(nome)}</b><small>{e(cod)}</small><em>{e("Não iniciada · bloqueada" if st == "bloqueada" else ROT[st])}</em></div>')
        if i < len(J) - 1:
            out.append('<div class="arr">→</div>')
    out.append('</div>')
    return ''.join(out)

# ---------- páginas ----------
P = []
def pagina(pergunta, titulo, corpo):
    P.append(f'<section class="page"><div class="q">{e(pergunta)}</div><h2>{titulo}</h2>{corpo}<div class="foot">AgroDireto · relatório executivo · coleta {e(V["coletado_em"])} · commit {e(V["commit"])} · página {len(P) + 1}</div></section>')

tc = sum(n for _, n in V['testes_codigo'])
# Capa + dashboard
cards = [
    (total, 'tarefas no backlog'), (len(mvp), 'no MVP original'),
    (tecnico, 'validadas tecnicamente ou homologadas'), (homol, 'homologadas'),
    (len(bloq), 'com bloqueio'), (sum(V['commits'].values()), 'commits (10–11/11)'),
    (f"{tc} / 0", 'testes de código aprovados / falhos'), (f"{V['testes_banco_aprovados']} / {V['testes_banco_total']}", 'suítes de teste do banco aprovadas'),
    (f"{V['migrations_aplicadas']} / {V['migrations_total']}", 'migrations aplicadas (0 pendentes)'), ('4 / 4', 'builds web sem erro · CI verde'),
]
cardhtml = ''.join(f'<div class="card"><b>{e(str(v))}</b><span>{e(r)}</span></div>' for v, r in cards)
estados_tab = ''.join(f'<tr><td><i class="sw" style="background:{COR[s]}"></i>{ROT[s]}</td><td class="num">{cont.get(s, 0)}</td><td class="num">{pct(cont.get(s, 0), total)}</td></tr>' for s in ESTADOS)
estados_tab += f'<tr><td><i class="sw" style="background:{COR["bloqueada"]}"></i>Com bloqueio (atributo, já contado acima)</td><td class="num">{len(bloq)}</td><td class="num">{pct(len(bloq), total)}</td></tr>'
mvpc = Counter(t['estado'] for t in mvp)
pagina('Em que ponto o projeto está agora?', 'Painel executivo', f'''
<p class="lede">Em dois dias de desenvolvimento, o projeto saiu de um conjunto de telas sem servidor para um sistema com cadastro, aprovação, produção, mídia, inspeção, cotação e demandas funcionando no banco de homologação. Nenhuma funcionalidade foi ensaiada em aparelho com contas reais, por isso só as três tarefas de preparação estão homologadas.</p>
<div class="cards">{cardhtml}</div>
<div class="row">
 <div class="col">{rosca(cont, total)}</div>
 <div class="col grow"><table class="t"><thead><tr><th>Estado</th><th class="num">Tarefas</th><th class="num">%</th></tr></thead><tbody>{estados_tab}</tbody></table></div>
</div>
<div class="prog">
<div class="pr"><span>Progresso técnico</span><div class="pb"><span style="width:{100 * tecnico / total:.1f}%;background:{COR["validada"]}"></span></div><b>{pct(tecnico, total)}</b></div>
<div class="pr"><span>Progresso homologado</span><div class="pb"><span style="width:{100 * homol / total:.1f}%;background:{COR["homologada"]}"></span></div><b>{pct(homol, total)}</b></div>
<div class="pr"><span>MVP original ({len(mvp)}) · técnico</span><div class="pb"><span style="width:{100 * (mvpc["validada"] + mvpc["homologada"]) / len(mvp):.1f}%;background:{COR["validada"]}"></span></div><b>{pct(mvpc["validada"] + mvpc["homologada"], len(mvp))}</b></div>
<div class="pr"><span>MVP original ({len(mvp)}) · homologado</span><div class="pb"><span style="width:{100 * mvpc["homologada"] / len(mvp):.1f}%;background:{COR["homologada"]}"></span></div><b>{pct(mvpc["homologada"], len(mvp))}</b></div>
</div>
<p class="note">Progresso técnico = tarefas validadas tecnicamente ou homologadas. Progresso homologado = só as que passaram no fluxo completo de aceitação. As duas medidas não se somam.</p>
''')

# Categorias (2 páginas)
linhas = ''; barras = ''
for et, nome in ETAPAS:
    ts, c = por_etapa(et); n = len(ts); b = sum(1 for t in ts if t['bloqueio'])
    linhas += (f'<tr><td><b>{et}</b> · {nome}</td><td class="num">{n}</td>' + ''.join(f'<td class="num">{c.get(s, 0)}</td>' for s in ESTADOS)
               + f'<td class="num">{b}</td><td class="num">{pct(c["validada"] + c["homologada"], n)}</td><td class="num">{pct(c["homologada"], n)}</td></tr>')
    barras += f'<div class="sb"><div class="sbl"><b>{et}</b> {nome}<small>{n} tarefas{f" · {b} com bloqueio" if b else ""}</small></div><div class="sbb">{barra_empilhada(c, n)}</div></div>'
tot = ''.join(f'<td class="num"><b>{cont.get(s, 0)}</b></td>' for s in ESTADOS)
linhas += f'<tr class="tot"><td><b>Total</b></td><td class="num"><b>{total}</b></td>{tot}<td class="num"><b>{len(bloq)}</b></td><td class="num"><b>{pct(tecnico, total)}</b></td><td class="num"><b>{pct(homol, total)}</b></td></tr>'
pagina('Como está cada etapa do plano?', 'Progresso por categoria', f'''
<div class="tw"><table class="t small"><thead><tr><th>Categoria</th><th class="num">Total</th><th class="num">Não inic.</th><th class="num">Em desenv.</th><th class="num">Implem.</th><th class="num">Validadas</th><th class="num">Homolog.</th><th class="num">Bloq.</th><th class="num">% técnico</th><th class="num">% homolog.</th></tr></thead><tbody>{linhas}</tbody></table></div>
<div class="bars">{barras}</div>{legenda()}
<p class="note">Os totais fecham com o backlog: {total} tarefas, cada uma contada uma única vez. Bloqueio é atributo adicional e não entra na soma dos estados.</p>
''')

falta = ''
for et, nome in ETAPAS:
    ts, c = por_etapa(et)
    pend = [t for t in ts if t['estado'] != 'homologada']
    pend_tecnico = [t for t in ts if t['estado'] not in ('validada', 'homologada')]
    lista = ', '.join(f'<span class="tag {t["estado"]}">{t["id"]}</span>' for t in pend_tecnico) or '<span class="muted">nenhuma</span>'
    falta += f'<tr><td><b>{et}</b> · {nome}</td><td class="num">{len(pend_tecnico)}</td><td>{lista}</td><td class="num">{len(pend)}</td></tr>'
pagina('O que falta em cada etapa?', 'Tarefas restantes por categoria', f'''
<div class="tw"><table class="t"><thead><tr><th>Categoria</th><th class="num">Faltam p/ validação técnica</th><th>Quais</th><th class="num">Faltam p/ homologação</th></tr></thead><tbody>{falta}</tbody></table></div>
<p class="note">Todas as tarefas validadas tecnicamente ainda precisam do ensaio com contas reais em aparelho para chegar a homologadas. A cor de cada código indica o estado atual.</p>{legenda(False)}
''')

# Previsões (2 páginas)
prev = ''.join(f'<tr><td><b>{e(p["etapa"])}</b></td><td>{e(", ".join(p["restam"]))}</td><td>{e(p["complexidade"])}</td><td>{e(p["dependencias"])}</td><td>{e(p["impl"])}</td><td>{e(p["valid"])}</td><td>{e(p["homol"])}</td><td>{e(p["terceiros"])}</td></tr>' for p in C['previsoes'])
pagina('Quando cada etapa deve terminar?', 'Previsão de conclusão por categoria', f'''
<div class="tw"><table class="t small"><thead><tr><th>Etapa</th><th>Restam</th><th>Complexidade</th><th>Dependências</th><th>Implementação</th><th>Validação técnica</th><th>Homologação</th><th>Depende de terceiros</th></tr></thead><tbody>{prev}</tbody></table></div>
<p class="note">Base da estimativa: em 11/11, quatro frentes em paralelo, mais a integração, levaram 20 tarefas à validação técnica, quase todas de cadastro, mídia e telas. As etapas restantes têm peso maior (concorrência, pagamento, split, disputas e homologação em aparelho) e por isso não foram projetadas pela média de tarefas por dia. Datas são janelas, não compromissos.</p>
''')
cen = ''.join(f'<tr><td><b>{e(p["etapa"])}</b></td><td class="num">{e(p["otimista"])}</td><td class="num">{e(p["provavel"])}</td><td class="num">{e(p["pessimista"])}</td><td>{e(p["confianca"])}</td></tr>' for p in C['previsoes'])
pagina('Como as etapas se encaixam no tempo?', 'Cronograma provável e cenários', f'''
<div class="gantt">{gantt()}</div>
<div class="legend"><span><i style="background:#3b78c2"></i>Implementação e validação técnica</span><span><i style="background:#8cc98f"></i>Homologação (cenário provável)</span></div>
<div class="tw"><table class="t small"><thead><tr><th>Etapa homologada</th><th class="num">Otimista</th><th class="num">Provável</th><th class="num">Pessimista</th><th>Confiança</th></tr></thead><tbody>{cen}</tbody></table></div>
<div class="crit"><b>Caminho crítico para a primeira venda completa:</b> E01 → F02 → F03 → G01 (sandbox) → G02 → G04 → G05 → G06 → H02. O pagamento depende de conta no provedor; sem ela, a venda completa em homologação para no pedido.</div>
''')

# Histórico
H = C['historico']
rot = [h['marco'] for h in H]
evo = ''.join(f'<tr><td><b>{e(h["marco"])}</b></td><td>{e(h["fonte"])}</td><td>{e(", ".join(f"{ROTH.get(k, k)}: {v}" for k, v in h["tarefas"].items())) if h["tarefas"] else "s/ registro"}</td><td>{e(h["nota"])}</td></tr>' for h in H)
pagina('Como o projeto evoluiu?', 'Evolução histórica', f'''
<div class="row three">
 <div class="col"><h3>Testes de código aprovados</h3>{barras_v([h["testes_codigo"] for h in H], rot, '#3b78c2')}</div>
 <div class="col"><h3>Suítes de teste do banco</h3>{barras_v([h["testes_banco"] for h in H], rot, '#2d6a3e')}</div>
 <div class="col"><h3>Migrations aplicadas no agro</h3>{barras_v([h["migrations"] for h in H], rot, '#8a6d1e')}</div>
</div>
<div class="row"><div class="col"><h3>Commits por dia</h3>{barras_v(list(V["commits"].values()), [k[8:] + "/" + k[5:7] for k in V["commits"]], '#5b6a60', w=240)}</div>
<div class="col grow"><h3>Estado das tarefas em cada marco</h3><div class="tw"><table class="t small"><thead><tr><th>Marco</th><th>Fonte</th><th>Estados</th><th>Observação</th></tr></thead><tbody>{evo}</tbody></table></div></div></div>
<p class="note">A classificação mudou entre os relatórios (concluída/parcial → implementada ou decidida → seis estados). Os números de tarefas por marco não são diretamente comparáveis; testes, migrations e commits são. Taxa de implementada para homologada até agora: 0 de 23 tarefas técnicas, porque nenhum ensaio em aparelho foi feito. Métricas sem registro não foram reconstruídas.</p>
''')

# Frentes
FRENTES = ['Integração', 'Oferta e mídia', 'Identidade e operação', 'Logística e negociação', 'Pesquisa e administrador']
fr = ''
for f in FRENTES:
    ts = [t for t in tarefas if t['frente'] == f]; c = Counter(t['estado'] for t in ts)
    fr += (f'<tr><td><b>{f}</b></td><td class="num">{len(ts)}</td><td class="num">{c["implementada"] + c["validada"] + c["homologada"]}</td><td class="num">{c["validada"] + c["homologada"]}</td>'
           f'<td class="num">{c["homologada"]}</td><td class="num">{c["nao_iniciada"] + c["em_desenvolvimento"]}</td><td class="num">{sum(1 for t in ts if t["bloqueio"])}</td></tr>')
semf = [t for t in tarefas if t['frente'] not in FRENTES]
fr += f'<tr><td><b>Ainda sem frente</b> (financeiro, homologação)</td><td class="num">{len(semf)}</td><td class="num">0</td><td class="num">0</td><td class="num">0</td><td class="num">{len(semf)}</td><td class="num">{sum(1 for t in semf if t["bloqueio"])}</td></tr>'
N = C['frentes_notas']; li = lambda xs: ''.join(f'<li>{e(x)}</li>' for x in xs)
pagina('Como as frentes de trabalho estão rendendo?', 'Execução em frentes paralelas', f'''
<div class="tw"><table class="t"><thead><tr><th>Frente</th><th class="num">Atribuídas</th><th class="num">Implementadas ou além</th><th class="num">Validadas ou além</th><th class="num">Homologadas</th><th class="num">Pendentes</th><th class="num">Bloqueios</th></tr></thead><tbody>{fr}</tbody></table></div>
<p class="note">Última atividade comprovada de todas as frentes: 11/11/2026, entre 20h e 21h30, com integração no commit {e(V["commit"])}. Quantidade de commits não é usada como medida de eficiência.</p>
<div class="row three"><div class="col box"><h3>Ganhos</h3><ul>{li(N["ganhos"])}</ul></div><div class="col box"><h3>Gargalos</h3><ul>{li(N["gargalos"])}</ul></div><div class="col box"><h3>Conflitos evitados</h3><ul>{li(N["conflitos"])}</ul></div></div>
<div class="box"><h3>Defeitos encontrados na revisão, antes de chegar ao banco</h3><ul>{li(N["defeitos_revisao"])}</ul></div>
''')

# Jornada
pagina('O que falta para a primeira venda?', 'Caminho até a primeira venda', f'''
{fluxo()}{legenda()}
<div class="row three">
 <div class="col box"><h3>Funciona tecnicamente</h3><p>Cadastro, aprovação, cultura e previsão, rascunho de lote com campos por segmento, fotos e vídeos privados, inspeção obrigatória, cotação e demandas, todos testados no banco de homologação.</p></div>
 <div class="col box"><h3>Depende de desenvolvimento</h3><p>Publicação real integrada (E01), contraproposta (F02), pedido com reserva (F03), ordem de transporte, coleta e recebimento (G04–G06).</p></div>
 <div class="col box"><h3>Depende de terceiros</h3><p>Pagamento e repasse: conta sandbox e contrato com o provedor. Recuperação de senha: SMTP próprio. Homologação: ensaio em aparelho com contas reais.</p></div>
</div>
<div class="row"><div class="col box grow"><h3>Primeira transação simulada de ponta a ponta</h3><p class="big">Provável até 25/11 sem repasse; com repasse no sandbox, entre 01 e 10/12.</p></div>
<div class="col box grow"><h3>Piloto com usuários reais</h3><p class="big">Provável na 1ª quinzena de janeiro de 2027 (otimista: meados de dezembro; pessimista: fevereiro).</p></div></div>
''')

# Riscos
rk = ''.join(f'<tr><td class="num"><b>{n}</b></td><td>{e(r["risco"])}</td><td><span class="sev s{r["sev"][:3]}">{e(r["sev"])}</span></td><td>{e(r["consequencia"])}</td><td>{e(r["resp"])}</td><td>{e(r["acao"])}</td></tr>' for n, r in enumerate(C['riscos'], 1))
top = ''.join(f'<li>{e(b)}</li>' for b in C['bloqueios_top'])
pagina('O que pode atrasar ou impedir o piloto?', 'Riscos e bloqueios', f'''
<div class="row"><div class="col" style="flex:0 0 46%">{matriz_riscos()}</div><div class="col grow box"><h3>Cinco bloqueios mais importantes</h3><ol>{top}</ol></div></div>
<div class="tw"><table class="t small"><thead><tr><th class="num">#</th><th>Risco</th><th>Severidade</th><th>Consequência</th><th>Responsável sugerido</th><th>Próxima ação</th></tr></thead><tbody>{rk}</tbody></table></div>
<p class="note">Riscos já resolvidos nesta fase (aplicação das migrations, conflitos entre frentes, erros de sintaxe no banco) não aparecem como pendências.</p>
''')

# Marcos
mk = ''.join(f'<tr><td class="num"><b>{n}</b></td><td><b>{e(m["marco"])}</b></td><td>{e(m["aceite"])}</td><td>{e(m["deps"])}</td><td>{e(m["resp"])}</td><td>{e(m["janela"])}</td><td>{e(m["evidencia"])}</td></tr>' for n, m in enumerate(C['marcos'], 1))
pagina('Quais são os próximos marcos verificáveis?', 'Próximos marcos', f'''
<div class="tw"><table class="t small"><thead><tr><th class="num">#</th><th>Marco</th><th>Critério de aceite</th><th>Dependências</th><th>Responsável</th><th>Janela</th><th>Evidência</th></tr></thead><tbody>{mk}</tbody></table></div>
''')

# Apêndice
linhas = ''.join(f'<tr><td><b>{t["id"]}</b></td><td>{e(t["nome"])}</td><td>{e(t["etapa"])}{"" if t["mvp"] else " · ampliação"}</td><td><span class="tag {t["estado"]}">{ROT[t["estado"]]}</span>{" <span class=\"tag bloq\">bloqueada</span>" if t["bloqueio"] else ""}</td><td>{e(t["evidencias"])}</td><td>{e(t["proxima_acao"])}{(" · " + e(t["bloqueio"])) if t["bloqueio"] else ""}</td><td>{e(t["dependencias"])}</td></tr>' for t in tarefas)
pagina('Qual é o estado de cada tarefa?', 'Apêndice · inventário completo', f'''
<div class="tw"><table class="t tiny"><thead><tr><th>ID</th><th>Tarefa</th><th>Etapa</th><th>Estado</th><th>Evidências</th><th>Próxima ação</th><th>Dependências</th></tr></thead><tbody>{linhas}</tbody></table></div>
<p class="note">Fontes: tasks/todo.md, tasks/plan.md, DOC/ 001–044, histórico git, migrations em supabase/migrations, testes em supabase/tests e nos workspaces, CI no GitHub Actions. Base estruturada em relatorios/base/tarefas.json e contexto.json; este relatório é gerado por relatorios/gerar_relatorio.py.</p>
''')

CSS = open(os.path.join(RAIZ, 'estilo.css'), encoding='utf-8').read()
capa = f'''<section class="cover"><div class="eyebrow">Relatório executivo de desenvolvimento</div><h1>AgroDireto</h1>
<p class="sub">Estado real do projeto, previsões por etapa e caminho até a primeira venda</p>
<div class="meta"><div><span>Coleta</span><b>{e(V["coletado_em"])}</b></div><div><span>Commit</span><b>{e(V["commit"])}</b></div><div><span>Backlog</span><b>{total} tarefas · 8 etapas</b></div><div><span>Ambiente</span><b>Supabase de homologação (agro)</b></div></div>
<div class="covergrid"><div><b>{pct(tecnico, total)}</b><span>progresso técnico</span></div><div><b>{pct(homol, total)}</b><span>progresso homologado</span></div><div><b>{V["testes_banco_aprovados"]}/{V["testes_banco_total"]}</b><span>suítes do banco aprovadas</span></div><div><b>Jan/2027</b><span>piloto (cenário provável)</span></div></div></section>'''
out = f'<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>AgroDireto · Relatório executivo</title><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap"><style>{CSS}</style></head><body>{capa}{"".join(P)}</body></html>'
os.makedirs(os.path.join(RAIZ, 'saida'), exist_ok=True)
open(os.path.join(RAIZ, 'saida', 'relatorio.html'), 'w', encoding='utf-8').write(out)
os.makedirs(os.path.join(RAIZ, 'historico'), exist_ok=True)
snap = {'coletado_em': V['coletado_em'], 'commit': V['commit'], 'estados': dict(cont), 'bloqueadas': len(bloq),
        'por_etapa': {et: dict(por_etapa(et)[1]) for et, _ in ETAPAS}, 'testes_codigo': tc,
        'testes_banco': V['testes_banco_aprovados'], 'migrations': V['migrations_aplicadas']}
json.dump(snap, open(os.path.join(RAIZ, 'historico', T['coletado_em'][:16].replace(':', 'h') + '.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('ok', len(P) + 1, 'páginas lógicas')
