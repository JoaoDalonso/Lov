# Análise de produto: apps de ciclo menstrual (Flo, Clue, Meu Calendário, Clover, Maia)

> Método: análise de UX e funcionalidades **públicas** (telas, lojas de apps, documentação e
> artigos dos próprios apps). Não envolve descompilar APKs/IPAs nem copiar código, assets ou
> textos (ToS/direitos autorais). Os parâmetros abaixo viram **nossa** especificação.

## 1. Estrutura de navegação (padrão do mercado)

| Aba | Flo | Clue | Nosso app |
|---|---|---|---|
| Hoje / Home | Anel do ciclo + "Dia X" + cards | Anel/roda do ciclo + "Track" | **Hoje** |
| Calendário | Mês com dias coloridos + previsão | Mês/linha do tempo | **Calendário** |
| Análises | Insights, gráficos de sintomas | Analysis | **Insights** |
| Conteúdo | Artigos/vídeos, "Secret Chats" | Artigos | **Aprender** |
| Perfil | Conta, lembretes, premium | Configurações | **Perfil** |

## 2. Telas e componentes-chave (vistos nas capturas)

- **Anel do ciclo**: círculo dividido em fases (menstruação, folicular, fértil/ovulação, lútea),
  com "Dia 5", "Menstruação: 5º dia" ou "2 dias até o próximo período" no centro.
- **Faixa semanal** no topo (Seg–Dom) com o dia atual destacado.
- **Botão "Editar menstruação"** e "Registrar sintomas" (+).
- **Cards "Conteúdo do dia"**: sintomas esperados, dia do ciclo, artigos.
- **Calendário mensal**: gota vermelha = menstruação, tracejado = previsão, roxo/azul = fértil,
  ponto = ovulação.
- **Tela de registro diário**: categorias com ícones em grade.

## 3. Parâmetros rastreados (modelo de dados)

### 3.1 Ciclo
| Campo | Tipo | Observação |
|---|---|---|
| `periodStart` / `periodEnd` | date | cada menstruação registrada |
| `cycleLength` | int (dias) | média padrão 28; válido 21–35 (alerta fora de 21–45) |
| `periodLength` | int (dias) | média padrão 5; válido 2–10 |
| `lutealPhaseLength` | int | padrão 14 |
| `flow` | enum | spotting, leve, médio, intenso |

### 3.2 Registro diário
| Categoria | Valores |
|---|---|
| Fluxo | spotting, leve, médio, intenso |
| Humor | feliz, calma, energizada, sensível, irritada, ansiosa, triste, mudanças de humor |
| Sintomas físicos | cólica, dor de cabeça, dor lombar, inchaço, sensibilidade nos seios, acne, náusea, fadiga, desejo por comida, insônia |
| Secreção vaginal | nenhuma, pegajosa, cremosa, aquosa, clara/elástica (clara de ovo), atípica |
| Sexo | sem proteção, com proteção, libido (baixa/alta), masturbação |
| Teste de ovulação (LH) | negativo, positivo, não feito |
| Teste de gravidez | negativo, positivo |
| Temperatura basal | °C (ex.: 36,40) |
| Peso | kg |
| Sono | horas + qualidade |
| Água | copos/ml |
| Atividade física | tipo + duração |
| Medicação/pílula | tomada sim/não, horário |
| Notas | texto livre |

## 4. Parâmetros de previsão (núcleo "inteligente")

Versão 1 (heurística, igual ao que apps simples fazem):

```
cicloMedio    = média ponderada dos últimos 3–6 ciclos (peso maior nos recentes)
proxPeriodo   = ultimoInicio + cicloMedio
ovulacao      = proxPeriodo - faseLutea(14)
janelaFertil  = ovulacao - 5  ..  ovulacao + 1
confianca     = f(desvio-padrão dos ciclos)   // mostrar "± N dias"
```

Regras de produto observadas:
- Previsão em **intervalo** ("entre dia X e Y") quando ciclos são irregulares (desvio > 3 dias).
- Poucos dados (< 3 ciclos) → usar valores informados no onboarding e marcar "estimativa".
- Atraso → mostrar "Atrasada N dias" e sugerir teste de gravidez.
- Ciclos > 45 dias ou < 21 → sinalizar possível irregularidade (sem diagnosticar).
- Fases: menstrual (dia 1..periodLength), folicular, ovulatória (~3 dias), lútea.

