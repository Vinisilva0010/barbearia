import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  CheckCircle, 
  Calendar, 
  Clock, 
  Users, 
  Scissors, 
  Store, 
  ChevronLeft, 
  AlertCircle,
  TrendingUp,
  DollarSign,
  PlusCircle,
  Hash,
  Bell,
  X,
  Lock,        // NOVO - para login
  Eye,         // NOVO - para mostrar/ocultar senha
  BarChart3,   // NOVO - para analytics
  UserCheck,   // NOVO - para clientes
  Settings,    // NOVO - para configurações
  Star,        // NOVO - para avaliações
  MessageSquare, // NOVO - para feedback
  Phone,       // NOVO - para contato
  MapPin,      // NOVO - para localização
  Award,       // NOVO - para conquistas
  Target,      // NOVO - para metas
  Zap,         // NOVO - para promoções
} from 'lucide-react';

// Firebase imports
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, where, setDoc, getDoc, getDocs, writeBatch } from 'firebase/firestore';

// Firebase Configuration - Configuração corrigida com chaves reais
const firebaseConfig = {
  apiKey: "AIzaSyDGL3_RTuISqGAss08kImIsgtRklTGs29k",
  authDomain: "barbearia-oficial.firebaseapp.com",
  projectId: "barbearia-oficial",
  storageBucket: "barbearia-oficial.firebasestorage.app",
  messagingSenderId: "900174786749",
  appId: "1:900174786749:web:40e1152bd8184c0e02c7d4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Constantes para estrutura de dados
const APP_ID = "barbearia-app";
const COLLECTIONS = {
  BOOKINGS: "bookings",
  ADMINS: "admins",
  SERVICES: "services",
  BARBERS: "barbers",
  SCHEDULES: "schedules"
};

// --- Sistema de Barbearia ---
// Aplicação funcionando com Firebase real

// --- Dados Fictícios (Hardcoded) ---
// No mundo real, isso viria do Firestore, mas para V1 é mais fácil assim.

const SERVICES = [
  { id: 'cut', name: 'Corte Social', duration: 30, price: 50.00, icon: Scissors },
  { id: 'beard', name: 'Design de Barba', duration: 30, price: 40.00, icon: Users },
  { id: 'cut_beard', name: 'Corte + Barba', duration: 60, price: 85.00, icon: Scissors },
  { id: 'kids', name: 'Corte Infantil', duration: 40, price: 45.00, icon: Users },
];

const BARBERS = [
  { id: 'b1', name: 'Enzo', avatar: 'https://placehold.co/100x100/1F2937/EAB308?text=E', specialty: 'Cortes Clássicos', rating: 4.9, experience: '15 anos' },
  { id: 'b2', name: 'Gustavo', avatar: 'https://placehold.co/100x100/EAB308/1F2937?text=G', specialty: 'Design de Barba', rating: 4.8, experience: '12 anos' },
  { id: 'b3', name: 'João', avatar: 'https://placehold.co/100x100/6366F1/FFFFFF?text=J', specialty: 'Cortes Modernos', rating: 4.7, experience: '8 anos' },
];

// Sistema de armazenamento local
// Funções de localStorage removidas - agora usando Firebase

// Função para gerar ID único
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Funções auxiliares para estrutura de dados Firebase
const getCollectionPath = (collectionName) => {
  return `artifacts/${APP_ID}/public/data/${collectionName}`;
};

// Função removida - não utilizada

// Função para aguardar autenticação
const waitForAuth = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (user) {
        resolve(user);
      } else {
        reject(new Error('Usuário não autenticado'));
      }
    });
  });
};

// ========================================
// SISTEMA DE NOTIFICAÇÕES PWA PROFISSIONAL
// ========================================

/**
 * Função auxiliar para enviar notificações compatível com PWA
 * Detecta automaticamente o ambiente e usa o método correto:
 * - Service Worker (Android/iOS instalado) → registration.showNotification()
 * - Desktop/Navegador → new Notification() como fallback
 * 
 * @param {string} title - Título da notificação
 * @param {Object} options - Opções da notificação
 * @returns {Promise<void>}
 */
const sendNotification = async (title, options = {}) => {
  try {
    // Verificar se notificações são suportadas
    if (!('Notification' in window)) {
      console.warn('⚠️ Notificações não suportadas neste navegador');
      return;
    }
    
    // Solicitar permissão se ainda não foi concedida
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('⚠️ Permissão de notificação negada');
        return;
      }
    }
    
    // Se permissão foi negada, não fazer nada
    if (Notification.permission !== 'granted') {
      console.warn('⚠️ Permissão de notificação não concedida');
      return;
    }
    
    // Configurações padrão
    const defaultOptions = {
      body: '',
      icon: '/icons/icon-192x192.svg',
      badge: '/icons/icon-72x72.svg',
      vibrate: [200, 100, 200],
      tag: 'barbearia-notification',
      requireInteraction: false,
      silent: false,
      ...options
    };
    
    // Tentar usar Service Worker (PWA instalado - Android/iOS)
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      try {
        const registration = await navigator.serviceWorker.ready;
        
        // Enviar mensagem para o Service Worker criar a notificação
        if (registration.active) {
          registration.active.postMessage({
            type: 'SHOW_NOTIFICATION',
            title,
            options: defaultOptions
          });
          
          console.log('✅ Notificação enviada via Service Worker:', title);
          return;
        }
      } catch (swError) {
        console.warn('⚠️ Service Worker não disponível, usando fallback:', swError);
      }
    }
    
    // Fallback: usar Notification API direta (Desktop/Navegador)
    try {
      const notification = new Notification(title, defaultOptions);
      
      // Fechar automaticamente após 5 segundos
      setTimeout(() => {
        notification.close();
      }, 5000);
      
      console.log('✅ Notificação enviada via Notification API:', title);
    } catch (notifError) {
      console.error('❌ Erro ao criar notificação:', notifError);
    }
    
  } catch (error) {
    // NUNCA quebrar o app por causa de notificação
    console.error('❌ Erro no sistema de notificações:', error);
  }
};

/**
 * Solicitar permissão de notificação de forma amigável
 * @returns {Promise<boolean>} - true se permissão concedida
 */
const requestNotificationPermission = async () => {
  try {
    if (!('Notification' in window)) {
      return false;
    }
    
    if (Notification.permission === 'granted') {
      return true;
    }
    
    if (Notification.permission === 'denied') {
      return false;
    }
    
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('❌ Erro ao solicitar permissão:', error);
    return false;
  }
};

// Função para garantir que o documento existe antes de atualizar
const ensureDocumentExists = async (collectionName, documentId, defaultData) => {
  try {
    const collectionPath = getCollectionPath(collectionName);
    const docRef = doc(db, collectionPath, documentId);
    
    // Verificar se o documento existe
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      console.log(`📝 Documento ${documentId} não existe, criando com dados padrão...`);
      // Criar documento com dados padrão
      await setDoc(docRef, {
        ...defaultData,
        id: documentId,
        createdAt: new Date(),
        updatedAt: new Date()
      }, { merge: true });
      console.log(`✅ Documento ${documentId} criado com sucesso`);
    } else {
      console.log(`✅ Documento ${documentId} já existe`);
    }
    
    return docRef;
  } catch (error) {
    console.error(`❌ Erro ao verificar/criar documento ${documentId}:`, error);
    throw error;
  }
};

// Função para remover duplicatas e verificar integridade dos dados
const cleanBookingsData = (bookings) => {
  try {
    console.log("🧹 Limpando dados de agendamentos...");
    
    // Verificar se bookings é um array válido
    if (!Array.isArray(bookings)) {
      console.warn("⚠️ Dados de agendamentos não são um array válido");
      return [];
    }
    
    // Mapear para rastrear duplicatas
    const seenIds = new Set();
    const duplicateIds = new Set();
    const cleanedBookings = [];
    
    bookings.forEach((booking, index) => {
      // Verificar se o booking tem ID válido
      if (!booking.id) {
        console.warn(`⚠️ Agendamento sem ID encontrado no índice ${index}:`, booking);
        return; // Pular agendamentos sem ID
      }
      
      // Verificar se o ID já foi visto
      if (seenIds.has(booking.id)) {
        console.error(`❌ Duplicata encontrada - ID: ${booking.id}`);
        duplicateIds.add(booking.id);
        return; // Pular duplicatas
      }
      
      // Adicionar ID ao conjunto de IDs vistos
      seenIds.add(booking.id);
      
      // Verificar se o booking tem dados essenciais
      if (!booking.serviceName || !booking.clientName || !booking.barberName) {
        console.warn(`⚠️ Agendamento com dados incompletos - ID: ${booking.id}`);
        return; // Pular agendamentos com dados incompletos
      }
      
      // Adicionar booking limpo ao array
      cleanedBookings.push(booking);
    });
    
    // Log dos resultados
    const originalCount = bookings.length;
    const cleanedCount = cleanedBookings.length;
    const duplicatesCount = duplicateIds.size;
    
    console.log(`✅ Limpeza concluída:`);
    console.log(`   - Original: ${originalCount} agendamentos`);
    console.log(`   - Limpo: ${cleanedCount} agendamentos`);
    console.log(`   - Duplicatas removidas: ${duplicatesCount}`);
    
    if (duplicatesCount > 0) {
      console.error(`❌ Duplicatas encontradas: ${Array.from(duplicateIds).join(', ')}`);
    }
    
    return cleanedBookings;
    
  } catch (error) {
    console.error("❌ Erro ao limpar dados de agendamentos:", error);
    return [];
  }
};

// Função para excluir todos os dados do sistema (reutilizável)
const deleteAllData = async (onProgress, onSuccess, onError) => {
  try {
    console.log("🗑️ Iniciando exclusão de todos os dados...");
    
    // Aguardar autenticação estar pronta
    await waitForAuth();
    
    const collectionsToDelete = [
      COLLECTIONS.BOOKINGS,
      COLLECTIONS.ADMINS,
      COLLECTIONS.SERVICES,
      COLLECTIONS.BARBERS
    ];
    
    let totalDeleted = 0;
    let totalErrors = 0;
    
    for (const collectionName of collectionsToDelete) {
      try {
        onProgress(`Excluindo dados de ${collectionName}...`);
        
        const collectionPath = getCollectionPath(collectionName);
        const collectionRef = collection(db, collectionPath);
        
        // Buscar todos os documentos da coleção
        const querySnapshot = await getDocs(collectionRef);
        
        if (querySnapshot.empty) {
          console.log(`📭 Coleção ${collectionName} já está vazia`);
          continue;
        }
        
        // Usar batch para deletar múltiplos documentos
        const batch = writeBatch(db);
        querySnapshot.docs.forEach((docSnapshot) => {
          batch.delete(docSnapshot.ref);
        });
        
        // Executar batch
        await batch.commit();
        
        const deletedCount = querySnapshot.docs.length;
        totalDeleted += deletedCount;
        
        console.log(`✅ Excluídos ${deletedCount} documentos de ${collectionName}`);
        
      } catch (collectionError) {
        console.error(`❌ Erro ao excluir coleção ${collectionName}:`, collectionError);
        totalErrors++;
      }
    }
    
    if (totalErrors === 0) {
      console.log(`🎉 Exclusão concluída! Total de documentos excluídos: ${totalDeleted}`);
      onSuccess(`Dados excluídos com sucesso! ${totalDeleted} documentos removidos.`);
    } else {
      console.log(`⚠️ Exclusão concluída com ${totalErrors} erros. Total excluído: ${totalDeleted}`);
      onSuccess(`Exclusão concluída com avisos. ${totalDeleted} documentos removidos, ${totalErrors} erros.`);
    }
    
  } catch (error) {
    console.error("❌ Erro crítico na exclusão de dados:", error);
    onError(`Erro ao excluir dados: ${error.message}`);
  }
};

// Função para adicionar evento ao calendário do celular
// Gerar URL para diferentes tipos de calendário (helper global)
const generateCalendarUrlHelper = (type, eventDetails, startFormatted, endFormatted) => {
  const baseUrl = type === 'google' 
    ? 'https://calendar.google.com/calendar/render'
    : type === 'outlook'
    ? 'https://outlook.live.com/calendar/0/deeplink/compose'
    : null;
  
  if (!baseUrl) return null;
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: eventDetails.title,
    dates: `${startFormatted}/${endFormatted}`,
    details: eventDetails.description,
    location: eventDetails.location,
    trp: 'false',
    ...(type === 'google' && { 
      remind: eventDetails.reminder,
      remindUnit: 'minutes'
    })
  });
  
  return `${baseUrl}?${params.toString()}`;
};

const addToCalendar = (booking) => {
  const startDate = new Date(booking.startTime);
  const endDate = new Date(booking.endTime);
  
  // Formatar datas para o formato do calendário
  const formatDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  const startFormatted = formatDate(startDate);
  const endFormatted = formatDate(endDate);
  
  // Criar o conteúdo do evento
  const eventDetails = {
    title: `Corte na Barbearia - ${booking.serviceName}`,
    description: `Serviço: ${booking.serviceName}\nBarbeiro: ${booking.barberName}\nCliente: ${booking.clientName}\nValor: R$ ${booking.price.toFixed(2)}\n\nBarbearia Navalha Dourada`,
    location: 'Barbearia Navalha Dourada',
    startTime: startFormatted,
    endTime: endFormatted,
    reminder: '20' // 20 minutos antes
  };
  
  // Usar a função helper global
  const generateCalendarUrl = (type) => generateCalendarUrlHelper(type, eventDetails, startFormatted, endFormatted);
  
  // Detectar o dispositivo e abrir o calendário apropriado
  const userAgent = navigator.userAgent.toLowerCase();
  let calendarUrl = null;
  
  if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
    // iOS - usar formato ICS
    const icsContent = generateICSContent(eventDetails);
    downloadICS(icsContent, `agendamento-${booking.id}.ics`);
    
    // Mostrar instruções para iOS
    setTimeout(() => {
      alert('📱 Arquivo baixado! Abra o arquivo .ics no app Calendário do seu iPhone/iPad para adicionar o evento com lembrete.');
    }, 500);
  } else if (userAgent.includes('android')) {
    // Android - tentar Google Calendar
    calendarUrl = generateCalendarUrl('google');
    if (calendarUrl) {
      window.open(calendarUrl, '_blank');
      setTimeout(() => {
        alert('📱 Abrindo Google Calendar... Se não abrir automaticamente, copie o link e cole no seu navegador.');
      }, 500);
    }
  } else {
    // Desktop - mostrar opções
    showCalendarOptions(eventDetails, booking.id);
    return;
  }
};

// Gerar conteúdo ICS para iOS
const generateICSContent = (event) => {
  const now = new Date();
  const nowFormatted = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Barbearia Navalha Dourada//Agendamento//PT
BEGIN:VEVENT
UID:${generateId()}@barbearia.com
DTSTAMP:${nowFormatted}
DTSTART:${event.startTime}
DTEND:${event.endTime}
SUMMARY:${event.title}
DESCRIPTION:${event.description.replace(/\n/g, '\\n')}
LOCATION:${event.location}
BEGIN:VALARM
TRIGGER:-PT${event.reminder}M
ACTION:DISPLAY
DESCRIPTION:Lembrete do agendamento
END:VALARM
END:VEVENT
END:VCALENDAR`;
};

// Download do arquivo ICS
const downloadICS = (content, filename) => {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Mostrar opções de calendário para desktop
const showCalendarOptions = (eventDetails, bookingId) => {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
  
  const modalContent = document.createElement('div');
  modalContent.className = 'bg-gray-800 p-4 sm:p-6 rounded-lg shadow-xl max-w-md w-full';
  
  modalContent.innerHTML = `
    <h3 class="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Adicionar ao Calendário</h3>
    <p class="text-gray-300 mb-4 text-sm sm:text-base">Escolha como deseja adicionar o agendamento ao seu calendário:</p>
    <div class="space-y-3">
      <button id="googleCalBtn" class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-500 transition-colors text-sm sm:text-base">
        📅 Google Calendar
      </button>
      <button id="outlookCalBtn" class="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-400 transition-colors text-sm sm:text-base">
        📅 Outlook Calendar
      </button>
      <button id="downloadIcsBtn" class="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors text-sm sm:text-base">
        📥 Download (.ics)
      </button>
      <button id="cancelBtn" class="w-full bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors text-sm sm:text-base">
        Cancelar
      </button>
    </div>
    <div class="mt-4 p-3 bg-blue-900 bg-opacity-30 border border-blue-500 rounded-lg">
      <p class="text-blue-200 text-xs sm:text-sm">
        💡 O lembrete será configurado para 20 minutos antes do horário do agendamento.
      </p>
    </div>
  `;
  
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  
  // Adicionar event listeners
  const startFormatted = eventDetails.startTime;
  const endFormatted = eventDetails.endTime;
  
  document.getElementById('googleCalBtn').addEventListener('click', () => {
    const url = generateCalendarUrlHelper('google', eventDetails, startFormatted, endFormatted);
    window.open(url, '_blank');
    modal.remove();
  });
  
  document.getElementById('outlookCalBtn').addEventListener('click', () => {
    const url = generateCalendarUrlHelper('outlook', eventDetails, startFormatted, endFormatted);
    window.open(url, '_blank');
    modal.remove();
  });
  
  document.getElementById('downloadIcsBtn').addEventListener('click', () => {
    const icsContent = generateICSContent(eventDetails);
    downloadICS(icsContent, `agendamento-${bookingId}.ics`);
    modal.remove();
  });
  
  document.getElementById('cancelBtn').addEventListener('click', () => {
    modal.remove();
  });
};

const WORKING_HOURS = {
  start: '09:00',
  end: '18:00',
  breakStart: '12:00',
  breakEnd: '13:00',
  weekdays: [1, 2, 3, 4, 5, 6], // 0=Domingo, 1=Segunda, ..., 6=Sábado
};

// --- Componentes da UI ---

// Componente de Login Admin
const AdminLogin = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Verificar credenciais de admin
      if (credentials.username === 'admin' && credentials.password === 'admin123') {
        // Aguardar autenticação estar pronta
        await waitForAuth();
        
        // Dados padrão para o documento de admin
        const defaultAdminData = {
          id: 'main',
          lastLogin: new Date(),
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Garantir que o documento existe antes de atualizar
        const adminRef = await ensureDocumentExists(COLLECTIONS.ADMINS, 'main', defaultAdminData);
        
        // Atualizar o documento usando setDoc com merge
        await setDoc(adminRef, {
          lastLogin: new Date(),
          isActive: true,
          updatedAt: new Date()
        }, { merge: true });
        
        onLogin();
      } else {
        setError('Usuário ou senha incorretos. Use: admin / admin123');
      }
    } catch (error) {
      console.error('Erro no login admin:', error);
      setError(`Erro ao fazer login: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="text-center mb-6">
          <Lock className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white">Área do Barbeiro</h2>
          <p className="text-gray-400 mt-2">Faça login para acessar o painel administrativo</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Usuário</label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({...credentials, username: e.target.value})}
              className="w-full bg-gray-700 text-white border-gray-600 rounded-lg p-3 focus:ring-yellow-500 focus:border-yellow-500"
              placeholder="Digite seu usuário"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Senha</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                className="w-full bg-gray-700 text-white border-gray-600 rounded-lg p-3 pr-10 focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="Digite sua senha"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-white"
              >
                <Eye className="h-5 w-5" />
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-600 text-white p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-yellow-500 text-gray-900 font-bold py-3 px-6 rounded-lg hover:bg-yellow-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

      </div>
    </div>
  );
};

