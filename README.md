# Obeid — Protótipo de Prontuário Oftalmológico

Protótipo **front-end** de um sistema de prontuário eletrônico para oftalmologia,
construído a partir de `../requirements.md`. Serve para **demonstrar o produto**
antes da reunião de requisitos com o cliente — não há backend, nem intenção de uso
clínico.

> Todos os pacientes e dados clínicos são fictícios. Nada trafega pela rede.

## Rodando

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # build de produção
```

Requer Node 18+.

## O que dá para demonstrar

| Fluxo | Onde |
|---|---|
| Fila de atendimento do dia | **Painel** |
| Agendar consulta e mover o paciente pelo fluxo (triagem → exame → médico → finalizado) | **Agenda**, quadro de fluxo |
| Cadastro completo com convênio, comorbidades, alergias e consentimento LGPD | **Pacientes → Novo paciente** |
| Consulta guiada: anamnese → exames → diagnóstico → prescrição | **Agenda → Atender** |
| 16 tipos de exame, cada um com formulário próprio e lateralidade OD/OE/AO | **Prontuário → Exames** |
| Evolução de PIO, campo visual e OCT ao longo do tempo | **Prontuário → Exames → Acompanhamento** |
| Receita de óculos pré-preenchida pela última refração, receita de colírios, atestado | **Prontuário → Prescrições** |
| Documento em A4 pronto para impressão | botão **Imprimir** em qualquer prescrição |
| Linha do tempo com tudo o que já aconteceu com o paciente | **Prontuário → Histórico** |

O estado é salvo em `localStorage`: o que for criado durante a demonstração
sobrevive ao *reload*. Para voltar ao ponto de partida, use
**⚙ → Restaurar dados de demonstração**.

## Arquitetura

```
src/
├── services/
│   ├── http.js        cliente HTTP simulado: latência, envelope, erros
│   ├── rotas-mock.js  o "servidor" — único arquivo que conhece o formato do banco
│   └── api.js         superfície consumida pelas telas
├── mocks/
│   ├── db.js          coleções em memória + persistência
│   ├── seed.js        estado inicial, com datas relativas a hoje
│   └── exames/        um arquivo por tipo de exame + registry
├── stores/            Pinia: pacientes, agenda, prontuário, catálogos
├── components/        layout, comuns, motor de exames, formulários clínicos
└── views/             telas e abas do prontuário
```

### Duas decisões que sustentam o protótipo

**1. Exames são dados, não código.** Cada tipo de exame é um *schema declarativo*
em `src/mocks/exames/`, e um único componente — `ExameFormRenderer.vue` — monta o
formulário a partir dele. O registry usa `import.meta.glob`, então **criar um
arquivo nessa pasta basta**: o exame passa a aparecer no seletor, no formulário,
na leitura do prontuário e na linha do tempo, sem tocar em nenhum componente.

```js
// src/mocks/exames/meu-exame.js
export default {
  id: 'meu-exame',
  nome: 'Meu Exame',
  grupo: 'Imagem',
  icone: 'pi-camera',
  porOlho: true,          // gera colunas OD e OE
  permiteAnexos: true,
  descricao: '…',
  resumo: (d) => `OD ${d.od?.valor} / OE ${d.oe?.valor}`,
  campos: [
    { key: 'valor', label: 'Valor', tipo: 'number', sufixo: 'mm', porOlho: true },
  ],
}
```

Um schema que declare `grafico` também ganha automaticamente um gráfico de
evolução na aba Exames.

**2. O mock está isolado atrás de uma API.** Nenhum componente importa `mocks/`.
Tudo passa por `services/api.js`, que hoje fala com um backend simulado que imita
latência, códigos de status e o formato de resposta de uma API real. Trocar pelo
backend de verdade é reescrever `api.js` sobre `fetch` e apagar `rotas-mock.js`.

Para demonstrar o comportamento sob erro de rede, crie um `.env.local`:

```
VITE_MOCK_TAXA_ERRO=0.2      # 20% das chamadas falham com 503
VITE_MOCK_LATENCIA_MIN=400
VITE_MOCK_LATENCIA_MAX=1200
```

## Cobertura dos requisitos

Todos os requisitos funcionais de `requirements.md` estão implementados e
navegáveis: cadastro (RFCAD01–03), agenda e fluxo (RFAGE01–02), anamnese
(RFANA01–02), os 16 exames com schema próprio, lateralidade e anexos
(RFEXA01–18), procedimentos separados dos exames (RFPRO01), diagnóstico com
CID-10 e conduta (RFDIA01–02), as três prescrições (RFPRE01–03) e a linha do
tempo (RFHIS01).

Quanto aos não funcionais: Vue.js (RNFTEC01), dados mockados (RNFTEC02), API
fantasma com latência e envelope reais (RNFTEC03), mock isolado atrás de uma
camada substituível (RNFTEC04) e exames extensíveis por schema (RNFTEC05).
A interface é fluida com a navegação virando *drawer* abaixo de 1024 px
(RNFUSA01) e tem busca global por `/`, atalhos de registro rápido e salvamento
por seção (RNFUSA02). Para a LGPD (RNFSEG01), CPF e telefone aparecem mascarados
nas listagens com revelação explícita, o cadastro exige consentimento com
finalidade declarada e o prontuário mostra uma trilha de acessos.

## Limitações conhecidas

- Não há autenticação: o sistema assume a Dra. Helena Marques como usuária.
- Anexos ficam apenas na sessão do navegador (`URL.createObjectURL`), sem upload.
- O catálogo CID-10 é um subconjunto oftalmológico, não a tabela completa.
- Nenhuma validação clínica: o protótipo aceita qualquer valor nos campos.
