# RisikoSemplificato

Nella pagina principale (index) abbiamo le regole del gioco e il client ha l'opportunità di partecipare alla partita premendo il tasto inizia a giocare.

Il server gestisce una partita alla volta (al momento) alla quale possono partecipare dai 2 ai 4 giocatori.

Il file app.js è il codice del server che gestisce le connessioni tramite socket (una per ogni client) e lo scambio di messaggi.
Nella cartella client si hanno i file index.html (che è l'indice iniziale del client) e map.html che è la pagina in cui si svolge il gioco vero e proprio.
Nella cartella client abbiamo altre due cartelle che sono img che contiene le immagini e js che contiene file javascript di supporto (al momento il file states.js che contiene la lista degli stati, dei continenti, dei colori e dei simboli.

Lo scheletro dell'applicazione lato server è quasi completato (manca la fase di debug in seguito all'utilizzo del server stesso).
Lo scheletro dell'applicazione lato client è pronto per quanto riguarda la pagina di index ed in terminazione per quanto riguarda la pagina map.

Per l'utilizzo:
  nmp install express
  nmp install socket.io
  node app.js
  
  dopo aprire il browser ed andare sulla pagina http://localhost:4040/.
