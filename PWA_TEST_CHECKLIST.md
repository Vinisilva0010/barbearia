# 🧪 PWA - CHECKLIST DE TESTES

## 📱 TESTE 1: ANDROID CHROME

### Pré-requisitos
- [ ] Dispositivo Android ou emulador
- [ ] Chrome instalado
- [ ] App rodando (localhost ou produção)

### Passos

#### 1.1 Acesso Inicial
- [ ] Abrir Chrome no Android
- [ ] Acessar `http://localhost:5173` (ou URL de produção)
- [ ] Aguardar carregamento completo
- [ ] Verificar que não há erros no console (F12 via USB debugging)

#### 1.2 Banner de Instalação
- [ ] Banner deve aparecer automaticamente no topo da tela
- [ ] Banner tem gradiente teal (verde-azulado)
- [ ] Banner mostra ícone de tesoura 🪒
- [ ] Banner mostra texto "Instale nosso app!"
- [ ] Banner mostra subtexto "Acesso rápido, notificações e funciona offline"
- [ ] Banner tem botão branco "Instalar Agora"
- [ ] Banner tem botão "X" para fechar
- [ ] Animação de slide-down é suave

#### 1.3 Instalação
- [ ] Clicar em "Instalar Agora"
- [ ] Prompt nativo do Chrome aparece
- [ ] Prompt mostra nome "BarbeariaApp"
- [ ] Prompt mostra ícone correto
- [ ] Clicar em "Instalar" no prompt
- [ ] App é adicionado à tela inicial
- [ ] Ícone aparece na tela inicial
- [ ] Banner desaparece após instalação

#### 1.4 App Instalado
- [ ] Abrir app da tela inicial
- [ ] App abre em modo standalone (sem barra de navegação)
- [ ] Splash screen aparece (se configurado)
- [ ] App carrega normalmente
- [ ] Todas as funcionalidades funcionam

#### 1.5 Notificações
- [ ] Permissão de notificação é solicitada (após 3 segundos)
- [ ] Aceitar permissão
- [ ] Criar um novo agendamento
- [ ] Notificação aparece
- [ ] Notificação tem ícone correto
- [ ] Notificação tem título "Novo Agendamento"
- [ ] Notificação tem corpo com detalhes do agendamento
- [ ] Notificação vibra o dispositivo
- [ ] Clicar na notificação abre o app
- [ ] App não quebra em nenhum momento

#### 1.6 Console Logs (USB Debugging)
```
Esperado:
✅ Service Worker registrado com sucesso
✅ Usuário autenticado: [uid]
📱 Dispositivo Android detectado
📱 Evento beforeinstallprompt capturado (Android)
✅ Permissão de notificação concedida
✅ Notificação enviada via Service Worker: Novo Agendamento
✅ Usuário aceitou a instalação do PWA
✅ PWA instalado com sucesso!
```

#### 1.7 Fechar Banner (Teste Alternativo)
- [ ] Recarregar página (sem instalar)
- [ ] Banner aparece novamente
- [ ] Clicar no "X"
- [ ] Banner desaparece
- [ ] Recarregar página
- [ ] Banner NÃO aparece (dispensado por 7 dias)
- [ ] Verificar localStorage: `android-banner-dismissed` existe

---

## 🍎 TESTE 2: iOS SAFARI

### Pré-requisitos
- [ ] iPhone ou iPad
- [ ] Safari instalado
- [ ] App rodando (localhost via ngrok ou produção)

### Passos

#### 2.1 Acesso Inicial
- [ ] Abrir Safari no iOS
- [ ] Acessar URL do app
- [ ] Aguardar carregamento completo
- [ ] Verificar que app funciona normalmente

