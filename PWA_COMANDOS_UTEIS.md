# 🛠️ PWA - COMANDOS ÚTEIS

## 🚀 Desenvolvimento

### Iniciar servidor de desenvolvimento
```bash
npm run dev
```

### Build para produção
```bash
npm run build
```

### Preview do build
```bash
npm run preview
```

---

## 🧪 Testes

### Testar PWA localmente

1. **Build do projeto**
```bash
npm run build
```

2. **Servir com HTTPS (necessário para Service Worker)**
```bash
# Opção 1: Usando serve com SSL
npx serve -s dist -l 5173 --ssl-cert cert.pem --ssl-key key.pem

# Opção 2: Usando http-server com SSL
npx http-server dist -p 5173 -S -C cert.pem -K key.pem

# Opção 3: Usando Vite preview (já tem HTTPS)
npm run preview -- --https
```

3. **Acessar no navegador**
```
https://localhost:5173
```

### Gerar certificado SSL local (se necessário)
```bash
# Usando OpenSSL
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Usando mkcert (mais fácil)
npm install -g mkcert
mkcert create-ca
mkcert create-cert
```

---

## 📱 Testes em Dispositivos Móveis

### Opção 1: Usar ngrok (mais fácil)
```bash
# Instalar ngrok
npm install -g ngrok

# Iniciar servidor local
npm run dev

# Em outro terminal, criar túnel
ngrok http 5173

# Usar URL fornecida (https://xxx.ngrok.io) no celular
```

### Opção 2: Usar IP local (mesma rede)
```bash
# Descobrir seu IP local
# Windows
ipconfig

# Mac/Linux
ifconfig

# Iniciar servidor com host 0.0.0.0
npm run dev -- --host

# Acessar no celular
https://SEU_IP:5173
```

### Opção 3: Deploy temporário
```bash
# Deploy no Vercel (grátis)
npm install -g vercel
vercel

# Deploy no Netlify (grátis)
npm install -g netlify-cli
netlify deploy
```

---

## 🔍 Debug

### Inspecionar Service Worker

**Chrome Desktop:**
```
chrome://serviceworker-internals/
```

**Chrome DevTools:**
1. F12 → Application → Service Workers
2. Ver status, scope, update, unregister

### Inspecionar Cache

**Chrome DevTools:**
1. F12 → Application → Cache Storage
2. Ver caches: `barbearia-static-v1.0.0`, `barbearia-dynamic-v1.0.0`
3. Limpar cache: botão direito → Delete

### Inspecionar Manifest

**Chrome DevTools:**
1. F12 → Application → Manifest
2. Ver todas as propriedades
3. Testar ícones

### Limpar tudo e recomeçar

**Chrome DevTools:**
1. F12 → Application → Clear storage
2. Selecionar tudo
3. Clicar em "Clear site data"
4. Recarregar página

### Console Logs Úteis

**Ver todos os logs PWA:**
```javascript
// No console do navegador
localStorage.clear() // Limpar preferências
location.reload() // Recarregar
```

**Forçar atualização do Service Worker:**
```javascript
// No console do navegador
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.update())
})
```

**Desregistrar Service Worker:**
```javascript
// No console do navegador
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister())
})
```

---

## 📱 Debug Remoto (Android)

### USB Debugging

1. **Habilitar modo desenvolvedor no Android**
   - Configurações → Sobre o telefone
   - Tocar 7x em "Número da versão"

2. **Habilitar USB Debugging**
   - Configurações → Opções do desenvolvedor
   - Ativar "Depuração USB"

3. **Conectar via USB**
   - Conectar celular no computador
   - Aceitar permissão no celular

4. **Abrir Chrome DevTools**
   ```
   chrome://inspect/#devices
   ```
   - Ver dispositivos conectados
   - Clicar em "Inspect" no app

5. **Inspecionar**
   - Console, Network, Application, etc.
   - Igual ao desktop

---

## 🍎 Debug Remoto (iOS)

### Safari Web Inspector

1. **Habilitar Web Inspector no iOS**
   - Ajustes → Safari → Avançado
   - Ativar "Web Inspector"

2. **Conectar via USB**
   - Conectar iPhone/iPad no Mac
   - Confiar no computador

3. **Abrir Safari no Mac**
   - Safari → Develop → [Seu iPhone]
   - Selecionar a aba do app

4. **Inspecionar**
   - Console, Network, Storage, etc.
   - Igual ao desktop

---

## 🧪 Lighthouse PWA Audit

### Via Chrome DevTools
```
1. F12 → Lighthouse
2. Selecionar "Progressive Web App"
3. Selecionar "Mobile"
4. Clicar em "Analyze page load"
5. Aguardar resultado
```

### Via CLI
```bash
# Instalar Lighthouse
npm install -g lighthouse

# Executar audit
lighthouse https://localhost:5173 --view

# Executar audit PWA específico
lighthouse https://localhost:5173 --only-categories=pwa --view

# Salvar relatório
lighthouse https://localhost:5173 --output html --output-path ./report.html
```

---

## 📊 Monitoramento em Produção

### Verificar Service Worker ativo
```javascript
// No console do navegador (produção)
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service Workers ativos:', registrations.length)
  registrations.forEach(reg => {
    console.log('Scope:', reg.scope)
    console.log('Estado:', reg.active ? 'Ativo' : 'Inativo')
  })
})
```

### Verificar se está instalado
```javascript
// No console do navegador
if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log('✅ App instalado (standalone)')
} else {
  console.log('❌ App não instalado (navegador)')
}
```

