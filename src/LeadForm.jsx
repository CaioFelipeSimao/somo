import { useEffect, useRef, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight02Icon } from '@hugeicons/core-free-icons';
import ClickSpark from './components/ClickSpark';
import { FORM_ACCESS_KEY } from './config';

const TIPOS = ['Loja de roupas', 'Papelaria', 'Pet shop', 'Cosméticos', 'Outro'];
const RASCUNHO = 'p0-rascunho', ENVIADO = 'p0-enviado';
const VAZIO = { nome: '', tipo: '', tipoOutro: '', contato: '', problema: '' };
const pronto = Boolean(FORM_ACCESS_KEY) && !FORM_ACCESS_KEY.startsWith('COLE_AQUI');

function lerEnviado() {
  try { return JSON.parse(sessionStorage.getItem(ENVIADO) || 'null'); } catch { return null; }
}

function lerRascunho() {
  try {
    return { ...VAZIO, ...JSON.parse(sessionStorage.getItem(RASCUNHO) || '{}') };
  } catch {
    return VAZIO;
  }
}

// Devolve só os campos com problema, cada um com a frase que a pessoa vai ler.
function validar(v) {
  const e = {};
  if (v.nome.trim().length < 2) e.nome = 'Escreva seu nome.';
  if (!v.tipo) e.tipo = 'Escolha o tipo da sua loja.';
  else if (v.tipo === 'Outro' && !v.tipoOutro.trim()) e.tipoOutro = 'Conte qual é o seu negócio.';
  const c = v.contato.trim();
  const ehEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c);
  const digitos = c.replace(/\D/g, '').length, ehWhats = /^[\d\s()+.-]+$/.test(c) && digitos >= 10 && digitos <= 13;
  if (!c) e.contato = 'Deixe um e-mail ou WhatsApp para eu te responder.';
  else if (!ehEmail && !ehWhats) e.contato = 'Escreva um e-mail com @ ou um WhatsApp com DDD.';
  return e;
}

const ORDEM = ['nome', 'tipo', 'tipoOutro', 'contato'];

