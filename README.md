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

## Deploy com Docker

```bash
docker build -t obeid-front:0.1.0 .
docker run -d -p 8080:8080 obeid-front:0.1.0   # http://localhost:8080
```

Ou, com Compose:

```bash
docker compose up -d --build
```

A imagem é multi-stage: o primeiro estágio compila com Node 22, o segundo serve
o `dist/` com nginx. Como todo o "backend" roda dentro do navegador, a imagem de
produção não precisa de Node — são ~20 MB baseados em
`nginxinc/nginx-unprivileged`, rodando como usuário `nginx` (uid 101) na porta
**8080**, sem privilégios de root.

O nginx devolve `index.html` para qualquer rota não encontrada, que é o que o
`vue-router` em modo *history* exige para links diretos como
`/pacientes/pac-001/exames` funcionarem. Os assets, cujos nomes já carregam hash
de conteúdo, são cacheados por um ano; o `index.html` nunca.

Para publicar atrás de um proxy em um subcaminho (ex: `/demo`), defina
`base: '/demo/'` em `vite.config.js` antes de construir a imagem.

## O que dá para demonstrar

| Fluxo | Onde |
|---|---|
| Busca de paciente por nome, CPF ou telefone (atalho `/`) | qualquer tela |
| Cadastro com convênio e consentimento LGPD | **Pacientes → Novo paciente** |
| Antecedentes: doenças oculares, comorbidades, cirurgias prévias e observações | **Prontuário → Antecedentes** |
| Alergias, que alimentam o aviso do cabeçalho e o alerta da prescrição | **Prontuário → Alergias** |
| Anamnese com os campos que o serviço escolher | **Prontuário → Anamnese** |
| 16 tipos de exame, cada um com formulário próprio e lateralidade OD/OE/AO | **Prontuário → Exames** |
| Receita de óculos pré-preenchida pela última refração, receita de colírios, atestado | **Prontuário → Prescrições** |
| Documento em A4 pronto para impressão | botão **Imprimir** em qualquer prescrição |
| **Correção de qualquer registro**, mantendo a versão anterior | botão **Corrigir** em qualquer cartão |

O estado é salvo em `localStorage`: o que for criado durante a demonstração
sobrevive ao *reload*. Para voltar ao ponto de partida, use
**⚙ → Restaurar dados de demonstração**.

## Identidade visual

A paleta parte das duas cores da clínica — azul `#12548D` e cinza-azulado
`#B2BDC6`. Os demais degraus de `src/theme.js` foram gerados em OKLab a partir
delas, ancorando cada cor no degrau em que o sistema realmente a exibe
(`primary.500` nos botões e links do tema claro; `surface.300` nas bordas e
superfícies). Os contrastes de texto foram conferidos: 7,8:1 no botão primário,
6,8:1 no texto secundário, 4,8:1 no botão do tema escuro.

Os tons de lateralidade (OD âmbar, OE azul, AO magenta) são outra coisa: são
cores de dado, escolhidas para permanecerem distinguíveis entre si sob
daltonismo, e não seguem a marca.

## Arquitetura

```
src/
├── services/
│   ├── http.js        cliente HTTP simulado: latência, envelope, erros
│   ├── rotas-mock.js  o "servidor" — único arquivo que conhece o formato do banco
│   └── api.js         superfície consumida pelas telas
├── mocks/
│   ├── db.js              coleções em memória + persistência
│   ├── seed.js            estado inicial, com datas relativas a hoje
│   ├── anamnese-campos.js catálogo de perguntas da anamnese
│   └── exames/            um arquivo por tipo de exame + registry
├── stores/            Pinia: pacientes, prontuário, catálogos
├── components/        layout, comuns, motor de exames, cartão de registro
│                      e formulários clínicos
└── views/             telas e abas do prontuário
```

### Quatro decisões que sustentam o protótipo

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

**2. Nada se apaga: registros são corrigidos.** Um lançamento errado não é
removido nem sobrescrito. **Corrigir** grava uma versão nova que aponta para a
que substitui (`corrigeId`), marca a anterior como substituída
(`corrigidoPorId`) e preserva a data clínica — o exame foi feito quando foi
feito; só o `criadoEm` marca quando a correção aconteceu. As listagens mostram
a versão em vigor e revelam as anteriores sob demanda.

As cinco coleções clínicas passam por três fábricas, então o recurso inteiro
custou uma adição em cada uma: a rota `POST /{recurso}/:id/correcao` em
`services/rotas-mock.js`, `corrigir()` em `services/api.js` e `corretor()` em
`stores/prontuario.js`. Na tela, `components/prontuario/RegistroCard.vue` dá a
mesma aparência e o mesmo comportamento às cinco abas.

**3. A anamnese também é dirigida por dados.** `src/mocks/anamnese-campos.js`
lista tudo que pode ser perguntado, e o formulário exibe o catálogo inteiro —
acrescentar uma pergunta ao sistema é acrescentar um objeto ali.

Na gravação entram só as perguntas respondidas: uma anamnese em que se preencheu
duas grava duas, não treze. O registro reflete o que de fato foi perguntado, e é
isso que a leitura mostra. Caixa de seleção desmarcada conta como não
respondida — `false` é o valor inicial de quem nem olhou para a pergunta, não
uma negativa registrada. Ao corrigir, o catálogo reaparece com os valores
existentes, para que dê para acrescentar o que faltou.

**4. O mock está isolado atrás de uma API.** Nenhum componente importa `mocks/`.
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
navegáveis: cadastro (RFCAD01), antecedentes (RFCAD02) e alergias (RFCAD03),
anamnese (RFANA01–02), os 16 exames com schema próprio, lateralidade e anexos
(RFEXA01–18), procedimentos separados dos exames (RFPRO01), diagnóstico com
CID-10 e conduta (RFDIA01–02), as três prescrições (RFPRE01–03), a anamnese que
grava só o que foi respondido (RFANA03) e a correção de registros (RFCOR01–04).

Agendamento, fluxo de atendimento e linha do tempo foram retirados do escopo:
o sistema é só o prontuário, e o uso consiste em acrescentar entradas na tela
do paciente. Não existe entidade de consulta — cada registro é um lançamento
autônomo, com a sua data e o seu responsável.

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
- A correção não tem assinatura digital nem carimbo de tempo confiável — a
  rastreabilidade é apenas estrutural.
