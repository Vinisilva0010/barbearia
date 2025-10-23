# Sistema de Barbearia

Sistema completo de gerenciamento para barbearias com agendamentos, clientes e analytics.

## 🚀 Funcionalidades

### Para Clientes
- ✅ Agendamento online de serviços
- ✅ Visualização de horários disponíveis
- ✅ Histórico de agendamentos
- ✅ Informações sobre serviços e barbeiros

### Para Administradores
- ✅ Dashboard com analytics em tempo real
- ✅ Gerenciamento de agendamentos
- ✅ Base de clientes com histórico
- ✅ Analytics avançados (horários de pico, receita, etc.)
- ✅ Configurações do sistema
- ✅ Adição de cortes avulsos (walk-in)

## 🛠️ Tecnologias Utilizadas

- **React** - Framework frontend
- **Vite** - Build tool
- **Tailwind CSS** - Estilização
- **Lucide React** - Ícones
- **LocalStorage** - Armazenamento local

## 📋 Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn

## 🚀 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/Vinisilva0010/barbearia.git
cd barbearia
```

2. Instale as dependências:
```bash
npm install
```

3. Execute o projeto:
```bash
npm run dev
```

4. Acesse no navegador:
```
http://localhost:5173
```

## 👤 Acesso Administrativo

- **Usuário:** admin
- **Senha:** admin123

## 📱 Como Usar

### Agendamento de Cliente
1. Acesse a página inicial
2. Clique em "Agendar Agora"
3. Escolha o serviço desejado
4. Selecione o barbeiro
5. Escolha data e horário
6. Preencha seus dados
7. Confirme o agendamento

### Área Administrativa
1. Clique em "Admin" na navegação
2. Faça login com as credenciais
3. Explore o dashboard com analytics
4. Gerencie agendamentos e clientes
5. Visualize relatórios e estatísticas

## 🎯 Serviços Disponíveis

- **Corte Social** - R$ 50,00 (30 min)
- **Design de Barba** - R$ 40,00 (30 min)
- **Corte + Barba** - R$ 85,00 (60 min)
- **Corte Infantil** - R$ 45,00 (40 min)

## 👨‍💼 Barbeiros

- **Enzo** - Cortes Clássicos (15 anos de experiência)
- **Gustavo** - Design de Barba (12 anos de experiência)
- **João** - Cortes Modernos (8 anos de experiência)

## 📊 Analytics Disponíveis

- Receita por período (dia/semana/mês)
- Total de serviços realizados
- Avaliação média dos clientes
- Clientes únicos atendidos
- Receita por barbeiro
- Serviços mais populares
- Horários de pico
- Satisfação dos clientes
- Metas mensais

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Lint
npm run lint
```

## 📁 Estrutura do Projeto

```
src/
├── App.jsx          # Componente principal
├── index.css        # Estilos globais
└── main.jsx         # Ponto de entrada
```

## 🚀 Deploy

### Deploy no Vercel (Recomendado)

1. **Conecte seu repositório GitHub ao Vercel:**
   - Acesse [vercel.com](https://vercel.com)
   - Faça login com sua conta GitHub
   - Clique em "New Project"
   - Importe o repositório `Vinisilva0010/barbearia`

2. **Configurações automáticas:**
   - O Vercel detectará automaticamente que é um projeto Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Deploy:**
   - Clique em "Deploy"
   - Aguarde o processo de build
   - Seu site estará disponível em uma URL do Vercel

### Deploy Manual

Para fazer deploy em outros servidores:

1. Execute o build:
```bash
npm run build
```

2. Os arquivos estarão na pasta `dist/`

3. Faça upload dos arquivos para seu servidor web

### Variáveis de Ambiente

O projeto não requer variáveis de ambiente, pois usa localStorage para armazenamento de dados.

## 📝 Licença

Este projeto está sob a licença MIT.

## 👨‍💻 Desenvolvedor

Desenvolvido por Vinicius Silva

## 📞 Suporte

Para suporte ou dúvidas, entre em contato através do GitHub Issues.