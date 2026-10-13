import { lazy, Suspense, useEffect, useState } from 'react';
import BeforeAfter from './BeforeAfter';
import LeadForm from './LeadForm';

// Os efeitos carregam depois do texto: no 3G a página aparece primeiro, as animações chegam em seguida.
const BlurText = lazy(() => import('./components/BlurText'));
const StrokeText = lazy(() => import('./components/StrokeText'));
const ProfileCard = lazy(() => import('./components/ProfileCard'));

const problemas = [
  'Não sei qual produto dá mais lucro.',
  'Gasto horas copiando dados de um lugar para outro.',
  'Só uma pessoa entende a planilha (ou o caderno).',
  'Não confio nos números no fim do mês.'
];

const servicos = [
  { titulo: 'Painel de vendas simples', texto: 'Uma tela que mostra o que vendeu, quanto e o que deu lucro, como no exemplo lá em cima.' },
  { titulo: 'Relatório semanal automático', texto: 'Um resumo da semana que chega pronto, sem você copiar nada.' },
  { titulo: 'Estoque e caixa organizados', texto: 'Uma planilha arrumada para saber o que tem na loja e quanto entrou e saiu.' }
];

const passos = [
  { titulo: 'Conversa de 20 minutos', texto: 'Você me mostra como controla vendas e estoque hoje, do jeito que estiver.' },
  { titulo: 'Diagnóstico por escrito', texto: 'Eu te mando o que dá para melhorar, em palavras simples.' },
  { titulo: 'Proposta sem compromisso', texto: 'Se fizer sentido, eu digo como posso ajudar. Se não, você fica com o diagnóstico.' }
];

// Grade fina como padrão do brilho holográfico do cartão: o mesmo desenho da página.
const GRADE = `data:image/svg+xml,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><path d='" +
    Array.from({ length: 16 }, (_, i) => `M${i * 20 + 0.5} 0V320M0 ${i * 20 + 0.5}H320`).join('') +
    "' stroke='#000' stroke-width='1'/></svg>"
)}`;

function usePrefers(query) {
  const [ok, setOk] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const sync = () => setOk(mq.matches);
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, [query]);
  return ok;
}

// Leva até o formulário e já deixa o primeiro campo pronto para digitar.
function irFormulario(e) {
  e?.preventDefault();
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.getElementById('formulario')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  document.getElementById('f-nome')?.focus({ preventScroll: true });
}