Versão 2 (futuro): temperatura basal + LH para confirmar ovulação, ML por usuária.

## 5. Onboarding (perguntas típicas)

1. Objetivo: acompanhar ciclo / tentar engravidar / evitar gravidez / gestação / menopausa
2. Data da última menstruação
3. Duração média da menstruação
4. Duração média do ciclo (ou "não sei")
5. Idade
6. Uso de anticoncepcional
7. Sintomas frequentes
8. Permissão de notificações + lembretes
9. Criação de conta (opcional) / PIN ou biometria

## 6. Notificações e lembretes

- Período chegando (1–3 dias antes), janela fértil, ovulação, atraso
- Lembrete diário de registro, pílula, água
- Horário configurável; texto discreto (modo privado)

## 7. Privacidade (diferencial competitivo pós-2022)

- PIN/biometria, ícone/nome discreto, modo anônimo
- Dados criptografados; exportar e **excluir** tudo (LGPD)
- Consentimento explícito para análises/anúncios — **sem** venda de dados de saúde
- Dados de saúde são **sensíveis** na LGPD (art. 11)

## 8. Monetização observada

- Freemium: registro + previsão grátis; premium = insights avançados, relatórios PDF,
  conteúdo exclusivo, sem anúncios.
- Preço de referência: R$ 15–35/mês ou plano anual.

## 9. Design system (direção para o nosso)

- Paleta rosa/coral suave + roxo (fértil) + azul claro; modo escuro
- Fontes arredondadas (ex.: Nunito / Poppins), cantos 16–24px
- Anel central como "herói" da Home, microanimações ao registrar
- Identidade **própria** (não copiar logos, ícones ou ilustrações de terceiros)
- Idiomas: PT-BR (padrão) + EN desde o início (arb/i18n)

## 10. Decisão de arquitetura

| Camada | Tecnologia | Padrão Arquitetural |
|---|---|---|
| Front | **Mobile First (JS / Flutter)** | **MVC (Model-View-Controller)** |
| Back | **Java + Spring Boot** | **Spring MVC (Controller / Service / Model-Entity)** |
| Banco | PostgreSQL | Relacional |
| i18n | arb/i18n ou JSON | Dicionários PT-BR e EN |

### Diretriz Obrigatória: Arquitetura MVC (Model-View-Controller)

Todo o desenvolvimento segue rigorosamente a separação em três camadas:

1. **Model (Modelo):**
   - Regras de negócio, cálculos biológicos do ciclo (fases, ovulação, janela fértil).
   - Gerenciamento de estado e persistência (localStorage / SQLite / entidades de banco).
   - Não acessa elementos do DOM nem possui conhecimento sobre a interface gráfica.
2. **View (Visualização):**
   - Renderização dos componentes visuais (Anel do ciclo SVG, Calendário, Barra semanal, Estatísticas, Sheets).
   - Captura eventos do usuário e expõe métodos de `bind` para os Controllers.
   - Não contém regras de negócio ou de persistência.
3. **Controller (Controlador):**
   - Orquestrador do fluxo da aplicação.
   - Escuta eventos disparados pelas Views, invoca mutações no Model e comanda a atualização das Views.
   - Gerencia navegação e transições de tela.

> Laravel foi descartado no front: com Spring no back haveria dois backends redundantes. Flutter/Mobile Web cobre o formato nativo esperado.

## 11. Assistente de IA por voz (Fase 3)

**Objetivo:** a usuária conversa por áudio; a IA tira dúvidas gerais e conversa de forma
acolhedora, usando (com consentimento) o contexto do ciclo dela.

### Fluxo
```
Flutter (microfone) --stream de áudio--> Spring Boot (WebSocket) --> Gemini Live API
        <---------- áudio/texto de resposta (streaming) <-------------
```