### Verificar permissão de notificação
```javascript
// No console do navegador
console.log('Permissão de notificação:', Notification.permission)
// "granted", "denied" ou "default"
```

### Verificar cache
```javascript
// No console do navegador
caches.keys().then(keys => {
  console.log('Caches ativos:', keys)
  keys.forEach(key => {
    caches.open(key).then(cache => {
      cache.keys().then(requests => {
        console.log(`Cache ${key}:`, requests.length, 'itens')
      })
    })
  })
})
```

---

## 🔧 Troubleshooting

### Problema: Service Worker não registra

**Solução:**
```bash
# Verificar se está em HTTPS ou localhost
# Service Worker só funciona em HTTPS (ou localhost)

# Verificar console para erros
# F12 → Console

# Verificar se arquivo sw.js existe
curl https://localhost:5173/sw.js

# Limpar cache e tentar novamente
# F12 → Application → Clear storage
```

### Problema: Notificações não aparecem

**Solução:**
```javascript
// Verificar permissão
console.log(Notification.permission)

// Solicitar permissão manualmente
Notification.requestPermission().then(permission => {
  console.log('Permissão:', permission)
})

// Testar notificação manualmente
new Notification('Teste', { body: 'Funcionou!' })
```

### Problema: Banner Android não aparece

**Solução:**
```javascript
// Verificar se já foi dispensado
console.log(localStorage.getItem('android-banner-dismissed'))

// Limpar flag
localStorage.removeItem('android-banner-dismissed')

// Recarregar página
location.reload()

// Verificar console para evento beforeinstallprompt
// Deve aparecer: "📱 Evento beforeinstallprompt capturado"
```

### Problema: Modal iOS não aparece

**Solução:**
```javascript
// Verificar se já foi dispensado
console.log(localStorage.getItem('ios-install-dismissed'))

// Limpar flag
localStorage.removeItem('ios-install-dismissed')

// Recarregar página
location.reload()

// Aguardar 5 segundos
// Modal deve aparecer automaticamente
```

### Problema: Cache não funciona offline

**Solução:**
```bash
# Verificar se Service Worker está ativo
# F12 → Application → Service Workers
# Status deve ser "activated and is running"

# Verificar cache
# F12 → Application → Cache Storage
# Deve ter: barbearia-static-v1.0.0, barbearia-dynamic-v1.0.0

# Forçar atualização do Service Worker
# F12 → Application → Service Workers → Update

# Testar offline
# F12 → Network → Offline
# Recarregar página
```

---

## 📦 Build e Deploy

### Build otimizado
```bash
# Build para produção
npm run build

# Verificar tamanho dos arquivos
ls -lh dist/

# Analisar bundle
npm run build -- --mode production --report
```

### Deploy Vercel
```bash
# Instalar CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy para produção
vercel --prod
```

### Deploy Netlify
```bash
# Instalar CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy

# Deploy para produção
netlify deploy --prod
```

### Deploy Firebase Hosting
```bash
# Instalar CLI
npm install -g firebase-tools

# Login
firebase login

# Inicializar
firebase init hosting

# Deploy
firebase deploy --only hosting
```

---

## 🔐 Variáveis de Ambiente

### Criar arquivo .env
```bash
# Criar arquivo .env na raiz do projeto
touch .env
```

### Adicionar variáveis (se necessário)
```env
# Firebase (já está no código, mas pode mover para .env)
VITE_FIREBASE_API_KEY=AIzaSyDGL3_RTuISqGAss08kImIsgtRklTGs29k
VITE_FIREBASE_AUTH_DOMAIN=barbearia-oficial.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=barbearia-oficial
VITE_FIREBASE_STORAGE_BUCKET=barbearia-oficial.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=900174786749
VITE_FIREBASE_APP_ID=1:900174786749:web:40e1152bd8184c0e02c7d4

# Outras variáveis
VITE_APP_VERSION=1.0.0
VITE_API_URL=https://api.example.com
```

### Usar variáveis no código
```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  // ...
};
```

---

## 📚 Recursos Úteis

### Documentação
- [MDN - PWA](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web.dev - PWA](https://web.dev/progressive-web-apps/)
- [Firebase Docs](https://firebase.google.com/docs)
- [Vite Docs](https://vitejs.dev/)

### Ferramentas
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [PWA Builder](https://www.pwabuilder.com/)
- [Workbox](https://developers.google.com/web/tools/workbox)
- [ngrok](https://ngrok.com/)

### Geradores
- [Favicon Generator](https://realfavicongenerator.net/)
- [App Icon Generator](https://www.appicon.co/)
- [Manifest Generator](https://app-manifest.firebaseapp.com/)

---

## 🎯 Comandos Rápidos (Cheat Sheet)

```bash
# Desenvolvimento
npm run dev                          # Iniciar dev server
npm run build                        # Build para produção
npm run preview                      # Preview do build

# Testes
npx serve -s dist -l 5173           # Servir build localmente
ngrok http 5173                      # Túnel para testes mobile

# Debug
chrome://inspect/#devices            # Debug Android via USB
chrome://serviceworker-internals/    # Ver Service Workers

# Deploy
vercel                               # Deploy Vercel
netlify deploy                       # Deploy Netlify
firebase deploy --only hosting       # Deploy Firebase

# Lighthouse
lighthouse https://localhost:5173 --view

# Limpar
localStorage.clear()                 # Limpar localStorage
# F12 → Application → Clear storage  # Limpar tudo
```

---

**Boa sorte com o desenvolvimento! 🚀**