export default function App() {
  const reduce = usePrefers('(prefers-reduced-motion: reduce)');
  const escuro = usePrefers('(prefers-color-scheme: dark)');

  return (
    <>
      {/* 1. PRIMEIRA DOBRA (será reescrita na aula 1.9) */}
      <header className="hero">
        <div className="grid">
          <h1 className="hero-title">Sua planilha ou caderno deveria responder perguntas, não criar dúvidas.</h1>
          <div className="hero-copy">
            <p className="lead">
              Em 20 minutos eu olho como você controla vendas e estoque e te digo, sem custo, o que dá para melhorar.
            </p>
            <a className="btn" href="#formulario" onClick={irFormulario}>Pedir diagnóstico gratuito</a>
          </div>
          <BeforeAfter />
        </div>
      </header>

      <main>
        {/* 2. PROBLEMAS: cada frase sai do borrão e fica nítida (Blur Text) */}
        <section className="sec" aria-labelledby="t-problemas">
          <div className="grid">
            <h2 className="sec-title" id="t-problemas">Parece com a sua rotina?</h2>
            <ul className="problems">
              {problemas.map(frase => (
                <li key={frase}>
                  {reduce ? frase : (
                    <Suspense fallback={frase}>
                      <BlurText text={frase} delay={60} threshold={0.2} stepDuration={0.3}
                                animationFrom={{ filter: 'blur(8px)', opacity: 0, y: -12 }}
                                animationTo={[{ filter: 'blur(3px)', opacity: 0.6, y: 2 }, { filter: 'blur(0px)', opacity: 1, y: 0 }]} />
                    </Suspense>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 3. SERVIÇOS */}
        <section className="sec sec-accent" aria-labelledby="t-servicos">
          <div className="grid">
            <div className="sec-side">
              <h2 className="sec-title" id="t-servicos">O que eu posso fazer por você</h2>
              <p>Dá para resolver isso sem trocar de sistema e sem complicar.</p>
              <a className="btn btn-inverse" href="#formulario" onClick={irFormulario}>Pedir diagnóstico gratuito</a>
            </div>
            <ul className="services">
              {servicos.map((s, i) => (
                <li key={s.titulo} className={i === 0 ? 'service-main' : undefined}>
                  <h3>{s.titulo}</h3>
                  <p>{s.texto}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 4. COMO FUNCIONA: o número é desenhado e depois preenchido (Stroke Text) */}
        <section className="sec" aria-labelledby="t-passos">
          <div className="grid">
            <h2 className="sec-title" id="t-passos">Como funciona</h2>
            <ol className="steps">
              {passos.map((p, i) => (
                <li key={p.titulo}>
                  <div className="step-num" aria-hidden="true">
                    <Suspense fallback={<span className="step-num-plain">{i + 1}</span>}>
                      <StrokeText text={String(i + 1)} strokeColor="currentColor" fillColor="currentColor"
                                  strokeWidth={1.5} drawDuration={1.1} fillDelay={0.1 + i * 0.15}
                                  trigger="scroll" fillMode="wipe" fontSize={72} fontWeight={700} letterSpacing={-3} />
                    </Suspense>
                  </div>
                  <h3>{p.titulo}</h3>
                  <p>{p.texto}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 5. QUEM FAZ */}
        <section className="sec" aria-labelledby="t-quem">
          <div className="grid">
            <h2 className="sec-title" id="t-quem">Quem faz</h2>
            <div className="about">
              <div className="about-card">
                <Suspense fallback={<img src="/caio.webp" alt="Caio Simão" width="320" height="320" />}>
                  <ProfileCard
                    avatarUrl="/caio.webp"
                    iconUrl={GRADE}
                    name="Caio Simão"
                    title="Estudante de Engenharia no ITA"
                    handle=""
                    status=""
                    contactText="Pedir diagnóstico"
                    onContactClick={irFormulario}
                    theme={escuro ? 'dark' : 'light'}
                    backdropColor="#25272b"
                    radius={0}
                    holo={0.6}
                    glare={0.4}
                    tiltStrength={8}
                  />
                </Suspense>
              </div>
              <div className="about-text">
                <p>
                  Sou o Caio, estudante de Engenharia no ITA. Trabalho organizando números e projetos, e explico o que
                  eles dizem sem complicar.
                </p>
                <p>
                  Você não precisa trocar de sistema nem me dar senha de nada: eu olho o caderno ou a planilha do jeito
                  que estiver e te digo, por escrito, o que dá para melhorar.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. FORMULÁRIO */}
        <section className="sec sec-form" id="formulario" aria-labelledby="t-form">
          <div className="grid">
            <div className="form-intro">
              <h2 id="t-form">Pedir diagnóstico gratuito</h2>
              <p>20 minutos, sem custo e sem compromisso. Respondo em até 2 dias úteis.</p>
              <ul className="promises">
                <li>A conversa é por chamada de vídeo ou WhatsApp, como for melhor para você.</li>
                <li>Não peço senha nem acesso ao seu sistema.</li>
                <li>Seu contato só serve para eu te responder.</li>
              </ul>
            </div>
            <LeadForm />
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="grid">
          <p><strong>Caio Simão</strong><br />Diagnóstico de vendas para pequenos comércios</p>
          <p>Os dados enviados pelo formulário são usados só para responder ao seu pedido e não são repassados a ninguém.</p>
        </div>
      </footer>
    </>
  );
}
