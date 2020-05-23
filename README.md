# RisikoSemplificato

Nella pagina principale (index) abbiamo le regole del gioco e il client ha l'opportunità di partecipare alla partita premendo il tasto inizia a giocare.

Il server gestisce una partita alla volta (al momento) alla quale possono partecipare dai 2 ai 4 giocatori.

Il file app.js è il codice del server che gestisce le connessioni tramite socket (una per ogni client) e lo scambio di messaggi.
Nella cartella client si hanno i file index.html (che è l'indice iniziale del client) e map.html che è la pagina in cui si svolge il gioco vero e proprio.
Nella cartella client abbiamo altre due cartelle che sono img che contiene le immagini e js che contiene file javascript di supporto (al momento il file info.js che contiene la lista degli stati, dei continenti, dei colori e dei simboli, degli stati possibili del giocatore all'interno della partita e dei suggerimenti.

Ogni stato in states ha: un nome, il continente alla quale appartiene, un valore di x ed y che corrispondono alla posizione del nome dello stato nel canvas, radius che è il raggio della circonferenza cliccabile disegnata ed infine un array neighbor di stati confinanti.

Ogni continente in continents ha: un nome, il numero di stati e il bonus che viene conferito se si possiede l'intero continente.

L'array symbols contiene la lista dei simboli delle carte pescate con il relativo bonus assegnato in caso di scambio (4 carri armati per un tris di Cannoni, 6 carri armati per un tris di Fanti, 6 carri armati per un tris di Cavalieri, 10 carri armati per un tris di carte tutte diverse ed infine 12 carri armati se si hanno due simboli uguali ed uno diverso.

L'array colors contiene la lista dei possibili colori dei giocatori.

L'array playerState contiene la lista dei possibili stati in cui si può trovare un giocatore.

L'array suggestions contiene la lista dei suggerimenti che vengono dati all'utente in base al proprio stato.

Lo scheletro dell'applicazione lato server è quasi completato (manca la fase di debug in seguito all'utilizzo del server stesso).
Lo scheletro dell'applicazione lato client è pronto per quanto riguarda la pagina di index ed in terminazione per quanto riguarda la pagina map.

Per l'utilizzo:

      nmp install express
  
      nmp install socket.io
  
      node app.js
  
  dopo aprire il browser ed andare sulla pagina http://localhost:4040/.

Durante lo svolgimento del gioco, il giocatore riceve delle informazioni dal server. Esso mostrerà:

      il proprio nickname;

      la lista dei giocatori partecipanti alla partita;

      il giocatore che è in turno e cosa sta facendo;

      le carte simbolo disponibili al giocatore;

      le azioni possibili del giocatore (se è in fase di assegnazione delle truppe ad inizio turno può ad esempio 
      scambiare le carte simbolo con delle truppe, se è in fase di attacco può terminare la fase di attacco oppure 
      se il giocatore è in fase di spostamento può scegliere di non effettuarlo);

      alcuni suggerimenti per il giocatore in base al suo stato corrente.



Inoltre è possibile scrivere in una chat alla quale sono connessi tutti i partecipanti.


Parti funzionanti:

            registrazione nel server e verifica presenza nickname,
            assegnamento stati ed inizializzazione corretta dei giocatori quando la partita inizia,
            chat tra i giocatori,
            assegnamento truppe nei propri territori,
            saltare fase di spostamento o terminare fase di attacco con il bottone,
            fase di spostamento.
