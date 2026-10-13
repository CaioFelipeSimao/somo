import TextType from './components/TextType';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import BeforeAfter from './BeforeAfter';
import LeadForm from './LeadForm';
import CenaPlanilha from './cena/CenaPlanilha';
import Sintomas from './Sintomas';
import Diagnostico from './Diagnostico';
import Barra from './Barra';
import { Simbolo, Padrao } from './Marca';

// Os efeitos carregam depois do texto: no 3G a página aparece primeiro, as animações chegam em seguida.
const StrokeText = lazy(() => import('./components/StrokeText'));
const ProfileCard = lazy(() => import('./components/ProfileCard'));
// "E quanto sobrou?" (e a biblioteca de animação que só ela usa) fica fora do primeiro carregamento:
// o navegador busca esse pedaço assim que a página termina de abrir, bem antes de a pessoa rolar até lá
const carregarSobra = () => import('./Sobra');
const Sobra = lazy(carregarSobra);
if (typeof window !== 'undefined') window.addEventListener('load', () => (window.requestIdleCallback ?? setTimeout)(carregarSobra), { once: true });


// Três degraus: o grátis abre a porta; os outros dois só se a pessoa quiser (preço dito antes).
const degraus = [
  { quando: 'Para começar, grátis', titulo: 'Seu mês arrumado', texto: 'Você me mostra como anota as vendas e eu devolvo o mês organizado, com o que mais vendeu e o que dá para melhorar.' },
  { quando: 'Depois, se quiser', titulo: 'Raio-X do mês', texto: 'Vendas e gastos juntos: mercadoria, aluguel, contas, marketing, manutenção, maquininha. Você vê quanto sobrou, qual produto dá lucro de verdade e quanto precisa vender para pagar as contas.' },
  { quando: 'Todo mês', titulo: 'Fechamento do mês', texto: 'Vendas e gastos conferidos todo mês e um resumo de uma página: quanto vendeu, quanto sobrou e qual gasto mudou.' }
];

