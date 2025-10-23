import React, { useState, useEffect, useMemo, useCallback } from 'react';
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

// --- Sistema de Barbearia ---
// Aplicação funcionando apenas com dados locais

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
const STORAGE_KEYS = {
  BOOKINGS: 'barbershop_bookings',
  CLIENTS: 'barbershop_clients',
  SETTINGS: 'barbershop_settings'
};

// Funções para gerenciar localStorage
const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Erro ao salvar no localStorage:', error);
  }
};

const loadFromStorage = (key, defaultValue = []) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error('Erro ao carregar do localStorage:', error);
    return defaultValue;
  }
};

// Função para gerar ID único
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Função para adicionar evento ao calendário do celular
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
  
  // Gerar URL para diferentes tipos de calendário
  const generateCalendarUrl = (type) => {
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
  modal.innerHTML = `
    <div class="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-xl max-w-md w-full">
      <h3 class="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Adicionar ao Calendário</h3>
      <p class="text-gray-300 mb-4 text-sm sm:text-base">Escolha como deseja adicionar o agendamento ao seu calendário:</p>
      <div class="space-y-3">
        <button onclick="window.open('${generateCalendarUrl('google')}', '_blank'); this.closest('.fixed').remove();" 
                class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-500 transition-colors text-sm sm:text-base">
          📅 Google Calendar
        </button>
        <button onclick="window.open('${generateCalendarUrl('outlook')}', '_blank'); this.closest('.fixed').remove();" 
                class="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-400 transition-colors text-sm sm:text-base">
          📅 Outlook Calendar
        </button>
        <button onclick="downloadICS('${generateICSContent(eventDetails).replace(/'/g, "\\'")}', 'agendamento-${bookingId}.ics'); this.closest('.fixed').remove();" 
                class="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors text-sm sm:text-base">
          📥 Download (.ics)
        </button>
        <button onclick="this.closest('.fixed').remove();" 
                class="w-full bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors text-sm sm:text-base">
          Cancelar
        </button>
      </div>
      <div class="mt-4 p-3 bg-blue-900 bg-opacity-30 border border-blue-500 rounded-lg">
        <p class="text-blue-200 text-xs sm:text-sm">
          💡 O lembrete será configurado para 20 minutos antes do horário do agendamento.
        </p>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Credenciais: admin / admin123
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      onLogin();
    } else {
      setError('Usuário ou senha incorretos. Use: admin / admin123');
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
            className="w-full bg-yellow-500 text-gray-900 font-bold py-3 px-6 rounded-lg hover:bg-yellow-400 transition-all"
          >
            Entrar
          </button>
        </form>

      </div>
    </div>
  );
};

// Componente de Cabeçalho
const Header = ({ isAdmin, onLogout }) => (
  <header className="w-full bg-gray-900 p-3 sm:p-4 border-b-2 border-yellow-500">
    <div className="max-w-5xl mx-auto flex items-center justify-between">
      <div className="flex items-center">
        <Scissors className="text-yellow-500 h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3" />
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white tracking-wider">
          <span className="hidden sm:inline">Barbearia Navalha Dourada</span>
          <span className="sm:hidden">Barbearia</span>
      </h1>
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
                <p className="text-sm text-white">{notif.title}</p>
                <p className="text-xs text-gray-300">{notif.message}</p>
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
        
        {/* Botão de Notificações */}
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
        
        {/* Painel de Notificações Dropdown */}
        {showNotifications && (
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
const Home = ({ onBookNow }) => (
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
        {SERVICES.map(service => (
          <div key={service.id} className="bg-gray-700 p-3 sm:p-4 rounded-lg text-center shadow-md">
            <service.icon className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500 mx-auto mb-2" />
            <p className="font-semibold text-white text-sm sm:text-base">{service.name}</p>
            <p className="text-xs sm:text-sm text-gray-300">R$ {service.price.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
    
    <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-xl">
      <h3 className="text-xl sm:text-2xl font-semibold text-white mb-3 sm:mb-4 border-l-4 border-yellow-500 pl-3">Nossa Equipe</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {BARBERS.map(barber => (
          <div key={barber.id} className="bg-gray-700 p-4 rounded-lg text-center shadow-md">
            <img 
              src={barber.avatar}
              alt={barber.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-yellow-500 mb-3 mx-auto object-cover"
            />
            <p className="text-base sm:text-lg font-medium text-white">{barber.name}</p>
            <p className="text-xs sm:text-sm text-gray-400">{barber.specialty}</p>
            <div className="flex items-center justify-center mt-2">
              <Star className="h-4 w-4 text-yellow-500 mr-1" />
              <span className="text-xs sm:text-sm text-gray-300">{barber.rating}</span>
              <span className="text-xs text-gray-500 ml-2">({barber.experience})</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

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
const BookingFlow = ({ bookings, userId, onBookingComplete, onAddBooking }) => {
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
  
  // Nomes dos Passos
  const stepNames = ["Serviço", "Barbeiro", "Data", "Horário", "Confirmação"]; // ATUALIZADO
  
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
      
      const slots = generateTimeSlots(selectedDate, selectedService.duration, bookingsForDayAndBarber); // ATUALIZADO
      setAvailableSlots(slots);
      setIsLoadingSlots(false);
    }
  }, [selectedDate, selectedService, selectedBarber, bookings]); // ATUALIZADO

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
    
    if (!clientInfo.name || !clientInfo.phone) {
      setErrorMessage("Por favor, preencha seu nome e telefone.");
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage(null);
    
    const startTime = selectedTime;
    const endTime = new Date(startTime.getTime() + selectedService.duration * 60000);
    
    const newBooking = {
      id: generateId(),
      userId: userId,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      duration: selectedService.duration,
      barberId: selectedBarber.id,
      barberName: selectedBarber.name,
      date: new Date(selectedDate.setHours(0,0,0,0)),
      startTime: startTime,
      endTime: endTime,
      clientName: clientInfo.name,
      clientPhone: clientInfo.phone,
      createdAt: new Date(),
      status: 'confirmed',
      price: selectedService.price
    };
    
    try {
      // Adiciona o novo agendamento via callback
      onAddBooking(newBooking);
      
      // Sucesso
      setStep(6); // Vai para a tela de confirmação
      
    } catch (error) {
      console.error("Erro ao salvar agendamento:", error);
      setErrorMessage("Não foi possível realizar o agendamento. Tente novamente.");
    } finally {
      setIsSubmitting(false);
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
              {SERVICES.map(service => (
                <button
                  key={service.id}
                  onClick={() => handleSelectService(service)}
                  className="bg-gray-700 p-3 sm:p-4 rounded-lg shadow-lg text-left w-full hover:bg-gray-600 hover:ring-2 hover:ring-yellow-500 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base sm:text-lg font-semibold text-white">{service.name}</p>
                      <p className="text-xs sm:text-sm text-gray-300">{service.duration} min | R$ {service.price.toFixed(2)}</p>
                    </div>
                    <service.icon className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />
                  </div>
                </button>
              ))}
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
              {BARBERS.map(barber => (
                <button
                  key={barber.id}
                  onClick={() => handleSelectBarber(barber)}
                  className={`bg-gray-700 p-3 sm:p-4 rounded-lg shadow-lg text-center w-full hover:bg-gray-600 hover:ring-2 hover:ring-yellow-500 transition-all flex flex-col items-center ${
                    selectedBarber?.id === barber.id ? 'ring-2 ring-yellow-500' : ''
                  }`}
                >
                  <img 
                    src={barber.avatar} 
                    alt={barber.name} 
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-yellow-500 mb-2 sm:mb-3"
                  />
                  <p className="text-base sm:text-lg font-semibold text-white">{barber.name}</p>
                </button>
              ))}
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
              
              {errorMessage && (
                <p className="text-red-400 text-center mt-4 text-sm">{errorMessage}</p>
              )}
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg mt-6 hover:bg-green-500 transition-all disabled:bg-gray-500"
              >
                {isSubmitting ? 'Confirmando...' : 'Confirmar Agendamento'}
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
              <p className="text-lg text-white font-semibold mb-2">{selectedService.name}</p>
              <p className="text-gray-300 mb-1">
                <span className="font-medium">Data:</span> {selectedDate.toLocaleDateString('pt-BR')}
              </p>
              <p className="text-gray-300 mb-1">
                <span className="font-medium">Hora:</span> {selectedTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-gray-300">
                <span className="font-medium">Cliente:</span> {clientInfo.name}
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
                  serviceName: selectedService.name,
                  barberName: selectedBarber?.name || 'Barbeiro',
                  clientName: clientInfo.name,
                  price: selectedService.price,
                  startTime: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), selectedTime.getHours(), selectedTime.getMinutes()),
                  endTime: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), selectedTime.getHours(), selectedTime.getMinutes() + selectedService.duration)
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
const StatCard = ({ title, value, icon: Icon, colorClass = 'text-yellow-500' }) => (
  <div className="bg-gray-700 p-4 rounded-lg shadow-lg flex items-center">
    <div className={`p-3 rounded-full ${colorClass.replace('text-', 'bg-').replace('500', '500')} bg-opacity-20 mr-4`}>
      <Icon className={`h-6 w-6 ${colorClass}`} />
    </div>
    <div>
      <p className="text-sm text-gray-400 font-medium">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  </div>
);

// Formulário de Adicionar Corte Avulso
const AddWalkInForm = ({ userId, onAddBooking }) => {
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
            {SERVICES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
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
            {BARBERS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
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

// Componente do Dashboard (Admin)
const DashboardView = ({ todayBookings, isLoadingTodayBookings, history, isLoading, userId, onAddBooking }) => {
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

      {/* Formulário de Walk-in */}
      <AddWalkInForm userId={userId} onAddBooking={onAddBooking} />

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

    const filteredBookings = bookings.filter(b => {
      const bookingDate = new Date(b.startTime);
      return bookingDate >= filterDate;
    });
    
    const totalRevenue = filteredBookings.reduce((acc, b) => acc + (b.price || 0), 0);
    const totalBookings = filteredBookings.length;
    const averageRating = filteredBookings.reduce((acc, b) => acc + (b.rating || 0), 0) / filteredBookings.length || 0;
    
    const revenueByBarber = filteredBookings.reduce((acc, b) => {
      acc[b.barberName] = (acc[b.barberName] || 0) + (b.price || 0);
      return acc;
    }, {});

    const serviceStats = filteredBookings.reduce((acc, b) => {
      acc[b.serviceName] = (acc[b.serviceName] || 0) + 1;
      return acc;
    }, {});

    // Clientes únicos
    const uniqueClients = new Set(filteredBookings.map(b => b.clientName)).size;

    return {
      totalRevenue,
      totalBookings,
      averageRating,
      uniqueClients,
      revenueByBarber: Object.entries(revenueByBarber).sort((a, b) => b[1] - a[1]),
      serviceStats: Object.entries(serviceStats).sort((a, b) => b[1] - a[1])
    };
  }, [timeFilter, bookings]);

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
              <p className="text-xs sm:text-sm text-gray-400">Receita Total</p>
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
const AdminBookings = ({ bookings, onUpdateBooking }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const todaysBookings = bookings.filter(b => {
    const bookingDate = new Date(b.startTime);
    return bookingDate.toISOString().split('T')[0] === selectedDate;
  });

  const handleCompleteBooking = (bookingId) => {
    onUpdateBooking(bookingId, { status: 'completed' });
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

      <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-xl">
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">
          Agendamentos para {new Date(selectedDate).toLocaleDateString('pt-BR')}
        </h3>
        
        {todaysBookings.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {todaysBookings.map(booking => (
              <div key={booking.id} className="bg-gray-700 p-3 sm:p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-white text-sm sm:text-base">{booking.serviceName}</h4>
                  <p className="text-gray-400 text-xs sm:text-sm">Cliente: {booking.clientName}</p>
                  <p className="text-gray-400 text-xs sm:text-sm">Barbeiro: {booking.barberName}</p>
                  <p className="text-gray-400 text-xs sm:text-sm">Horário: {booking.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
                  <p className="text-base sm:text-lg font-bold text-green-400">R$ {booking.price.toFixed(2)}</p>
                  <div className="flex items-center">
                    <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 mr-1" />
                    <span className="text-xs sm:text-sm text-gray-300">{booking.rating}</span>
                  </div>
                  <button 
                    onClick={() => handleCompleteBooking(booking.id)}
                    className="bg-green-600 text-white px-3 py-1 rounded text-xs sm:text-sm hover:bg-green-500 w-full sm:w-auto"
                  >
                    {booking.status === 'completed' ? 'Concluído' : 'Marcar como Concluído'}
                  </button>
                </div>
              </div>
            ))}
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
  const clientStats = useMemo(() => {
    const clientMap = new Map();
    
    bookings.forEach(booking => {
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
  }, [bookings]);

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
                {clientStats.map((client, index) => (
                  <tr key={index} className="border-b border-gray-700">
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
                ))}
              </tbody>
            </table>

            {/* Mobile Cards */}
            <div className="sm:hidden space-y-3">
              {clientStats.map((client, index) => (
                <div key={index} className="bg-gray-700 p-4 rounded-lg">
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
              ))}
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
  const analytics = useMemo(() => {
    // Horários de pico por hora
    const hourlyStats = {};
    const dailyStats = {};
    const ratings = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    
    bookings.forEach(booking => {
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
    const monthlyBookings = bookings.filter(b => new Date(b.startTime) >= startOfMonth);
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
  }, [bookings]);

  const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
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
const AdminSettings = ({ bookings, onAddBooking }) => {
  return (
    <div className="animate-fade-in space-y-4 sm:space-y-6 p-4 sm:p-6">
      <h2 className="text-2xl sm:text-3xl font-bold text-white">Configurações</h2>
      
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
            {SERVICES.map(service => (
              <div key={service.id} className="bg-gray-700 p-3 rounded-lg flex justify-between items-center">
                <div>
                  <p className="text-white font-semibold">{service.name}</p>
                  <p className="text-sm text-gray-400">{service.duration} min - R$ {service.price.toFixed(2)}</p>
                </div>
                <div className="flex space-x-2">
                  <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-500">
                    Editar
                  </button>
                  <button className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-500">
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-500 transition-all">
            Adicionar Novo Serviço
          </button>
        </div>
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
    </div>
  );
};

// --- Componente Principal (App) ---
export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [userId] = useState("user-001");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [error, setError] = useState(null);

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
  const [isLoadingBookings] = useState(false);
  const [bookingHistory, setBookingHistory] = useState([]);
  const [isLoadingHistory] = useState(false);
  
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Carregar dados do localStorage
  useEffect(() => {
    console.log("🚀 Aplicação iniciada - carregando dados do localStorage");
    const savedBookings = loadFromStorage(STORAGE_KEYS.BOOKINGS);
    setBookings(savedBookings);
    setBookingHistory(savedBookings);
  }, []);

  // Salvar dados sempre que bookings mudarem
  useEffect(() => {
    if (bookings.length > 0) {
      saveToStorage(STORAGE_KEYS.BOOKINGS, bookings);
    }
  }, [bookings]);
  
  // Notificações do sistema
  useEffect(() => {
    // Notificações do sistema
    setNotifications([
      {
        title: 'Bem-vindo!',
        message: 'Sistema de barbearia carregado com sucesso.'
      }
    ]);
  }, []);
  
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
  const handleAddBooking = (newBooking) => {
    setBookings(prev => [...prev, newBooking]);
    setBookingHistory(prev => [...prev, newBooking]);
  };

  // Função para atualizar agendamento
  const handleUpdateBooking = (bookingId, updates) => {
    setBookings(prev => prev.map(booking => 
      booking.id === bookingId ? { ...booking, ...updates } : booking
    ));
    setBookingHistory(prev => prev.map(booking => 
      booking.id === bookingId ? { ...booking, ...updates } : booking
    ));
  };
  
  // Renderização do conteúdo principal
  const renderView = () => {
    // Views de admin
    if (isAdmin) {
      switch (currentView) {
      case 'admin_dashboard':
        return <AdminDashboard bookings={bookings} />;
      case 'admin_bookings':
        return <AdminBookings bookings={bookings} onUpdateBooking={handleUpdateBooking} />;
      case 'admin_clients':
        return <AdminClients bookings={bookings} />;
      case 'admin_analytics':
        return <AdminAnalytics bookings={bookings} />;
        case 'admin_settings':
          return <AdminSettings bookings={bookings} onAddBooking={handleAddBooking} />;
        default:
          return <AdminDashboard bookings={bookings} />;
      }
    }

    // Views de cliente
    switch (currentView) {
      case 'home':
        return <Home onBookNow={() => setCurrentView('book')} />;
      case 'book':
        return (
          <BookingFlow 
            bookings={bookings}
            userId={userId}
            onBookingComplete={() => setCurrentView('my_bookings')}
            onAddBooking={handleAddBooking}
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

  return (
    <div className="font-inter bg-gray-900 text-white min-h-screen">
      <Header isAdmin={isAdmin} onLogout={handleAdminLogout} />
      <Navigation 
        currentView={currentView} 
        setCurrentView={setCurrentView}
        notifications={notifications}
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
        isAdmin={isAdmin}
        onAdminLogin={handleAdminLogin}
      />
      <main 
        className="max-w-5xl mx-auto p-4 md:p-6"
        onClick={() => {
          // Fecha o painel de notificações se clicar fora
          if (showNotifications) setShowNotifications(false);
        }}
      >
        {renderView()}
      </main>
      <footer className="text-center p-4 text-gray-500 text-sm border-t border-gray-800 mt-8">
        App de Barbearia &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}





