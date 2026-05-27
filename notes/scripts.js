(function(){
    // ----------------------------- Firebase (опционально) -----------------------------
    const firebaseConfig = {
      apiKey: "ВАШ_API_KEY",
      authDomain: "ВАШ_PROJECT.firebaseapp.com",
      projectId: "ВАШ_PROJECT_ID",
      storageBucket: "ВАШ_BUCKET.appspot.com",
      appId: "ВАШ_APP_ID"
    };
    let storageRef = null;
    let firebaseInitialized = false;
    if (typeof firebase !== 'undefined' && firebaseConfig.apiKey !== "ВАШ_API_KEY") {
      try {
        if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
        storageRef = firebase.storage().ref();
        firebaseInitialized = true;
      } catch(e) { console.warn(e); }
    }

  

    let mediaRecorder = null;
    let audioChunks = [];
    let recordingStartTime = null;
    let timerInterval = null;
    let currentCoords = null;
    let isRecording = false;
    let mediaStream = null;
    let coords = {lat: null, lng: null}

    const recordBtn = document.getElementById('recordBtn');
    const timerDisplay = document.getElementById('timerDisplay');
    const notesContainer = document.getElementById('notesContainer');
    const geoStatusSpan = document.getElementById('geoStatus');
    const uploadAllBtn = document.getElementById('uploadAllBtn');
    const saveTextBtn = document.getElementById('saveTextBtn');
    const textNoteContent = document.getElementById('textNoteContent');
    const textInfo = document.getElementById('textInfo');
    const textNoteAddModal = document.getElementById('textNoteAddModal');
    const voiceNoteAddModal = document.getElementById('voiceNoteAddModal');
    const noteViewModal = document.getElementById('noteViewModal');

   

    // ----------------------------- Вспомогательные -----------------------------
    function formatDuration(sec) {
      const minutes = Math.floor(sec / 60);
      const seconds = Math.floor(sec % 60);
      return `${minutes>0?minutes+':':''}${seconds.toString().padStart(2,'0')}с`;
    }

    function formatFileSize(bytes) {
      if (!bytes) return '0 B';
      return bytes < 1024 ? `${bytes} B` : `${(bytes/1024).toFixed(1)} KB`;
    }

    async function updateCurrentLocation() {
      geoStatus.textContent = 'Requested...';
      coords = {lat: null, lng: null}
      if (!navigator.geolocation) return null;
      return new Promise((resolve) => {
        geoStatus.textContent = 'Awaiting...'
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            
            coords = {lat: pos.coords.latitude, lng: pos.coords.longitude}
            geoStatus.textContent = `${pos.coords.latitude.toFixed(5)},${pos.coords.longitude.toFixed(5)}`
            resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          },
          (e) => {
            geoStatus.textContent = e.message;
            resolve(null);
          },
          { enableHighAccuracy: false, timeout: 8000, maximumAge: 10000 }
        );
      });
    }

    async function showNote(note) {
      noteViewModal.innerHTML = '';
      noteViewModal.append(crEl('section',
        crEl('h1', {}, note.id),
        crEl('textarea', {placeholder:'Текст', e:{change:async (e)=>{
          await updateNote(note.id, { text: e.target.value })
        }}}, note.text),
        crEl('div', {},
          crEl('span', {}, 'Дата'),
          crEl('span', {}, new Date(note.timestamp).toLocaleString())
        ),
        note.type === 'audio' && crEl('aside', {},
          crEl('h4',{},
            note.mimeType || 'audio/webm',
            ' ',
            formatDuration(note.duration),
            ' ',
            formatFileSize(note.audioBuffer?.byteLength)
          ),
          note?.audioBuffer && crEl('audio', {controls:true, src:URL.createObjectURL(new Blob([note.audioBuffer], { type: note.mimeType || 'audio/webm' }))}),
        
          crEl('button',{e:{
            click: (e) => {
              if (note?.audioBuffer) {
                const blob = new Blob([note.audioBuffer], { type: note.mimeType || 'audio/webm' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `poh_note_${new Date(note.timestamp).toISOString()}.webm`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(() => URL.revokeObjectURL(url), 100);
              } else alert('Файл недоступен');
            }
          }},'Download')
        ),
        note.lat && note.lng && crEl('div',
          crEl('a',{href: `geo:${note.lat},${note.lng}`}, `${note.lat.toFixed(5)}, ${note.lng.toFixed(5)}`)
        ),
        crEl('footer', {},
          crEl('button',{e:{
            click: async (e) => {
              if (confirm('Удалить заметку?')) {
                await deleteNoteById(note.id);
                noteViewModal.close();
                renderNotesList();
              }
            }
          }},'Delete'),
          crEl('button',{e:{
            click: async (e) => {
              await uploadSingleNote(note);
            }
          }},'Upload')
        )
      ));
      noteViewModal.showModal();
    }

    // Выгрузка (без изменений)
    async function uploadToCloud(note) {
      if (!navigator.onLine) throw new Error('Нет интернета');
      if (!firebaseInitialized || !storageRef) {
        await new Promise(r => setTimeout(r, 500));
        return { downloadURL: `mock://cloud/${note.id}_${Date.now()}`, uploadedAt: Date.now() };
      }
      const blob = new Blob([note.audioBuffer], { type: note.mimeType || 'audio/webm' });
      const fileName = `notes/${note.id}_${note.timestamp}.webm`;
      const fileRef = storageRef.child(fileName);
      const snapshot = await fileRef.put(blob);
      const downloadURL = await snapshot.ref.getDownloadURL();
      return { downloadURL, uploadedAt: Date.now() };
    }

    async function uploadSingleNote(note) {
      if (!navigator.onLine) { alert('Нет интернета'); return false; }
      if (!note || note.type !== 'audio') { alert('Только аудио можно выгрузить'); return false; }
      if (note.downloadURL) { alert('Уже выгружена'); return true; }
      try {
        const { downloadURL, uploadedAt } = await uploadToCloud(note);
        await updateNote(noteId, { downloadURL, uploadedAt });
        await renderNotesList();
        return true;
      } catch(e) {
        alert('Ошибка выгрузки: ' + e.message);
        return false;
      }
    }

    async function uploadAllNotes() {
      if (!navigator.onLine) { alert('Нет интернета'); return; }
      const notes = await getAllNotes();
      const notUploaded = notes.filter(n => n.type === 'audio' && !n.downloadURL);
      if (!notUploaded.length) { alert('Все аудиозаметки выгружены'); return; }
      geoStatusSpan.innerText = `☁️ Выгружаю ${notUploaded.length}...`;
      let success = 0;
      for (const note of notUploaded) {
        try {
          const { downloadURL, uploadedAt } = await uploadToCloud(note);
          await updateNote(note.id, { downloadURL, uploadedAt });
          success++;
        } catch(e) { console.warn(e); }
      }
      await renderNotesList();
      geoStatusSpan.innerText = `✅ Выгружено ${success} из ${notUploaded.length}`;
      setTimeout(() => { if(!isRecording) geoStatusSpan.innerText = `📍 GPS: готов`; }, 3000);
    }

    // ----------------------------- Отрисовка списка -----------------------------
    async function renderNotesList() {
      if (!db) return;
      const notes = await getAllNotes();
      if (!notes.length) {
        notesContainer.innerHTML = `<div class="empty-msg">Нет заметок</div>`;
        return;
      }

      notesContainer.innerHTML = '';

      notesContainer.append(crEl('ul',{c:'notes-list'},
        notes.map((note)=>{
          const date = new Date(note.timestamp);
          const timeStr = date.toLocaleString(undefined, { hour:'2-digit', minute:'2-digit', day:'2-digit', month:'short' });

          return crEl('li', {e:{click: ()=> showNote(note)}},
            crEl('strong', {}, timeStr),
            crEl('span', crEl('em', note.text || `Rec ${formatDuration(note.duration)}`)),
            note.type === 'audio' && crEl('aside', {},
              formatDuration(note.duration),
              formatFileSize(note.audioBuffer?.byteLength)
            ),
            crEl('small', {}, note.lat && note.lng ? `📍` : '🌐')
          )
        })
      ));
    }

    function escapeHtml(str) { return str.replace(/[&<>]/g, function(m){if(m==='&') return '&amp;'; if(m==='<') return '&lt;'; if(m==='>') return '&gt;'; return m;}); }

    // ----------------------------- Аудиозапись (одна кнопка) -----------------------------
    async function startRecording() {
      if (isRecording) return;
      try {

        updateCurrentLocation();
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStream = stream;
        let mimeType = '';
        const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
        for (const type of candidates) {
          if (MediaRecorder.isTypeSupported(type)) { mimeType = type; break; }
        }
        if (!mimeType) mimeType = 'audio/webm';
        mediaRecorder = new MediaRecorder(stream, { mimeType, audioBitsPerSecond: 32000 });
        audioChunks = [];
        mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunks.push(e.data); };
        mediaRecorder.onstop = async () => {
          const rawBlob = new Blob(audioChunks, { type: mimeType });
          const arrayBuffer = await rawBlob.arrayBuffer();
          const duration = (Date.now() - recordingStartTime) / 1000;
          const timestamp = recordingStartTime;
          const note = {
            id: crypto.randomUUID(),
            type: 'audio',
            timestamp: timestamp,
            duration: duration,
            audioBuffer: arrayBuffer,
            mimeType: mimeType,
            lat: coords?.lat || null,
            lng: coords?.lng || null,
            text: '',
            downloadURL: null,
            uploadedAt: null
          };
          await saveNote(note);
          await renderNotesList();
          if (timerInterval) clearInterval(timerInterval);
          timerDisplay.textContent = '00:00.0';
          if (mediaStream) {
            mediaStream.getTracks().forEach(t => t.stop());
            mediaStream = null;
          }
          isRecording = false;
          recordBtn.textContent = '🎤 Начать запись';
          recordBtn.classList.remove('btn-secondary');
          recordBtn.classList.add('btn-primary');
          geoStatusSpan.innerHTML = `📍 GPS: готов`;
          voiceNoteAddModal.close()
        };
        mediaRecorder.start(1000);
        recordingStartTime = Date.now();
        isRecording = true;
        recordBtn.textContent = '⏹️ Остановить запись';

        timerInterval = setInterval(() => {
          if (!recordingStartTime) return;
          const elapsed = (Date.now() - recordingStartTime) / 1000;
          const mins = Math.floor(elapsed / 60);
          const secs = (elapsed % 60).toFixed(1);
          timerDisplay.textContent = `${mins.toString().padStart(2,'0')}:${secs.toString().padStart(4,'0')}`;
        }, 100);
      } catch(err) {
        alert('Нет доступа к микрофону');
        if (mediaStream) mediaStream.getTracks().forEach(t => t.stop());
        isRecording = false;
        recordBtn.textContent = '🎤 Начать запись';
        recordBtn.classList.remove('btn-secondary');
        recordBtn.classList.add('btn-primary');
      }
    }

    function stopRecording() {
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      } else {
        if (timerInterval) clearInterval(timerInterval);
        isRecording = false;
        recordBtn.textContent = '🎤 Начать запись';
        recordBtn.classList.remove('btn-secondary');
        recordBtn.classList.add('btn-primary');
        if (mediaStream) mediaStream.getTracks().forEach(t => t.stop());
        mediaStream = null;
      }
    }

    function toggleRecording() {
      if (isRecording) stopRecording();
      else startRecording();
    }

    // ----------------------------- Текстовая заметка (с координатами) -----------------------------
    async function saveTextNote() {
      const text = textNoteContent.value.trim();
      if (!text) { textInfo.innerText = 'Введите текст'; return; }
  
      const timestamp = Date.now();
      // Имя не запрашиваем – оно будет равно тексту (отображается в списке)
      const note = {
        id: crypto.randomUUID(),
        type: 'text',
        timestamp: timestamp,
        text: text,
        lat: coords?.lat || null,
        lng: coords?.lng || null
      };
      await saveNote(note);
      textNoteContent.value = '';
      textInfo.innerText = '✅ Сохранено с координатами';
      textNoteAddModal.close()
      setTimeout(() => textInfo.innerText = '', 2000);
      await renderNotesList();
    }

    // ----------------------------- Глубокие ссылки и shortcuts -----------------------------
    function handleDeepLink(url) {
      try {
        const u = new URL(url);
        if (u.protocol === 'pohodnik:') {
          if (u.pathname === '//new-voice-note' || u.pathname === '/new-voice-note') {
            voiceNoteAddModal.showModal();
            startRecording();
          } else if (u.pathname === '//new-text-note' || u.pathname === '/new-text-note') {
            textNoteAddModal.showModal()
            textNoteContent.focus();
            textInfo.innerText = '📝 Готово к вводу текстовой заметки';
            setTimeout(() => textInfo.innerText = '', 3000);
          }
        }
      } catch(e) {}
    }

    window.addEventListener('load', () => {
      if (window.location.protocol === 'pohodnik:') handleDeepLink(window.location.href);
    });
    window.addEventListener('message', (e) => { if (e.data && e.data.type === 'deep-link') handleDeepLink(e.data.url); });

    function handleUrlParams() {
      const params = new URLSearchParams(window.location.search);
      const action = params.get('action');
      if (action === 'voice') startRecording();
      else if (action === 'text') textNoteContent.focus();
    }

    // ----------------------------- Service Worker (PWA) -----------------------------
    function installServiceWorker() {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            registration.addEventListener("updatefound", () => {
              // If updatefound is fired, it means that there's
              // a new service worker being installed.
              const installingWorker = registration.installing;
              console.log(
                "A new service worker is being installed:",
                installingWorker,
              );

              // You can listen for changes to the installing service worker's
              // state via installingWorker.onstatechange
            });
          })
          .catch((error) => {
            console.error(`Service worker registration failed: ${error}`);
          });
      } else {
        console.error("Service workers are not supported.");
      }    
  }

    // ----------------------------- Инициализация -----------------------------
    window.addEventListener('load', async () => {
      await initDB();
      await renderNotesList();
      recordBtn.onclick = toggleRecording;
      saveTextBtn.onclick = saveTextNote;
      uploadAllBtn.onclick = uploadAllNotes;
      fabMicrophone.onclick = () => {
        voiceNoteAddModal.showModal();
        startRecording();
      }
      fabText.onclick = () => {
        updateCurrentLocation();
        textNoteAddModal.showModal();
      }

      installServiceWorker();
      handleUrlParams();
      window.addEventListener('online', () => document.getElementById('offlineBadge').innerText = 'online ready');
      window.addEventListener('offline', () => document.getElementById('offlineBadge').innerText = 'offline mode');

    });
  })();