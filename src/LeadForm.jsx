import { useEffect, useRef, useState } from 'react';
import ClickSpark from './components/ClickSpark';
import { FORM_ACCESS_KEY } from './config';

export default function LeadForm() {
  const formRef = useRef(null);
  const sparkRef = useRef(null);
  const pressRef = useRef(null);
  const [status, setStatus] = useState({ msg: '', kind: '' });
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [corFaisca, setCorFaisca] = useState('');

  // Faíscas só quando o envio deu certo (Click Spark), saindo de onde a pessoa clicou.
  useEffect(() => {
    if (!enviado || !corFaisca) return;
    const p = pressRef.current;
    sparkRef.current?.spark(p?.x, p?.y);
  }, [enviado, corFaisca]);

  const lembrarClique = e => {
    const r = e.currentTarget.parentElement.getBoundingClientRect();
    pressRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  async function enviar(e) {
    e.preventDefault();
    const form = formRef.current;

    for (const field of form.querySelectorAll('[required]')) {
      field.setAttribute('aria-invalid', field.validity.valid ? 'false' : 'true');
    }

    if (!form.checkValidity()) {
      setStatus({ msg: 'Preencha nome, tipo de negócio e um contato para eu te responder.', kind: 'erro' });
      form.querySelector(':invalid').focus();
      return;
    }

    if (!FORM_ACCESS_KEY || FORM_ACCESS_KEY.startsWith('COLE_AQUI')) {
      setStatus({ msg: 'O formulário ainda não está configurado. Tente de novo mais tarde.', kind: 'erro' });
      return;
    }

    setEnviando(true);
    setStatus({ msg: 'Enviando…', kind: '' });

    const data = new FormData(form);
    data.append('access_key', FORM_ACCESS_KEY);
    data.append('subject', 'Novo pedido de diagnóstico');

    try {
      const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: data });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);
      setStatus({ msg: 'Recebi seu pedido, respondo em até 2 dias úteis.', kind: 'ok' });
      form.reset();
      form.querySelectorAll('[aria-invalid]').forEach(f => f.removeAttribute('aria-invalid'));
      setCorFaisca(getComputedStyle(form).getPropertyValue('--ok').trim());
      setEnviado(true); // botão fica inativo de propósito, para evitar envio duplicado
    } catch {
      setEnviando(false);
      setStatus({ msg: 'Não consegui enviar. Verifique sua internet e tente de novo.', kind: 'erro' });
    }
  }

  return (
    <form ref={formRef} onSubmit={enviar} noValidate>
      <label>Seu nome
        <input name="nome" type="text" autoComplete="name" required />
      </label>
      <label>Tipo de negócio
        <input name="tipo_de_negocio" type="text" placeholder="Ex.: papelaria, pet shop" required />
      </label>
      <label>E-mail ou WhatsApp para eu te responder
        <input name="contato" type="text" required />
      </label>
      <label>
        <span>Qual o seu maior problema hoje? <span className="opt">(opcional)</span></span>
        <textarea name="problema" rows={3} />
      </label>
      {/* campo invisível contra robôs de spam */}
      <input type="checkbox" name="botcheck" className="hidden" tabIndex={-1} autoComplete="off" />
      <ClickSpark ref={sparkRef} disabled={!enviado} sparkColor={corFaisca || '#17663f'} layer="back"
                  sparkCount={12} sparkSize={16} sparkRadius={48} duration={600} style={{ height: 'auto' }}>
        <button className="btn" type="submit" disabled={enviando || enviado} onPointerDown={lembrarClique}>
          Pedir diagnóstico gratuito
        </button>
      </ClickSpark>
      <p className={`status ${status.kind}`} role="status" aria-live="polite">{status.msg}</p>
    </form>
  );
}