// Modal de Confirmação para Exclusão de Dados
const DeleteDataModal = ({ isOpen, onClose, onConfirm, isLoading, progressMessage }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="bg-red-100 rounded-full p-2 mr-3">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-white">Excluir Todos os Dados</h3>
          </div>
          
          <p className="text-gray-300 mb-6">
            Tem certeza que deseja excluir todos os dados? Esta ação não poderá ser desfeita.
          </p>
          
          {isLoading && (
            <div className="mb-4 p-3 bg-blue-900 rounded-lg">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400 mr-2"></div>
                <span className="text-blue-200 text-sm">{progressMessage}</span>
              </div>
            </div>
          )}
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Excluindo...' : 'Excluir Tudo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de Cabeçalho
const Header = ({
  isAdmin,
  onLogout,
  notifications,
  unreadNotifications,
  showNotifications,
  setShowNotifications,
  markNotificationAsRead,
  removeNotification,
  clearAllNotifications,
  onShowInstallInstructions,
  isInstalled
}) => (
  <header className="w-full bg-gray-900 p-3 sm:p-4 border-b-2 border-yellow-500">
    <div className="max-w-5xl mx-auto flex items-center justify-between">
      <div className="flex items-center">
        <Scissors className="text-yellow-500 h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3" />
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white tracking-wider">
          <span className="hidden sm:inline">Barbearia Navalha Dourada</span>
          <span className="sm:hidden">Barbearia</span>
      </h1>
        <span className={`ml-3 px-2.5 py-1 rounded-full text-xs font-semibold ${isAdmin ? 'bg-red-500 text-white' : 'bg-green-500 text-gray-900'}`}>
          {isAdmin ? 'Área do Barbeiro' : 'Área do Cliente'}
        </span>
      </div>

      <div className="flex items-center space-x-3">
        {!isInstalled && onShowInstallInstructions && (
          <button
            onClick={onShowInstallInstructions}
            className="hidden sm:flex items-center space-x-2 bg-yellow-500 text-gray-900 px-3 py-2 rounded-lg hover:bg-yellow-400 transition-colors text-sm font-semibold"
            title="Instalar App"
          >
            <Scissors className="h-4 w-4" />
            <span>Instalar</span>
          </button>
        )}

        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-300 hover:text-white transition-colors"
          >
            <Bell className="h-6 w-6" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadNotifications}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Notificações</h3>
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Limpar todas
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    Nenhuma notificação
                  </div>
                ) : (
                  notifications.map((notification) => {
                    const hasDetails = isAdmin && notification.details;
                    const detailDate = hasDetails && notification.details?.date
                      ? (notification.details.date instanceof Date
                          ? notification.details.date
                          : new Date(notification.details.date))
                      : null;
                    const detailTime = hasDetails && notification.details?.time
                      ? (notification.details.time instanceof Date
                          ? notification.details.time
                          : new Date(notification.details.time))
                      : null;
                    const timestamp = notification.timestamp?.toDate
                      ? notification.timestamp.toDate()
                      : notification.timestamp instanceof Date
                        ? notification.timestamp
                        : notification.timestamp
                          ? new Date(notification.timestamp)
                          : null;

                    return (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {notification.title || notification.message}
                            </p>
                            {notification.title && notification.message && notification.title !== notification.message && (
                              <p className="text-xs text-gray-600 mt-1">
                                {notification.message}
                              </p>
                            )}

                            {hasDetails && (
                              <div className="mt-2 text-xs text-gray-600 space-y-1">
                                {notification.details?.service && (
                                  <p><strong>Serviço:</strong> {notification.details.service}</p>
                                )}
                                {notification.details?.barber && (
                                  <p><strong>Barbeiro:</strong> {notification.details.barber}</p>
                                )}
                                {detailDate && (
                                  <p><strong>Data:</strong> {detailDate.toLocaleDateString('pt-BR')}</p>
                                )}
                                {detailTime && (
                                  <p><strong>Horário:</strong> {detailTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                                )}
                                {typeof notification.details?.price === 'number' && (
                                  <p><strong>Valor:</strong> R$ {notification.details.price.toFixed(2)}</p>
                                )}
                              </div>
                            )}

                            {timestamp && (
                              <p className="text-xs text-gray-400 mt-1">
                                {timestamp.toLocaleString('pt-BR')}
                              </p>
                            )}
                          </div>

                          <div className="flex space-x-1 ml-2">
                            {!notification.read && (
                              <button
                                onClick={() => markNotificationAsRead(notification.id)}
                                className="text-xs text-blue-600 hover:text-blue-800"
                              >
                                Marcar como lida
                              </button>
                            )}
                            <button
                              onClick={() => removeNotification(notification.id)}
                              className="text-xs text-gray-400 hover:text-gray-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {isAdmin && (
          <button
            onClick={onLogout}
            className="bg-red-600 text-white px-3 py-2 sm:px-4 rounded-lg hover:bg-red-500 transition-all flex items-center text-sm sm:text-base"
          >
            <X className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        )}
      </div>
    </div>
  </header>
);

// Painel de Notificações (NOVO)
const NotificationsPanel = ({ notifications, onClose }) => (
  <div className="absolute top-16 right-0 w-72 md:w-80 bg-gray-700 rounded-lg shadow-xl border border-gray-600 z-50 animate-fade-in-down">
    <div className="flex justify-between items-center p-3 border-b border-gray-600">
      <h4 className="font-semibold text-white">Lembretes</h4>
      <button onClick={onClose} className="text-gray-400 hover:text-white">
        <X className="h-5 w-5" />
      </button>
    </div>
    <div className="p-3 max-h-60 overflow-y-auto">
      {notifications.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-4">Nenhum lembrete no momento.</p>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif, index) => (
            <div key={index} className="flex items-start">
              <Clock className="h-4 w-4 text-yellow-500 mt-1 mr-2 flex-shrink-0" />
              <div>
                <p className="text-sm text-white">{notif.title || notif.message}</p>
                {notif.title && notif.message && notif.title !== notif.message && (
                <p className="text-xs text-gray-300">{notif.message}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

// Componente de Navegação
const Navigation = ({ currentView, setCurrentView, notifications, showNotifications, setShowNotifications, isAdmin, onAdminLogin }) => {
  const clientNavItems = [
    { id: 'home', label: 'Início', icon: Store },
    { id: 'book', label: 'Agendar', icon: Calendar },
    { id: 'my_bookings', label: 'Meus Horários', icon: Clock },
    { id: 'services', label: 'Serviços', icon: Scissors },
    { id: 'contact', label: 'Contato', icon: Phone },
  ];

  const adminNavItems = [
    { id: 'admin_dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'admin_bookings', label: 'Agendamentos', icon: Calendar },
    { id: 'admin_clients', label: 'Clientes', icon: UserCheck },
    { id: 'admin_analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'admin_settings', label: 'Configurações', icon: Settings },
  ];

  const navItems = isAdmin ? adminNavItems : clientNavItems;

  return (
    <nav className="w-full bg-gray-800 p-2 sticky top-0 z-40 shadow-lg">
      <div className="max-w-md sm:max-w-lg md:max-w-4xl mx-auto flex justify-around relative">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`flex flex-col items-center px-2 sm:px-3 md:px-4 py-2 rounded-lg transition-all duration-200 ${
              currentView === item.id
                ? 'bg-yellow-500 text-gray-900 scale-105'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <item.icon className="h-4 w-4 sm:h-5 sm:w-5 mb-1" />
            <span className="text-xs font-medium hidden sm:block">{item.label}</span>
            <span className="text-xs font-medium sm:hidden">{item.label.split(' ')[0]}</span>
          </button>
        ))}
        
        {/* Botão de Notificações (apenas para clientes) */}
        {!isAdmin && (
        <button
          onClick={() => setShowNotifications(prev => !prev)}
            className="relative flex flex-col items-center px-2 sm:px-3 md:px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white"
        >
          {notifications.length > 0 && (
              <span className="absolute top-1 right-2 sm:right-3 flex h-3 w-3 sm:h-4 sm:w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 sm:h-4 sm:w-4 bg-red-500 items-center justify-center text-xs font-bold text-white">
                {notifications.length}
              </span>
            </span>
          )}
            <Bell className="h-4 w-4 sm:h-5 sm:w-5 mb-1" />
            <span className="text-xs font-medium hidden sm:block">Lembretes</span>
            <span className="text-xs font-medium sm:hidden">Alertas</span>
        </button>
        )}
        
        {/* Botão de Admin (apenas para clientes) */}
        {!isAdmin && (
          <button
            onClick={onAdminLogin}
            className="flex flex-col items-center px-2 sm:px-3 md:px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            <Lock className="h-4 w-4 sm:h-5 sm:w-5 mb-1" />
            <span className="text-xs font-medium hidden sm:block">Admin</span>
            <span className="text-xs font-medium sm:hidden">Admin</span>
          </button>
        )}
        
        {/* Painel de Notificações Dropdown (apenas para clientes) */}
        {!isAdmin && showNotifications && (
          <NotificationsPanel 
            notifications={notifications} 
            onClose={() => setShowNotifications(false)} 
          />
        )}
      </div>
    </nav>
  );
};

// Componente da Tela Inicial (Home)
const Home = ({ onBookNow, services, barbers }) => {
  // Proteção contra dados undefined/null
  const safeServices = services || [];
  const safeBarbers = barbers || [];

  return (
  <div className="animate-fade-in space-y-4 sm:space-y-6 p-4 sm:p-6">
    <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-xl text-center">
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3">Bem-vindo à Navalha Dourada!</h2>
      <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">Onde tradição e estilo se encontram. Agende seu horário com os melhores.</p>
      <button
        onClick={onBookNow}
        className="bg-yellow-500 text-gray-900 font-bold py-3 px-6 sm:px-8 rounded-lg text-base sm:text-lg hover:bg-yellow-400 transition-transform hover:scale-105 w-full sm:w-auto"
      >
        Agendar Agora
      </button>
    </div>
    
    <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-xl">
      <h3 className="text-xl sm:text-2xl font-semibold text-white mb-3 sm:mb-4 border-l-4 border-yellow-500 pl-3">Nossos Serviços</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {safeServices.length > 0 ? (
          safeServices.map(service => (
            <div key={service.id} className="bg-gray-700 p-3 sm:p-4 rounded-lg text-center shadow-md">
              <Scissors className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500 mx-auto mb-2" />
              <p className="font-semibold text-white text-sm sm:text-base">{service?.name || 'Serviço'}</p>
              <p className="text-xs sm:text-sm text-gray-300">R$ {(service?.price || 0).toFixed(2)}</p>
              <p className="text-xs text-gray-400">{service?.duration || 30} min</p>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-400">Carregando serviços...</p>
          </div>
        )}
      </div>
    </div>
    
    <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-xl">
      <h3 className="text-xl sm:text-2xl font-semibold text-white mb-3 sm:mb-4 border-l-4 border-yellow-500 pl-3">Nossa Equipe</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {safeBarbers.length > 0 ? (
          safeBarbers.filter(barber => barber?.isActive !== false).map(barber => (
            <div key={barber.id} className="bg-gray-700 p-4 rounded-lg text-center shadow-md">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-yellow-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                <span className="text-gray-900 font-bold text-lg sm:text-xl">{(barber?.name || 'B').charAt(0)}</span>
              </div>
              <p className="text-base sm:text-lg font-medium text-white">{barber?.name || 'Barbeiro'}</p>
              <p className="text-xs sm:text-sm text-gray-400">
                {barber?.specialties && barber.specialties.length > 0 ? barber.specialties.join(', ') : 'Barbeiro'}
              </p>
              <div className="flex items-center justify-center mt-2">
                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="text-xs sm:text-sm text-gray-300">{(barber?.rating || 5.0).toFixed(1)}</span>
                <span className="text-xs text-gray-500 ml-2">({barber?.experience || 'Experiência'})</span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-400">Carregando barbeiros...</p>
          </div>
        )}
      </div>
    </div>
  </div>
  );
};

// Componente de Serviços Detalhados
const ServicesView = () => (
  <div className="animate-fade-in space-y-6">
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
      <h2 className="text-3xl font-bold text-white mb-6 text-center">Nossos Serviços</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SERVICES.map(service => (
          <div key={service.id} className="bg-gray-700 p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <service.icon className="h-10 w-10 text-yellow-500 mr-4" />
              <div>
                <h3 className="text-xl font-semibold text-white">{service.name}</h3>
                <p className="text-gray-400">{service.duration} minutos</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-yellow-500 mb-4">R$ {service.price.toFixed(2)}</p>
            <button className="w-full bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-yellow-400 transition-all">
              Agendar Este Serviço
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>
);
    
// Componente de Contato
const ContactView = () => (
  <div className="animate-fade-in space-y-6">
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
      <h2 className="text-3xl font-bold text-white mb-6 text-center">Entre em Contato</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center">
            <Phone className="h-6 w-6 text-yellow-500 mr-3" />
            <div>
              <p className="text-white font-semibold">Telefone</p>
              <p className="text-gray-400">(11) 99999-8888</p>
            </div>
          </div>
          <div className="flex items-center">
            <MapPin className="h-6 w-6 text-yellow-500 mr-3" />
            <div>
              <p className="text-white font-semibold">Endereço</p>
              <p className="text-gray-400">Rua das Flores, 123<br />Centro - São Paulo/SP</p>
            </div>
          </div>
          <div className="flex items-center">
            <Clock className="h-6 w-6 text-yellow-500 mr-3" />
            <div>
              <p className="text-white font-semibold">Horário de Funcionamento</p>
              <p className="text-gray-400">Segunda a Sábado: 09:00 às 18:00</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Envie uma Mensagem</h3>
          <form className="space-y-3">
            <input
              type="text"
              placeholder="Seu nome"
              className="w-full bg-gray-600 text-white border-gray-500 rounded-lg p-3 focus:ring-yellow-500 focus:border-yellow-500"
            />
            <input
              type="email"
              placeholder="Seu email"
              className="w-full bg-gray-600 text-white border-gray-500 rounded-lg p-3 focus:ring-yellow-500 focus:border-yellow-500"
            />
            <textarea
              placeholder="Sua mensagem"
              rows="4"
              className="w-full bg-gray-600 text-white border-gray-500 rounded-lg p-3 focus:ring-yellow-500 focus:border-yellow-500"
            ></textarea>
            <button
              type="submit"
              className="w-full bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-yellow-400 transition-all"
            >
              Enviar Mensagem
            </button>
          </form>
          </div>
      </div>
    </div>
  </div>
);

// Componente de Carregamento
const LoadingSpinner = ({ text = "Carregando..." }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <svg className="animate-spin h-10 w-10 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <p className="text-gray-300 mt-3 text-lg">{text}</p>
  </div>
);

// Componente de Mensagem (Substituto do Alert)
const MessageBox = ({ title, message, onDone }) => (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
    <div className="bg-gray-800 rounded-lg shadow-xl p-6 md:p-8 max-w-sm w-full text-center border-t-4 border-yellow-500">
      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
      <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-300 mb-6">{message}</p>
      <button
        onClick={onDone}
        className="bg-yellow-500 text-gray-900 font-bold py-2 px-6 rounded-lg w-full hover:bg-yellow-400 transition-all"
      >
        OK
      </button>
    </div>
  </div>
);

// Componente de Erro (Substituto do Alert)
const ErrorBox = ({ message, onDone }) => (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
    <div className="bg-gray-800 rounded-lg shadow-xl p-6 md:p-8 max-w-sm w-full text-center border-t-4 border-red-500">
      <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
      <h3 className="text-2xl font-bold text-white mb-3">Ocorreu um Erro</h3>
      <p className="text-gray-300 mb-6">{message}</p>
      <button
        onClick={onDone}
        className="bg-red-500 text-white font-bold py-2 px-6 rounded-lg w-full hover:bg-red-400 transition-all"
      >
        Tentar Novamente
      </button>
    </div>
  </div>
);


// --- Lógica de Geração de Horários ---
const generateTimeSlots = (selectedDate, serviceDuration, existingBookings) => {
  const slots = [];
  const { start, end, breakStart, breakEnd } = WORKING_HOURS;

  // Converte a data selecionada para o fuso horário local
  const localDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
  
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);
  const [breakStartH, breakStartM] = breakStart.split(':').map(Number);
  const [breakEndH, breakEndM] = breakEnd.split(':').map(Number);

  const startTime = new Date(localDate);
  startTime.setHours(startH, startM, 0, 0);

  const endTime = new Date(localDate);
  endTime.setHours(endH, endM, 0, 0);

  const breakStartTime = new Date(localDate);
  breakStartTime.setHours(breakStartH, breakStartM, 0, 0);

  const breakEndTime = new Date(localDate);
  breakEndTime.setHours(breakEndH, breakEndM, 0, 0);

  let currentSlotTime = new Date(startTime);

  while (currentSlotTime < endTime) {
    const slotStart = new Date(currentSlotTime);
    const slotEnd = new Date(slotStart.getTime() + serviceDuration * 60000);

    // Verifica se o slot termina depois do fim do expediente
    if (slotEnd > endTime) {
      break;
    }

    // Verifica se o slot está DENTRO do horário de almoço
    const isDuringBreak = (slotStart >= breakStartTime && slotStart < breakEndTime) ||
                          (slotEnd > breakStartTime && slotEnd <= breakEndTime) ||
                          (slotStart < breakStartTime && slotEnd > breakEndTime);
                          
    if (!isDuringBreak) {
      // Verifica se o slot está ocupado
      const isOccupied = existingBookings.some(booking => {
        const bookingStart = new Date(booking.startTime);
        const bookingEnd = new Date(booking.endTime);
        
        // Verifica sobreposição
        return (slotStart < bookingEnd && slotEnd > bookingStart);
      });

      if (!isOccupied) {
        slots.push(new Date(slotStart));
      }
    }

    // Avança para o próximo slot (baseado na duração do serviço, ou 30min fixo para simplificar)
    // Usar 30min fixo é mais simples para evitar buracos
    currentSlotTime.setMinutes(currentSlotTime.getMinutes() + 30); 
  }
  return slots;
};


// --- Componente Principal do Fluxo de Agendamento ---
const BookingFlow = ({ bookings, userId, onBookingComplete, onAddBooking, services, barbers }) => {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedBarber, setSelectedBarber] = useState(null); // NOVO ESTADO
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [clientInfo, setClientInfo] = useState({ name: '', phone: '' });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Proteção contra dados undefined/null
  const safeServices = services || [];
  const safeBarbers = barbers || [];
  // safeBookings definido mas usado em outros componentes via props
  
  // Nomes dos Passos
  const stepNames = ["Serviço", "Barbeiro", "Data", "Horário", "Confirmação"];
  
  // Datas disponíveis (próximos 7 dias, filtrando dias fechados)
  const availableDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Zera a hora para comparações

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dayOfWeek = date.getDay();
      
      if (WORKING_HOURS.weekdays.includes(dayOfWeek)) {
        dates.push(date);
      }
    }
    return dates;
  }, []);
  
  // Efeito para carregar horários quando a data, serviço e barbeiro mudam
  useEffect(() => {
    if (selectedDate && selectedService && selectedBarber) { // ATUALIZADO
      setIsLoadingSlots(true);
      
      // Filtra bookings para o dia selecionado
      const dateStart = new Date(selectedDate);
      dateStart.setHours(0, 0, 0, 0);
      const dateEnd = new Date(selectedDate);
      dateEnd.setHours(23, 59, 59, 999);
      
      const bookingsForDayAndBarber = bookings.filter(b => { // ATUALIZADO
        const bDate = new Date(b.startTime);
        // Filtra pelo dia E pelo barbeiro selecionado
        return bDate >= dateStart && 
               bDate <= dateEnd && 
               b.barberId === selectedBarber.id;
      });
      
      const slots = generateTimeSlots(selectedDate, selectedService?.duration || 30, bookingsForDayAndBarber);
      setAvailableSlots(slots);
      setIsLoadingSlots(false);
    }
  }, [selectedDate, selectedService, selectedBarber, bookings]);

  // Funções de Seleção
  const handleSelectService = (service) => {
    setSelectedService(service);
    setStep(2);
  };
  
  // NOVA FUNÇÃO
  const handleSelectBarber = (barber) => {
    setSelectedBarber(barber);
    setStep(3);
  };
  
  const handleSelectDate = (date) => {
    setSelectedDate(date);
    setSelectedTime(null); // Reseta a hora ao mudar o dia
    setStep(4); // ATUALIZADO
  };
  
  const handleSelectTime = (time) => {
    setSelectedTime(time);
    setStep(5); // ATUALIZADO
  };
  
  const handleInfoChange = (e) => {
    setClientInfo({ ...clientInfo, [e.target.name]: e.target.value });
  };
  
  // Função para Voltar
  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
      // Limpar seleções futuras
      if(step === 2) setSelectedService(null);
      if(step === 3) setSelectedBarber(null); // ATUALIZADO
      if(step === 4) setSelectedDate(null); // ATUALIZADO
      if(step === 5) setSelectedTime(null); // ATUALIZADO
    }
  };

  // Envio do Agendamento
  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    
    try {
      // Validações de segurança
      if (!selectedService || !selectedBarber || !selectedDate || !selectedTime) {
        setError('Dados de agendamento incompletos. Por favor, selecione todos os campos obrigatórios.');
        return;
      }

      if (!clientInfo?.name?.trim()) {
        setError('Nome do cliente é obrigatório.');
        return;
      }

      if (!clientInfo?.phone?.trim()) {
        setError('Telefone do cliente é obrigatório.');
        return;
      }

      if (!userId) {
        setError('Usuário não autenticado. Por favor, recarregue a página.');
      return;
    }
    
    setIsSubmitting(true);
      setError(null);
    setErrorMessage(null);
      setIsLoading(true);
    
    const startTime = selectedTime;
      const serviceDuration = selectedService?.duration || 30;
      const endTime = new Date(startTime.getTime() + serviceDuration * 60000);
    
    const newBooking = {
        id: generateId(),
      userId: userId,
        serviceId: selectedService.id || 'unknown',
        serviceName: selectedService.name || 'Serviço',
        duration: serviceDuration,
        barberId: selectedBarber.id || 'unknown',
        barberName: selectedBarber.name || 'Barbeiro',
        date: new Date(selectedDate.setHours(0,0,0,0)),
        startTime: startTime,
        endTime: endTime,
        clientName: clientInfo.name.trim(),
        clientPhone: clientInfo.phone.trim(),
        createdAt: new Date(),
        status: 'confirmed',
        price: selectedService.price || 0
      };
      
      console.log("🚀 Iniciando agendamento:", newBooking);
      
      // Adiciona o novo agendamento via callback
      await onAddBooking(newBooking);
      
      console.log("✅ Agendamento criado com sucesso");
      setStep(6); // Vai para a tela de confirmação
      
    } catch (error) {
      console.error("❌ Erro ao salvar agendamento:", error);
      
      // Mensagens de erro amigáveis
      let errorMessage = 'Não foi possível realizar o agendamento. Tente novamente.';
      
      if (error.message?.includes('permission')) {
        errorMessage = 'Erro de permissão. Verifique sua conexão e tente novamente.';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
      } else if (error.message?.includes('quota')) {
        errorMessage = 'Limite de agendamentos atingido. Tente novamente mais tarde.';
      } else if (error.message?.includes('auth')) {
        errorMessage = 'Erro de autenticação. Recarregue a página e tente novamente.';
      }
      
      setError(errorMessage);
      setErrorMessage(errorMessage);
      
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };
  
  // Reiniciar o fluxo
  const resetFlow = () => {
    setStep(1);
    setSelectedService(null);
    setSelectedBarber(null); // NOVO
    setSelectedDate(null);
    setSelectedTime(null);
    setClientInfo({ name: '', phone: '' });
    setErrorMessage(null);
    setIsSubmitting(false);
    
    // Chama a função passada para notificar o App (ex: mudar de aba)
    if(onBookingComplete) onBookingComplete();
  };
  
  // Botão de Voltar (renderizado condicionalmente)
  const BackButton = () => (
    step > 1 && step < 6 ? ( // ATUALIZADO
      <button
        onClick={goBack}
        className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center text-gray-300 hover:text-yellow-500 transition-colors text-sm sm:text-base"
      >
        <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
        <span className="hidden sm:inline">Voltar</span>
      </button>
    ) : null
  );

  // Renderização dos Passos
  
  const renderStep = () => {
    switch(step) {
      // PASSO 1: ESCOLHER SERVIÇO
      case 1:
        return (
          <div className="animate-fade-in">
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 text-center">1. Escolha o Serviço</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {safeServices.length > 0 ? (
                safeServices.map(service => (
                <button
                  key={service.id}
                  onClick={() => handleSelectService(service)}
                    className="bg-gray-700 p-3 sm:p-4 rounded-lg shadow-lg text-left w-full hover:bg-gray-600 hover:ring-2 hover:ring-yellow-500 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base sm:text-lg font-semibold text-white">{service?.name || 'Serviço'}</p>
                      <p className="text-xs sm:text-sm text-gray-300">{(service?.duration || 30)} min | R$ {(service?.price || 0).toFixed(2)}</p>
                    </div>
                    <Scissors className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />
                  </div>
                </button>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-400">Carregando serviços...</p>
                </div>
              )}
            </div>
          </div>
        );
        
      // PASSO 2: ESCOLHER BARBEIRO (NOVO)
      case 2:
        return (
          <div className="animate-fade-in">
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 text-center">2. Escolha o Barbeiro</h3>
            <p className="text-center text-gray-400 mb-3 sm:mb-4 text-sm">Serviço: {selectedService?.name}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {safeBarbers.length > 0 ? (
                safeBarbers.filter(barber => barber?.isActive !== false).map(barber => (
                <button
                  key={barber.id}
                  onClick={() => handleSelectBarber(barber)}
                    className={`bg-gray-700 p-3 sm:p-4 rounded-lg shadow-lg text-center w-full hover:bg-gray-600 hover:ring-2 hover:ring-yellow-500 transition-all flex flex-col items-center ${
                    selectedBarber?.id === barber.id ? 'ring-2 ring-yellow-500' : ''
                  }`}
                >
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-500 rounded-full mb-2 sm:mb-3 flex items-center justify-center">
                      <span className="text-gray-900 font-bold text-lg sm:text-xl">{(barber?.name || 'B').charAt(0)}</span>
                    </div>
                    <p className="text-base sm:text-lg font-semibold text-white">{barber?.name || 'Barbeiro'}</p>
                    <p className="text-gray-400 text-xs sm:text-sm">
                      {barber?.specialties && barber.specialties.length > 0 ? barber.specialties.join(', ') : 'Barbeiro'}
                    </p>
                    <div className="flex items-center mt-1">
                      <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 mr-1" />
                      <span className="text-yellow-400 text-xs sm:text-sm font-semibold">{(barber?.rating || 5.0).toFixed(1)}</span>
                    </div>
                </button>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-400">Carregando barbeiros...</p>
                </div>
              )}
            </div>
          </div>
        );

      // PASSO 3: ESCOLHER DATA (ERA 2)
      case 3:
        return (
          <div className="animate-fade-in">
            <h3 className="text-xl font-semibold text-white mb-4 text-center">3. Escolha a Data</h3>
            <p className="text-center text-gray-400 mb-1 text-sm">Serviço: {selectedService?.name}</p>
            <p className="text-center text-gray-400 mb-4 text-sm">Barbeiro: {selectedBarber?.name}</p>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {availableDates.map(date => (
                <button
                  key={date.toISOString()}
                  onClick={() => handleSelectDate(date)}
                  className={`p-3 rounded-lg text-center transition-all ${
                    selectedDate?.toISOString() === date.toISOString()
                      ? 'bg-yellow-500 text-gray-900 font-bold'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  <p className="text-xs font-medium uppercase">{date.toLocaleDateString('pt-BR', { weekday: 'short' })}</p>
                  <p className="text-2xl font-bold">{date.getDate()}</p>
                  <p className="text-xs font-medium uppercase">{date.toLocaleDateString('pt-BR', { month: 'short' })}</p>
                </button>
              ))}
            </div>
          </div>
        );

      // PASSO 4: ESCOLHER HORÁRIO (ERA 3)
      case 4:
        return (
          <div className="animate-fade-in">
            <h3 className="text-xl font-semibold text-white mb-4 text-center">4. Escolha o Horário</h3>
            <p className="text-center text-gray-400 mb-1 text-sm">Serviço: {selectedService?.name}</p>
            <p className="text-center text-gray-400 mb-1 text-sm">Barbeiro: {selectedBarber?.name}</p>
            <p className="text-center text-gray-400 mb-4 text-sm">Data: {selectedDate?.toLocaleDateString('pt-BR')}</p>
            
            {isLoadingSlots && <LoadingSpinner text="Buscando horários..." />}
            
            {!isLoadingSlots && availableSlots.length > 0 && (
              <div className="grid grid-cols-4 gap-3 max-h-60 overflow-y-auto pr-2">
                {availableSlots.map(time => (
                  <button
                    key={time.toISOString()}
                    onClick={() => handleSelectTime(time)}
                    className={`p-3 rounded-lg text-center transition-all ${
                      selectedTime?.toISOString() === time.toISOString()
                        ? 'bg-yellow-500 text-gray-900 font-bold'
                        : 'bg-gray-700 text-white hover:bg-gray-600'
                    }`}
                  >
                    {time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </button>
                ))}
              </div>
            )}
            
            {!isLoadingSlots && availableSlots.length === 0 && (
              <p className="text-center text-gray-400 p-4 bg-gray-700 rounded-lg">
                Nenhum horário disponível para este dia. Tente outra data.
              </p>
            )}
          </div>
        );

      // PASSO 5: INFORMAÇÕES E CONFIRMAÇÃO (ERA 4)
      case 5:
        return (
          <div className="animate-fade-in">
            <h3 className="text-xl font-semibold text-white mb-4 text-center">5. Confirme seu Agendamento</h3>
            
            <div className="bg-gray-700 p-4 rounded-lg mb-4 text-center space-y-2">
              <p className="text-lg text-white font-semibold">{selectedService?.name}</p>
              <p className="text-gray-300">
                <span className="font-medium text-yellow-500">{selectedDate?.toLocaleDateString('pt-BR')}</span>
                {' às '}
                <span className="font-medium text-yellow-500">{selectedTime?.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
              </p>
              <p className="text-gray-300">Com: {selectedBarber?.name}</p>
            </div>
            
            <form onSubmit={handleSubmitBooking}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Seu Nome</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={clientInfo.name}
                    onChange={handleInfoChange}
                    required
                    className="w-full bg-gray-700 text-white border-gray-600 rounded-lg p-3 focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="João Silva"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">Seu Telefone (WhatsApp)</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={clientInfo.phone}
                    onChange={handleInfoChange}
                    required
                    className="w-full bg-gray-700 text-white border-gray-600 rounded-lg p-3 focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="(11) 99999-8888"
                  />
                </div>
              </div>
              
              {(error || errorMessage) && (
                <p className="text-red-400 text-center mt-4 text-sm">{error || errorMessage}</p>
              )}
              
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg mt-6 hover:bg-green-500 transition-all disabled:bg-gray-500"
              >
                {(isSubmitting || isLoading) ? 'Confirmando...' : 'Confirmar Agendamento'}
              </button>
            </form>
          </div>
        );
      
      // PASSO 6: SUCESSO (ERA 5)
      case 6:
        // Verificar se os dados estão disponíveis
        if (!selectedService || !selectedDate || !selectedTime || !clientInfo.name) {
          return (
            <div className="text-center p-4">
              <p className="text-red-500">Erro: Dados do agendamento não encontrados</p>
              <button 
                onClick={() => setStep(1)}
                className="bg-yellow-500 text-gray-900 font-bold py-2 px-6 rounded-lg mt-4"
              >
                Voltar ao Início
              </button>
            </div>
          );
        }
        
        return (
          <div className="animate-fade-in text-center p-4">
            <div className="bg-green-500 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-3xl">✓</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Agendamento Confirmado!</h3>
            <div className="bg-gray-700 p-4 rounded-lg mb-6 text-left">
              <p className="text-lg text-white font-semibold mb-2">{selectedService?.name || 'Serviço'}</p>
              <p className="text-gray-300 mb-1">
                <span className="font-medium">Data:</span> {selectedDate?.toLocaleDateString('pt-BR') || 'Data não selecionada'}
              </p>
              <p className="text-gray-300 mb-1">
                <span className="font-medium">Hora:</span> {selectedTime?.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) || 'Horário não selecionado'}
              </p>
              <p className="text-gray-300">
                <span className="font-medium">Cliente:</span> {clientInfo?.name || 'Cliente'}
              </p>
            </div>
            <p className="text-gray-300 mb-4">Te esperamos! Você pode ver seus horários na aba "Meus Horários".</p>
            
            {/* Informação sobre o lembrete */}
            <div className="bg-blue-900 bg-opacity-50 border border-blue-500 rounded-lg p-3 mb-4">
              <p className="text-blue-200 text-sm">
                💡 <strong>Dica:</strong> Adicione ao seu calendário para receber um lembrete 20 minutos antes do horário!
              </p>
            </div>
            
            {/* Botão para adicionar ao calendário */}
            <button
              onClick={() => {
                const bookingData = {
                  id: generateId(),
                  serviceName: selectedService?.name || 'Serviço',
                  barberName: selectedBarber?.name || 'Barbeiro',
                  clientName: clientInfo?.name || 'Cliente',
                  price: selectedService?.price || 0,
                  startTime: new Date(selectedDate?.getFullYear() || new Date().getFullYear(), selectedDate?.getMonth() || new Date().getMonth(), selectedDate?.getDate() || new Date().getDate(), selectedTime?.getHours() || 9, selectedTime?.getMinutes() || 0),
                  endTime: new Date(selectedDate?.getFullYear() || new Date().getFullYear(), selectedDate?.getMonth() || new Date().getMonth(), selectedDate?.getDate() || new Date().getDate(), selectedTime?.getHours() || 9, (selectedTime?.getMinutes() || 0) + (selectedService?.duration || 30))
                };
                addToCalendar(bookingData);
              }}
              className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg w-full mb-3 hover:bg-blue-500 transition-all flex items-center justify-center"
            >
              <Calendar className="h-5 w-5 mr-2" />
              Adicionar ao Calendário
            </button>
            
            <button
              onClick={resetFlow}
              className="bg-yellow-500 text-gray-900 font-bold py-2 px-6 rounded-lg w-full hover:bg-yellow-400 transition-all"
            >
              OK
            </button>
          </div>
        );
        
      default:
        return (
          <div className="text-center p-4">
            <p className="text-red-500">Erro: Step {step} não encontrado</p>
            <button 
              onClick={() => setStep(1)}
              className="bg-yellow-500 text-gray-900 font-bold py-2 px-6 rounded-lg mt-4"
            >
              Voltar ao Início
            </button>
          </div>
        );
    }
  };
  
  return (
    <div className="bg-gray-800 p-3 sm:p-4 md:p-6 rounded-lg shadow-xl relative animate-fade-in mx-2 sm:mx-4">
      <BackButton />
      {/* Indicador de Passos */}
      {step < 6 && ( // ATUALIZADO
        <div className="mb-3 sm:mb-4">
          <div className="flex justify-between items-center mb-1">
            {stepNames.map((name, index) => (
              <span 
                key={index}
                className={`text-xs sm:text-sm ${index + 1 <= step ? 'text-yellow-500' : 'text-gray-500'} hidden sm:block`}
              >
                {name}
              </span>
            ))}
            <span className="text-xs sm:text-sm text-yellow-500 sm:hidden">
              Passo {step} de 5
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {renderStep()}
    </div>
  );
};

// Componente da Lista de Agendamentos (Admin e Cliente)
const BookingsList = ({ bookings, userId, isLoading }) => {
  
  const [myBookings] = useMemo(() => {
    // Ordena por data (mais recentes primeiro)
    const sortedBookings = [...bookings].sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
    
    const my = sortedBookings.filter(b => b.userId === userId);
    // Retorna [meusAgendamentos, todosAgendamentos], mas só usamos o primeiro
    return [my, sortedBookings]; 
  }, [bookings, userId]);
  
  const formatDate = (timestamp) => {
    if (!timestamp) return '...';
    return new Date(timestamp).toLocaleDateString('pt-BR');
  };
  
  const formatTime = (timestamp) => {
    if (!timestamp) return '...';
    return new Date(timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };
  
  const BookingCard = ({ booking }) => (
    <div className="bg-gray-700 p-4 rounded-lg shadow-md border-l-4 border-yellow-500">
      <p className="text-lg font-semibold text-white">{booking.serviceName}</p>
      <p className="text-sm text-gray-300">Cliente: {booking.clientName}</p>
      <p className="text-sm text-gray-300">Data: {formatDate(booking.startTime)}</p>
      <p className="text-sm text-gray-300">Hora: {formatTime(booking.startTime)}</p>
      <p className="text-sm text-gray-300">Barbeiro: {booking.barberName}</p>
      
      {/* Botão para adicionar ao calendário */}
      <button
        onClick={() => addToCalendar(booking)}
        className="mt-3 bg-blue-600 text-white py-1 px-3 rounded text-xs hover:bg-blue-500 transition-colors flex items-center"
      >
        <Calendar className="h-3 w-3 mr-1" />
        Adicionar ao Calendário
      </button>
    </div>
  );

  if (isLoading) {
    return <LoadingSpinner text="Carregando agendamentos..." />;
  }
  
  return (
    <div className="animate-fade-in space-y-6">
      {/* Meus Agendamentos */}
      <div>
        <h3 className="text-2xl font-semibold text-white mb-4 border-l-4 border-yellow-500 pl-3">Meus Próximos Horários</h3>
        {myBookings.length > 0 ? (
          <div className="space-y-4">
            {myBookings.map(b => <BookingCard key={b.id} booking={b} />)}
          </div>
        ) : (
          <p className="text-gray-400 bg-gray-800 p-4 rounded-lg">Você ainda não tem nenhum agendamento.</p>
        )}
      </div>
      
      {/* Painel do Barbeiro (Admin) - REMOVIDO DAQUI */}
    </div>
  );
};


// --- NOVOS COMPONENTES DO DASHBOARD ---

// NOVO: Lista de Agendamentos de Hoje (para o Dashboard)
const TodaysBookingsList = ({ bookings, isLoading, onComplete }) => {
  const todaysBookings = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    return bookings.filter(b => {
      const startTime = new Date(b.startTime);
      // Filtra por agendamentos que começam hoje E estão confirmados
      return startTime >= todayStart && 
             startTime < todayEnd && 
             b.status === 'confirmed';
    }).sort((a, b) => new Date(a.startTime) - new Date(b.startTime)); // Mais cedo primeiro
  }, [bookings]);

  if (isLoading) {
    return <LoadingSpinner text="Carregando..." />;
  }

  if (todaysBookings.length === 0) {
    return <p className="text-gray-400">Nenhum agendamento confirmado para hoje.</p>;
  }

  return (
    <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
      {todaysBookings.map(b => (
        <div key={b.id} className="bg-gray-700 p-4 rounded-lg shadow-md flex justify-between items-center">
          <div>
            <p className="text-base font-semibold text-white">
              {new Date(b.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {b.serviceName}
            </p>
            <p className="text-sm text-gray-300">Cliente: {b.clientName}</p>
            <p className="text-sm text-gray-300">Barbeiro: {b.barberName}</p>
          </div>
          <button
            onClick={() => onComplete(b.id)}
            className="bg-green-600 text-white font-bold py-2 px-3 rounded-lg text-sm hover:bg-green-500 transition-all flex-shrink-0"
          >
            Concluir
          </button>
        </div>
      ))}
    </div>
  );
};


// Card de Estatística
const StatCard = ({ title, value, icon, colorClass = 'text-yellow-500' }) => {
  const IconComponent = icon;
  return (
  <div className="bg-gray-700 p-4 rounded-lg shadow-lg flex items-center">
    <div className={`p-3 rounded-full ${colorClass.replace('text-', 'bg-').replace('500', '500')} bg-opacity-20 mr-4`}>
      <IconComponent className={`h-6 w-6 ${colorClass}`} />
    </div>
    <div>
      <p className="text-sm text-gray-400 font-medium">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  </div>
);
};

// Formulário de Adicionar Corte Avulso (DESABILITADO - não utilizado)
const AddWalkInForm = ({ services, barbers, userId, onAddBooking }) => {
  const [serviceId, setServiceId] = useState(SERVICES[0].id);
  const [barberId, setBarberId] = useState(BARBERS[0].id);
  const [price, setPrice] = useState(SERVICES[0].price);
  const [clientName, setClientName] = useState('Cliente Avulso');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const handleServiceChange = (e) => {
    const sId = e.target.value;
    setServiceId(sId);
    const service = SERVICES.find(s => s.id === sId);
    if (service) {
      setPrice(service.price);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const service = SERVICES.find(s => s.id === serviceId);
    const barber = BARBERS.find(b => b.id === barberId);
    const now = new Date();

    const newBooking = {
      id: generateId(),
      userId: userId,
      serviceId: service.id,
      serviceName: service.name,
      duration: service.duration,
      barberId: barber.id,
      barberName: barber.name,
      date: new Date(now.setHours(0,0,0,0)),
      startTime: now,
      endTime: new Date(now.getTime() + service.duration * 60000),
      clientName: clientName || 'Cliente Avulso',
      clientPhone: 'N/A',
      createdAt: now,
      status: 'completed',
      price: parseFloat(price)
    };

    try {
      onAddBooking(newBooking);
      setMessage({ type: 'success', text: 'Corte avulso adicionado!' });
      // Reset form
      setServiceId(SERVICES[0].id);
      setBarberId(BARBERS[0].id);
      setPrice(SERVICES[0].price);
      setClientName('Cliente Avulso');
    } catch (error) {
      console.error("Erro ao adicionar corte avulso:", error);
      setMessage({ type: 'error', text: 'Erro ao salvar.' });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
      <h3 className="text-xl font-semibold text-white mb-4">Adicionar Corte Avulso (Walk-in)</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="walkin-service" className="block text-sm font-medium text-gray-300 mb-1">Serviço</label>
          <select 
            id="walkin-service" 
            value={serviceId} 
            onChange={handleServiceChange}
            className="w-full bg-gray-700 text-white border-gray-600 rounded-lg p-3 focus:ring-yellow-500 focus:border-yellow-500"
          >
            {services.length > 0 ? (
              services.map(s => <option key={s.id} value={s.id}>{s.name} - R$ {s.price.toFixed(2)}</option>)
            ) : (
              <option value="">Carregando serviços...</option>
            )}
          </select>
        </div>
        <div>
          <label htmlFor="walkin-barber" className="block text-sm font-medium text-gray-300 mb-1">Barbeiro</label>
          <select 
            id="walkin-barber" 
            value={barberId} 
            onChange={(e) => setBarberId(e.target.value)}
            className="w-full bg-gray-700 text-white border-gray-600 rounded-lg p-3 focus:ring-yellow-500 focus:border-yellow-500"
          >
            {barbers.length > 0 ? (
              barbers.filter(b => b.isActive).map(b => <option key={b.id} value={b.name}>{b.name}</option>)
            ) : (
              <option value="">Carregando barbeiros...</option>
            )}
          </select>
        </div>
        <div>
          <label htmlFor="walkin-name" className="block text-sm font-medium text-gray-300 mb-1">Nome do Cliente</label>
          <input 
            type="text" 
            id="walkin-name" 
            value={clientName} 
            onChange={(e) => setClientName(e.target.value)}
            className="w-full bg-gray-700 text-white border-gray-600 rounded-lg p-3 focus:ring-yellow-500 focus:border-yellow-500" 
          />
        </div>
        <div>
          <label htmlFor="walkin-price" className="block text-sm font-medium text-gray-300 mb-1">Preço (R$)</label>
          <input 
            type="number" 
            id="walkin-price" 
            value={price} 
            onChange={(e) => setPrice(e.target.value)}
            className="w-full bg-gray-700 text-white border-gray-600 rounded-lg p-3 focus:ring-yellow-500 focus:border-yellow-500" 
          />
        </div>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-yellow-500 text-gray-900 font-bold py-3 px-6 rounded-lg hover:bg-yellow-400 transition-all disabled:bg-gray-600"
        >
          {isSubmitting ? 'Salvando...' : 'Adicionar Corte'}
        </button>
        {message && (
          <p className={`text-center text-sm ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
            {message.text}
          </p>
        )}
      </form>
    </div>
  );
};

// Componente do Dashboard (Admin) - DESABILITADO
const DashboardView = ({ todayBookings, isLoadingTodayBookings, history, isLoading }) => {
  const [timeFilter, setTimeFilter] = useState('month'); // 'day', 'week', 'month'

  // Lógica de cálculo (useMemo)
  const stats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(today);
    // Ajuste para semana começando na Segunda (1) e terminando no Domingo (0)
    const dayOfWeek = today.getDay(); // 0 (Dom) - 6 (Sáb)
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // se Dom, vai pra Seg passada, senão, vai pra Seg
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    let filterDate;
    if (timeFilter === 'day') filterDate = today;
    else if (timeFilter === 'week') filterDate = startOfWeek;
    else filterDate = startOfMonth;

    // ALTERADO: Agora só calcula stats de agendamentos 'completed'
    const filteredHistory = history.filter(b => 
      new Date(b.startTime) >= filterDate && 
      b.status === 'completed'
    );
    
    // Tenta pegar o preço do doc, senão, busca em SERVICES
    const getPrice = (booking) => {
      if (booking.price) return booking.price;
      const service = SERVICES.find(s => s.id === booking.serviceId);
      return service ? service.price : 0;
    };

    const totalRevenue = filteredHistory.reduce((acc, b) => acc + getPrice(b), 0);
    const totalBookings = filteredHistory.length;
    
    const revenueByBarber = filteredHistory.reduce((acc, b) => {
      const name = b.barberName || 'N/A';
      acc[name] = (acc[name] || 0) + getPrice(b);
      return acc;
    }, {});

    return {
      totalRevenue,
      totalBookings,
      revenueByBarber: Object.entries(revenueByBarber).sort((a, b) => b[1] - a[1]) // Ordena por quem faturou mais
    };

  }, [history, timeFilter]);

  const filterLabel = {
    day: 'Hoje',
    week: 'Esta Semana',
    month: 'Este Mês',
  };

  // NOVO: Função para marcar como concluído
  const handleCompleteBooking = async (bookingId) => {
    console.log("Agendamento concluído:", bookingId);
    // Esta função será implementada no componente pai
  };

  // Cards de Histórico (similar ao BookingsList)
  const BookingHistoryCard = ({ booking }) => {
    const price = booking.price || SERVICES.find(s => s.id === booking.serviceId)?.price || 0;
    
    return (
      <div className="bg-gray-700 p-4 rounded-lg shadow-md border-l-4 border-yellow-500">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-lg font-semibold text-white">{booking.serviceName}</p>
            <p className="text-sm text-gray-300">Cliente: {booking.clientName}</p>
            <p className="text-sm text-gray-300">Data: {new Date(booking.startTime).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'})}</p>
            <p className="text-sm text-gray-300">Barbeiro: {booking.barberName}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-green-400 mt-1">
              R$ {price.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <LoadingSpinner text="Carregando dashboard..." />;
  }

  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="text-3xl font-bold text-white">Dashboard do Barbeiro</h2>
      
      {/* Filtros de Data */}
      <div className="flex space-x-2">
        {['day', 'week', 'month'].map(filter => (
          <button
            key={filter}
            onClick={() => setTimeFilter(filter)}
            className={`py-2 px-4 rounded-lg font-medium transition-all text-sm md:text-base ${
              timeFilter === filter 
                ? 'bg-yellow-500 text-gray-900' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {filterLabel[filter]}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard 
          title={`Receita (${filterLabel[timeFilter]})`} 
          value={`R$ ${stats.totalRevenue.toFixed(2)}`}
          icon={DollarSign}
          colorClass="text-green-500"
        />
        <StatCard 
          title={`Cortes (${filterLabel[timeFilter]})`}
          value={stats.totalBookings}
          icon={Hash}
          colorClass="text-blue-500"
        />
      </div>
      
      {/* NOVO: Agendamentos de Hoje */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
        <h3 className="text-xl font-semibold text-white mb-4">Agendamentos de Hoje (Pendentes)</h3>
        <TodaysBookingsList 
          bookings={todayBookings}
          isLoading={isLoadingTodayBookings}
          onComplete={handleCompleteBooking}
        />
      </div>
      
      {/* Outros Stats */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
        <h3 className="text-xl font-semibold text-white mb-4">Receita por Barbeiro ({filterLabel[timeFilter]})</h3>
        <div className="space-y-2">
          {stats.revenueByBarber.length > 0 ? stats.revenueByBarber.map(([name, revenue]) => (
            <div key={name} className="flex justify-between items-center bg-gray-700 p-3 rounded-lg">
              <span className="text-gray-300">{name}</span>
              <span className="font-bold text-green-400">R$ {revenue.toFixed(2)}</span>
            </div>
          )) : (
            <p className="text-gray-400">Nenhum dado no período.</p>
          )}
        </div>
      </div>

      {/* Formulário de Walk-in removido - funcionalidade disponível na tela de agendamentos */}

      {/* Histórico Recente */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
        <h3 className="text-xl font-semibold text-white mb-4">Histórico Recente (Últimos 90 dias)</h3>
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {history.length > 0 ? history.map(b => (
          <BookingHistoryCard key={b.id} booking={b} />
          )) : (
            <p className="text-gray-400">Nenhum histórico encontrado.</p>
          )}
        </div>
      </div>
    </div>
  );
};


// --- Componentes de Admin ---

// Dashboard Admin Principal
const AdminDashboard = ({ bookings }) => {
  const [timeFilter, setTimeFilter] = useState('week'); // 'day', 'week', 'month'
  
  // Limpar dados de agendamentos antes de processar
  const cleanedBookings = useMemo(() => {
    return cleanBookingsData(bookings);
  }, [bookings]);

  const stats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(today);
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    let filterDate;
    if (timeFilter === 'day') filterDate = today;
    else if (timeFilter === 'week') filterDate = startOfWeek;
    else filterDate = startOfMonth;

    const filteredBookings = cleanedBookings.filter(b => {
      const bookingDate = new Date(b.startTime);
      return bookingDate >= filterDate;
    });
    
    // ✅ CORREÇÃO: Calcular receita e estatísticas APENAS de agendamentos que foram adicionados ao dashboard
    // Isso significa: pagamento confirmado E serviço concluído
    const dashboardBookings = filteredBookings.filter(b => b.addedToDashboard === true);
    
    const totalRevenue = dashboardBookings.reduce((acc, b) => acc + (b.price || 0), 0);
    const totalBookings = filteredBookings.length;
    const confirmedBookingsCount = dashboardBookings.length;
    const averageRating = dashboardBookings.reduce((acc, b) => acc + (b.rating || 0), 0) / dashboardBookings.length || 0;
    
    const revenueByBarber = dashboardBookings.reduce((acc, b) => {
      acc[b.barberName] = (acc[b.barberName] || 0) + (b.price || 0);
      return acc;
    }, {});

    const serviceStats = dashboardBookings.reduce((acc, b) => {
      acc[b.serviceName] = (acc[b.serviceName] || 0) + 1;
      return acc;
    }, {});

    // Clientes únicos baseado em agendamentos completados
    const uniqueClients = new Set(dashboardBookings.map(b => b.clientName)).size;

    return {
      totalRevenue,
      totalBookings,
      confirmedBookingsCount,
      averageRating,
      uniqueClients,
      revenueByBarber: Object.entries(revenueByBarber).sort((a, b) => b[1] - a[1]),
      serviceStats: Object.entries(serviceStats).sort((a, b) => b[1] - a[1])
    };
  }, [timeFilter, cleanedBookings]);

  return (
    <div className="animate-fade-in space-y-4 sm:space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-white">Dashboard Administrativo</h2>
        <div className="flex flex-wrap gap-2">
          {['day', 'week', 'month'].map(filter => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`py-2 px-3 sm:px-4 rounded-lg font-medium transition-all text-xs sm:text-sm ${
                timeFilter === filter 
                  ? 'bg-yellow-500 text-gray-900' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {filter === 'day' ? 'Hoje' : filter === 'week' ? 'Esta Semana' : 'Este Mês'}
            </button>
          ))}
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-xl">
          <div className="flex items-center">
            <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 mr-2 sm:mr-4" />
            <div>
              <p className="text-xs sm:text-sm text-gray-400">Receita Confirmada</p>
              <p className="text-lg sm:text-2xl font-bold text-white">R$ {stats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-xl">
          <div className="flex items-center">
            <Hash className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 mr-2 sm:mr-4" />
            <div>
              <p className="text-xs sm:text-sm text-gray-400">Total de Serviços</p>
              <p className="text-lg sm:text-2xl font-bold text-white">{stats.totalBookings}</p>
              <p className="text-xs text-gray-500">{stats.confirmedBookingsCount} confirmados</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-xl">
          <div className="flex items-center">
            <Star className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500 mr-2 sm:mr-4" />
            <div>
              <p className="text-xs sm:text-sm text-gray-400">Avaliação Média</p>
              <p className="text-lg sm:text-2xl font-bold text-white">{stats.averageRating.toFixed(1)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-xl">
          <div className="flex items-center">
            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500 mr-2 sm:mr-4" />
            <div>
              <p className="text-xs sm:text-sm text-gray-400">Clientes Atendidos</p>
              <p className="text-lg sm:text-2xl font-bold text-white">{stats.uniqueClients}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos e Análises */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Receita por Barbeiro */}
        <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-xl">
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Receita por Barbeiro</h3>
          <div className="space-y-2 sm:space-y-3">
            {stats.revenueByBarber.map(([name, revenue]) => (
              <div key={name} className="flex justify-between items-center">
                <span className="text-gray-300 text-sm sm:text-base">{name}</span>
                <span className="font-bold text-green-400 text-sm sm:text-base">R$ {revenue.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Serviços Mais Populares */}
        <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-xl">
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Serviços Mais Populares</h3>
          <div className="space-y-2 sm:space-y-3">
            {stats.serviceStats.map(([service, count]) => (
              <div key={service} className="flex justify-between items-center">
                <span className="text-gray-300 text-sm sm:text-base">{service}</span>
                <span className="font-bold text-blue-400 text-sm sm:text-base">{count} serviços</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Clientes Frequentes */}
      <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-xl">
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Clientes Frequentes</h3>
        {stats.uniqueClients > 0 ? (
          <p className="text-gray-400 text-center py-6 sm:py-8 text-sm sm:text-base">
            {stats.uniqueClients} clientes únicos atendidos no período selecionado.
          </p>
        ) : (
          <p className="text-gray-400 text-center py-6 sm:py-8 text-sm sm:text-base">
            Nenhum cliente atendido ainda. Faça alguns agendamentos para ver as estatísticas!
          </p>
        )}
      </div>
    </div>
  );
};

// Gerenciamento de Agendamentos Admin
const AdminBookings = ({ bookings, onUpdateBooking, onConfirmPayment }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [duplicateWarning, setDuplicateWarning] = useState('');
  
  // Limpar e validar dados de agendamentos
  const cleanedBookings = useMemo(() => {
    const cleaned = cleanBookingsData(bookings);
    
    // Verificar se houve duplicatas
    if (bookings.length !== cleaned.length) {
      const duplicatesCount = bookings.length - cleaned.length;
      setDuplicateWarning(`${duplicatesCount} agendamentos duplicados foram removidos automaticamente`);
      
      // Limpar aviso após 5 segundos
      setTimeout(() => setDuplicateWarning(''), 5000);
    } else {
      setDuplicateWarning('');
    }
    
    return cleaned;
  }, [bookings]);
  
  const todaysBookings = useMemo(() => {
    return cleanedBookings.filter(b => {
      if (!b.startTime) return false;
      const bookingDate = new Date(b.startTime);
      return bookingDate.toISOString().split('T')[0] === selectedDate;
    });
  }, [cleanedBookings, selectedDate]);

  const handleCompleteBooking = (bookingId) => {
    onUpdateBooking(bookingId, { status: 'completed' });
  };

  const handleConfirmPayment = (bookingId) => {
    onConfirmPayment(bookingId);
  };

  return (
    <div className="animate-fade-in space-y-4 sm:space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-white">Gerenciar Agendamentos</h2>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="bg-gray-700 text-white border-gray-600 rounded-lg p-2 w-full sm:w-auto"
        />
      </div>
      
      {/* Aviso de duplicatas */}
      {duplicateWarning && (
        <div className="bg-yellow-900 border border-yellow-500 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
            <span className="text-yellow-200">{duplicateWarning}</span>
          </div>
        </div>
      )}

      <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-xl">
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">
          Agendamentos para {new Date(selectedDate).toLocaleDateString('pt-BR')}
        </h3>
        
        {todaysBookings.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {todaysBookings.map((booking, index) => {
              // Garantir chave única combinando ID com índice e timestamp
              const uniqueKey = `${booking.id}-${index}-${booking.startTime?.getTime() || Date.now()}`;
              
              return (
                <div key={uniqueKey} className="bg-gray-700 p-3 sm:p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-white text-sm sm:text-base">{booking.serviceName}</h4>
                  <p className="text-gray-400 text-xs sm:text-sm">Cliente: {booking.clientName}</p>
                  <p className="text-gray-400 text-xs sm:text-sm">Barbeiro: {booking.barberName}</p>
                  <p className="text-gray-400 text-xs sm:text-sm">Horário: {booking.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
                  <div className="flex items-center gap-2">
                    <p className="text-base sm:text-lg font-bold text-green-400">R$ {booking.price.toFixed(2)}</p>
                    {booking.paymentConfirmed ? (
                      <span className="bg-green-600 text-white px-2 py-1 rounded text-xs">Pago</span>
                    ) : (
                      <span className="bg-yellow-600 text-white px-2 py-1 rounded text-xs">Pendente</span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 mr-1" />
                    <span className="text-xs sm:text-sm text-gray-300">{booking.rating}</span>
                  </div>
                  <div className="flex flex-col gap-2 w-full sm:w-auto">
                    {!booking.paymentConfirmed && (
                      <button 
                        onClick={() => handleConfirmPayment(booking.id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-xs sm:text-sm hover:bg-blue-500 w-full sm:w-auto"
                      >
                        Confirmar Pagamento
                      </button>
                    )}
                    <button 
                      onClick={() => handleCompleteBooking(booking.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-xs sm:text-sm hover:bg-green-500 w-full sm:w-auto"
                    >
                      {booking.status === 'completed' ? 'Concluído' : 'Marcar como Concluído'}
                    </button>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">Nenhum agendamento para esta data.</p>
        )}
      </div>
    </div>
  );
};

// Gerenciamento de Clientes
const AdminClients = ({ bookings }) => {
  // Limpar dados de agendamentos antes de processar
  const cleanedBookings = useMemo(() => {
    return cleanBookingsData(bookings);
  }, [bookings]);
  
  const clientStats = useMemo(() => {
    // ✅ CORREÇÃO: Calcular estatísticas apenas de agendamentos adicionados ao dashboard (pagos E concluídos)
    const dashboardBookings = cleanedBookings.filter(b => b.addedToDashboard === true);
    
    const clientMap = new Map();
    
    dashboardBookings.forEach(booking => {
      const clientName = booking.clientName;
      if (!clientMap.has(clientName)) {
        clientMap.set(clientName, {
          name: clientName,
          visits: 0,
          totalSpent: 0,
          lastVisit: null,
          services: []
        });
      }
      
      const client = clientMap.get(clientName);
      client.visits += 1;
      client.totalSpent += booking.price || 0;
      client.services.push(booking.serviceName);
      
      const bookingDate = new Date(booking.startTime);
      if (!client.lastVisit || bookingDate > client.lastVisit) {
        client.lastVisit = bookingDate;
      }
    });
    
    return Array.from(clientMap.values()).map(client => ({
      ...client,
      favoriteService: client.services.reduce((a, b, i, arr) => 
        arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
      )
    })).sort((a, b) => b.visits - a.visits);
  }, [cleanedBookings]);

  return (
    <div className="animate-fade-in space-y-4 sm:space-y-6 p-4 sm:p-6">
      <h2 className="text-2xl sm:text-3xl font-bold text-white">Gerenciar Clientes</h2>
      
      <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-xl">
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Base de Clientes</h3>
        {clientStats.length > 0 ? (
          <div className="overflow-x-auto">
            {/* Desktop Table */}
            <table className="w-full text-left hidden sm:table">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="pb-3 text-gray-300 text-sm">Cliente</th>
                  <th className="pb-3 text-gray-300 text-sm">Visitas</th>
                  <th className="pb-3 text-gray-300 text-sm">Última Visita</th>
                  <th className="pb-3 text-gray-300 text-sm">Total Gasto</th>
                  <th className="pb-3 text-gray-300 text-sm">Serviço Favorito</th>
                  <th className="pb-3 text-gray-300 text-sm">Ações</th>
                </tr>
              </thead>
              <tbody>
                {clientStats.map((client, index) => {
                  // Garantir chave única para cada cliente
                  const uniqueKey = `client-${client.name}-${index}-${client.lastVisit?.getTime() || Date.now()}`;
                  
                  return (
                    <tr key={uniqueKey} className="border-b border-gray-700">
                    <td className="py-3 text-white font-medium text-sm">{client.name}</td>
                    <td className="py-3 text-gray-300 text-sm">{client.visits}</td>
                    <td className="py-3 text-gray-300 text-sm">
                      {client.lastVisit ? client.lastVisit.toLocaleDateString('pt-BR') : 'N/A'}
                    </td>
                    <td className="py-3 text-green-400 font-semibold text-sm">R$ {client.totalSpent.toFixed(2)}</td>
                    <td className="py-3 text-gray-300 text-sm">{client.favoriteService}</td>
                    <td className="py-3">
                      <button className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-500 mr-1">
                        Histórico
                      </button>
                      <button className="bg-yellow-600 text-white px-2 py-1 rounded text-xs hover:bg-yellow-500">
                        Contatar
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Mobile Cards */}
            <div className="sm:hidden space-y-3">
              {clientStats.map((client, index) => {
                // Garantir chave única para cada cliente mobile
                const uniqueKey = `client-mobile-${client.name}-${index}-${client.lastVisit?.getTime() || Date.now()}`;
                
                return (
                  <div key={uniqueKey} className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-white font-medium text-sm">{client.name}</h4>
                    <span className="text-green-400 font-semibold text-sm">R$ {client.totalSpent.toFixed(2)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-300 mb-3">
                    <div>
                      <span className="text-gray-400">Visitas:</span> {client.visits}
                    </div>
                    <div>
                      <span className="text-gray-400">Última:</span> {client.lastVisit ? client.lastVisit.toLocaleDateString('pt-BR') : 'N/A'}
                    </div>
                  </div>
                  <div className="mb-3 text-xs text-gray-300">
                    <span className="text-gray-400">Favorito:</span> {client.favoriteService}
                  </div>
                  <div className="flex gap-2">
                    <button className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-500 flex-1">
                      Ver Histórico
                    </button>
                    <button className="bg-yellow-600 text-white px-3 py-1 rounded text-xs hover:bg-yellow-500 flex-1">
                      Contatar
                    </button>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">
            Nenhum cliente ainda. Faça alguns agendamentos para ver os clientes!
          </p>
        )}
      </div>
    </div>
  );
};

// Analytics Avançados
const AdminAnalytics = ({ bookings }) => {
  // Limpar dados de agendamentos antes de processar
  const cleanedBookings = useMemo(() => {
    return cleanBookingsData(bookings);
  }, [bookings]);
  
  const analytics = useMemo(() => {
    // ✅ CORREÇÃO: Filtrar apenas agendamentos adicionados ao dashboard (pagos E concluídos)
    const dashboardBookings = cleanedBookings.filter(b => b.addedToDashboard === true);
    
    // Horários de pico por hora
    const hourlyStats = {};
    const dailyStats = {};
    const ratings = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    
    dashboardBookings.forEach(booking => {
      const date = new Date(booking.startTime);
      const hour = date.getHours();
      const day = date.getDay();
      
      // Contar por hora
      hourlyStats[hour] = (hourlyStats[hour] || 0) + 1;
      
      // Contar por dia da semana
      dailyStats[day] = (dailyStats[day] || 0) + 1;
      
      // Contar avaliações
      if (booking.rating) {
        ratings[booking.rating] = (ratings[booking.rating] || 0) + 1;
      }
    });
    
    // Calcular metas mensais
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyBookings = dashboardBookings.filter(b => new Date(b.startTime) >= startOfMonth);
    const monthlyRevenue = monthlyBookings.reduce((acc, b) => acc + (b.price || 0), 0);
    const monthlyClients = new Set(monthlyBookings.map(b => b.clientName)).size;
    const monthlyRating = monthlyBookings.reduce((acc, b) => acc + (b.rating || 0), 0) / monthlyBookings.length || 0;
    
    return {
      hourlyStats,
      dailyStats,
      ratings,
      monthlyRevenue,
      monthlyClients,
      monthlyRating,
      totalMonthlyBookings: monthlyBookings.length
    };
  }, [cleanedBookings]);

  // dayNames removido - não utilizado
  return (
    <div className="animate-fade-in space-y-4 sm:space-y-6 p-4 sm:p-6">
      <h2 className="text-2xl sm:text-3xl font-bold text-white">Analytics Avançados</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Horários de Pico */}
        <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-xl">
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Horários de Pico</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">09:00 - 10:00</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-700 rounded-full h-2 mr-3">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{width: '75%'}}></div>
                </div>
                <span className="text-white">75%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">14:00 - 15:00</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-700 rounded-full h-2 mr-3">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{width: '90%'}}></div>
                </div>
                <span className="text-white">90%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">16:00 - 17:00</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-700 rounded-full h-2 mr-3">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{width: '60%'}}></div>
                </div>
                <span className="text-white">60%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Satisfação dos Clientes */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
          <h3 className="text-xl font-semibold text-white mb-4">Satisfação dos Clientes</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">5 estrelas</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-700 rounded-full h-2 mr-3">
                  <div className="bg-green-500 h-2 rounded-full" style={{width: '80%'}}></div>
                </div>
                <span className="text-white">80%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">4 estrelas</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-700 rounded-full h-2 mr-3">
                  <div className="bg-blue-500 h-2 rounded-full" style={{width: '15%'}}></div>
                </div>
                <span className="text-white">15%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">3 estrelas</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-700 rounded-full h-2 mr-3">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{width: '5%'}}></div>
                </div>
                <span className="text-white">5%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metas e Objetivos */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
        <h3 className="text-xl font-semibold text-white mb-4">Metas do Mês</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <Target className="h-5 w-5 text-yellow-500 mr-2" />
              <span className="text-white font-semibold">Receita Mensal</span>
            </div>
            <p className="text-2xl font-bold text-green-400">R$ {analytics.monthlyRevenue.toFixed(2)}</p>
            <p className="text-sm text-gray-400">Meta: R$ 5.000</p>
            <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
              <div className="bg-green-500 h-2 rounded-full" style={{width: `${Math.min((analytics.monthlyRevenue / 5000) * 100, 100)}%`}}></div>
            </div>
          </div>
          
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <Users className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-white font-semibold">Novos Clientes</span>
            </div>
            <p className="text-2xl font-bold text-blue-400">{analytics.monthlyClients}</p>
            <p className="text-sm text-gray-400">Meta: 100</p>
            <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{width: `${Math.min((analytics.monthlyClients / 100) * 100, 100)}%`}}></div>
            </div>
          </div>
          
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <Star className="h-5 w-5 text-yellow-500 mr-2" />
              <span className="text-white font-semibold">Avaliação Média</span>
            </div>
            <p className="text-2xl font-bold text-yellow-400">{analytics.monthlyRating.toFixed(1)}</p>
            <p className="text-sm text-gray-400">Meta: 5.0</p>
            <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
              <div className="bg-yellow-500 h-2 rounded-full" style={{width: `${(analytics.monthlyRating / 5) * 100}%`}}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Configurações Admin
const AdminSettings = ({ onDeleteAllData, services, schedules, barbers, onAddService, onUpdateService, onDeleteService, onAddSchedule, onUpdateSchedule, onDeleteSchedule, onAddBarber, onUpdateBarber, onDeleteBarber }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState('');
  const [deleteMessage, setDeleteMessage] = useState('');
  
  // Estados para formulários de serviços
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    price: '',
    duration: '',
    description: ''
  });
  
  // Estados para formulários de horários
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({
    barberName: '',
    dayOfWeek: '',
    startTime: '',
    endTime: '',
    isActive: true
  });
  
  // Estados para formulários de barbeiros
  const [showBarberForm, setShowBarberForm] = useState(false);
  const [editingBarber, setEditingBarber] = useState(null);
  const [barberForm, setBarberForm] = useState({
    name: '',
    specialties: [],
    experience: '',
    rating: 5.0,
    phone: '',
    email: '',
    isActive: true
  });

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    setDeleteProgress('Preparando exclusão...');
    
    try {
      await onDeleteAllData(
        (progress) => setDeleteProgress(progress),
        (success) => {
          setDeleteMessage(success);
          setShowDeleteModal(false);
          setIsDeleting(false);
          setDeleteProgress('');
        },
        (error) => {
          setDeleteMessage(error);
          setShowDeleteModal(false);
          setIsDeleting(false);
          setDeleteProgress('');
        }
      );
    } catch (error) {
      setDeleteMessage(`Erro inesperado: ${error.message}`);
      setShowDeleteModal(false);
      setIsDeleting(false);
      setDeleteProgress('');
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setIsDeleting(false);
    setDeleteProgress('');
  };

  // Funções para gerenciar serviços
  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    
    if (editingService) {
      await onUpdateService(editingService.id, serviceForm);
    } else {
      await onAddService(serviceForm);
    }
    
    // Limpar formulário
    setServiceForm({ name: '', price: '', duration: '', description: '' });
    setEditingService(null);
    setShowServiceForm(false);
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setServiceForm({
      name: service.name,
      price: service.price.toString(),
      duration: service.duration.toString(),
      description: service.description || ''
    });
    setShowServiceForm(true);
  };

  const handleDeleteService = async (service) => {
    if (window.confirm(`Tem certeza que deseja excluir o serviço "${service.name}"?`)) {
      await onDeleteService(service.id, service.name);
    }
  };

  // Funções para gerenciar horários
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    
    if (editingSchedule) {
      await onUpdateSchedule(editingSchedule.id, scheduleForm);
    } else {
      await onAddSchedule(scheduleForm);
    }
    
    // Limpar formulário
    setScheduleForm({ barberName: '', dayOfWeek: '', startTime: '', endTime: '', isActive: true });
    setEditingSchedule(null);
    setShowScheduleForm(false);
  };

  const handleEditSchedule = (schedule) => {
    setEditingSchedule(schedule);
    setScheduleForm({
      barberName: schedule.barberName,
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      isActive: schedule.isActive
    });
    setShowScheduleForm(true);
  };

  const handleDeleteSchedule = async (schedule) => {
    if (window.confirm(`Tem certeza que deseja excluir o horário de ${schedule.barberName}?`)) {
      await onDeleteSchedule(schedule.id, schedule.barberName);
    }
  };

  // Funções para gerenciar barbeiros
  const handleBarberSubmit = async (e) => {
    e.preventDefault();
    
    if (editingBarber) {
      await onUpdateBarber(editingBarber.id, barberForm);
    } else {
      await onAddBarber(barberForm);
    }
    
    // Limpar formulário
    setBarberForm({ name: '', specialties: [], experience: '', rating: 5.0, phone: '', email: '', isActive: true });
    setEditingBarber(null);
    setShowBarberForm(false);
  };

  const handleEditBarber = (barber) => {
    setEditingBarber(barber);
    setBarberForm({
      name: barber.name,
      specialties: barber.specialties || [],
      experience: barber.experience || '',
      rating: barber.rating || 5.0,
      phone: barber.phone || '',
      email: barber.email || '',
      isActive: barber.isActive !== undefined ? barber.isActive : true
    });
    setShowBarberForm(true);
  };

  const handleDeleteBarber = async (barber) => {
    if (window.confirm(`Tem certeza que deseja excluir o barbeiro "${barber.name}"? Todos os horários relacionados também serão excluídos.`)) {
      await onDeleteBarber(barber.id, barber.name);
    }
  };

  return (
    <div className="animate-fade-in space-y-4 sm:space-y-6 p-4 sm:p-6">
      <h2 className="text-2xl sm:text-3xl font-bold text-white">Configurações</h2>
      
      {/* Mensagem de feedback */}
      {deleteMessage && (
        <div className={`p-4 rounded-lg ${deleteMessage.includes('sucesso') ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
          {deleteMessage}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Configurações de Horários */}
        <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-xl">
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Horários de Funcionamento</h3>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">Horário de Abertura</label>
              <input
                type="time"
                defaultValue="09:00"
                className="w-full bg-gray-700 text-white border-gray-600 rounded-lg p-2 sm:p-3 focus:ring-yellow-500 focus:border-yellow-500 text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">Horário de Fechamento</label>
              <input
                type="time"
                defaultValue="18:00"
                className="w-full bg-gray-700 text-white border-gray-600 rounded-lg p-2 sm:p-3 focus:ring-yellow-500 focus:border-yellow-500 text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">Início do Almoço</label>
              <input
                type="time"
                defaultValue="12:00"
                className="w-full bg-gray-700 text-white border-gray-600 rounded-lg p-3 focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Fim do Almoço</label>
              <input
                type="time"
                defaultValue="13:00"
                className="w-full bg-gray-700 text-white border-gray-600 rounded-lg p-3 focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>
            <button className="w-full bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-yellow-400 transition-all">
              Salvar Configurações
            </button>
          </div>
        </div>

        {/* Configurações de Serviços */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
          <h3 className="text-xl font-semibold text-white mb-4">Gerenciar Serviços</h3>
          <div className="space-y-3">
            {services.length > 0 ? (
              services.map(service => (
                <div key={service.id} className="bg-gray-700 p-3 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="text-white font-semibold">{service.name}</p>
                    <p className="text-sm text-gray-400">{service.duration} min - R$ {service.price.toFixed(2)}</p>
                    {service.description && (
                      <p className="text-gray-500 text-xs">{service.description}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleEditService(service)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-500"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDeleteService(service)}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-500"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">Nenhum serviço cadastrado</p>
            )}
          </div>
          <button 
            onClick={() => setShowServiceForm(true)}
            className="w-full mt-4 bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-500 transition-all"
          >
            Adicionar Novo Serviço
          </button>
        </div>
      </div>

      {/* Configurações de Horários */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
        <h3 className="text-xl font-semibold text-white mb-4">Gerenciar Horários dos Barbeiros</h3>
        <div className="space-y-3">
          {schedules.length > 0 ? (
            schedules.map(schedule => (
              <div key={schedule.id} className="bg-gray-700 p-3 rounded-lg flex justify-between items-center">
                <div>
                  <p className="text-white font-semibold">{schedule.barberName}</p>
                  <p className="text-sm text-gray-400">
                    {['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][schedule.dayOfWeek]} - 
                    {schedule.startTime} às {schedule.endTime}
                  </p>
                  <p className={`text-xs ${schedule.isActive ? 'text-green-400' : 'text-red-400'}`}>
                    {schedule.isActive ? 'Ativo' : 'Inativo'}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEditSchedule(schedule)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-500"
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => handleDeleteSchedule(schedule)}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-500"
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center py-4">Nenhum horário cadastrado</p>
          )}
        </div>
        <button 
          onClick={() => setShowScheduleForm(true)}
          className="w-full mt-4 bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-500 transition-all"
        >
          Adicionar Novo Horário
        </button>
      </div>

      {/* Configurações de Barbeiros */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
        <h3 className="text-xl font-semibold text-white mb-4">Gerenciar Barbeiros</h3>
        <div className="space-y-3">
          {barbers.length > 0 ? (
            barbers.map(barber => (
              <div key={barber.id} className="bg-gray-700 p-3 rounded-lg flex justify-between items-center">
                <div>
                  <p className="text-white font-semibold">{barber.name}</p>
                  <p className="text-sm text-gray-400">
                    {barber.specialties && barber.specialties.length > 0 ? barber.specialties.join(', ') : 'Barbeiro'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {barber.experience || 'Experiência profissional'} - ⭐ {barber.rating.toFixed(1)}
                  </p>
                  <p className={`text-xs ${barber.isActive ? 'text-green-400' : 'text-red-400'}`}>
                    {barber.isActive ? 'Ativo' : 'Inativo'}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEditBarber(barber)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-500"
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => handleDeleteBarber(barber)}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-500"
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center py-4">Nenhum barbeiro cadastrado</p>
          )}
        </div>
        <button 
          onClick={() => setShowBarberForm(true)}
          className="w-full mt-4 bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-500 transition-all"
        >
          Adicionar Novo Barbeiro
        </button>
      </div>

      {/* Configurações de Notificações */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
        <h3 className="text-xl font-semibold text-white mb-4">Notificações</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-semibold">Lembretes de Agendamento</p>
              <p className="text-sm text-gray-400">Enviar lembretes 24h antes do agendamento</p>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-semibold">Confirmação por WhatsApp</p>
              <p className="text-sm text-gray-400">Enviar confirmação via WhatsApp</p>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-semibold">Feedback Pós-Serviço</p>
              <p className="text-sm text-gray-400">Solicitar avaliação após o serviço</p>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5 text-yellow-500" />
          </div>
        </div>
      </div>
      
      {/* Seção de Exclusão de Dados */}
      <div className="bg-red-900 border border-red-500 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <AlertCircle className="h-6 w-6 text-red-400 mr-3" />
          <h3 className="text-lg font-semibold text-red-200">Zona de Perigo</h3>
        </div>
        
        <p className="text-red-300 mb-4">
          Esta seção contém ações que podem afetar permanentemente os dados do sistema. 
          Use com extrema cautela.
        </p>
        
        <div className="bg-red-800 rounded-lg p-4">
          <h4 className="text-red-200 font-semibold mb-2">Excluir Todos os Dados</h4>
          <p className="text-red-300 text-sm mb-4">
            Remove permanentemente todos os agendamentos, clientes, serviços e configurações do sistema. 
            Esta ação não pode ser desfeita.
          </p>
          
          <button
            onClick={handleDeleteClick}
            disabled={isDeleting}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            {isDeleting ? 'Excluindo...' : 'Excluir Todos os Dados'}
          </button>
        </div>
      </div>
      
      {/* Modal de Confirmação */}
      <DeleteDataModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        progressMessage={deleteProgress}
      />
      
      {/* Modal de Formulário de Serviço */}
      {showServiceForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                {editingService ? 'Editar Serviço' : 'Adicionar Novo Serviço'}
              </h3>
              
              <form onSubmit={handleServiceSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nome do Serviço</label>
                  <input
                    type="text"
                    value={serviceForm.name}
                    onChange={(e) => setServiceForm({...serviceForm, name: e.target.value})}
                    className="w-full bg-gray-700 text-white border-gray-600 rounded-lg p-3 focus:ring-yellow-500 focus:border-yellow-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Preço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm({...serviceForm, price: e.target.value})}
                    className="w-full bg-gray-700 text-white border-gray-600 rounded-lg p-3 focus:ring-yellow-500 focus:border-yellow-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Duração (minutos)</label>
                  <input
                    type="number"
                    value={serviceForm.duration}
                    onChange={(e) => setServiceForm({...serviceForm, duration: e.target.value})}
                    className="w-full bg-gray-700 text-white border-gray-600 rounded-lg p-3 focus:ring-yellow-500 focus:border-yellow-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Descrição (opcional)</label>
                  <textarea
                    value={serviceForm.description}
                    onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})}
                    className="w-full bg-gray-700 text-white border-gray-600 rounded-lg p-3 focus:ring-yellow-500 focus:border-yellow-500"
                    rows="3"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowServiceForm(false);
                      setEditingService(null);
                      setServiceForm({ name: '', price: '', duration: '', description: '' });
                    }}
                    className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-yellow-500 text-gray-900 font-bold px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors"
                  >
                    {editingService ? 'Atualizar' : 'Adicionar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de Formulário de Horário */}
      {showScheduleForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                {editingSchedule ? 'Editar Horário' : 'Adicionar Novo Horário'}
              </h3>
              
              <form onSubmit={handleScheduleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Barbeiro</label>
                  <select
                    value={scheduleForm.barberName}
                    onChange={(e) => setScheduleForm({...scheduleForm, barberName: e.target.value})}
                    className="w-full bg-gray-700 text-white border-gray-600 rounded-lg p-3 focus:ring-yellow-500 focus:border-yellow-500"
                    required
                  >
                    <option value="">Selecione um barbeiro</option>
                    {BARBERS.map(barber => (
                      <option key={barber.id} value={barber.name}>{barber.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Dia da Semana</label>
                  <select
                    value={scheduleForm.dayOfWeek}
                    onChange={(e) => setScheduleForm({...scheduleForm, dayOfWeek: parseInt(e.target.value)})}
                    className="w-full bg-gray-700 text-white border-gray-600 rounded-lg p-3 focus:ring-yellow-500 focus:border-yellow-500"
                    required
                  >
                    <option value="">Selecione um dia</option>
                    {['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].map((day, index) => (
                      <option key={index} value={index}>{day}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Horário de Início</label>
                  <input
                    type="time"
                    value={scheduleForm.startTime}
                    onChange={(e) => setScheduleForm({...scheduleForm, startTime: e.target.value})}
                    className="w-full bg-gray-700 text-white border-gray-600 rounded-lg p-3 focus:ring-yellow-500 focus:border-yellow-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Horário de Fim</label>
                  <input
                    type="time"
                    value={scheduleForm.endTime}
                    onChange={(e) => setScheduleForm({...scheduleForm, endTime: e.target.value})}
                    className="w-full bg-gray-700 text-white border-gray-600 rounded-lg p-3 focus:ring-yellow-500 focus:border-yellow-500"
                    required
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={scheduleForm.isActive}
                    onChange={(e) => setScheduleForm({...scheduleForm, isActive: e.target.checked})}
                    className="w-4 h-4 text-yellow-500 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gray-300">
                    Horário ativo
                  </label>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowScheduleForm(false);
                      setEditingSchedule(null);
                      setScheduleForm({ barberName: '', dayOfWeek: '', startTime: '', endTime: '', isActive: true });
                    }}
                    className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-yellow-500 text-gray-900 font-bold px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors"
                  >
                    {editingSchedule ? 'Atualizar' : 'Adicionar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de Formulário de Barbeiro */}
      {showBarberForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                {editingBarber ? 'Editar Barbeiro' : 'Adicionar Novo Barbeiro'}
              </h3>
              
              <form onSubmit={handleBarberSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nome do Barbeiro</label>
                  <input
                    type="text"
                    value={barberForm.name}
                    onChange={(e) => setBarberForm({...barberForm, name: e.target.value})}
                    className="w-full bg-gray-700 text-white border-gray-600 rounded-lg p-3 focus:ring-yellow-500 focus:border-yellow-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Especialidades (separadas por vírgula)</label>
                  <input
                    type="text"
                    value={barberForm.specialties.join(', ')}
                    onChange={(e) => setBarberForm({...barberForm, specialties: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
                    className="w-full bg-gray-700 text-white border-gray-600 rounded-lg p-3 focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="Ex: Corte masculino, Barba, Bigode"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Experiência</label>
                  <input
                    type="text"
                    value={barberForm.experience}
                    onChange={(e) => setBarberForm({...barberForm, experience: e.target.value})}
                    className="w-full bg-gray-700 text-white border-gray-600 rounded-lg p-3 focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="Ex: 5 anos de experiência"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Avaliação (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={barberForm.rating}
                    onChange={(e) => setBarberForm({...barberForm, rating: parseFloat(e.target.value)})}
                    className="w-full bg-gray-700 text-white border-gray-600 rounded-lg p-3 focus:ring-yellow-500 focus:border-yellow-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Telefone (opcional)</label>
                  <input
                    type="tel"
                    value={barberForm.phone}
                    onChange={(e) => setBarberForm({...barberForm, phone: e.target.value})}
                    className="w-full bg-gray-700 text-white border-gray-600 rounded-lg p-3 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email (opcional)</label>
                  <input
                    type="email"
                    value={barberForm.email}
                    onChange={(e) => setBarberForm({...barberForm, email: e.target.value})}
                    className="w-full bg-gray-700 text-white border-gray-600 rounded-lg p-3 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="barberIsActive"
                    checked={barberForm.isActive}
                    onChange={(e) => setBarberForm({...barberForm, isActive: e.target.checked})}
                    className="w-4 h-4 text-yellow-500 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500"
                  />
                  <label htmlFor="barberIsActive" className="ml-2 text-sm text-gray-300">
                    Barbeiro ativo
                  </label>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowBarberForm(false);
                      setEditingBarber(null);
                      setBarberForm({ name: '', specialties: [], experience: '', rating: 5.0, phone: '', email: '', isActive: true });
                    }}
                    className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-yellow-500 text-gray-900 font-bold px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors"
                  >
                    {editingBarber ? 'Atualizar' : 'Adicionar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente de Prompt de Instalação PWA
const InstallPrompt = ({ onInstall, onClose, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-yellow-500 text-gray-900 p-4 rounded-lg shadow-xl z-50 animate-fade-in-down">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Scissors className="h-6 w-6 mr-3" />
          <div>
            <h3 className="font-bold text-sm">Instalar BarbeariaApp</h3>
            <p className="text-xs opacity-80">Adicione à tela inicial para acesso rápido</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onInstall}
            className="bg-gray-900 text-yellow-500 px-3 py-1 rounded text-sm font-semibold hover:bg-gray-800 transition-colors"
          >
            Instalar
          </button>
          <button
            onClick={onClose}
            className="text-gray-900 hover:opacity-70 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente de Instruções de Instalação
const InstallInstructions = ({ onClose, isVisible }) => {
  if (!isVisible) return null;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Scissors className="h-8 w-8 text-yellow-500 mr-3" />
              <h3 className="text-xl font-bold text-white">Instalar App</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4">
            <p className="text-gray-300 text-sm">
              Instale o BarbeariaApp na tela inicial do seu dispositivo para acesso rápido e melhor experiência.
            </p>

            {isIOS ? (
              <div className="space-y-3">
                <h4 className="text-white font-semibold">📱 iPhone/iPad:</h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-start">
                    <span className="bg-yellow-500 text-gray-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</span>
                    <span>Toque no botão <span className="bg-gray-700 px-2 py-1 rounded text-yellow-400">Compartilhar</span> na parte inferior da tela</span>
                  </div>
                  <div className="flex items-start">
                    <span className="bg-yellow-500 text-gray-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</span>
                    <span>Role para baixo e toque em <span className="bg-gray-700 px-2 py-1 rounded text-yellow-400">"Adicionar à Tela Inicial"</span></span>
                  </div>
                  <div className="flex items-start">
                    <span className="bg-yellow-500 text-gray-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</span>
                    <span>Toque em <span className="bg-gray-700 px-2 py-1 rounded text-yellow-400">"Adicionar"</span> para confirmar</span>
                  </div>
                </div>
              </div>
            ) : isAndroid ? (
              <div className="space-y-3">
                <h4 className="text-white font-semibold">🤖 Android:</h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-start">
                    <span className="bg-yellow-500 text-gray-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</span>
                    <span>Toque no menu <span className="bg-gray-700 px-2 py-1 rounded text-yellow-400">⋮</span> no navegador</span>
                  </div>
                  <div className="flex items-start">
                    <span className="bg-yellow-500 text-gray-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</span>
                    <span>Selecione <span className="bg-gray-700 px-2 py-1 rounded text-yellow-400">"Adicionar à tela inicial"</span></span>
                  </div>
                  <div className="flex items-start">
                    <span className="bg-yellow-500 text-gray-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</span>
                    <span>Toque em <span className="bg-gray-700 px-2 py-1 rounded text-yellow-400">"Adicionar"</span> para confirmar</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <h4 className="text-white font-semibold">💻 Desktop:</h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-start">
                    <span className="bg-yellow-500 text-gray-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</span>
                    <span>Procure pelo ícone de instalação <span className="bg-gray-700 px-2 py-1 rounded text-yellow-400">⬇️</span> na barra de endereços</span>
                  </div>
                  <div className="flex items-start">
                    <span className="bg-yellow-500 text-gray-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</span>
                    <span>Clique em <span className="bg-gray-700 px-2 py-1 rounded text-yellow-400">"Instalar"</span> quando aparecer</span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-blue-900 bg-opacity-50 border border-blue-500 rounded-lg p-3">
              <p className="text-blue-200 text-xs">
                💡 <strong>Dica:</strong> Após a instalação, o app aparecerá na tela inicial como um aplicativo nativo!
              </p>
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-colors"
            >
              Entendi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ========================================
// COMPONENTES PWA - INSTALAÇÃO
// ========================================

// Banner de Instalação para Android
const InstallBannerAndroid = ({ onInstall, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  
  if (!isVisible) return null;
  
  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };
  
  const handleInstall = () => {
    setIsVisible(false);
    if (onInstall) onInstall();
  };
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-slide-down">
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between flex-wrap">
            <div className="flex items-center flex-1">
              <span className="flex p-2 rounded-lg bg-teal-800">
                <Scissors className="h-6 w-6 text-white" />
              </span>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-white">
                  Instale nosso app!
                </p>
                <p className="text-xs text-teal-100 hidden sm:block">
                  Acesso rápido, notificações e funciona offline
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <button
                onClick={handleInstall}
                className="bg-white text-teal-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-teal-50 transition-colors shadow-md"
              >
                Instalar Agora
              </button>
              <button
                onClick={handleClose}
                className="text-white hover:text-teal-100 p-2 transition-colors"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal de Instruções para iOS
const InstallModalIOS = ({ onClose }) => {
  const [showModal, setShowModal] = useState(true);
  
  const handleClose = () => {
    setShowModal(false);
    if (onClose) onClose();
  };
  
  const handleDontShowAgain = () => {
    localStorage.setItem('ios-install-dismissed', 'true');
    handleClose();
  };
  
  if (!showModal) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scale-in">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-center mb-4">
            <div className="bg-teal-100 p-3 rounded-full">
              <Scissors className="h-8 w-8 text-teal-600" />
            </div>
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Instale Nosso App
          </h3>
          
          <p className="text-gray-600 text-center mb-6">
            Para uma melhor experiência, adicione à sua tela inicial
          </p>
          
          {/* Instruções */}
          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="bg-teal-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                1
              </div>
              <div className="flex-1">
                <p className="text-gray-700">
                  Toque no botão <span className="font-semibold">"Compartilhar"</span> 
                  <span className="inline-block ml-1 text-blue-600">⬆️</span> na barra inferior
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-teal-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                2
              </div>
              <div className="flex-1">
                <p className="text-gray-700">
                  Role para baixo e selecione{' '}
                  <span className="font-semibold">"Adicionar à Tela Inicial"</span>
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-teal-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                3
              </div>
              <div className="flex-1">
                <p className="text-gray-700">
                  Toque em <span className="font-semibold">"Adicionar"</span> para instalar
                </p>
              </div>
            </div>
          </div>
          
          {/* Botões */}
          <div className="flex flex-col gap-2">
            <button
              onClick={handleClose}
              className="w-full bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
            >
              Entendi
            </button>
            <button
              onClick={handleDontShowAgain}
              className="w-full text-gray-600 px-6 py-2 rounded-lg text-sm hover:bg-gray-100 transition-colors"
            >
              Não mostrar novamente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Componente Principal (App) ---
export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [userId, setUserId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Solicitar permissão para notificações de forma profissional
  useEffect(() => {
    // Aguardar 3 segundos após o carregamento para solicitar permissão
    const timer = setTimeout(async () => {
      const granted = await requestNotificationPermission();
      if (granted) {
        console.log('✅ Permissão de notificação concedida');
      } else {
        console.log('⚠️ Permissão de notificação não concedida');
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  // Firebase Authentication - Garantir login anônimo antes de qualquer acesso ao Firestore
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log("🚀 Inicializando autenticação Firebase...");
        
        // Aguardar estado de autenticação
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
            setUserId(user.uid);
            setAuthError(null);
            console.log("✅ Usuário autenticado:", user.uid);
            setIsLoading(false);
      } else {
            console.log("🔐 Realizando login anônimo...");
            try {
              const result = await signInAnonymously(auth);
              setUserId(result.user.uid);
              setAuthError(null);
              console.log("✅ Login anônimo realizado:", result.user.uid);
            } catch (authError) {
              console.error("❌ Erro no login anônimo:", authError);
              setAuthError("Falha na autenticação. Verifique sua conexão com a internet.");
              setError("Erro ao conectar com o servidor de autenticação");
            }
            setIsLoading(false);
          }
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("❌ Erro na inicialização da autenticação:", error);
        setAuthError("Erro crítico na inicialização do Firebase");
        setError("Erro ao inicializar o sistema");
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Error boundary para capturar erros
  useEffect(() => {
    const handleError = (error) => {
      console.error('Erro capturado:', error);
      setError(error.message);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Promise rejeitada:', event.reason);
      setError(event.reason?.message || 'Erro desconhecido');
    });

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, []);

  const [bookings, setBookings] = useState([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [, setBookingHistory] = useState([]);
  const [, setIsLoadingHistory] = useState(false);
  
  const [adminNotifications, setAdminNotifications] = useState([]);
  const [showAdminNotifications, setShowAdminNotifications] = useState(false);
  const [adminUnreadNotifications, setAdminUnreadNotifications] = useState(0);
  
  const [clientNotifications, setClientNotifications] = useState([]);
  const [showClientNotifications, setShowClientNotifications] = useState(false);
  const [clientUnreadNotifications, setClientUnreadNotifications] = useState(0);
  const previousBookingStatusesRef = useRef({});
  
  // Estados para serviços, horários e barbeiros
  const [services, setServices] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [, setIsLoadingServices] = useState(false);
  const [, setIsLoadingSchedules] = useState(false);
  const [, setIsLoadingBarbers] = useState(false);
  
  // Estados para PWA
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  // Carregar dados do Firebase - Só executa após autenticação bem-sucedida
  useEffect(() => {
    if (!userId || authError) return;

    const loadFirestoreData = async () => {
      try {
        console.log("🚀 Carregando dados do Firestore para usuário:", userId);
    setIsLoadingBookings(true);
        setIsLoadingHistory(true);

        // Aguardar autenticação estar pronta
        await waitForAuth();

        // Usar caminho correto para coleção de agendamentos
        const bookingsPath = getCollectionPath(COLLECTIONS.BOOKINGS);
        const bookingsRef = collection(db, bookingsPath);
        const q = query(bookingsRef, orderBy('startTime', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
          const rawBookingsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            startTime: doc.data().startTime?.toDate() || new Date(doc.data().startTime),
            endTime: doc.data().endTime?.toDate() || new Date(doc.data().endTime),
            date: doc.data().date?.toDate() || new Date(doc.data().date)
          }));
          
          // Limpar dados e remover duplicatas
          const cleanedBookingsData = cleanBookingsData(rawBookingsData);
          
          // Verificar se houve duplicatas e mostrar aviso
          if (rawBookingsData.length !== cleanedBookingsData.length) {
            const duplicatesCount = rawBookingsData.length - cleanedBookingsData.length;
            console.warn(`⚠️ ${duplicatesCount} agendamentos duplicados foram removidos`);
            
            // Adicionar notificação de aviso sobre duplicatas
            setAdminNotifications(prev => [...prev, {
              id: generateId(),
              type: 'warning',
              message: `${duplicatesCount} agendamentos duplicados foram removidos automaticamente`,
              timestamp: new Date(),
              read: false
            }]);
          }
          
          setBookings(cleanedBookingsData);
          setBookingHistory(cleanedBookingsData);
      setIsLoadingBookings(false);
          setIsLoadingHistory(false);
          console.log("✅ Dados carregados e limpos do Firestore:", cleanedBookingsData.length, "agendamentos");
    }, (error) => {
          console.error("❌ Erro ao carregar dados do Firestore:", error);
          setError(`Erro ao carregar dados: ${error.message}`);
      setIsLoadingBookings(false);
          setIsLoadingHistory(false);
    });

    return () => unsubscribe();
      } catch (error) {
        console.error("❌ Erro na inicialização do Firestore:", error);
        setError(`Erro na conexão com o banco de dados: ${error.message}`);
        setIsLoadingBookings(false);
        setIsLoadingHistory(false);
      }
    };

    const loadServices = async () => {
      try {
        setIsLoadingServices(true);
        const servicesPath = getCollectionPath(COLLECTIONS.SERVICES);
        const servicesRef = collection(db, servicesPath);
        const q = query(servicesRef, orderBy('name', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const servicesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          setServices(servicesData);
          setIsLoadingServices(false);
          console.log("✅ Serviços carregados do Firestore:", servicesData.length, "serviços");
        }, (error) => {
          console.error("❌ Erro ao carregar serviços:", error);
          setIsLoadingServices(false);
        });
        
        return () => unsubscribe();
      } catch (error) {
        console.error("❌ Erro ao carregar serviços:", error);
        setIsLoadingServices(false);
      }
    };

    const loadSchedules = async () => {
      try {
        setIsLoadingSchedules(true);
        const schedulesPath = getCollectionPath(COLLECTIONS.SCHEDULES);
        const schedulesRef = collection(db, schedulesPath);
        const q = query(schedulesRef, orderBy('barberName', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const schedulesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          setSchedules(schedulesData);
          setIsLoadingSchedules(false);
          console.log("✅ Horários carregados do Firestore:", schedulesData.length, "horários");
        }, (error) => {
          console.error("❌ Erro ao carregar horários:", error);
          setIsLoadingSchedules(false);
        });
        
        return () => unsubscribe();
      } catch (error) {
        console.error("❌ Erro ao carregar horários:", error);
        setIsLoadingSchedules(false);
      }
    };

    const loadBarbers = async () => {
      try {
        setIsLoadingBarbers(true);
        const barbersPath = getCollectionPath(COLLECTIONS.BARBERS);
        const barbersRef = collection(db, barbersPath);
        const q = query(barbersRef, orderBy('name', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const barbersData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          setBarbers(barbersData);
          setIsLoadingBarbers(false);
          console.log("✅ Barbeiros carregados do Firestore:", barbersData.length, "barbeiros");
        }, (error) => {
          console.error("❌ Erro ao carregar barbeiros:", error);
          setIsLoadingBarbers(false);
        });
        
        return () => unsubscribe();
      } catch (error) {
        console.error("❌ Erro ao carregar barbeiros:", error);
        setIsLoadingBarbers(false);
      }
    };

    loadFirestoreData();
    loadServices();
    loadSchedules();
    loadBarbers();
  }, [userId, authError]);

  // ========================================
  // PWA INSTALLATION MANAGEMENT - PROFISSIONAL
  // ========================================
  
  // Estados adicionais para PWA
  const [showAndroidBanner, setShowAndroidBanner] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  
  useEffect(() => {
    // Verificar se já está instalado
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches || 
          window.navigator.standalone === true) {
        setIsInstalled(true);
        return true;
      }
      return false;
    };

    // Detectar plataforma
    const isIOS = () => {
      const ua = window.navigator.userAgent;
      const isIPad = /iPad/.test(ua);
      const isIPhone = /iPhone/.test(ua);
      return isIPad || isIPhone;
    };

    const isAndroid = () => {
      const ua = window.navigator.userAgent;
      return /Android/.test(ua);
    };

    // Verificar se o usuário já dispensou
    const androidDismissed = localStorage.getItem('android-banner-dismissed');
    const iosDismissed = localStorage.getItem('ios-install-dismissed');
    
    // Se já está instalado, não mostrar nada
    if (checkIfInstalled()) {
      console.log('✅ PWA já instalado');
      return;
    }

    // ANDROID: Listener para o evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      console.log('📱 Evento beforeinstallprompt capturado (Android)');
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Mostrar banner apenas se não foi dispensado nos últimos 7 dias
      if (!androidDismissed || Date.now() - parseInt(androidDismissed) > 7 * 24 * 60 * 60 * 1000) {
        setShowAndroidBanner(true);
      }
    };

    // Listener para o evento appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowAndroidBanner(false);
      setShowIOSModal(false);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      console.log('✅ PWA instalado com sucesso!');
      
      // Limpar flags de dismissal
      localStorage.removeItem('android-banner-dismissed');
      localStorage.removeItem('ios-install-dismissed');
    };

    // IOS: Mostrar modal de instruções
    if (isIOS() && !iosDismissed) {
      console.log('📱 Dispositivo iOS detectado');
      // Mostrar após 5 segundos de navegação
      const timer = setTimeout(() => {
        setShowIOSModal(true);
      }, 5000);
      
      return () => clearTimeout(timer);
    }

    // ANDROID: Adicionar listeners
    if (isAndroid()) {
      console.log('📱 Dispositivo Android detectado');
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    }
  }, []);

  // Sistema de notificações em tempo real
  useEffect(() => {
    if (!userId || authError || !isAdmin) {
      return;
    }

    let unsubscribe = null;

    const setupNotifications = async () => {
      try {
        await waitForAuth();

        const bookingsPath = getCollectionPath(COLLECTIONS.BOOKINGS);
        const bookingsRef = collection(db, bookingsPath);
        const q = query(bookingsRef, orderBy('createdAt', 'desc'));

        unsubscribe = onSnapshot(q, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const newBooking = change.doc.data();
              const bookingId = change.doc.id;

              const notification = {
                id: generateId(),
                type: 'booking',
                message: `Novo agendamento: ${newBooking.clientName}`,
                details: {
                  service: newBooking.serviceName,
                  barber: newBooking.barberName,
                  date: newBooking.date?.toDate ? newBooking.date.toDate() : new Date(newBooking.date),
                  time: newBooking.startTime?.toDate ? newBooking.startTime.toDate() : new Date(newBooking.startTime),
                  price: newBooking.price,
                  bookingId
                },
                timestamp: new Date(),
                read: false
              };

              setAdminNotifications(prev => [notification, ...prev]);
              setAdminUnreadNotifications(prev => prev + 1);

              sendNotification('Novo Agendamento', {
                body: `${newBooking.clientName} agendou ${newBooking.serviceName}`,
                icon: '/icons/icon-192x192.svg',
                tag: 'new-booking',
                requireInteraction: true
              });
            }
          });
    }, (error) => {
          console.error('❌ Erro ao escutar notificações:', error);
        });
      } catch (error) {
        console.error('❌ Erro ao configurar notificações:', error);
      }
    };

    setupNotifications();

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [userId, authError, isAdmin]);
  
  // Notificações para clientes - conclusão de agendamento
  useEffect(() => {
    if (!userId || isAdmin) {
      return;
    }

    const prevStatuses = previousBookingStatusesRef.current;
    const userBookings = bookings.filter(booking => booking?.userId === userId);
    const activeBookingIds = new Set();

    userBookings.forEach((booking) => {
      if (!booking?.id) {
        return;
      }

      activeBookingIds.add(booking.id);
      const currentStatus = booking.status;
      const previousStatus = prevStatuses[booking.id]?.status;

      if (!previousStatus) {
        prevStatuses[booking.id] = { status: currentStatus };
        return;
      }

      if (previousStatus !== currentStatus) {
        if (currentStatus === 'completed') {
          let shouldNotify = false;
          const notificationPayload = {
            id: generateId(),
            type: 'booking-completed',
            bookingId: booking.id,
            title: 'Serviço concluído',
            message: `Seu corte com ${booking.barberName || 'nosso barbeiro'} foi concluído com sucesso!`,
            timestamp: new Date(),
            read: false
          };

          setClientNotifications(prev => {
            const alreadyExists = prev.some(
              notif => notif.type === 'booking-completed' && notif.bookingId === booking.id
            );

            if (alreadyExists) {
              return prev;
            }

            shouldNotify = true;
            return [notificationPayload, ...prev];
          });

          if (shouldNotify) {
            setClientUnreadNotifications(prev => prev + 1);
            sendNotification('Serviço concluído', {
              body: `Seu corte com ${booking.barberName || 'nosso barbeiro'} foi finalizado. Obrigado por escolher a Barbearia Navalha Dourada!`,
              icon: '/icons/icon-192x192.svg',
              tag: `booking-completed-${booking.id}`
            });
          }
        }

        prevStatuses[booking.id] = { status: currentStatus };
      }
    });

    Object.keys(prevStatuses).forEach((bookingId) => {
      if (!activeBookingIds.has(bookingId)) {
        delete prevStatuses[bookingId];
      }
    });
  }, [bookings, userId, isAdmin, previousBookingStatusesRef]);

  // Funções de notificações - Admin
  const markAdminNotificationAsRead = (notificationId) => {
    setAdminNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    setAdminUnreadNotifications(prev => Math.max(0, prev - 1));
  };

  const removeAdminNotification = (notificationId) => {
    setAdminNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        setAdminUnreadNotifications(prev => Math.max(0, prev - 1));
      }
      return prev.filter(n => n.id !== notificationId);
    });
  };

  const clearAllAdminNotifications = () => {
    setAdminNotifications([]);
    setAdminUnreadNotifications(0);
  };

  // Funções de notificações - Cliente
  const markClientNotificationAsRead = (notificationId) => {
    setClientNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    setClientUnreadNotifications(prev => Math.max(0, prev - 1));
  };

  const removeClientNotification = (notificationId) => {
    setClientNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        setClientUnreadNotifications(prev => Math.max(0, prev - 1));
      }
      return prev.filter(n => n.id !== notificationId);
    });
  };

  const clearAllClientNotifications = () => {
    setClientNotifications([]);
    setClientUnreadNotifications(0);
  };

  // Função para excluir todos os dados (apenas para administradores)
  const handleDeleteAllData = async (onProgress, onSuccess, onError) => {
    // Verificar se o usuário é administrador
    if (!isAdmin) {
      onError("Acesso negado. Apenas administradores podem excluir dados.");
      return;
    }

    try {
      await deleteAllData(onProgress, onSuccess, onError);
    } catch (error) {
      console.error("❌ Erro na exclusão de dados:", error);
      onError(`Erro inesperado: ${error.message}`);
    }
  };

  // Funções CRUD para Serviços
  const handleAddService = async (serviceData) => {
    try {
      await waitForAuth();
      
      const servicesPath = getCollectionPath(COLLECTIONS.SERVICES);
      const servicesRef = collection(db, servicesPath);
      
      const newService = {
        name: serviceData.name,
        price: parseFloat(serviceData.price),
        duration: parseInt(serviceData.duration),
        description: serviceData.description || '',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await addDoc(servicesRef, newService);
      console.log("✅ Serviço adicionado com sucesso");
      
      // Adicionar notificação de sucesso
      setAdminNotifications(prev => [...prev, {
        id: generateId(),
        type: 'success',
        message: `Serviço "${serviceData.name}" adicionado com sucesso`,
        timestamp: new Date(),
        read: false
      }]);
      
    } catch (error) {
      console.error("❌ Erro ao adicionar serviço:", error);
      setAdminNotifications(prev => [...prev, {
        id: generateId(),
        type: 'error',
        message: `Erro ao adicionar serviço: ${error.message}`,
        timestamp: new Date(),
        read: false
      }]);
    }
  };

  const handleUpdateService = async (serviceId, serviceData) => {
    try {
      await waitForAuth();
      
      const servicesPath = getCollectionPath(COLLECTIONS.SERVICES);
      const serviceRef = doc(db, servicesPath, serviceId);
      
      const updatedService = {
        name: serviceData.name,
        price: parseFloat(serviceData.price),
        duration: parseInt(serviceData.duration),
        description: serviceData.description || '',
        updatedAt: new Date()
      };
      
      await updateDoc(serviceRef, updatedService);
      console.log("✅ Serviço atualizado com sucesso");
      
      // Adicionar notificação de sucesso
      setAdminNotifications(prev => [...prev, {
        id: generateId(),
        type: 'success',
        message: `Serviço "${serviceData.name}" atualizado com sucesso`,
        timestamp: new Date(),
        read: false
      }]);
      
    } catch (error) {
      console.error("❌ Erro ao atualizar serviço:", error);
      setAdminNotifications(prev => [...prev, {
        id: generateId(),
        type: 'error',
        message: `Erro ao atualizar serviço: ${error.message}`,
        timestamp: new Date(),
        read: false
      }]);
    }
  };

  const handleDeleteService = async (serviceId, serviceName) => {
    try {
      await waitForAuth();
      
      const servicesPath = getCollectionPath(COLLECTIONS.SERVICES);
      const serviceRef = doc(db, servicesPath, serviceId);
      
      await deleteDoc(serviceRef);
      console.log("✅ Serviço excluído com sucesso");
      
      // Adicionar notificação de sucesso
      setAdminNotifications(prev => [...prev, {
        id: generateId(),
        type: 'success',
        message: `Serviço "${serviceName}" excluído com sucesso`,
        timestamp: new Date(),
        read: false
      }]);
      
    } catch (error) {
      console.error("❌ Erro ao excluir serviço:", error);
      setAdminNotifications(prev => [...prev, {
        id: generateId(),
        type: 'error',
        message: `Erro ao excluir serviço: ${error.message}`,
        timestamp: new Date(),
        read: false
      }]);
    }
  };

  // Funções CRUD para Horários
  const handleAddSchedule = async (scheduleData) => {
    try {
      await waitForAuth();
      
      const schedulesPath = getCollectionPath(COLLECTIONS.SCHEDULES);
      const schedulesRef = collection(db, schedulesPath);
      
      const newSchedule = {
        barberName: scheduleData.barberName,
        dayOfWeek: scheduleData.dayOfWeek,
        startTime: scheduleData.startTime,
        endTime: scheduleData.endTime,
        isActive: scheduleData.isActive !== undefined ? scheduleData.isActive : true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await addDoc(schedulesRef, newSchedule);
      console.log("✅ Horário adicionado com sucesso");
      
      // Adicionar notificação de sucesso
      setAdminNotifications(prev => [...prev, {
        id: generateId(),
        type: 'success',
        message: `Horário para ${scheduleData.barberName} adicionado com sucesso`,
        timestamp: new Date(),
        read: false
      }]);
      
    } catch (error) {
      console.error("❌ Erro ao adicionar horário:", error);
      setAdminNotifications(prev => [...prev, {
        id: generateId(),
        type: 'error',
        message: `Erro ao adicionar horário: ${error.message}`,
        timestamp: new Date(),
        read: false
      }]);
    }
  };

  const handleUpdateSchedule = async (scheduleId, scheduleData) => {
    try {
      await waitForAuth();
      
      const schedulesPath = getCollectionPath(COLLECTIONS.SCHEDULES);
      const scheduleRef = doc(db, schedulesPath, scheduleId);
      
      const updatedSchedule = {
        barberName: scheduleData.barberName,
        dayOfWeek: scheduleData.dayOfWeek,
        startTime: scheduleData.startTime,
        endTime: scheduleData.endTime,
        isActive: scheduleData.isActive !== undefined ? scheduleData.isActive : true,
        updatedAt: new Date()
      };
      
      await updateDoc(scheduleRef, updatedSchedule);
      console.log("✅ Horário atualizado com sucesso");
      
      // Adicionar notificação de sucesso
      setAdminNotifications(prev => [...prev, {
        id: generateId(),
        type: 'success',
        message: `Horário para ${scheduleData.barberName} atualizado com sucesso`,
        timestamp: new Date(),
        read: false
      }]);
      
    } catch (error) {
      console.error("❌ Erro ao atualizar horário:", error);
      setAdminNotifications(prev => [...prev, {
        id: generateId(),
        type: 'error',
        message: `Erro ao atualizar horário: ${error.message}`,
        timestamp: new Date(),
        read: false
      }]);
    }
  };

  const handleDeleteSchedule = async (scheduleId, barberName) => {
    try {
      await waitForAuth();
      
      const schedulesPath = getCollectionPath(COLLECTIONS.SCHEDULES);
      const scheduleRef = doc(db, schedulesPath, scheduleId);
      
      await deleteDoc(scheduleRef);
      console.log("✅ Horário excluído com sucesso");
      
      // Adicionar notificação de sucesso
      setAdminNotifications(prev => [...prev, {
        id: generateId(),
        type: 'success',
        message: `Horário para ${barberName} excluído com sucesso`,
        timestamp: new Date(),
        read: false
      }]);
      
    } catch (error) {
      console.error("❌ Erro ao excluir horário:", error);
      setAdminNotifications(prev => [...prev, {
        id: generateId(),
        type: 'error',
        message: `Erro ao excluir horário: ${error.message}`,
        timestamp: new Date(),
        read: false
      }]);
    }
  };

  // Funções CRUD para Barbeiros
  const handleAddBarber = async (barberData) => {
    try {
      await waitForAuth();
      
      const barbersPath = getCollectionPath(COLLECTIONS.BARBERS);
      const barbersRef = collection(db, barbersPath);
      
      const newBarber = {
        name: barberData.name,
        specialties: barberData.specialties || [],
        experience: barberData.experience || '',
        rating: barberData.rating || 5.0,
        phone: barberData.phone || '',
        email: barberData.email || '',
        isActive: barberData.isActive !== undefined ? barberData.isActive : true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await addDoc(barbersRef, newBarber);
      console.log("✅ Barbeiro adicionado com sucesso");
      
      // Adicionar notificação de sucesso
      setAdminNotifications(prev => [...prev, {
        id: generateId(),
        type: 'success',
        message: `Barbeiro "${barberData.name}" adicionado com sucesso`,
        timestamp: new Date(),
        read: false
      }]);
      
    } catch (error) {
      console.error("❌ Erro ao adicionar barbeiro:", error);
      setAdminNotifications(prev => [...prev, {
        id: generateId(),
        type: 'error',
        message: `Erro ao adicionar barbeiro: ${error.message}`,
        timestamp: new Date(),
        read: false
      }]);
    }
  };

  const handleUpdateBarber = async (barberId, barberData) => {
    try {
      await waitForAuth();
      
      const barbersPath = getCollectionPath(COLLECTIONS.BARBERS);
      const barberRef = doc(db, barbersPath, barberId);
      
      const updatedBarber = {
        name: barberData.name,
        specialties: barberData.specialties || [],
        experience: barberData.experience || '',
        rating: barberData.rating || 5.0,
        phone: barberData.phone || '',
        email: barberData.email || '',
        isActive: barberData.isActive !== undefined ? barberData.isActive : true,
        updatedAt: new Date()
      };
      
      await updateDoc(barberRef, updatedBarber);
      console.log("✅ Barbeiro atualizado com sucesso");
      
      // Adicionar notificação de sucesso
      setAdminNotifications(prev => [...prev, {
        id: generateId(),
        type: 'success',
        message: `Barbeiro "${barberData.name}" atualizado com sucesso`,
        timestamp: new Date(),
        read: false
      }]);
      
    } catch (error) {
      console.error("❌ Erro ao atualizar barbeiro:", error);
      setAdminNotifications(prev => [...prev, {
        id: generateId(),
        type: 'error',
        message: `Erro ao atualizar barbeiro: ${error.message}`,
        timestamp: new Date(),
        read: false
      }]);
    }
  };

  const handleDeleteBarber = async (barberId, barberName) => {
    try {
      await waitForAuth();
      
      // Primeiro, excluir todos os horários relacionados ao barbeiro
      const schedulesPath = getCollectionPath(COLLECTIONS.SCHEDULES);
      const schedulesRef = collection(db, schedulesPath);
      const schedulesQuery = query(schedulesRef, where('barberName', '==', barberName));
      const schedulesSnapshot = await getDocs(schedulesQuery);
      
      const batch = writeBatch(db);
      schedulesSnapshot.docs.forEach((scheduleDoc) => {
        batch.delete(scheduleDoc.ref);
      });
      
      // Excluir o barbeiro
      const barbersPath = getCollectionPath(COLLECTIONS.BARBERS);
      const barberRef = doc(db, barbersPath, barberId);
      batch.delete(barberRef);
      
      await batch.commit();
      console.log("✅ Barbeiro e horários relacionados excluídos com sucesso");
      
      // Adicionar notificação de sucesso
      setAdminNotifications(prev => [...prev, {
        id: generateId(),
        type: 'success',
        message: `Barbeiro "${barberName}" e horários relacionados excluídos com sucesso`,
        timestamp: new Date(),
        read: false
      }]);
      
    } catch (error) {
      console.error("❌ Erro ao excluir barbeiro:", error);
      setAdminNotifications(prev => [...prev, {
        id: generateId(),
        type: 'error',
        message: `Erro ao excluir barbeiro: ${error.message}`,
        timestamp: new Date(),
        read: false
      }]);
    }
  };

  // ========================================
  // FUNÇÕES PWA - INSTALAÇÃO
  // ========================================
  
  // Handler para instalação Android
  const handleInstallAndroid = async () => {
    if (deferredPrompt) {
      try {
        // Mostrar o prompt nativo do navegador
        deferredPrompt.prompt();
        
        // Aguardar a escolha do usuário
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          console.log('✅ Usuário aceitou a instalação do PWA');
          setShowAndroidBanner(false);
        } else {
          console.log('❌ Usuário rejeitou a instalação do PWA');
          // Salvar que o usuário dispensou
          localStorage.setItem('android-banner-dismissed', Date.now().toString());
          setShowAndroidBanner(false);
        }
        
        setDeferredPrompt(null);
      } catch (error) {
        console.error('❌ Erro ao instalar PWA:', error);
      }
    }
  };

  // Handler para fechar banner Android
  const handleCloseAndroidBanner = () => {
    setShowAndroidBanner(false);
    // Salvar que o usuário dispensou por 7 dias
    localStorage.setItem('android-banner-dismissed', Date.now().toString());
  };

  // Handler para fechar modal iOS
  const handleCloseIOSModal = () => {
    setShowIOSModal(false);
  };

  // Exibir instruções de instalação sob demanda
  const handleShowInstallInstructions = () => {
    const ua = window.navigator.userAgent.toLowerCase();

    if (ua.includes('android')) {
      if (deferredPrompt) {
        handleInstallPWA();
      } else {
        setShowAndroidBanner(true);
      }
      return;
    }

    if (ua.includes('iphone') || ua.includes('ipad')) {
      setShowIOSModal(true);
      return;
    }

    setShowAndroidBanner(true);
  };

  // Funções legadas (manter compatibilidade)
  const handleInstallPWA = () => handleInstallAndroid();

  const handleCloseInstallInstructions = () => handleCloseIOSModal();

  const handleCloseInstallPrompt = () => handleCloseAndroidBanner();

  // Funções de admin
  const handleAdminLogin = () => {
    setShowAdminLogin(true);
  };

  const handleAdminAuth = () => {
    setIsAdmin(true);
    setShowAdminLogin(false);
    setCurrentView('admin_dashboard');
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    setCurrentView('home');
  };

  // Função para adicionar novo agendamento
  const handleAddBooking = async (newBooking) => {
    try {
      console.log("📝 Adicionando agendamento ao Firestore:", newBooking);
      
      // Aguardar autenticação estar pronta
      await waitForAuth();
      
      // Converter datas para Timestamp do Firebase
      const bookingData = {
        ...newBooking,
        startTime: newBooking.startTime,
        endTime: newBooking.endTime,
        date: newBooking.date,
        createdAt: new Date(),
        updatedAt: new Date(),
        paymentConfirmed: false, // Pagamento não confirmado inicialmente
        paymentConfirmedAt: null,
        paymentConfirmedBy: null,
        addedToDashboard: false // ✅ Não adicionar ao dashboard até que esteja pago E concluído
      };
      
      // Usar caminho correto para coleção
      const bookingsPath = getCollectionPath(COLLECTIONS.BOOKINGS);
      const docRef = await addDoc(collection(db, bookingsPath), bookingData);
      console.log("✅ Agendamento adicionado com ID:", docRef.id);
      
      // Adicionar notificação de sucesso
      setAdminNotifications(prev => [...prev, {
        id: generateId(),
        type: 'success',
        message: 'Agendamento realizado com sucesso!',
        timestamp: new Date()
      }]);
      
    } catch (error) {
      console.error("❌ Erro ao adicionar agendamento:", error);
      setError(`Erro ao salvar agendamento: ${error.message}`);
    }
  };

  // Função para atualizar agendamento
  const handleUpdateBooking = async (bookingId, updates) => {
    try {
      console.log("📝 Atualizando agendamento no Firestore:", bookingId, updates);
      
      // Aguardar autenticação estar pronta
      await waitForAuth();
      
      // Buscar o agendamento atual para usar como dados padrão se necessário
      const currentBooking = bookings.find(b => b.id === bookingId);
      
      // Dados padrão para criar o documento se não existir
      const defaultBookingData = currentBooking || {
        serviceId: 'unknown',
        serviceName: 'Serviço Desconhecido',
        duration: 30,
        barberId: 'unknown',
        barberName: 'Barbeiro Desconhecido',
        date: new Date(),
        startTime: new Date(),
        endTime: new Date(),
        clientName: 'Cliente Desconhecido',
        clientPhone: '00000000000',
        status: 'confirmed',
        price: 0,
        paymentConfirmed: false,
        paymentConfirmedAt: null,
        paymentConfirmedBy: null,
        addedToDashboard: false
      };
      
      // Garantir que o documento existe antes de atualizar
      const bookingRef = await ensureDocumentExists(COLLECTIONS.BOOKINGS, bookingId, defaultBookingData);
      
      // Verificar se está marcando como concluído
      const isMarkingAsCompleted = updates.status === 'completed';
      
      // Se está marcando como concluído, verificar se o pagamento já foi confirmado
      if (isMarkingAsCompleted && currentBooking) {
        const isPaid = currentBooking.paymentConfirmed === true;
        const notYetAddedToDashboard = !currentBooking.addedToDashboard;
        
        // Se pagamento confirmado E não foi adicionado ao dashboard ainda, marcar para adicionar
        if (isPaid && notYetAddedToDashboard) {
          console.log("✅ Condições atendidas: Pagamento confirmado + Serviço concluído. Marcando para dashboard.");
          updates.addedToDashboard = true;
        }
      }
      
      // Atualizar o documento usando setDoc com merge
      await setDoc(bookingRef, {
        ...updates,
        updatedAt: new Date()
      }, { merge: true });
      
      console.log("✅ Agendamento atualizado com sucesso");
      
    } catch (error) {
      console.error("❌ Erro ao atualizar agendamento:", error);
      setError(`Erro ao atualizar agendamento: ${error.message}`);
    }
  };

  // Função para confirmar pagamento
  const handleConfirmPayment = async (bookingId) => {
    try {
      console.log("💰 Confirmando pagamento para agendamento:", bookingId);
      
      // Aguardar autenticação estar pronta
      await waitForAuth();
      
      // Buscar o agendamento atual para usar como dados padrão se necessário
      const currentBooking = bookings.find(b => b.id === bookingId);
      
      // Dados padrão para criar o documento se não existir
      const defaultBookingData = currentBooking || {
        serviceId: 'unknown',
        serviceName: 'Serviço Desconhecido',
        duration: 30,
        barberId: 'unknown',
        barberName: 'Barbeiro Desconhecido',
        date: new Date(),
        startTime: new Date(),
        endTime: new Date(),
        clientName: 'Cliente Desconhecido',
        clientPhone: '00000000000',
        status: 'confirmed',
        price: 0,
        paymentConfirmed: false,
        paymentConfirmedAt: null,
        paymentConfirmedBy: null,
        addedToDashboard: false
      };
      
      // Garantir que o documento existe antes de atualizar
      const bookingRef = await ensureDocumentExists(COLLECTIONS.BOOKINGS, bookingId, defaultBookingData);
      
      // Preparar os dados de atualização
      const updateData = {
        paymentConfirmed: true,
        paymentConfirmedAt: new Date(),
        paymentConfirmedBy: userId,
        updatedAt: new Date()
      };
      
      // Verificar se o serviço já foi concluído
      if (currentBooking) {
        const isCompleted = currentBooking.status === 'completed';
        const notYetAddedToDashboard = !currentBooking.addedToDashboard;
        
        // Se serviço concluído E não foi adicionado ao dashboard ainda, marcar para adicionar
        if (isCompleted && notYetAddedToDashboard) {
          console.log("✅ Condições atendidas: Serviço concluído + Pagamento confirmado. Marcando para dashboard.");
          updateData.addedToDashboard = true;
        }
      }
      
      // Atualizar o documento usando setDoc com merge
      await setDoc(bookingRef, updateData, { merge: true });
      
      console.log("✅ Pagamento confirmado com sucesso");
      
      // Adicionar notificação de sucesso
      setAdminNotifications(prev => [...prev, {
        id: generateId(),
        type: 'success',
        message: 'Pagamento confirmado com sucesso!',
        timestamp: new Date(),
        read: false
      }]);
      
    } catch (error) {
      console.error("❌ Erro ao confirmar pagamento:", error);
      setError(`Erro ao confirmar pagamento: ${error.message}`);
    }
  };
  
  // Tela de loading enquanto Firebase carrega
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Conectando ao servidor...</p>
        </div>
      </div>
    );
  }

  // Tela de erro de autenticação
  if (authError) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-red-900 border border-red-500 rounded-lg p-8 max-w-md w-full text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-4">Erro de Conexão</h2>
          <p className="text-red-200 mb-6">{authError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-500 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }
  
  // Renderização do conteúdo principal
  const renderView = () => {
    // Views de admin
    if (isAdmin) {
      switch (currentView) {
      case 'admin_dashboard':
        return <AdminDashboard bookings={bookings} />;
      case 'admin_bookings':
        return <AdminBookings bookings={bookings} onUpdateBooking={handleUpdateBooking} onConfirmPayment={handleConfirmPayment} />;
      case 'admin_clients':
        return <AdminClients bookings={bookings} />;
      case 'admin_analytics':
        return <AdminAnalytics bookings={bookings} />;
        case 'admin_settings':
          return <AdminSettings 
            bookings={bookings} 
            onAddBooking={handleAddBooking} 
            onDeleteAllData={handleDeleteAllData}
            services={services}
            schedules={schedules}
            barbers={barbers}
            onAddService={handleAddService}
            onUpdateService={handleUpdateService}
            onDeleteService={handleDeleteService}
            onAddSchedule={handleAddSchedule}
            onUpdateSchedule={handleUpdateSchedule}
            onDeleteSchedule={handleDeleteSchedule}
            onAddBarber={handleAddBarber}
            onUpdateBarber={handleUpdateBarber}
            onDeleteBarber={handleDeleteBarber}
          />;
        default:
          return <AdminDashboard bookings={bookings} />;
      }
    }

    // Views de cliente
    switch (currentView) {
      case 'home':
        return <Home onBookNow={() => setCurrentView('book')} services={services} barbers={barbers} />;
      case 'book':
        return (
          <BookingFlow 
            bookings={bookings}
            userId={userId}
            onBookingComplete={() => setCurrentView('my_bookings')}
            onAddBooking={handleAddBooking}
            services={services}
            barbers={barbers}
          />
        );
      case 'my_bookings':
        return <BookingsList bookings={bookings} userId={userId} isLoading={isLoadingBookings} />;
      case 'services':
        return <ServicesView />;
      case 'contact':
        return <ContactView />;
      default:
        return <Home onBookNow={() => setCurrentView('book')} />;
    }
  };

  // Se está mostrando login de admin
  if (showAdminLogin) {
    return <AdminLogin onLogin={handleAdminAuth} />;
  }

  if (error) {
    return (
      <div className="font-inter bg-gray-900 text-white min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Erro no Sistema</h1>
          <p className="text-gray-300 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-yellow-500 text-gray-900 font-bold py-2 px-6 rounded-lg hover:bg-yellow-400"
          >
            Recarregar Página
          </button>
        </div>
      </div>
    );
  }

  const headerNotifications = isAdmin ? adminNotifications : clientNotifications;
  const headerUnreadNotifications = isAdmin ? adminUnreadNotifications : clientUnreadNotifications;
  const headerShowNotifications = isAdmin ? showAdminNotifications : showClientNotifications;
  const headerSetShowNotifications = isAdmin ? setShowAdminNotifications : setShowClientNotifications;
  const headerMarkNotificationAsRead = isAdmin ? markAdminNotificationAsRead : markClientNotificationAsRead;
  const headerRemoveNotification = isAdmin ? removeAdminNotification : removeClientNotification;
  const headerClearAllNotifications = isAdmin ? clearAllAdminNotifications : clearAllClientNotifications;

  const navigationNotifications = clientNotifications;
  const navigationShowNotifications = showClientNotifications;
  const navigationSetShowNotifications = setShowClientNotifications;

  return (
    <div className="font-inter bg-gray-900 text-white min-h-screen">
      <Header 
        isAdmin={isAdmin} 
        onLogout={handleAdminLogout}
        notifications={headerNotifications}
        unreadNotifications={headerUnreadNotifications}
        showNotifications={headerShowNotifications}
        setShowNotifications={headerSetShowNotifications}
        markNotificationAsRead={headerMarkNotificationAsRead}
        removeNotification={headerRemoveNotification}
        clearAllNotifications={headerClearAllNotifications}
        onShowInstallInstructions={handleShowInstallInstructions}
        isInstalled={isInstalled}
      />
      <Navigation 
        currentView={currentView} 
        setCurrentView={setCurrentView}
        notifications={navigationNotifications}
        showNotifications={navigationShowNotifications}
        setShowNotifications={navigationSetShowNotifications}
        isAdmin={isAdmin}
        onAdminLogin={handleAdminLogin}
      />
      <main 
        className="max-w-5xl mx-auto p-4 md:p-6"
        onClick={() => {
          // Fecha o painel de notificações se clicar fora
          if (headerShowNotifications) headerSetShowNotifications(false);
        }}
      >
        {renderView()}
      </main>
      <footer className="text-center p-4 text-gray-500 text-sm border-t border-gray-800 mt-8">
        App de Barbearia &copy; {new Date().getFullYear()}
      </footer>

      {/* PWA Components - Android Banner */}
      {showAndroidBanner && (
        <InstallBannerAndroid 
          onInstall={handleInstallAndroid}
          onClose={handleCloseInstallPrompt}
        />
      )}
      
      {/* PWA Components - iOS Modal */}
      {showIOSModal && (
        <InstallModalIOS 
          onClose={handleCloseInstallInstructions}
        />
      )}
    </div>
  );
}





