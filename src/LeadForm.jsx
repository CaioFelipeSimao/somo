import { useEffect, useRef, useState } from 'react';
import ClickSpark from './components/ClickSpark';
import { FORM_ACCESS_KEY } from './config';

const TIPOS = ['Loja de roupas', 'Papelaria', 'Pet shop', 'Cosméticos', 'Outro'];
const RASCUNHO = 'p0-rascunho';
const VAZIO = { nome: '', tipo: '', tipoOutro: '', contato: '', problema: '' };
const pronto = Boolean(FORM_ACCESS_KEY) && !FORM_ACCESS_KEY.startsWith('COLE_AQUI');

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
  if (!v.tipo) e.tipo = 'Escolha o tipo do seu negócio.';
  else if (v.tipo === 'Outro' && !v.tipoOutro.trim()) e.tipoOutro = 'Conte qual é o seu negócio.';
  const c = v.contato.trim();
  const ehEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c);
  const ehWhats = c.replace(/\D/g, '').length >= 10;
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
  const [enviado, setEnviado] = useState(null);
  const [celebrar, setCelebrar] = useState(false);
  const [corFaisca, setCorFaisca] = useState('#17663f');
  const wrapRef = useRef(null);
  const sparkRef = useRef(null);
  const pressRef = useRef(null);
  const doneRef = useRef(null);
  const botRef = useRef(null);

  const erros = validar(v);
  const mostrar = campo => (tentou || tocado[campo]) && erros[campo];

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

    setEnviando(true);
    setFalha('');
    const data = new FormData();
    data.append('access_key', FORM_ACCESS_KEY);
    data.append('subject', `Novo pedido de diagnóstico: ${v.nome.trim()}`);
    data.append('nome', v.nome.trim());
    data.append('tipo_de_negocio', v.tipo === 'Outro' ? v.tipoOutro.trim() : v.tipo);
    data.append('contato', v.contato.trim());
    data.append('problema', v.problema.trim());
    if (botRef.current?.checked) data.append('botcheck', 'on');

    try {
      const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: data });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);
      try { sessionStorage.removeItem(RASCUNHO); } catch { /* ignorado */ }
      setCorFaisca(getComputedStyle(wrapRef.current).getPropertyValue('--ok').trim() || '#17663f');
      setEnviado({ nome: v.nome.trim().split(/\s+/)[0], contato: v.contato.trim() });
      setCelebrar(true);
    } catch {
      setFalha('Não consegui enviar. Seus dados continuam aqui: confira a internet e toque no botão de novo.');
    } finally {
      setEnviando(false);
    }
  }

  const corrigir = () => {
    setEnviado(null);
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
          <form onSubmit={enviar} noValidate>
            {!pronto && (
              <p className="notice" role="note">
                O formulário ainda está sendo configurado e não envia pedidos. Volte em breve.
              </p>
            )}

            <div className="field">
              <label htmlFor="f-nome">Seu nome</label>
              <input id="f-nome" name="nome" type="text" autoComplete="name" maxLength={80} required
                     value={v.nome} onChange={mudar('nome')} onBlur={sair('nome')}
                     aria-invalid={Boolean(mostrar('nome'))} aria-describedby={ajuda('nome')} />
              {mostrar('nome') && <p className="field-error" id="e-nome">{erros.nome}</p>}
            </div>

            <fieldset className="field" aria-describedby={ajuda('tipo')}>
              <legend>Tipo de negócio</legend>
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
              <label htmlFor="f-contato">E-mail ou WhatsApp para eu te responder</label>
              <input id="f-contato" name="contato" type="text" maxLength={120}
                     required value={v.contato} onChange={mudar('contato')} onBlur={sair('contato')}
                     aria-invalid={Boolean(mostrar('contato'))} aria-describedby={ajuda('contato') ?? 'h-contato'} />
              {mostrar('contato')
                ? <p className="field-error" id="e-contato">{erros.contato}</p>
                : <p className="field-help" id="h-contato">Só uso para responder ao seu pedido.</p>}
            </div>

            <div className="field">
              <label htmlFor="f-problema">Qual o seu maior problema hoje? <span className="opt">(opcional)</span></label>
              <textarea id="f-problema" name="problema" rows={3} maxLength={1000}
                        value={v.problema} onChange={mudar('problema')} />
            </div>

            {/* campo invisível contra robôs de spam */}
            <input ref={botRef} type="checkbox" name="botcheck" className="hidden" tabIndex={-1} autoComplete="off" />

            {falha && <p className="status erro" role="alert">{falha}</p>}
            <button className="btn" type="submit" disabled={!pronto || enviando} aria-busy={enviando}
                    onPointerDown={lembrarClique}>
              {enviando ? 'Enviando…' : 'Pedir diagnóstico gratuito'}
            </button>
          </form>
        )}
      </div>
    </ClickSpark>
  );
}
