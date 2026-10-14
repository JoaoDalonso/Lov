/**
 * Model / Content: PhaseContent
 * Conteúdo clínico-educativo e acolhedor por fase do ciclo menstrual.
 * Baseado nas diretrizes médicas e parâmetros de produto (Flo, Clue, ACOG).
 */

export const PHASE_TAGS = {
  hormones: { label: 'Hormônios & Corpo', color: 'violet' },
  symptoms: { label: 'Sintomas & Alívio', color: 'rose' },
  nutrition: { label: 'Nutrição & Chás', color: 'peach' },
  movement: { label: 'Energia & Treino', color: 'soft' },
  fertility: { label: 'Fertilidade & Sinais', color: 'info' },
  wellness: { label: 'Autocuidado', color: 'warm' }
};

export const PHASE_CONTENT = {
  menstrual: [
    {
      tone: 'rose',
      tag: 'Sintomas & Alívio',
      icon: '❤️',
      title: 'Alívio de cólicas e fluxo',
      text: 'O miométrio se contrai para descamar o endométrio. Uma bolsa de água morna na pelve e chás de camomila ou gengibre diminuem o espasmo e aliviam a dor.',
      action: { type: 'open-log', label: 'Registrar sintomas de hoje' }
    },
    {
      tone: 'violet',
      tag: 'Hormônios & Corpo',
      icon: '🌙',
      title: 'Seus hormônios agora',
      text: 'Estrogênio e progesterona estão nos níveis mais baixos do ciclo. É normal sentir maior necessidade de sono e ritmo mais recolhido.',
      action: { type: 'open-mic', label: 'Tirar dúvida com a Lov' }
    },
    {
      tone: 'peach',
      tag: 'Nutrição & Chás',
      icon: '🍵',
      title: 'Reposição de ferro e magnésio',
      text: 'Durante o sangramento, priorize folhas escuras, feijões, beterraba e sementes de abóbora. O magnésio ajuda a relaxar a musculatura uterina.'
    },
    {
      tone: 'soft',
      tag: 'Energia & Treino',
      icon: '🧘‍♀️',
      title: 'Movimento restaurativo',
      text: 'Evite treinos de impacto se houver cólica. Alongamentos da coluna lombar, ioga suave e caminhadas leves liberam endorfina analgésica.'
    },
    {
      tone: 'warm',
      tag: 'Autocuidado',
      icon: '🛏️',
      title: 'Ritmo do seu sono',
      text: 'Sua temperatura basal cai nesta fase. Mantenha o quarto aconchegante e dê a si mesma permissão para descansar sem culpa.'
    }
  ],

  follicular: [
    {
      tone: 'rose',
      tag: 'Hormônios & Corpo',
      icon: '⚡',
      title: 'Estrogênio em ascensão',
      text: 'O hormônio FSH estimula os folículos e o estrogênio começa a subir. É a fase de renovação: sua energia, clareza mental e foco aumentam.',
      action: { type: 'open-log', label: 'Registrar energia e humor' }
    },
    {
      tone: 'violet',
      tag: 'Energia & Treino',
      icon: '🏃‍♀️',
      title: 'Melhor fase para força e treinos',
      text: 'Seus músculos respondem melhor aos treinos de força e resistência. Excelente momento para iniciar novos projetos, treinos intensos e rotinas.',
      action: { type: 'open-log', label: 'Registrar atividade física' }
    },
    {
      tone: 'peach',
      tag: 'Nutrição & Chás',
      icon: '🥗',
      title: 'Alimentação pró-metabolismo',
      text: 'Apoie o metabolismo hepático do estrogênio com brócolis, couve, vegetais crucíferos, fibras e gorduras boas como azeite e abacate.'
    },
    {
      tone: 'info',
      tag: 'Fertilidade & Sinais',
      icon: '🌱',
      title: 'Secreção e colo uterino',
      text: 'A secreção vaginal começa a passar de sequinha para cremosa/hidratada, preparando o trato reprodutivo para os próximos dias férteis.'
    },
    {
      tone: 'warm',
      tag: 'Autocuidado',
      icon: '✨',
      title: 'Viço e vitalidade da pele',
      text: 'O estrogênio eleva a síntese natural de colágeno e hidratação da pele. É um ótimo momento para cuidados faciais e rotinas de skincare.'
    }
  ],

  fertile: [
    {
      tone: 'violet',
      tag: 'Fertilidade & Sinais',
      icon: '🥚',
      title: 'Janela fértil aberta',
      text: 'O muco cervical fica fluido, transparente e elástico (aspecto de clara de ovo crua). Esse sinal biológico protege e guia os espermatozoides.',
      action: { type: 'open-log', label: 'Registrar muco e libido' }
    },
    {
      tone: 'rose',
      tag: 'Hormônios & Corpo',
      icon: '💖',
      title: 'Pico de autoconfiança e libido',
      text: 'O estrogênio atinge seu pico máximo e há uma pequena elevação de testosterona. Muitas mulheres sentem aumento natural de libido e sociabilidade.',
      action: { type: 'open-mic', label: 'Conversar com a Lov' }
    },
    {
      tone: 'peach',
      tag: 'Nutrição & Chás',
      icon: '💧',
      title: 'Hidratação e antioxidantes',
      text: 'Beba bastante água para manter o muco fértil fluido e saudável. Frutas vermelhas, nozes e sementes combatem radicais livres nos folículos.'
    },
    {
      tone: 'info',
      tag: 'Fertilidade & Sinais',
      icon: '🌡️',
      title: 'Temperatura basal e ovulação',
      text: 'Antes de ovular, a temperatura basal permanece estável e pode ter uma leve queda, subindo logo após a ovulação confirmada.'
    },
    {
      tone: 'warm',
      tag: 'Autocuidado',
      icon: '🛡️',
      title: 'Objetivo reprodutivo',
      text: 'Se o objetivo for engravidar, são os melhores dias para relações. Se for evitar, utilize proteção com rigor em toda a janela.'
    }
  ],

  ovulation: [
    {
      tone: 'violet',
      tag: 'Hormônios & Corpo',
      icon: '✨',
      title: 'Pico de ovulação (LH)',
      text: 'O hormônio luteinizante (LH) rompe o folículo dominante liberando o óvulo maduro. Ele sobrevive cerca de 12 a 24 horas nas trompas.',
      action: { type: 'open-log', label: 'Registrar teste de ovulação' }
    },
    {
      tone: 'rose',
      tag: 'Sintomas & Alívio',
      icon: '📍',
      title: 'Sensação no baixo ventre',
      text: 'Uma leve pontadinha de um dos lados da pelve (chamada Mittelschmerz) é comum e sinaliza a liberação folicular ovariana.'
    },
    {
      tone: 'peach',
      tag: 'Nutrição & Chás',
      icon: '🥑',
      title: 'Gorduras boas e progesterona',
      text: 'O corpo se prepara para produzir progesterona. Alimentos com ômega-3 (chia, linhaça, salmão) e vitamina E apoiam o corpo lúteo.'
    },
    {
      tone: 'info',
      tag: 'Fertilidade & Sinais',
      icon: '🌡️',
      title: 'Pico fértil do mês',
      text: 'É o ápice do potencial reprodutivo do ciclo. A temperatura basal subirá nos próximos 1 a 2 dias confirmando a ovulação.'
    }
  ],

  luteal: [
    {
      tone: 'rose',
      tag: 'Sintomas & Alívio',
      icon: '🎈',
      title: 'Alívio de inchaço e TPM',
      text: 'A progesterona relaxa a musculatura lisa do trato digestivo, podendo causar retenção de líquidos e gases. Reduza sal e beba chás digestivos (hortelã e dente-de-leão).',
      action: { type: 'open-log', label: 'Registrar inchaço e dor' }
    },
    {
      tone: 'violet',
      tag: 'Hormônios & Corpo',
      icon: '😴',
      title: 'Progesterona e serenidade',
      text: 'A progesterona atua nos receptores GABA do cérebro, induzindo calma inicial, mas sua oscilação final pode provocar irritabilidade ou melancolia pré-menstrual.'
    },
    {
      tone: 'peach',
      tag: 'Nutrição & Chás',
      icon: '🍫',
      title: 'Desejo por carboidratos e doces',
      text: 'A serotonina tende a cair antes da menstruação. Chocolate amargo (70%+), banana com aveia e sementes de girassol aumentam o triptofano sem picos de glicemia.'
    },
    {
      tone: 'soft',
      tag: 'Energia & Treino',
      icon: '🧘‍♀️',
      title: 'Ritmo moderado e pilates',
      text: 'A temperatura corporal está mais alta e o gasto calórico basal sobe ligeiramente. Treinos moderados, pilates e caminhadas ao ar livre são ideais.'
    },
    {
      tone: 'warm',
      tag: 'Autocuidado',
      icon: '☕',
      title: 'Rotina desacelerada de sono',
      text: 'O sono pode ficar mais leve na fase lútea tardia. Crie um ritual noturno: luz baixa 1 hora antes de deitar e reduza cafeína após as 14h.'
    }
  ]
};

