# MediBox — App Mobile

Aplicativo mobile do sistema inteligente de gerenciamento e dispensação de medicamentos.
Desenvolvido com **React Native (Expo)** + **TypeScript**.

## Tecnologias

- Expo SDK 51 + Expo Router (navegação file-based)
- TypeScript (strict)
- Zustand (gerenciamento de estado)
- Axios (HTTP)
- date-fns (datas em pt-BR)
- Jest + Testing Library (testes)

## Estrutura do projeto

```
medibox/
├── app/                    # Telas (expo-router)
│   ├── (tabs)/             # Navegação por tabs
│   │   ├── index.tsx       # Home / Dashboard
│   │   ├── medications.tsx # Lista de medicamentos
│   │   ├── history.tsx     # Histórico
│   │   ├── notifications.tsx # Notificações
│   │   └── device.tsx      # Status do dispositivo IoT
│   └── medication/
│       ├── new.tsx         # Cadastrar medicamento (modal)
│       └── [id].tsx        # Detalhe/edição (modal)
├── components/
│   ├── ui/                 # Componentes genéricos
│   └── medication/         # Componentes de medicamento
│   └── device/             # Componentes do dispositivo
├── constants/              # Cores, espaçamentos, config
├── hooks/                  # useTheme, etc
├── services/               # API calls (axios + mock)
├── store/                  # Zustand stores
├── types/                  # Interfaces TypeScript
└── __tests__/              # Testes unitários
```

## Como rodar

```bash
# 1. Instalar dependências
npm install

# 2. Copiar variáveis de ambiente
cp .env.example .env

# 3. Iniciar o Expo
npx expo start

# Rodar no Android
npx expo start --android

# Rodar no iOS
npx expo start --ios
```

## Testes

```bash
npm test
```

## Variáveis de ambiente

| Variável | Descrição | Default |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | URL do backend Node.js | `http://localhost:3000` |
| `EXPO_PUBLIC_ENV` | Ambiente | `development` |

## Modo mock

Em desenvolvimento (`__DEV__ === true`), os serviços usam dados mock locais — **não precisa do backend rodando** para desenvolver o front.

Para conectar ao backend real, defina `EXPO_PUBLIC_API_URL` no `.env`.

## Próximos passos

- [ ] Tela de login / autenticação JWT
- [ ] Tela de cadastro de responsáveis
- [ ] Push notifications com Expo Notifications
- [ ] Integração real com o backend Node.js
- [ ] Testes de componentes com Testing Library
