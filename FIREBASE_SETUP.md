# 🔥 Configuração do Firebase

## Como configurar o Firebase para funcionalidade completa

### 1. Criar projeto no Firebase
1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Clique em "Adicionar projeto"
3. Digite um nome para o projeto (ex: "barbearia-app")
4. Siga os passos de configuração

### 2. Configurar Authentication
1. No console do Firebase, vá em "Authentication"
2. Clique em "Começar"
3. Vá na aba "Sign-in method"
4. Habilite "Anônimo" (para modo demo)
5. Opcionalmente, habilite outros métodos (Email/Password, Google, etc.)

### 3. Configurar Firestore Database
1. No console do Firebase, vá em "Firestore Database"
2. Clique em "Criar banco de dados"
3. Escolha "Começar no modo de teste" (para desenvolvimento)
4. Escolha uma localização (ex: us-central1)

### 4. Obter configurações do projeto
1. No console do Firebase, vá em "Project Settings" (ícone de engrenagem)
2. Role para baixo até "Your apps"
3. Clique em "Add app" e escolha "Web" (ícone </>)
4. Digite um nome para o app (ex: "barbearia-web")
5. Copie as configurações que aparecem

### 5. Configurar variáveis de ambiente
1. Crie um arquivo `.env` na raiz do projeto
2. Cole as configurações no formato:

```env
VITE_FIREBASE_API_KEY=sua_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_projeto_id
VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
```

### 6. Configurar regras do Firestore
No console do Firebase, vá em "Firestore Database" > "Regras" e cole:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permite leitura e escrita para todos (apenas para desenvolvimento)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 7. Reiniciar o servidor
```bash
npm run dev
```

## ✅ Pronto!
Agora o app funcionará com Firebase completo, salvando dados reais no banco.

## 🚀 Modo Demo
Se não configurar o Firebase, o app funcionará em modo demo com dados fictícios.