/**
 * Cards complementares de condições de saúde específicas
 */
export const CONDITION_TIPS = {
  sop: {
    tone: 'violet',
    tag: 'Condição: SOP',
    icon: '🩺',
    title: 'Cuidado metabólico na SOP',
    text: 'A sensibilidade à insulina afeta a ovulação. Priorize refeições equilibradas com proteínas e fibras para manter os níveis hormonais mais estáveis.'
  },
  endometriose: {
    tone: 'rose',
    tag: 'Condição: Endometriose',
    icon: '🌸',
    title: 'Cuidado anti-inflamatório',
    text: 'Aplique calor local suave e aposte em cúrcuma, gengibre e alimentos ricos em ômega-3 para modular processos inflamatórios pélvicos.'
  },
  irregular: {
    tone: 'peach',
    tag: 'Condição: Ciclo Irregular',
    icon: '📊',
    title: 'Monitoramento de padrões',
    text: 'Com ciclos variáveis, observar o muco cervical e registrar a temperatura ajuda o Lov a refinar sua estimativa a cada mês.'
  },
  pms_heavy: {
    tone: 'rose',
    tag: 'Condição: TPM / TDPM',
    icon: '🕊️',
    title: 'Acolhimento na TPM Severa',
    text: 'Seus neurotransmissores são mais sensíveis à queda de progesterona. Evite sobrecargas, pratique pausas e mantenha apoio acolhedor.'
  },
  migraine: {
    tone: 'warm',
    tag: 'Condição: Enxaqueca Menstrual',
    icon: '⚡',
    title: 'Prevenção de dor de cabeça',
    text: 'A oscilação rápida de estrogênio pode engatilhar enxaqueca. Beba bastante água, evite jejum prolongado e controle luzes fortes.'
  }
};
