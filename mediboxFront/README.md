medibox/
├── app/                         # Rotas (Expo Router)
│   ├── (tabs)/                 # Navegação principal
│   │   ├── index.tsx          # Dashboard
│   │   ├── medications.tsx    # Lista de medicamentos
│   │   ├── history.tsx        # Histórico
│   │   ├── notifications.tsx  # Notificações
│   │   └── device.tsx         # IoT / dispositivo
│   └── medication/
│       ├── new.tsx            # Cadastro (modal)
│       └── [id].tsx           # Detalhe (modal)
│
├── components/
│   ├── ui/                    # Componentes genéricos
│   ├── medication/            # Componentes de medicamentos
│   └── device/                # Componentes IoT
│
├── constants/                 # Cores, estilos, configs
├── hooks/                     # Hooks customizados
├── services/                  # API (axios + mock)
├── store/                     # Zustand stores
├── types/                     # Tipagens TypeScript
└── __tests__/                 # Testes automatizados

# 1. Instalar dependências
npm install

# 2. Copiar variáveis de ambiente
cp .env.example .env

# 3. Iniciar o projeto
npx expo start

# 4. Testes
npm test

***
Para rodar o Front com o Back, "descomentar" o código em store/authStore.ts
***