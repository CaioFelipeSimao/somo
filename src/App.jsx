import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import BeforeAfter from './BeforeAfter';
import LeadForm from './LeadForm';
import CenaPlanilha from './cena/CenaPlanilha';
import Sintomas from './Sintomas';
import Diagnostico from './Diagnostico';

// Os efeitos carregam depois do texto: no 3G a página aparece primeiro, as animações chegam em seguida.
const StrokeText = lazy(() => import('./components/StrokeText'));
const ProfileCard = lazy(() => import('./components/ProfileCard'));


// Cada serviço responde a um dos problemas acima.
const servicos = [
  { titulo: 'Painel de vendas simples', texto: 'Uma tela que mostra o que vendeu, quanto e o que vende mais. Você bate o olho e sabe.' },
  { titulo: 'Relatório semanal automático', texto: 'Um resumo da semana que chega pronto, sem você copiar nada de um lugar para outro.' },
  { titulo: 'Estoque e caixa organizados', texto: 'Uma planilha arrumada, que qualquer pessoa da loja entende, para saber o que tem e quanto entrou e saiu.' }
];

const passos = [
  { titulo: 'Conversa de 20 minutos', texto: 'Você me mostra a planilha ou o caderno, do jeito que estiver, e me conta como a loja funciona.' },
  { titulo: 'Seu mês arrumado, de presente', texto: 'Eu organizo um mês das suas vendas e te mando a planilha arrumada, o que mais vendeu e o que dá para melhorar. Se for caderno, fotos das páginas bastam.' },
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

// O cartão só é montado quando entra na tela: assim o reflexo de entrada (intro) acontece na frente da pessoa,
// e é esse movimento que convida a mexer nele, sem precisar escrever "passe o mouse".
function CartaoNaTela() {
  const ref = useRef(null);
  const [visivel, setVisivel] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisivel(true); io.disconnect(); } }, { threshold: 0.45 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  const foto = <img src="/caio.webp" alt="Caio Simão" width="340" height="340" className="cartao-espera" />;
  return (
    <div ref={ref} className="cartao">
      {visivel ? (
        <Suspense fallback={foto}>
          <ProfileCard
            avatarUrl="/caio.webp"
            iconUrl={GRADE}
            name="Caio Simão"
            title="Estudante de Engenharia no ITA"
            handle=""
            status="Diagnóstico grátis"
            statusColor="#2148c0"
            contactText="Pedir diagnóstico"
            onContactClick={irFormulario}
            theme="light"
            backdropColor="#25272b"
            radius={0}
          />
        </Suspense>
      ) : foto}
    </div>
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
              Numa conversa de 20 minutos eu entendo como você controla vendas e estoque. Depois te mando, sem custo,
              um mês das suas vendas arrumado e o que dá para melhorar.
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
        {/* 2. PROBLEMAS: cada dor com um recorte da planilha mostrando o sintoma e o que muda */}
        <section className="sec" aria-labelledby="t-problemas">
          <div className="grid">
            <h2 className="sec-title" id="t-problemas">Parece com a sua rotina?</h2>
            <Sintomas />
          </div>
        </section>

        {/* 2b. DA BAGUNÇA À RESPOSTA: a planilha explode e se remonta no painel (cena 3D por rolagem) */}
        <CenaPlanilha />

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
              <p className="about-lead">
                Sou o Caio, estudante de Engenharia no ITA, e estou começando a ajudar pequenos comércios a entender
                as próprias vendas.
              </p>
              <p>
                <strong>Por que é grátis?</strong> Porque estou começando e quero conhecer lojas de verdade. Se depois
                você quiser ajuda, eu digo o preço antes e você decide sem pressão.
              </p>
              <p>
                <strong>E a inteligência artificial?</strong> Uso IA para fazer rápido a parte chata: ler as fotos do
                caderno, juntar nomes repetidos, conferir as contas. A parte que importa fica comigo: entender como a sua
                loja funciona e explicar o resultado sem complicar. Você não precisa aprender nada, trocar de sistema nem
                me dar senha de nada.
              </p>
            </div>
            <div className="about-card">
              <CartaoNaTela />
            </div>
          </div>
        </section>

        {/* 6. FORMULÁRIO */}
        <section className="sec sec-form" id="formulario" aria-labelledby="t-form">
          <div className="grid">
            <div className="form-intro">
              <h2 id="t-form">Pedir diagnóstico gratuito</h2>
              <p>20 minutos de conversa e um mês das suas vendas arrumado, sem custo e sem compromisso. Respondo em até 2 dias úteis.</p>
              <Diagnostico />
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
