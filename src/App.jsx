import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import BeforeAfter from './BeforeAfter';
import LeadForm from './LeadForm';
import CenaPlanilha from './cena/CenaPlanilha';

// Os efeitos carregam depois do texto: no 3G a página aparece primeiro, as animações chegam em seguida.
const StrokeText = lazy(() => import('./components/StrokeText'));
const ProfileCard = lazy(() => import('./components/ProfileCard'));

const problemas = [
  'Não sei qual produto dá mais lucro.',
  'Gasto horas copiando dados de um lugar para outro.',
  'Só uma pessoa entende a planilha (ou o caderno).',
  'Não confio nos números no fim do mês.'
];

// Cada serviço responde a um dos problemas acima.
const servicos = [
  { titulo: 'Painel de vendas simples', texto: 'Uma tela que mostra o que vendeu, quanto e o que deu lucro. Você bate o olho e sabe.' },
  { titulo: 'Relatório semanal automático', texto: 'Um resumo da semana que chega pronto, sem você copiar nada de um lugar para outro.' },
  { titulo: 'Estoque e caixa organizados', texto: 'Uma planilha arrumada, que qualquer pessoa da loja entende, para saber o que tem e quanto entrou e saiu.' }
];

const passos = [
  { titulo: 'Conversa de 20 minutos', texto: 'Você me mostra como controla vendas e estoque hoje, do jeito que estiver.' },
  { titulo: 'Diagnóstico por escrito', texto: 'Eu te mando o que dá para melhorar, em palavras simples.' },
  { titulo: 'Proposta sem compromisso', texto: 'Se fizer sentido, eu digo como posso ajudar e quanto custa. Se não, você fica com o diagnóstico.' }
];

// Grade fina como padrão do brilho holográfico do cartão: o mesmo desenho da página.
const GRADE = `data:image/svg+xml,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><path d='" +
    Array.from({ length: 16 }, (_, i) => `M${i * 20 + 0.5} 0V320M0 ${i * 20 + 0.5}H320`).join('') +
    "' stroke='#000' stroke-width='1'/></svg>"
)}`;

const reduzMovimento = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Leva até o formulário. No computador, o cursor vai para o primeiro campo quando a rolagem termina;
// no celular não, para o teclado não abrir no meio do caminho.
function irFormulario(e) {
  e?.preventDefault();
  document.getElementById('formulario')?.scrollIntoView({ behavior: reduzMovimento() ? 'auto' : 'smooth' });
  if (window.matchMedia('(pointer: coarse)').matches) return;
  const focar = () => document.getElementById('f-nome')?.focus({ preventScroll: true });
  if ('onscrollend' in window) window.addEventListener('scrollend', focar, { once: true });
  else window.setTimeout(focar, 900);
}

// Frases dos problemas com Blur Text. Se o efeito chegar quando a lista já está na tela, fica o texto parado (sem piscar).
function Problemas() {
  const ref = useRef(null);
  const [Blur, setBlur] = useState(null);
  useEffect(() => {
    if (reduzMovimento()) return undefined;
    let vivo = true;
    import('./components/BlurText').then(m => {
      const r = ref.current?.getBoundingClientRect();
      if (!vivo || !r || (r.top < window.innerHeight && r.bottom > 0)) return;
      setBlur(() => m.default);
    });
    return () => { vivo = false; };
  }, []);
  return (
    <ul className="problems" ref={ref}>
      {problemas.map(frase => (
        <li key={frase}>
          {Blur ? (
            <Blur text={frase} delay={60} threshold={0.2} stepDuration={0.3}
                  animationFrom={{ filter: 'blur(8px)', opacity: 0, y: -12 }}
                  animationTo={[{ filter: 'blur(3px)', opacity: 0.6, y: 2 }, { filter: 'blur(0px)', opacity: 1, y: 0 }]} />
          ) : frase}
        </li>
      ))}
    </ul>
  );
}

export default function App() {
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
            <p className="byline">
              <img src="/caio.webp" alt="" width="44" height="44" />
              <span><strong>Caio Simão</strong>Estudante de Engenharia no ITA</span>
            </p>
          </div>
          <BeforeAfter />
        </div>
      </header>

      <main>
        {/* 1b. DO CADERNO À RESPOSTA: a planilha explode e se remonta no painel (cena 3D por rolagem) */}
        <CenaPlanilha />

        {/* 2. PROBLEMAS: cada frase sai do borrão e fica nítida (Blur Text) */}
        <section className="sec" aria-labelledby="t-problemas">
          <div className="grid">
            <h2 className="sec-title" id="t-problemas">Parece com a sua rotina?</h2>
            <Problemas />
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
                                  strokeWidth={2.5} drawDuration={0.8} fillDelay={0.05 + i * 0.12}
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

        {/* 5. QUEM FAZ: texto embaixo do título, cartão à direita */}
        <section className="sec" aria-labelledby="t-quem">
          <div className="grid">
            <div className="about-text">
              <h2 className="sec-title" id="t-quem">Quem faz</h2>
              <p>
                Sou o Caio, estudante de Engenharia no ITA. Trabalho organizando números e projetos, e explico o que
                eles dizem sem complicar.
              </p>
              <p>
                Você não precisa trocar de sistema nem me dar senha de nada: eu olho o caderno ou a planilha do jeito
                que estiver e te digo, por escrito, o que dá para melhorar.
              </p>
            </div>
            <div className="about-card">
              <Suspense fallback={<img src="/caio.webp" alt="Caio Simão" width="340" height="340" />}>
                <ProfileCard
                  avatarUrl="/caio.webp"
                  iconUrl={GRADE}
                  name="Caio Simão"
                  title="Estudante de Engenharia no ITA"
                  showUserInfo={false}
                  theme="light"
                  backdropColor="#25272b"
                  radius={0}
                  holo={0.6}
                  glare={0.4}
                  tiltStrength={8}
                />
              </Suspense>
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
                <li>
                  Por que é grátis? Estou começando e quero conhecer lojas de verdade. Se depois você quiser ajuda, eu
                  digo o preço antes e você decide sem pressão.
                </li>
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
