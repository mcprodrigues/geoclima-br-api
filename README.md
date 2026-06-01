# GeoClima BR

API REST em **NestJS** que agrega **dados climáticos** (Open-Meteo) e **dados geográficos**
(IBGE via BrasilAPI) de cidades brasileiras. O usuário informa apenas o nome da cidade e a
aplicação resolve dinamicamente coordenadas, estado e previsão do tempo — sem coordenadas
fixas no código.

> Trabalho acadêmico da disciplina de Técnicas de Integração de Sistemas (N703).

---

## Sumário

- [Arquitetura](#arquitetura)
- [Stack](#stack)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Execução](#execução)
- [Testes](#testes)
- [Rotas](#rotas)
- [APIs externas](#apis-externas)
- [Estrutura do repositório](#estrutura-do-repositório)

---

## Arquitetura

O projeto segue um padrão **modular com ports & adapters** (hexagonal), um módulo por
feature (`clima`, `cidades`, `ping`) mais `health`:

- **Ports** (`interfaces/*.port.ts`): contratos das dependências externas, expostos via
  tokens de injeção (`Symbol.for(...)`).
- **Use-cases** (`use-cases/*.use-case.ts`): regra de aplicação isolada, sem acoplamento ao
  framework HTTP. Validam a entrada, orquestram as ports e montam a resposta.
- **Adapters** (ex.: `open-meteo-geocoding.adapter.ts`, `brasil-api-municipios.adapter.ts`):
  implementam as ports traduzindo as APIs externas para o domínio (anti-corruption layer).
- **Service**: implementa a interface de serviço do módulo e delega aos use-cases.
- **Controller**: adapter de entrada HTTP; converte erros de domínio em respostas via um
  `handleError` privado.
- **Erros compartilhados** (`src/shared/errors`): `AppError` (base, com `statusCode`),
  `NotFoundError` (404) e `ServiceUnavailableError` (503).

Fluxo de erro: use-cases/adapters lançam `AppError` (ou subclasses); o controller mapeia
para a `HttpException` correspondente do NestJS. Erros inesperados viram `500` sem vazar
stack para o cliente.

---

## Stack

- **NestJS 11** (Node 20+) — `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`
- **@nestjs/axios** (HttpModule) — chamadas HTTP às APIs externas
- **@nestjs/terminus** — health check
- **@nestjs/swagger** — documentação OpenAPI em `/api/docs`
- **class-validator / class-transformer** — `ValidationPipe`
- **Jest** — testes unitários

---

## Pré-requisitos

- **Node.js 20+** e npm.

```bash
node -v   # deve ser 20.x ou superior
```

> Usando `nvm`: `nvm use 20`.

---

## Instalação

```bash
npm install
```

---

## Execução

A aplicação sobe na **porta 3000** por padrão (configurável via variável `PORT`).

```bash
# desenvolvimento (watch)
npm run start:dev

# produção
npm run build
npm run start:prod
```

- API: `http://localhost:3000`
- Documentação Swagger: `http://localhost:3000/api/docs`

> Para usar outra porta: `PORT=3100 npm run start:prod`.

---

## Testes

```bash
npm test            # roda toda a suíte (Jest)
npm run test:watch  # modo watch
npm run test:cov    # com cobertura
```

Os testes são unitários e co-locados em `src/modules/<feature>/tests/`, mockando as ports
via `Test.createTestingModule` (não dependem de rede).

---

## Rotas

Base: `http://localhost:3000`. As rotas de domínio ficam sob o prefixo **`/api/v1`**;
`/` e `/ping` ficam na raiz.

| Método | Rota                          | Descrição                             |
|--------|-------------------------------|---------------------------------------|
| GET    | `/`                           | Mensagem de boas-vindas               |
| GET    | `/ping`                       | Liveness — retorna `pong!`            |
| GET    | `/api/v1/health`              | Health check (Terminus)               |
| GET    | `/api/v1/clima/{nome_cidade}` | Clima atual de uma cidade brasileira  |
| GET    | `/api/v1/cidades/{sigla_uf}`  | Municípios de uma UF (`?limite=10`)   |

### `GET /`

```
GeoClima BR (N703) — agregação de dados climáticos e geográficos do Brasil. Documentação em /api/docs.
```

### `GET /ping`

```
pong!
```

### `GET /api/v1/health`

Health check via Terminus, verificando BrasilAPI e Open-Meteo. **200** quando saudável:

```json
{
  "status": "ok",
  "info": {
    "brasil-api": { "status": "up" },
    "open-meteo": { "status": "up" }
  },
  "error": {},
  "details": {
    "brasil-api": { "status": "up" },
    "open-meteo": { "status": "up" }
  }
}
```

Se alguma dependência estiver fora, retorna **503** com o serviço em `error`.

### `GET /api/v1/clima/{nome_cidade}`

Resolve as coordenadas pelo nome (geocoding) e retorna a previsão do dia.

**200** — `GET /api/v1/clima/Fortaleza`:

```json
{
  "nome": "Fortaleza",
  "estado": "CE",
  "clima": {
    "temperatura_min": 24,
    "temperatura_max": 32,
    "condicao": "Parcialmente nublado",
    "unidades": { "temperatura": "°C" }
  },
  "consultado_em": "2025-03-15T14:30:00.000Z"
}
```

Erros:

| HTTP | Quando                                              |
|------|-----------------------------------------------------|
| 400  | nome da cidade com menos de 2 caracteres            |
| 404  | nenhuma cidade brasileira encontrada para o nome    |
| 503  | falha/timeout na chamada ao Open-Meteo              |

### `GET /api/v1/cidades/{sigla_uf}?limite=10`

Lista municípios da UF. `limite` é opcional (padrão **10**, restringido ao intervalo 1–100).

**200** — `GET /api/v1/cidades/CE?limite=5`:

```json
{
  "uf": "CE",
  "quantidade_retornada": 5,
  "cidades": [{ "nome": "Abaiara" }, { "nome": "Acarape" }],
  "consultado_em": "2025-03-15T14:30:00.000Z"
}
```

Erros:

| HTTP | Quando                                  |
|------|-----------------------------------------|
| 400  | sigla da UF sem exatamente 2 letras     |
| 404  | UF inexistente                          |
| 503  | falha/timeout na chamada à BrasilAPI    |

### Formato de erro

Os erros seguem o formato padrão do NestJS, por exemplo:

```json
{ "statusCode": 404, "message": "Nenhuma cidade encontrada com o nome informado", "error": "Not Found" }
```

---

## APIs externas

- **BrasilAPI / IBGE** — municípios por UF
  `https://brasilapi.com.br/api/ibge/municipios/v1/{UF}`
- **Open-Meteo Geocoding** — resolve nome → coordenadas + estado
  `https://geocoding-api.open-meteo.com/v1/search`
- **Open-Meteo Forecast** — previsão do dia por coordenada
  `https://api.open-meteo.com/v1/forecast`

Créditos: [BrasilAPI](https://brasilapi.com.br) e [Open-Meteo](https://open-meteo.com)
(dados climáticos gratuitos sob licença aberta).

---

## Estrutura do repositório

```
src/
├── main.ts                      # bootstrap (prefixo, CORS, validação, Swagger)
├── app.module.ts
├── app.controller.ts            # GET /  (mensagem)
├── app.service.ts
├── shared/
│   └── errors/                  # AppError, NotFoundError, ServiceUnavailableError
├── health/                      # health check (Terminus)
└── modules/
    ├── ping/                    # GET /ping
    ├── clima/                   # consulta de clima (Open-Meteo)
    │   ├── interfaces/          # ports (geocoding, forecast, service)
    │   ├── use-cases/           # consultar-clima.use-case
    │   ├── value-objects/       # nome-cidade.vo
    │   ├── dto/                 # clima.response.dto
    │   ├── *.adapter.ts         # adapters Open-Meteo
    │   └── tests/
    └── cidades/                 # municípios por UF (BrasilAPI)
        ├── interfaces/          # ports (municipios, service)
        ├── use-cases/           # listar-cidades.use-case
        ├── value-objects/       # sigla-uf.vo
        ├── dto/                 # cidades.response.dto
        ├── *.adapter.ts         # adapter BrasilAPI
        └── tests/

docs/
└── postman_collection.json      # coleção Postman (schema v2.1)
```