const passos = [
  { titulo: 'Conversa de 20 minutos', texto: 'Você me mostra a planilha ou o caderno, do jeito que estiver, e me conta como a loja funciona.' },
  { titulo: 'Seu mês arrumado, de presente', texto: 'Eu organizo um mês das suas vendas e te mando a planilha arrumada, o que mais vendeu e o que dá para melhorar. Se for caderno, eu leio pelas fotos.' },
  { titulo: 'Você usa no dia a dia', texto: 'A planilha arrumada fica com você. Se quiser ir além, a gente conversa sobre o Raio-X do mês.' }
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
  // espera com o mesmo desenho do cartão (moldura, foto escura, nome e rodapé), para a troca não dar salto
  const foto = (
    <div className="cartao-espera">
      <div className="cartao-espera-tile">
        <img src="/caio.webp" alt="Caio Simão" width="320" height="400" />
        <p><strong>Caio Simão</strong>Estudante de Engenharia no ITA</p>
      </div>
      <div className="cartao-espera-pe" aria-hidden="true" />
    </div>
  );
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
            status="Grátis"
            statusColor="#2148c0"
            contactText="Quero meu mês arrumado"
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

// Serviços em degraus. No computador a faixa azul fica parada na tela e os degraus chegam da esquerda
// para a direita conforme a rolagem; só na primeira vez (o progresso guarda o máximo e não volta).
function Degraus() {
  const trilho = useRef(null);
  useEffect(() => {
    const el = trilho.current;
    const pode = window.matchMedia('(min-width: 960px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)');
    if (!pode.matches) { el.style.setProperty('--p', 1); return undefined; }
    el.classList.add('degraus-presos');
    let maximo = 0, quadro = 0;
    const medir = () => {
      quadro = 0;
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - window.innerHeight)) / 0.8);
      if (p > maximo) { maximo = p; el.style.setProperty('--p', maximo.toFixed(3)); }
      if (maximo >= 1) window.removeEventListener('scroll', pedir);
    };
    const pedir = () => { if (!quadro) quadro = requestAnimationFrame(medir); };
    window.addEventListener('scroll', pedir, { passive: true });
    medir();
    return () => { window.removeEventListener('scroll', pedir); cancelAnimationFrame(quadro); };
  }, []);
  return (
    <div className="degraus-trilho" ref={trilho}>
      <section className="sec sec-accent" aria-labelledby="t-servicos">
        <div className="grid">
          <div className="sec-side">
            <h2 className="sec-title" id="t-servicos">O que eu posso fazer por você</h2>
            <p><strong>Por que o primeiro é grátis?</strong> Estou começando e quero conhecer lojas de verdade. Os outros passos só se fizer sentido para você, com o preço combinado antes.</p>
            <a className="btn btn-inverse" href="#formulario" onClick={irFormulario}>Quero meu mês arrumado</a>
          </div>
          <ol className="degraus">
            {degraus.map((d, i) => (
              <li key={d.titulo} style={{ '--i': i }}>
                <p className="degrau-quando">{d.quando}</p>
                <h3>{d.titulo}</h3>
                <p>{d.texto}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}

export default function App() {
  // a planilha do topo só começa a contar para se arrumar sozinha depois que o título termina de digitar
  const [tituloPronto, setTituloPronto] = useState(false);
  return (
    <>
      {/* 1. PRIMEIRA DOBRA (será reescrita na aula 1.9) */}
      <Barra onPedir={irFormulario} />
      <header className="hero" id="topo">
        {/* fundo do topo: o padrão de peças da marca, em tons claros, sumindo em direção ao texto */}
        <Padrao id="padrao-topo" className="hero-padrao" forte="var(--apoio-forte)" leve="var(--apoio)" />
        <div className="grid">
          <h1 className="hero-title"><TextType text="Sua planilha ou caderno deveria responder perguntas, não criar dúvidas." onDone={() => setTituloPronto(true)} /></h1>
          <div className="hero-copy">
            <div className="hero-dados">
              <p className="lead">
                Eu arrumo um mês das suas vendas, de presente, e te mostro o que os números dizem. Começa com uma conversa.
              </p>
              <a className="btn" href="#formulario" onClick={irFormulario}>Quero meu mês arrumado</a>
              <p className="hero-nota">Planilha bagunçada ou caderno: fotos das páginas bastam.</p>
              <p className="byline">
                <img src="/caio.webp" alt="" width="44" height="44" />
                <span><strong>Caio Simão</strong>Estudante de Engenharia no ITA</span>
              </p>
            </div>
            <dl className="hero-fatos">
              <div><dt>20 min</dt><dd>de conversa, por vídeo ou WhatsApp</dd></div>
              <div><dt>1 mês</dt><dd>das suas vendas arrumado</dd></div>
              <div className="hero-preco"><dt>R$ 0</dt><dd>para começar, sem compromisso</dd></div>
            </dl>
          </div>
          <BeforeAfter liberado={tituloPronto} />
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

        {/* 2c. E QUANTO SOBROU: exemplo do Raio-X do mês (vendas menos gastos; rosca dos fixos) */}
        <Suspense fallback={<section className="sec sobra" style={{ minHeight: '100vh' }} aria-hidden="true" />}><Sobra /></Suspense>

        {/* 3. SERVIÇOS em degraus */}
        <Degraus />

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
              <div className="quem-divide">
                <div>
                  <p className="quem-rotulo">A IA faz a parte chata</p>
                  <ul>
                    <li>lê as fotos do caderno</li>
                    <li>junta os nomes repetidos</li>
                    <li>confere as contas</li>
                  </ul>
                </div>
                <div>
                  <p className="quem-rotulo">Eu faço a parte que importa</p>
                  <ul>
                    <li>entendo como a sua loja funciona</li>
                    <li>explico o resultado sem complicar</li>
                    <li>não peço senha nem que você troque de sistema</li>
                  </ul>
                </div>
              </div>
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
              <h2 id="t-form">Pedir meu mês arrumado</h2>
              <p>Respondo em até 2 dias úteis, pelo contato que você deixar.</p>
              <a className="form-exemplo" href="#t-diag">Ver um exemplo do que você recebe</a>
              <Diagnostico />
            </div>
            <LeadForm />
          </div>
        </section>
      </main>

      {/* rodapé como o anúncio da marca: faixa azul, o símbolo, a frase e o padrão de peças no canto */}
      <footer className="footer">
        <Padrao id="padrao-rodape" className="footer-padrao" />
        <div className="grid">
          <p className="footer-marca"><Simbolo tamanho={36} cor="var(--on-accent)" /><strong>Somô</strong></p>
          <p className="footer-frase">Clareza para o seu pequeno comércio.</p>
          <p className="footer-miudo">Por Caio Simão. Os dados enviados pelo formulário são usados só para responder ao seu pedido e não são repassados a ninguém.</p>
        </div>
      </footer>
    </>
  );
}
