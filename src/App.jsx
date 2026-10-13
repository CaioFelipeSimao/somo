import { useReducedMotion } from 'motion/react';
import BlurText from './components/BlurText';
import StrokeText from './components/StrokeText';
import LeadForm from './LeadForm';

// Exemplo de painel: os valores são fictícios, troque à vontade.
const lucroPorProduto = [
  { produto: 'Cadernos', valor: 1840 },
  { produto: 'Mochilas', valor: 1215 },
  { produto: 'Canetas', valor: 960 },
  { produto: 'Presentes', valor: 430 },
  { produto: 'Cópias', valor: 290 }
];

const problemas = [
  'Não sei qual produto dá mais lucro.',
  'Gasto horas copiando dados de um lugar para outro.',
  'Só uma pessoa entende a planilha.',
  'Não confio nos números no fim do mês.'
];

const servicos = [
  { titulo: 'Painel de vendas simples', texto: 'Uma tela que mostra o que vendeu, quanto e o que deu lucro.' },
  { titulo: 'Relatório semanal automático', texto: 'Um resumo da semana que chega pronto, sem você copiar nada.' },
  { titulo: 'Estoque e caixa organizados', texto: 'Uma planilha arrumada para saber o que tem na loja e quanto entrou e saiu.' }
];

const passos = [
  { titulo: 'Conversa de 20 minutos', texto: 'Você me mostra como controla vendas e estoque hoje.' },
  { titulo: 'Diagnóstico por escrito', texto: 'Eu te mando o que dá para melhorar, em palavras simples.' },
  { titulo: 'Proposta sem compromisso', texto: 'Se fizer sentido, eu digo como posso ajudar. Se não, você fica com o diagnóstico.' }
];

const real = valor => `R$ ${valor.toLocaleString('pt-BR')}`;

export default function App() {
  const reduce = useReducedMotion();
  const maior = Math.max(...lucroPorProduto.map(p => p.valor));

  return (
    <>
      {/* 1. PRIMEIRA DOBRA (será reescrita na aula 1.9) */}
      <header className="hero">
        <div className="grid">
          <h1 className="hero-title">Sua planilha deveria responder perguntas, não criar dúvidas.</h1>
          <div className="hero-copy">
            <p className="lead">
              Em 20 minutos eu olho como você controla vendas e estoque e te digo, sem custo, o que dá para melhorar.
            </p>
            <a className="btn" href="#formulario">Pedir diagnóstico gratuito</a>
          </div>

          <figure className="chart">
            <p className="chart-title">Lucro por produto no mês</p>
            <ol className="chart-rows">
              {lucroPorProduto.map((p, i) => (
                <li key={p.produto} className={p.valor === maior ? 'top' : undefined}
                    style={{ '--v': Math.round((p.valor / maior) * 100), '--i': i }}>
                  <span>{p.produto}</span>
                  <span className="bar" />
                  <span className="val">{real(p.valor)}</span>
                </li>
              ))}
            </ol>
            <figcaption>Exemplo com dados fictícios.</figcaption>
          </figure>
        </div>
      </header>

      <main>
        {/* 2. PROBLEMAS: cada frase sai do borrão e fica nítida (Blur Text) */}
        <section className="sec">
          <div className="grid">
            <h2 className="sec-title">Parece com a sua rotina?</h2>
            <ul className="problems">
              {problemas.map(frase => (
                <li key={frase}>
                  {reduce ? frase : <BlurText text={frase} delay={70} direction="top" threshold={0.6} />}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 3. SERVIÇOS */}
        <section className="sec sec-accent">
          <div className="grid">
            <h2 className="sec-title">O que eu posso fazer por você</h2>
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
        <section className="sec">
          <div className="grid">
            <h2 className="sec-title">Como funciona</h2>
            <ol className="steps">
              {passos.map((p, i) => (
                <li key={p.titulo}>
                  <div className="step-num" aria-hidden="true">
                    <StrokeText
                      text={String(i + 1)}
                      strokeColor="currentColor"
                      fillColor="currentColor"
                      strokeWidth={1.5}
                      drawDuration={1.2}
                      fillDelay={0.1 + i * 0.15}
                      trigger="scroll"
                      fillMode="wipe"
                      fontSize={72}
                      fontWeight={700}
                      letterSpacing={-3}
                    />
                  </div>
                  <h3>{p.titulo}</h3>
                  <p>{p.texto}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 5. QUEM FAZ */}
        <section className="sec">
          <div className="grid">
            <h2 className="sec-title">Quem faz</h2>
            <p className="about">
              Sou estudante de Engenharia no ITA, com experiência em análise de dados e gestão de projetos. Meu trabalho é
              transformar a sua planilha em respostas claras, sem complicar.
            </p>
          </div>
        </section>

        {/* 6. FORMULÁRIO */}
        <section className="sec sec-form" id="formulario">
          <div className="grid">
            <div className="form-intro">
              <h2>Pedir diagnóstico gratuito</h2>
              <p>20 minutos, sem custo e sem compromisso. Respondo em até 2 dias úteis.</p>
            </div>
            <LeadForm />
          </div>
        </section>
      </main>
    </>
  );
}
