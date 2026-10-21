import React from 'react';

/*
  Línea de pulso (electrocardiograma) — motivo visual de NutriLife.
  Se revela una sola vez al montar el componente; no se repite en bucle.
  Dos latidos en viewBox 600x120. El trazo se mantiene fino al escalar.
*/
const BEAT = (x) =>
  `H${x + 60} Q${x + 70} 40 ${x + 80} 60 H${x + 108} L${x + 117} 67 L${x + 130} 12 L${x + 145} 96 L${x + 153} 60 H${x + 182} Q${x + 202} 28 ${x + 224} 60 H${x + 300}`;

const PATH = `M0 60 ${BEAT(0)} ${BEAT(300)}`;

const PulseLine = ({ className = '', stroke = 'currentColor', strokeWidth = 2, soft = false }) => (
  <svg
    className={`${className} ${soft ? 'pulse-reveal-soft' : 'pulse-reveal'}`}
    viewBox="0 0 600 120"
    preserveAspectRatio="none"
    fill="none"
    aria-hidden="true"
  >
    <path
      d={PATH}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
    />
  </svg>
);

export default PulseLine;
