/**
 * Conteúdo textual por fase do ciclo (cards "Para você, hoje").
 * Linguagem informativa, sem aconselhamento médico.
 */
export const PHASE_CONTENT = {
  menstrual: [
    { tone: 'rose', icon: '❤️', title: 'Sintomas esperados', text: 'Cólica leve, cansaço e sono mais pesado são comuns.' },
    { tone: 'violet', icon: '🌙', title: 'Seu corpo agora', text: 'Hormônios em níveis baixos. Descansar mais ajuda.' },
    { tone: 'peach', icon: '🍵', title: 'Autocuidado', text: 'Chá morno e alongamento suave podem aliviar a cólica.' }
  ],
  follicular: [
    { tone: 'rose', icon: '⚡', title: 'Mais energia', text: 'O estrogênio sobe e muitas pessoas se sentem mais dispostas.' },
    { tone: 'violet', icon: '🌱', title: 'Seu corpo agora', text: 'O corpo se prepara para a ovulação nos próximos dias.' },
    { tone: 'peach', icon: '🏃‍♀️', title: 'Movimento', text: 'Boa fase para treinos mais intensos e novos desafios.' }
  ],
  fertile: [
    { tone: 'rose', icon: '🥚', title: 'Janela fértil', text: 'A secreção pode ficar parecida com clara de ovo.' },
    { tone: 'violet', icon: '🌡️', title: 'Observe os sinais', text: 'Registrar muco e temperatura ajuda a entender seu padrão.' },
    { tone: 'peach', icon: '💧', title: 'Hidratação', text: 'Beba água ao longo do dia para manter o bem-estar.' }
  ],
  ovulation: [
    { tone: 'rose', icon: '✨', title: 'Provável ovulação', text: 'É o pico de fertilidade do ciclo, segundo a estimativa.' },
    { tone: 'violet', icon: '🌡️', title: 'Temperatura', text: 'A temperatura basal costuma subir logo após a ovulação.' },
    { tone: 'peach', icon: '😊', title: 'Humor e libido', text: 'Muitas pessoas percebem mais disposição e libido.' }
  ],
  luteal: [
    { tone: 'rose', icon: '🎈', title: 'Sintomas de TPM', text: 'Inchaço, sensibilidade nos seios e oscilações de humor.' },
    { tone: 'violet', icon: '😴', title: 'Seu corpo agora', text: 'A progesterona sobe e o sono pode ficar mais leve.' },
    { tone: 'peach', icon: '🧘‍♀️', title: 'Autocuidado', text: 'Rotina de sono e pausas ajudam a atravessar a TPM.' }
  ]
};