#### 2.2 Modal de Instruções
- [ ] Aguardar 5 segundos
- [ ] Modal aparece no centro da tela
- [ ] Modal tem backdrop escuro semitransparente
- [ ] Modal tem card branco arredondado
- [ ] Modal tem ícone de tesoura com fundo teal
- [ ] Modal tem título "Instale Nosso App"
- [ ] Modal tem subtítulo "Para uma melhor experiência..."
- [ ] Animação fade-in + scale-in é suave

#### 2.3 Instruções
- [ ] Modal mostra 3 passos numerados
- [ ] Passo 1: "Toque no botão 'Compartilhar' ⬆️ na barra inferior"
- [ ] Passo 2: "Role para baixo e selecione 'Adicionar à Tela Inicial'"
- [ ] Passo 3: "Toque em 'Adicionar' para instalar"
- [ ] Números estão em círculos teal
- [ ] Texto está legível e bem formatado

#### 2.4 Botões
- [ ] Modal tem botão "Entendi" (teal, destaque)
- [ ] Modal tem botão "Não mostrar novamente" (cinza, discreto)
- [ ] Clicar em "Entendi" fecha o modal
- [ ] Clicar em "Não mostrar novamente" fecha e salva preferência

#### 2.5 Instalação Manual
- [ ] Seguir instruções do modal
- [ ] Tocar no botão "Compartilhar" ⬆️ na barra inferior do Safari
- [ ] Menu de compartilhamento abre
- [ ] Rolar para baixo no menu
- [ ] Encontrar opção "Adicionar à Tela Inicial"
- [ ] Tocar na opção
- [ ] Tela de confirmação aparece
- [ ] Nome "BarbeariaApp" está correto
- [ ] Ícone está correto
- [ ] Tocar em "Adicionar"
- [ ] App é adicionado à tela inicial

#### 2.6 App Instalado
- [ ] Abrir app da tela inicial
- [ ] App abre em modo standalone (sem barra Safari)
- [ ] Status bar é transparente/integrado
- [ ] App carrega normalmente
- [ ] Todas as funcionalidades funcionam

#### 2.7 Notificações
- [ ] Permissão de notificação é solicitada
- [ ] Aceitar permissão
- [ ] Criar um novo agendamento
- [ ] Notificação aparece
- [ ] Notificação tem conteúdo correto
- [ ] Clicar na notificação abre o app
- [ ] App não quebra

#### 2.8 Console Logs (Safari Web Inspector)
```
Esperado:
✅ Service Worker registrado com sucesso
✅ Usuário autenticado: [uid]
📱 Dispositivo iOS detectado
✅ Permissão de notificação concedida
✅ Notificação enviada via Notification API: Novo Agendamento
```

#### 2.9 Modal "Não mostrar novamente" (Teste Alternativo)
- [ ] Recarregar página (sem instalar)
- [ ] Modal aparece após 5 segundos
- [ ] Clicar em "Não mostrar novamente"
- [ ] Modal desaparece
- [ ] Recarregar página
- [ ] Modal NÃO aparece mais
- [ ] Verificar localStorage: `ios-install-dismissed` = "true"

---

## 💻 TESTE 3: DESKTOP CHROME

### Pré-requisitos
- [ ] Chrome Desktop instalado
- [ ] App rodando (localhost ou produção)

### Passos

#### 3.1 Acesso Inicial
- [ ] Abrir Chrome no desktop
- [ ] Acessar `http://localhost:5173`
- [ ] Aguardar carregamento completo
- [ ] Abrir DevTools (F12)
- [ ] Verificar que não há erros no console

#### 3.2 Ícone de Instalação
- [ ] Verificar barra de endereço
- [ ] Ícone de instalação (➕ ou ⬇️) deve aparecer no lado direito
- [ ] Clicar no ícone
- [ ] Diálogo de instalação aparece
- [ ] Diálogo mostra nome "Barbearia Oficial"
- [ ] Diálogo mostra ícone correto