### Parâmetros / decisões
| Item | Decisão |
|---|---|
| Modelo | Gemini (Live API para voz em tempo real; modelo de texto para chat escrito) |
| Chave da API | **Só no backend**; app usa token efêmero ou proxy Spring |
| Contexto | fase atual, dia do ciclo, sintomas recentes (opt-in, minimizado) |
| Modos | voz em tempo real + chat de texto como fallback |
| Histórico | opcional, apagável pela usuária |
| Gravação de áudio | **não armazenar** por padrão; só transcrição, se ela permitir |

### Guardrails (obrigatórios)
- Aviso fixo: "não substitui orientação médica"; sem diagnóstico ou prescrição
- Sinais de alerta (dor intensa, sangramento anormal, atraso + sintomas, saúde mental/crise)
  → orientar a procurar profissional/serviço de emergência (CVV 188)
- System prompt com tom empático, linguagem inclusiva, sem julgamento
- Moderação de entrada/saída e limite de uso (rate limit) por usuária
- Consentimento específico para uso de voz e de dados de saúde (LGPD art. 11)

## 12. Login e conta (Fase 2)

| Provedor | Situação | Observação |
|---|---|---|
| E-mail + senha | Base | JWT + refresh token, verificação de e-mail |
| **Google** | Viável | `google_sign_in` (Flutter) → ID token validado no Spring |
| **Instagram** | **Limitado** | A Basic Display API foi encerrada (dez/2024); login Instagram só existe para contas Business/Creator. Para usuária comum, usar **Login com Facebook/Meta**, ou apenas "conectar Instagram" para exibir o @ no perfil |
| Apple | **Recomendado** | Obrigatório na App Store se houver login social de terceiros |

- Biometria/PIN local para abrir o app (privacidade).
- Vinculação de múltiplos provedores à mesma conta.
- **Verificar a política atual da Meta antes de implementar Instagram.**

## 13. Perfil e rede de amizades (Fase 4)

### Perfil
- Foto (upload, recorte, compressão; armazenamento em bucket com URL assinada)
- Nome/apelido, @usuario único, bio curta, data de nascimento (**idade mínima**)
- Visibilidade: o que amigas veem (nada / só fase / apelido+foto)
- **Dados de ciclo nunca são públicos por padrão**

### Amizades entre mulheres
| Função | Detalhe |
|---|---|
| Buscar | por @usuario ou convite por link/QR |
| Solicitar / aceitar / recusar | fluxo bilateral |
| Bloquear / denunciar | obrigatório desde o dia 1 |
| Compartilhar (opt-in) | ex.: "estou na fase lútea", granular por amiga |
| Chat 1:1 | fase posterior; texto + moderação |
| Comunidade/grupos | fase posterior |

### Modelo de dados (backend)
`users`, `auth_identities`, `profiles`, `friendships(status)`, `blocks`, `reports`,
`share_settings`, `cycles`, `daily_logs`, `ai_conversations`.

### Segurança e conformidade
- Menores de idade: definir política (idade mínima, consentimento dos responsáveis — ECA/LGPD)
- Moderação de fotos e textos, rate limit de pedidos de amizade (anti-spam/assédio)
- Dados de saúde sensíveis: criptografia em trânsito e em repouso, exportar/excluir conta
- Política de privacidade e termos antes de lançar

## 14. Roadmap por fases

| Fase | Entrega | Camada |
|---|---|---|
| **1 – Núcleo** | Setup Flutter, tema, i18n, onboarding, Home com anel, calendário, registro diário, previsão local, insights básicos | Front |
| **2 – Conta e API** | Spring Boot + PostgreSQL, login e-mail/Google/Apple (+ Meta), sincronização de dados, notificações push | Back + Front |
| **3 – IA** | Chat de texto, depois voz em tempo real (WebSocket), guardrails, histórico opcional | Back + Front |
| **4 – Social** | Perfil com foto, busca, amizades, bloqueio/denúncia, compartilhamento opt-in | Back + Front |
| **5 – Crescimento** | Premium, relatórios PDF, chat entre amigas, comunidade, wearables | Todos |

> Começamos pela **Fase 1**, que é 100% front e não depende do backend: os dados ficam
> locais (Drift/SQLite ou Hive) e depois sincronizam com a API na Fase 2.
