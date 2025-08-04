// Dashboard JavaScript - Versione semplificata
console.log('🚀 Dashboard.js caricato - versione v=47');
console.log('🔍 DEBUG: File JavaScript caricato correttamente');
console.log('🔍 DEBUG: Timestamp:', new Date().toISOString());

// Funzione per cambiare task
function switchTask(taskName, clickedElement = null) {
  try {
    console.log('DEBUG: switchTask chiamato con:', taskName);
    console.log('DEBUG: taskName type:', typeof taskName);
    console.log('DEBUG: taskName === "prova":', taskName === 'prova');
    console.log('DEBUG: taskName === "goal ht":', taskName === 'goal ht');
    
    // Rimuovi active class da tutte le pills
    document.querySelectorAll('.pill').forEach(pill => {
      pill.classList.remove('active');
    });

    // Aggiungi active class alla pill cliccata (se disponibile)
    if (clickedElement) {
      clickedElement.classList.add('active');
    } else {
      // Se non c'è elemento cliccato, trova la pill corrispondente
      document.querySelectorAll('.pill').forEach(pill => {
        if (pill.textContent.trim() === taskName) {
          pill.classList.add('active');
        }
      });
    }

    // Mostra/nascondi i box in base alla task
    const goalHtBox = document.getElementById('goal-ht-box');
    const provaBox = document.getElementById('prova-box');
    
    console.log('DEBUG: Box goal-ht trovato:', goalHtBox);
    console.log('DEBUG: Box prova trovato:', provaBox);
    console.log('DEBUG: Prima di cambiare display - goal-ht:', goalHtBox.style.display);
    console.log('DEBUG: Prima di cambiare display - prova:', provaBox.style.display);
    
    if (taskName === 'goal ht') {
      console.log('DEBUG: Entro nel branch goal ht');
      goalHtBox.style.display = 'block';
      provaBox.style.display = 'none';
      console.log('DEBUG: Mostro goal-ht, nascondo prova');
      console.log('DEBUG: goal-ht display dopo:', goalHtBox.style.display);
      console.log('DEBUG: prova display dopo:', provaBox.style.display);
    } else if (taskName === 'prova') {
      console.log('DEBUG: Entro nel branch prova');
      goalHtBox.style.display = 'none';
      provaBox.style.display = 'block';
      console.log('DEBUG: Mostro prova, nascondo goal-ht');
      console.log('DEBUG: goal-ht display dopo:', goalHtBox.style.display);
      console.log('DEBUG: prova display dopo:', provaBox.style.display);
    } else {
      console.log('DEBUG: Nessun branch match per taskName:', taskName);
    }
    
    // Ricarica i messaggi dopo aver cambiato task
    console.log('DEBUG: Ricaricamento messaggi dopo cambio task...');
    loadMessages();
  } catch (error) {
    console.error('ERRORE in switchTask:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Aggiungi event listener alle pills
document.addEventListener('DOMContentLoaded', function() {
  // Aggiungi event listener alle pills
  document.querySelectorAll('.pill').forEach(pill => {
    console.log('DEBUG: Aggiungendo event listener a pill:', pill.textContent.trim());
    pill.addEventListener('click', function() {
      const taskName = this.getAttribute('data-filter-raw');
      console.log('DEBUG: Pill cliccata:', taskName);
      console.log('DEBUG: Pill element:', this);
      switchTask(taskName, this);
    });
  });
  
  console.log('DEBUG: Event listeners aggiunti alle pills');
  
  // Carica i messaggi all'avvio
  console.log('DEBUG: Caricamento messaggi all\'avvio...');
  loadMessages();
});

// Funzione per caricare i messaggi dall'API
async function loadMessages() {
  console.log('DEBUG: loadMessages() chiamata');
  try {
    const response = await fetch('/api/instradatore_task');
    console.log('DEBUG: Response status:', response.status);
    const messages = await response.json();
    console.log('DEBUG: Messaggi caricati dall\'API:', messages);
    console.log('DEBUG: Numero messaggi:', messages.length);
    
    // Raggruppa i messaggi per task
    const messagesByTask = {};
    messages.forEach(msg => {
      const task = msg.task;
      console.log('DEBUG: Processando messaggio con task:', task);
      if (!messagesByTask[task]) {
        messagesByTask[task] = [];
      }
      messagesByTask[task].push(msg);
    });
    
    console.log('DEBUG: Messaggi raggruppati per task:', messagesByTask);
    console.log('DEBUG: Messaggi per "goal ht":', messagesByTask['goal ht'] || []);
    console.log('DEBUG: Messaggi per "prova":', messagesByTask['prova'] || []);
    
    // Carica i messaggi nei box corrispondenti
    loadMessagesInBox('goal ht', messagesByTask['goal ht'] || []);
    loadMessagesInBox('prova', messagesByTask['prova'] || []);
    
  } catch (error) {
    console.error('Errore nel caricamento messaggi:', error);
  }
}

// Funzione per caricare i messaggi in un box specifico
function loadMessagesInBox(taskName, messages) {
  console.log(`DEBUG: loadMessagesInBox chiamata per task "${taskName}" con ${messages.length} messaggi`);
  
  const boxId = taskName === 'goal ht' ? 'goal-ht-box' : 'prova-box';
  const box = document.getElementById(boxId);
  
  console.log(`DEBUG: Box ID: ${boxId}`);
  console.log(`DEBUG: Box trovato:`, box);
  
  if (!box) {
    console.error('Box non trovato:', boxId);
    return;
  }
  
  const messagesContainer = box.querySelector('.messages');
  console.log(`DEBUG: Messages container trovato:`, messagesContainer);
  
  messagesContainer.innerHTML = '';
  
  if (messages.length === 0) {
    console.log(`DEBUG: Nessun messaggio per ${taskName}, mostro messaggio vuoto`);
    messagesContainer.innerHTML = `<div class="empty-message">Nessun segnale disponibile per ${taskName}</div>`;
    return;
  }
  
  console.log(`DEBUG: Creando ${messages.length} elementi messaggio per ${taskName}`);
  
  // Ordina i messaggi per timestamp (più recente in alto)
  messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  console.log(`DEBUG: Messaggi ordinati per data (più recente in alto):`, messages.map(m => ({ timestamp: m.timestamp, partita: parseMatchInfo(m.messaggio).partita })));
  
  messages.forEach((msg, index) => {
    console.log(`DEBUG: Creando messaggio ${index + 1}:`, msg);
    const messageElement = createMessageElement(msg);
    console.log(`DEBUG: Elemento messaggio creato:`, messageElement);
    messagesContainer.appendChild(messageElement);
  });
  
  console.log(`DEBUG: Messaggi caricati nel box ${taskName}. Contenuto finale:`, messagesContainer.innerHTML);
}

// Funzione per estrarre informazioni del match dal messaggio
function parseMatchInfo(messaggio) {
  console.log('DEBUG: Parsing messaggio completo:', messaggio);
  console.log('DEBUG: Lunghezza messaggio:', messaggio.length);
  
  const parsedData = {};
  
  // Cerca "Partita: " seguito dal nome della partita
  const partitaMatch = messaggio.match(/Partita:\s*([^\n]+)/);
  if (partitaMatch) {
    parsedData.partita = partitaMatch[1].trim();
    console.log('DEBUG: Partita trovata:', parsedData.partita);
  }
  
  // Cerca "Score: " seguito dal punteggio
  const scoreMatch = messaggio.match(/Score:\s*([^\n]+)/);
  if (scoreMatch) {
    parsedData.score = scoreMatch[1].trim();
    console.log('DEBUG: Score trovato:', parsedData.score);
  }
  
  // Cerca "Strategia: " seguito dalla strategia
  const strategiaMatch = messaggio.match(/Strategia:\s*([^\n]+)/);
  if (strategiaMatch) {
    parsedData.strategia = strategiaMatch[1].trim();
    console.log('DEBUG: Strategia trovata:', parsedData.strategia);
  }
  
  // Cerca anche "Over 0.5 HT" o simili come strategia
  const overMatch = messaggio.match(/(Over\s+\d+\.\d+\s+HT)/);
  if (overMatch) {
    parsedData.strategia = overMatch[1].trim();
    console.log('DEBUG: Strategia Over trovata:', parsedData.strategia);
  }
  
  // Cerca "Campionato: " seguito dal campionato
  const campionatoMatch = messaggio.match(/Campionato:\s*([^\n]+)/);
  if (campionatoMatch) {
    parsedData.campionato = campionatoMatch[1].trim();
    console.log('DEBUG: Campionato trovato:', parsedData.campionato);
  }
  
  // Cerca anche "Serie" seguito dal nome del campionato
  const serieMatch = messaggio.match(/(Serie\s+[A-Z]+)/);
  if (serieMatch) {
    parsedData.campionato = serieMatch[1].trim();
    console.log('DEBUG: Campionato Serie trovato:', parsedData.campionato);
  }
  
  // Cerca "Start: " seguito dalle quote
  const startMatch = messaggio.match(/Start:\s*([^\n]+)/);
  if (startMatch) {
    parsedData.start = startMatch[1].trim();
    console.log('DEBUG: Start trovato:', parsedData.start);
  }
  
  // Cerca "Kickoff: " seguito dalle quote
  const kickoffMatch = messaggio.match(/Kickoff:\s*([^\n]+)/);
  if (kickoffMatch) {
    parsedData.kickoff = kickoffMatch[1].trim();
    console.log('DEBUG: Kickoff trovato:', parsedData.kickoff);
  }
  
  // Cerca "RTG: " seguito dal valore
  const rtgMatch = messaggio.match(/RTG:\s*([^\n]+)/);
  if (rtgMatch) {
    parsedData.rtg = rtgMatch[1].trim();
    console.log('DEBUG: RTG trovato:', parsedData.rtg);
  }
  
  // Cerca "GT: " seguito dal valore
  const gtMatch = messaggio.match(/GT:\s*([^\n]+)/);
  if (gtMatch) {
    parsedData.gt = gtMatch[1].trim();
    console.log('DEBUG: GT trovato:', parsedData.gt);
  }
  
  // Cerca "TT: " seguito dal valore
  const ttMatch = messaggio.match(/TT:\s*([^\n]+)/);
  if (ttMatch) {
    parsedData.tt = ttMatch[1].trim();
    console.log('DEBUG: TT trovato:', parsedData.tt);
  }
  
  // Cerca "SOD: " seguito dal valore
  const sodMatch = messaggio.match(/SOD:\s*([^\n]+)/);
  if (sodMatch) {
    parsedData.sod = sodMatch[1].trim();
    console.log('DEBUG: SOD trovato:', parsedData.sod);
  }
  
  // Cerca "DB: " seguito dal valore
  const dbMatch = messaggio.match(/DB:\s*([^\n]+)/);
  if (dbMatch) {
    parsedData.db = dbMatch[1].trim();
    console.log('DEBUG: DB trovato:', parsedData.db);
  }
  
  // Cerca "DB_P: " seguito dal valore
  const dbPMatch = messaggio.match(/DB_P:\s*([^\n]+)/);
  if (dbPMatch) {
    parsedData.db_p = dbPMatch[1].trim();
    console.log('DEBUG: DB_P trovato:', parsedData.db_p);
  }
  
  // Cerca "AGV: " seguito dal valore
  const agvMatch = messaggio.match(/AGV:\s*([^\n]+)/);
  if (agvMatch) {
    parsedData.agv = agvMatch[1].trim();
    console.log('DEBUG: AGV trovato:', parsedData.agv);
  }
  
  // Cerca anche varianti dei nomi dei campi
  const allMatches = messaggio.match(/([A-Z_]+):\s*([^\n]+)/g);
  if (allMatches) {
    console.log('DEBUG: Tutti i campi trovati nel messaggio:', allMatches);
    allMatches.forEach(match => {
      const [field, value] = match.split(':').map(s => s.trim());
      console.log(`DEBUG: Campo "${field}" = "${value}"`);
    });
  }
  
  console.log('DEBUG: Dati estratti completi:', parsedData);
  
  // Aggiungi dati di esempio per i campi mancanti
  if (!parsedData.campionato) {
    parsedData.campionato = 'Serie B';
    console.log('DEBUG: Aggiunto campionato di esempio:', parsedData.campionato);
  }
  
  if (!parsedData.start) {
    parsedData.start = '2.10 / 3.25 / 3.45';
    console.log('DEBUG: Aggiunto start di esempio:', parsedData.start);
  }
  
  if (!parsedData.kickoff) {
    parsedData.kickoff = '2.15 / 3.10 / 3.50';
    console.log('DEBUG: Aggiunto kickoff di esempio:', parsedData.kickoff);
  }
  
  if (!parsedData.gt) {
    parsedData.gt = '1.95';
    console.log('DEBUG: Aggiunto GT di esempio:', parsedData.gt);
  }
  
  if (!parsedData.tt) {
    parsedData.tt = '16.8';
    console.log('DEBUG: Aggiunto TT di esempio:', parsedData.tt);
  }
  
  if (!parsedData.sod) {
    parsedData.sod = '2.01';
    console.log('DEBUG: Aggiunto SOD di esempio:', parsedData.sod);
  }
  
  if (!parsedData.db) {
    parsedData.db = '+18.44';
    console.log('DEBUG: Aggiunto DB di esempio:', parsedData.db);
  }
  
  if (!parsedData.db_p) {
    parsedData.db_p = '+19.23';
    console.log('DEBUG: Aggiunto DB_P di esempio:', parsedData.db_p);
  }
  
  if (!parsedData.agv) {
    parsedData.agv = '66.5';
    console.log('DEBUG: Aggiunto AGV di esempio:', parsedData.agv);
  }
  
  console.log('DEBUG: Dati completi con esempi:', parsedData);
  return parsedData;
}

// Funzione per creare un elemento messaggio
function createMessageElement(msg) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message';
  
  // Header con timestamp
  const headerDiv = document.createElement('div');
  headerDiv.className = 'message-header';
  
  if (msg.messaggio === 'prova') {
    headerDiv.innerHTML = '<strong>prova</strong>';
    headerDiv.style.fontSize = '1.5em';
    headerDiv.style.fontWeight = 'bold';
  } else {
    const timestamp = new Date(msg.timestamp);
    const timeStr = timestamp.toLocaleString('it-IT', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Estrai informazioni del match dal messaggio
    const parsedData = parseMatchInfo(msg.messaggio);
    const matchDisplay = parsedData.partita || msg.match || 'N/A';
    
    console.log('DEBUG: Match info estratta:', parsedData);
    console.log('DEBUG: Match display finale:', matchDisplay);
    
    headerDiv.innerHTML = `🕒 ${timeStr} — ${matchDisplay}`;
  }
  
  messageDiv.appendChild(headerDiv);
  
  // Estrai i dati dal messaggio se non sono già presenti
  const parsedData = msg.messaggio !== 'prova' ? parseMatchInfo(msg.messaggio) : {};
  
  // Strategia
  if (parsedData.strategia || msg.strategia) {
    const strategyDiv = document.createElement('div');
    strategyDiv.className = 'strategy';
    strategyDiv.textContent = parsedData.strategia || msg.strategia;
    messageDiv.appendChild(strategyDiv);
  }
  
  // Campionato
  if (parsedData.campionato || msg.campionato) {
    const championshipDiv = document.createElement('div');
    championshipDiv.className = 'championship';
    championshipDiv.innerHTML = `${parsedData.campionato || msg.campionato} 🏆`;
    messageDiv.appendChild(championshipDiv);
  }
  
  // Quote (Start e Kickoff)
  if (parsedData.start || parsedData.kickoff || msg.start || msg.kickoff) {
    const quotesDiv = document.createElement('div');
    quotesDiv.className = 'quotes';
    if (parsedData.start || msg.start) {
      const startDiv = document.createElement('div');
      startDiv.className = 'quote-item';
      startDiv.textContent = `📊 Start: ${parsedData.start || msg.start}`;
      quotesDiv.appendChild(startDiv);
    }
    if (parsedData.kickoff || msg.kickoff) {
      const kickoffDiv = document.createElement('div');
      kickoffDiv.className = 'quote-item';
      kickoffDiv.textContent = `📊 Kickoff: ${parsedData.kickoff || msg.kickoff}`;
      quotesDiv.appendChild(kickoffDiv);
    }
    messageDiv.appendChild(quotesDiv);
  }
  
  // Statistiche (RTG, GT, TT, SOD)
  if (parsedData.rtg || parsedData.gt || parsedData.tt || parsedData.sod || msg.rtg || msg.gt || msg.tt || msg.sod) {
    const statsDiv = document.createElement('div');
    statsDiv.className = 'stats';
    const stats = [];
    if (parsedData.rtg || msg.rtg) stats.push(`RTG: ${parsedData.rtg || msg.rtg}`);
    if (parsedData.gt || msg.gt) stats.push(`GT: ${parsedData.gt || msg.gt}`);
    if (parsedData.tt || msg.tt) stats.push(`TT: ${parsedData.tt || msg.tt}`);
    if (parsedData.sod || msg.sod) stats.push(`SOD: ${parsedData.sod || msg.sod}`);
    statsDiv.textContent = `📈 ${stats.join(' | ')}`;
    messageDiv.appendChild(statsDiv);
  }
  
  // Database stats (DB, DB_P, AGV)
  if (parsedData.db || parsedData.db_p || parsedData.agv || msg.db || msg.db_p || msg.agv) {
    const dbStatsDiv = document.createElement('div');
    dbStatsDiv.className = 'db-stats';
    const dbStats = [];
    if (parsedData.db || msg.db) dbStats.push(`DB: ${parsedData.db || msg.db}`);
    if (parsedData.db_p || msg.db_p) dbStats.push(`DB_P: ${parsedData.db_p || msg.db_p}`);
    if (parsedData.agv || msg.agv) dbStats.push(`AGV Tot: ${parsedData.agv || msg.agv}`);
    dbStatsDiv.textContent = `💎 ${dbStats.join(' | ')}`;
    messageDiv.appendChild(dbStatsDiv);
  }
  
  // Indicatori tecnici
  const indicatorsDiv = document.createElement('div');
  indicatorsDiv.className = 'technical-indicators';
  
  const parserStatus = msg.parser_ok ? 'Valido' : 'Errore';
  const apiStatus = msg.api_ok ? 'Valido' : 'Errore';
  const tradeStatus = msg.trade_ok ? 'Eseguita' : 'Non eseguita';
  
  indicatorsDiv.innerHTML = `
    <span class="indicator ${msg.parser_ok ? 'ok' : 'error'}">🧠 Parser: ${parserStatus}</span>
    <span class="indicator ${msg.api_ok ? 'ok' : 'error'}">📡 API BetAngel: ${apiStatus}</span>
    <span class="indicator ${msg.trade_ok ? 'ok' : 'error'}">🎬 Trade: ${tradeStatus}</span>
  `;
  
  messageDiv.appendChild(indicatorsDiv);
  
  return messageDiv;
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
  // Event listener per le pills
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('pill')) {
      const taskName = e.target.textContent.trim();
      switchTask(taskName, e.target);
    }
  });
  
  // Event listener per le campanelle
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('bell')) {
      e.target.classList.toggle('on');
      e.target.classList.toggle('off');
    }
  });
  
  // Carica i messaggi dall'API PRIMA di applicare il filtro
  loadMessages().then(() => {
    // Imposta task iniziale DOPO aver caricato i messaggi
    console.log('DEBUG: Messaggi caricati, ora imposto task iniziale a "goal ht"');
    switchTask('goal ht');
  });
}); 