#### 3.3 Instalação
- [ ] Clicar em "Instalar"
- [ ] App é instalado como app desktop
- [ ] Janela standalone abre
- [ ] App aparece na lista de apps do Chrome (chrome://apps)
- [ ] App aparece no menu iniciar (Windows) ou Applications (Mac)

#### 3.4 App Instalado
- [ ] Abrir app instalado
- [ ] App abre em janela separada (sem barra de navegação)
- [ ] Tamanho da janela é adequado
- [ ] Todas as funcionalidades funcionam
- [ ] Pode minimizar/maximizar janela

#### 3.5 Notificações
- [ ] Permissão de notificação é solicitada
- [ ] Aceitar permissão
- [ ] Criar um novo agendamento
- [ ] Notificação do sistema aparece (Windows/Mac)
- [ ] Notificação tem ícone correto
- [ ] Notificação tem título e corpo corretos
- [ ] Notificação fecha automaticamente após 5 segundos
- [ ] Clicar na notificação foca a janela do app

#### 3.6 Console Logs
```
Esperado:
✅ Service Worker registrado com sucesso
✅ Usuário autenticado: [uid]
✅ Permissão de notificação concedida
✅ Notificação enviada via Notification API: Novo Agendamento
```

#### 3.7 Service Worker (DevTools)
- [ ] Abrir DevTools → Application → Service Workers
- [ ] Service Worker está "activated and is running"
- [ ] Status é verde
- [ ] Scope é "/"
- [ ] Pode fazer "Update" e "Unregister"

#### 3.8 Cache (DevTools)
- [ ] Abrir DevTools → Application → Cache Storage
- [ ] Caches existem:
  - `barbearia-static-v1.0.0`
  - `barbearia-dynamic-v1.0.0`
- [ ] Cache estático contém:
  - `/`
  - `/index.html`
  - `/manifest.json`
  - Ícones SVG
- [ ] Cache dinâmico contém requisições recentes

#### 3.9 Manifest (DevTools)
- [ ] Abrir DevTools → Application → Manifest
- [ ] Nome: "Barbearia Oficial - Sistema de Agendamento"
- [ ] Nome curto: "BarbeariaApp"
- [ ] Start URL: "/"
- [ ] Display: "standalone"
- [ ] Theme color: "#EAB308"
- [ ] Background color: "#1F2937"
- [ ] Ícones: 8 tamanhos listados
- [ ] Shortcuts: 2 atalhos listados

---

## 🔍 TESTE 4: LIGHTHOUSE PWA AUDIT

### Passos

#### 4.1 Executar Lighthouse
- [ ] Abrir Chrome DevTools (F12)
- [ ] Ir para aba "Lighthouse"
- [ ] Selecionar categoria "Progressive Web App"
- [ ] Selecionar "Mobile" como dispositivo
- [ ] Clicar em "Analyze page load"
- [ ] Aguardar análise completa

#### 4.2 Resultados Esperados
- [ ] **Score PWA: ≥ 90%** (idealmente 100%)
- [ ] ✅ Installable
  - [ ] Registers a service worker
  - [ ] Responds with a 200 when offline
  - [ ] Has a `<meta name="viewport">` tag
  - [ ] Contains some content when JavaScript is disabled
- [ ] ✅ PWA Optimized
  - [ ] Configured for a custom splash screen
  - [ ] Sets a theme color
  - [ ] Content is sized correctly for the viewport
  - [ ] Has a `<meta name="theme-color">` tag
  - [ ] Provides a valid `apple-touch-icon`
  - [ ] Manifest has a maskable icon

#### 4.3 Verificações Manuais
- [ ] Manifest includes a 512px icon
- [ ] Manifest includes a 192px icon
- [ ] Manifest has a name
- [ ] Manifest has a short_name
- [ ] Manifest has a start_url
- [ ] Manifest has a display mode
- [ ] Service Worker caches assets

---

## 🚨 TESTE 5: CENÁRIOS DE ERRO

### 5.1 Sem Permissão de Notificação
- [ ] Abrir app
- [ ] Negar permissão de notificação
- [ ] App continua funcionando normalmente
- [ ] Criar agendamento
- [ ] Notificação NÃO aparece (esperado)
- [ ] Console mostra: "⚠️ Permissão de notificação não concedida"
- [ ] App não quebra

### 5.2 Sem Service Worker
- [ ] Desregistrar Service Worker (DevTools)
- [ ] Recarregar página
- [ ] App funciona normalmente
- [ ] Criar agendamento
- [ ] Notificação aparece via Notification API (fallback)
- [ ] Console mostra: "⚠️ Service Worker não disponível, usando fallback"
- [ ] App não quebra

### 5.3 Navegador Sem Suporte
- [ ] Abrir app em navegador antigo (simular)
- [ ] App funciona normalmente
- [ ] Notificações não aparecem (esperado)
- [ ] Console mostra: "⚠️ Notificações não suportadas neste navegador"
- [ ] App não quebra

### 5.4 Offline
- [ ] Instalar app
- [ ] Navegar pelo app
- [ ] Ativar modo avião / desconectar internet
- [ ] Recarregar app
- [ ] App carrega do cache
- [ ] Interface aparece normalmente
- [ ] Funcionalidades offline funcionam
- [ ] Mensagem de "offline" aparece (se implementado)

### 5.5 Atualização do Service Worker
- [ ] Modificar arquivo `sw.js` (mudar versão do cache)
- [ ] Recarregar página
- [ ] Service Worker detecta atualização
- [ ] Novo Service Worker instala
- [ ] Cache antigo é limpo
- [ ] Console mostra: "🗑️ Service Worker: Removendo cache antigo"
- [ ] App continua funcionando

---

## ✅ CRITÉRIOS DE SUCESSO

### Obrigatórios (Todos devem passar)
- [ ] **App NÃO quebra em nenhum momento**
- [ ] **Notificações funcionam em Android, iOS e Desktop**
- [ ] **Banner Android aparece automaticamente**
- [ ] **Modal iOS aparece após 5 segundos**
- [ ] **Instalação funciona em todas as plataformas**
- [ ] **Service Worker registra com sucesso**
- [ ] **Console limpo (sem erros)**
- [ ] **Lighthouse PWA score ≥ 90%**

### Desejáveis (Maioria deve passar)
- [ ] Animações são suaves
- [ ] Ícones estão corretos
- [ ] Cores estão consistentes
- [ ] Textos estão corretos
- [ ] Botões respondem ao toque/clique
- [ ] Preferências são salvas corretamente
- [ ] Cache funciona offline
- [ ] Notificações fecham automaticamente

---

## 📊 RELATÓRIO DE TESTES

### Resumo
- **Data do teste:** ___/___/___
- **Testador:** _______________
- **Versão do app:** _______________

### Resultados

| Teste | Android | iOS | Desktop | Status |
|-------|---------|-----|---------|--------|
| Acesso inicial | ☐ | ☐ | ☐ | ☐ |
| Banner/Modal | ☐ | ☐ | ☐ | ☐ |
| Instalação | ☐ | ☐ | ☐ | ☐ |
| Notificações | ☐ | ☐ | ☐ | ☐ |
| Service Worker | ☐ | ☐ | ☐ | ☐ |
| Lighthouse | - | - | ☐ | ☐ |
| Cenários de erro | ☐ | ☐ | ☐ | ☐ |

### Problemas Encontrados
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### Observações
_______________________________________________
_______________________________________________
_______________________________________________

---

## 🎯 PRÓXIMOS PASSOS

Após todos os testes passarem:
1. [ ] Fazer commit das alterações
2. [ ] Fazer deploy em produção
3. [ ] Testar em produção
4. [ ] Monitorar logs de erro
5. [ ] Coletar feedback dos usuários
6. [ ] Iterar melhorias

---

**Boa sorte com os testes! 🚀**

