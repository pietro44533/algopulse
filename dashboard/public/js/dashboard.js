// Dashboard JavaScript - Funzionalità principali
console.log('🚀 Dashboard.js caricato - versione v=30');

class Dashboard {
  constructor() {
    this.currentTask = null;
    this.notifications = [];
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.startLiveUpdates();
    this.registerServiceWorker();
    this.setupPWA();
  }

  setupEventListeners() {
    // Task pills
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('pill')) {
        this.switchTask(e.target.textContent.trim());
      }
    });

    // Bell notifications
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('bell')) {
        this.toggleNotifications(e.target);
      }
    });

    // Remove task buttons
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-task-btn')) {
        this.removeTask(e.target.closest('.match-box'));
      }
    });
  }

  switchTask(taskName) {
    // Remove active class from all pills
    document.querySelectorAll('.pill').forEach(pill => {
      pill.classList.remove('active');
    });

    // Add active class to clicked pill
    event.target.classList.add('active');

    // Filter messages by task
    this.currentTask = taskName;
    this.filterMessagesByTask(taskName);
  }

  filterMessagesByTask(taskName) {
    const matchBoxes = document.querySelectorAll('.match-box');
    
    matchBoxes.forEach(box => {
      const header = box.querySelector('.header').textContent;
      if (taskName === 'Tutti' || header === taskName) {
        box.style.display = 'block';
      } else {
        box.style.display = 'none';
      }
    });
  }

  toggleNotifications(bellElement) {
    bellElement.classList.toggle('on');
    bellElement.classList.toggle('off');
    
    if (bellElement.classList.contains('on')) {
      this.requestNotificationPermission();
    }
  }

  async requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        this.showNotification('Notifiche attivate', 'Riceverai notifiche per i nuovi segnali');
      }
    }
  }

  showNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: body,
        icon: '/images/icon_192x192.png',
        badge: '/images/icon_192x192.png'
      });
    }
  }

  removeTask(matchBox) {
    if (confirm('Sei sicuro di voler rimuovere questo task?')) {
      matchBox.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        matchBox.remove();
      }, 300);
    }
  }

  startLiveUpdates() {
    // Solo fetch iniziale, niente aggiornamento automatico
    this.fetchLiveMessages();
  }

  async fetchLiveMessages() {
    try {
      const response = await fetch('/api/instradatore_task');
      const data = await response.json();
      
      if (data && Array.isArray(data)) {
        this.updateMessages(data);
      }
    } catch (error) {
      console.error('Errore nel caricamento messaggi:', error);
      this.showError('Errore di connessione');
    }
  }

  updateMessages(messages) {
    const container = document.getElementById('tasks-container');
    if (!container) return;

    console.log('DEBUG: Messaggi ricevuti:', messages);

    // Get task names from the existing pills (HTML template)
    const pills = document.querySelectorAll('.pill');
    const taskNames = Array.from(pills).map(pill => pill.getAttribute('data-filter-raw'));
    
    console.log('DEBUG: Task names dalle pills:', taskNames);
    
    // Group messages by task
    const groupedMessages = this.groupMessagesByTask(messages);
    
    console.log('DEBUG: Messaggi raggruppati:', groupedMessages);
    
    // Clear container
    container.innerHTML = '';

    // Create match boxes only for tasks that exist in the HTML template
    taskNames.forEach(taskName => {
      const taskKey = taskName.toLowerCase().replace(/ /g, '-');
      const taskMessages = groupedMessages[taskKey] || [];
      
      console.log(`DEBUG: Task "${taskName}" (key: "${taskKey}") ha ${taskMessages.length} messaggi`);
      
      if (taskMessages.length > 0) {
        const matchBox = this.createMatchBox(taskName, taskMessages);
        container.appendChild(matchBox);
      }
    });
  }

  // Funzione per aggiungere un nuovo messaggio in cima
  addNewMessage(newMessage) {
    const container = document.getElementById('tasks-container');
    if (!container) return;

    // Trova il match box per la task del nuovo messaggio
    const taskKey = newMessage.task ? newMessage.task.toLowerCase().replace(/ /g, '-') : 'no-task';
    let matchBox = container.querySelector(`[data-task="${taskKey}"]`);

    if (!matchBox) {
      // Se non esiste, crea un nuovo match box
      const messagesContainer = document.createElement('div');
      messagesContainer.className = 'messages';
      
      matchBox = document.createElement('div');
      matchBox.className = 'match-box';
      matchBox.setAttribute('data-task', taskKey);
      
      const header = document.createElement('div');
      header.className = 'header';
      header.textContent = newMessage.task || 'Nuovo Task';
      
      matchBox.appendChild(header);
      matchBox.appendChild(messagesContainer);
      
      // Inserisci il nuovo match box in cima
      container.insertBefore(matchBox, container.firstChild);
    }

    // Trova il container dei messaggi
    const messagesContainer = matchBox.querySelector('.messages');
    
    // Crea il nuovo messaggio
    const messageElement = this.renderMessage(newMessage);
    
    // Inserisci il nuovo messaggio in cima
    messagesContainer.insertBefore(messageElement, messagesContainer.firstChild);
  }

  groupMessagesByTask(messages) {
    const grouped = {};
    
    messages.forEach(msg => {
      if (!msg.task) return;
      
      const key = msg.task.toLowerCase().replace(/ /g, '-');
      console.log(`DEBUG: Raggruppando messaggio con task "${msg.task}" -> key "${key}"`);
      
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(msg);
    });

    return grouped;
  }

  createMatchBox(taskName, messages) {
    console.log(`DEBUG: createMatchBox chiamato per task "${taskName}" con ${messages.length} messaggi`);
    
    const matchBox = document.createElement('div');
    matchBox.className = 'match-box';
    matchBox.setAttribute('data-task', taskName);

    // Header
    const header = document.createElement('div');
    header.className = 'header';
    header.textContent = taskName;
    matchBox.appendChild(header);

    // Messages container
    const messagesContainer = document.createElement('div');
    messagesContainer.className = 'messages';

    // Add messages in order (newest first)
    messages.forEach(msg => {
      console.log(`DEBUG: Rendering messaggio per task "${taskName}":`, msg);
      const messageElement = this.renderMessage(msg);
      if (messageElement) {
        console.log(`DEBUG: MessageElement creato per task "${taskName}"`);
        messagesContainer.appendChild(messageElement);
      } else {
        console.log(`DEBUG: MessageElement NULL per task "${taskName}"`);
      }
    });

    matchBox.appendChild(messagesContainer);
    console.log(`DEBUG: MatchBox completato per task "${taskName}"`);
    return matchBox;
  }

  renderMessage(msg) {
    console.log(`DEBUG: renderMessage chiamato con:`, msg);
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';

    // Header con timestamp e match (o "prova" se messaggio === "prova")
    const messageHeader = document.createElement('div');
    messageHeader.className = 'message-header';
    
    if (msg.messaggio === "prova") {
      // Mostra header "prova" in grande e grassetto
      messageHeader.innerHTML = `<strong>prova</strong>`;
      messageHeader.style.fontSize = '1.5em';
      messageHeader.style.fontWeight = 'bold';
    } else {
      // Mostra timestamp con match e orario
      const timestamp = new Date(msg.timestamp);
      const timeStr = timestamp.toLocaleString('it-IT', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      messageHeader.innerHTML = `🕒 ${timeStr} — ${msg.match || 'N/A'}`;
    }
    
    messageDiv.appendChild(messageHeader);

    // Strategia
    if (msg.strategia) {
      const strategiaDiv = document.createElement('div');
      strategiaDiv.className = 'strategia';
      strategiaDiv.textContent = `Strategia: ${msg.strategia}`;
      messageDiv.appendChild(strategiaDiv);
    }

    // Campionato
    if (msg.campionato) {
      const campionatoDiv = document.createElement('div');
      campionatoDiv.className = 'campionato';
      campionatoDiv.innerHTML = `${msg.campionato} 🏆`;
      messageDiv.appendChild(campionatoDiv);
    }

    // Quote
    if (msg.start || msg.kickoff) {
      const quoteDiv = document.createElement('div');
      quoteDiv.className = 'quote';
      if (msg.start) quoteDiv.innerHTML += `Start: ${msg.start}<br>`;
      if (msg.kickoff) quoteDiv.innerHTML += `Kickoff: ${msg.kickoff}`;
      messageDiv.appendChild(quoteDiv);
    }

    // Statistiche
    if (msg.rtg || msg.gt || msg.tt || msg.sod) {
      const statsDiv = document.createElement('div');
      statsDiv.className = 'stats';
      const stats = [];
      if (msg.rtg) stats.push(`RTG: ${msg.rtg}`);
      if (msg.gt) stats.push(`GT: ${msg.gt}`);
      if (msg.tt) stats.push(`TT: ${msg.tt}`);
      if (msg.sod) stats.push(`SOD: ${msg.sod}`);
      statsDiv.textContent = stats.join(' | ');
      messageDiv.appendChild(statsDiv);
    }

    // Database stats
    if (msg.db || msg.db_p || msg.agv) {
      const dbStatsDiv = document.createElement('div');
      dbStatsDiv.className = 'db-stats';
      const dbStats = [];
      if (msg.db) dbStats.push(`DB: ${msg.db}`);
      if (msg.db_p) dbStats.push(`DB_P: ${msg.db_p}`);
      if (msg.agv) dbStats.push(`AGV Tot: ${msg.agv}`);
      dbStatsDiv.textContent = dbStats.join(' | ');
      messageDiv.appendChild(dbStatsDiv);
    }

    // Indicatori tecnici
    const indicatorsDiv = document.createElement('div');
    indicatorsDiv.className = 'indicators';
    
    const parserStatus = msg.parser_ok ? 'Valido' : 'Errore';
    const apiStatus = msg.api_ok ? 'Valido' : 'Errore';
    const tradeStatus = msg.trade_ok ? 'Eseguita' : 'Non eseguita';
    
    indicatorsDiv.innerHTML = `
      <span class="indicator ${msg.parser_ok ? 'ok' : 'error'}">Parser: ${parserStatus}</span>
      <span class="indicator ${msg.api_ok ? 'ok' : 'error'}">API BetAngel: ${apiStatus}</span>
      <span class="indicator ${msg.trade_ok ? 'ok' : 'error'}">Trade: ${tradeStatus}</span>
    `;
    messageDiv.appendChild(indicatorsDiv);

    console.log(`DEBUG: renderMessage completato per messaggio:`, msg);
    return messageDiv;
  }

  // Funzione rimossa - non serve più il controllo automatico delle notifiche

  showError(message) {
    // Create error notification
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-notification';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #e74c3c;
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(errorDiv);

    setTimeout(() => {
      errorDiv.remove();
    }, 3000);
  }

  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('Service Worker registrato con successo:', registration);
      } catch (error) {
        console.error('Errore nella registrazione del Service Worker:', error);
      }
    }
  }

  setupPWA() {
    // Add to home screen prompt
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      
      // Show install prompt
      this.showInstallPrompt();
    });

    // Handle app installed
    window.addEventListener('appinstalled', () => {
      console.log('App installata con successo');
      this.showNotification('App installata', 'L\'app è stata aggiunta alla schermata home');
    });
  }

  showInstallPrompt() {
    const promptDiv = document.createElement('div');
    promptDiv.innerHTML = `
      <div style="
        position: fixed;
        bottom: 20px;
        left: 20px;
        right: 20px;
        background: white;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        z-index: 1000;
        text-align: center;
      ">
        <h3>Installa l'app</h3>
        <p>Aggiungi questa app alla schermata home per un accesso più veloce</p>
        <button onclick="this.parentElement.remove()" style="
          background: #667eea;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          margin: 5px;
          cursor: pointer;
        ">Installa</button>
        <button onclick="this.parentElement.remove()" style="
          background: #95a5a6;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          margin: 5px;
          cursor: pointer;
        ">Non ora</button>
      </div>
    `;
    
    document.body.appendChild(promptDiv);
  }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new Dashboard();
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(-100%); opacity: 0; }
  }
`;
document.head.appendChild(style); 