export default function LeadForm() {
  const [v, setV] = useState(lerRascunho);
  const [tocado, setTocado] = useState({});
  const [tentou, setTentou] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [falha, setFalha] = useState('');
  const [enviado, setEnviado] = useState(lerEnviado);
  const [correcao, setCorrecao] = useState(false);
  const [teclado, setTeclado] = useState('tel');
  const [celebrar, setCelebrar] = useState(false);
  const [corFaisca, setCorFaisca] = useState('#17663f');
  const wrapRef = useRef(null);
  const sparkRef = useRef(null);
  const pressRef = useRef(null);
  const doneRef = useRef(null);
  const botRef = useRef(null);
  const falhaRef = useRef(null);

  const erros = validar(v);
  const mostrar = campo => (tentou || tocado[campo]) && erros[campo];
  const respondidas = [!erros.nome, !erros.tipo && !erros.tipoOutro, !erros.contato].filter(Boolean).length;

  // erro do envio (rede ou servidor): o foco vai para a mensagem, como nos erros dos campos
  useEffect(() => { if (falha) falhaRef.current?.focus(); }, [falha]);

  useEffect(() => {
    try { sessionStorage.setItem(RASCUNHO, JSON.stringify(v)); } catch { /* sem armazenamento: segue sem rascunho */ }
  }, [v]);

  // Faíscas (Click Spark) só quando o envio deu certo, saindo de onde a pessoa clicou.
  useEffect(() => {
    if (!celebrar) return;
    const p = pressRef.current;
    sparkRef.current?.spark(p?.x, p?.y);
    setCelebrar(false);
  }, [celebrar]);

  useEffect(() => {
    if (enviado) doneRef.current?.focus();
  }, [enviado]);

  const mudar = campo => e => {
    setV(atual => ({ ...atual, [campo]: e.target.value }));
    setFalha('');
  };
  const sair = campo => () => setTocado(t => ({ ...t, [campo]: true }));

  const lembrarClique = e => {
    const r = wrapRef.current.getBoundingClientRect();
    pressRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  async function enviar(e) {
    e.preventDefault();
    setTentou(true);
    const primeiro = ORDEM.find(c => erros[c]);
    if (primeiro) {
      document.getElementById(primeiro === 'tipo' ? 'f-tipo-0' : `f-${primeiro}`)?.focus();
      return;
    }

    if (!pronto) {
      setFalha('Falta a chave do Web3Forms em src/config.js: sem ela o pedido não é enviado.');
      return;
    }

    setEnviando(true);
    setFalha('');
    const data = new FormData();
    data.append('access_key', FORM_ACCESS_KEY);
    data.append('subject', `${correcao ? 'Correção de contato' : 'Novo pedido de mês arrumado'}: ${v.nome.trim()}`);
    data.append('nome', v.nome.trim());
    data.append('tipo_de_negocio', v.tipo === 'Outro' ? v.tipoOutro.trim() : v.tipo);
    data.append('contato', v.contato.trim());
    data.append('problema', v.problema.trim());
    if (botRef.current?.checked) data.append('botcheck', 'on');
    if (correcao) data.append('observacao', 'Este pedido corrige o contato de um pedido anterior.');

    // Sem resposta em 15 s, desiste: no 3G o botão não pode ficar em "Enviando…" para sempre.
    const corte = new AbortController(), relogio = window.setTimeout(() => corte.abort(), 15000);
    try {
      let res;
      try {
        res = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: data, signal: corte.signal });
      } catch {
        throw new Error('rede');
      }
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error('servidor');
      try { sessionStorage.removeItem(RASCUNHO); } catch { /* ignorado */ }
      setCorFaisca(getComputedStyle(wrapRef.current).getPropertyValue('--ok').trim() || '#17663f');
      const pedido = { nome: v.nome.trim().split(/\s+/)[0], contato: v.contato.trim() };
      try { sessionStorage.setItem(ENVIADO, JSON.stringify(pedido)); } catch { /* ignorado */ }
      setEnviado(pedido);
      setCorrecao(false);
      setCelebrar(true);
    } catch (erro) {
      setFalha(erro.message === 'rede'
        ? 'Não consegui enviar: a conexão falhou ou demorou demais. Seus dados continuam aqui; tente de novo.'
        : 'O envio não foi aceito agora. Seus dados continuam aqui; tente de novo em alguns minutos.');
    } finally {
      window.clearTimeout(relogio);
      setEnviando(false);
    }
  }

  const corrigir = () => {
    try { sessionStorage.removeItem(ENVIADO); } catch { /* ignorado */ }
    setEnviado(null);
    setCorrecao(true);
    setTentou(false);
    window.setTimeout(() => document.getElementById('f-contato')?.focus(), 0);
  };

  const ajuda = campo => (mostrar(campo) ? `e-${campo}` : undefined);

  return (
    <ClickSpark ref={sparkRef} disabled={!celebrar} sparkColor={corFaisca} layer="back"
                sparkCount={12} sparkSize={16} sparkRadius={52} duration={650}
                className="form-wrap" style={{ height: 'auto' }}>
      <div ref={wrapRef}>
        {enviado ? (
          <div className="done" ref={doneRef} tabIndex={-1} role="status">
            <h3>Pronto, {enviado.nome}.</h3>
            <p>Recebi seu pedido. Vou te responder em até 2 dias úteis por <strong>{enviado.contato}</strong>.</p>
            <p>Se quiser, já separe o caderno ou a planilha de vendas para a nossa conversa.</p>
            <button type="button" className="btn-ghost" onClick={corrigir}>Errei o contato, quero corrigir</button>
          </div>
        ) : (
          <form onSubmit={enviar} noValidate className="ficha-form">
            <div className="ficha-topo" aria-live="polite">
              <span>{respondidas === 3 ? 'Tudo pronto para enviar' : `${respondidas} de 3 respostas`}</span>
              <ol className="ficha-progresso" aria-hidden="true">
                {[0, 1, 2].map(i => <li key={i} className={i < respondidas ? 'feito' : undefined} />)}
              </ol>
            </div>

            <div className="field">
              <label htmlFor="f-nome"><span className="passo" aria-hidden="true">1</span>Seu nome</label>
              <input id="f-nome" name="nome" type="text" autoComplete="name" maxLength={80} required
                     value={v.nome} onChange={mudar('nome')} onBlur={sair('nome')}
                     aria-invalid={Boolean(mostrar('nome'))} aria-describedby={ajuda('nome')} />
              {mostrar('nome') && <p className="field-error" id="e-nome">{erros.nome}</p>}
            </div>

            <fieldset className="field" aria-describedby={ajuda('tipo')}>
              <legend><span className="passo" aria-hidden="true">2</span>Que tipo de loja você tem?</legend>
              <div className="chips">
                {TIPOS.map((t, i) => (
                  <label key={t} className="chip">
                    <input type="radio" name="tipo" id={`f-tipo-${i}`} value={t} checked={v.tipo === t}
                           onChange={mudar('tipo')} onBlur={sair('tipo')} aria-invalid={Boolean(mostrar('tipo'))} />
                    <span>{t}</span>
                  </label>
                ))}
              </div>
              {mostrar('tipo') && <p className="field-error" id="e-tipo">{erros.tipo}</p>}
              {v.tipo === 'Outro' && (
                <div className="field field-sub">
                  <label htmlFor="f-tipoOutro">Qual?</label>
                  <input id="f-tipoOutro" type="text" maxLength={80} placeholder="Ex.: mercadinho, açougue"
                         value={v.tipoOutro} onChange={mudar('tipoOutro')} onBlur={sair('tipoOutro')}
                         aria-invalid={Boolean(mostrar('tipoOutro'))} aria-describedby={ajuda('tipoOutro')} />
                  {mostrar('tipoOutro') && <p className="field-error" id="e-tipoOutro">{erros.tipoOutro}</p>}
                </div>
              )}
            </fieldset>

            <div className="field">
              <label htmlFor="f-contato"><span className="passo" aria-hidden="true">3</span>WhatsApp ou e-mail para eu te responder</label>
              {/* só troca o teclado do celular; a validação aceita os dois de qualquer jeito */}
              <div className="teclado" role="group" aria-label="Tipo de contato">
                {[['tel', 'WhatsApp'], ['email', 'E-mail']].map(([m, t]) => (
                  <button key={m} type="button" aria-pressed={teclado === m}
                          onClick={() => { setTeclado(m); document.getElementById('f-contato')?.focus(); }}>{t}</button>
                ))}
              </div>
              <input id="f-contato" name="contato" type="text" inputMode={teclado} autoComplete={teclado === 'email' ? 'email' : 'tel'} maxLength={120}
                     placeholder={teclado === 'email' ? 'Ex.: voce@email.com' : 'Ex.: (12) 99999-0000'}
                     required value={v.contato} onChange={mudar('contato')} onBlur={sair('contato')}
                     aria-invalid={Boolean(mostrar('contato'))} aria-describedby={ajuda('contato') ?? 'h-contato'} />
              {mostrar('contato')
                ? <p className="field-error" id="e-contato">{erros.contato}</p>
                : <p className="field-help" id="h-contato">Só uso para responder ao seu pedido.</p>}
            </div>

            <div className="field">
              <label htmlFor="f-problema"><span className="passo passo-opt" aria-hidden="true">+</span>O que mais te incomoda hoje? <span className="opt">(opcional)</span></label>
              <textarea id="f-problema" name="problema" rows={3} maxLength={1000} placeholder="Ex.: nunca sei quanto tenho de estoque"
                        value={v.problema} onChange={mudar('problema')} />
            </div>

            {/* campo invisível contra robôs de spam */}
            <input ref={botRef} type="checkbox" name="botcheck" className="hidden" tabIndex={-1} autoComplete="off" />

            {falha && <p className="status erro" role="alert" tabIndex={-1} ref={falhaRef}>{falha}</p>}
            <button className="btn btn-seta" type="submit" disabled={enviando} aria-busy={enviando}
                    onPointerDown={lembrarClique}>
              <span>{enviando ? 'Enviando…' : correcao ? 'Enviar com o contato corrigido' : 'Quero meu mês arrumado'}</span>
              {!enviando && <HugeiconsIcon icon={ArrowRight02Icon} size={20} strokeWidth={2} aria-hidden="true" />}
            </button>
            <ul className="promises">
              <li>Conversa por chamada de vídeo ou WhatsApp, como for melhor para você.</li>
              <li>Não peço senha nem acesso ao seu sistema.</li>
            </ul>
          </form>
        )}
      </div>
    </ClickSpark>
  );
}
