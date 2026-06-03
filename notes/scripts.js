(function(){
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
      return `${minutes>0?minutes+':':''}${seconds.toString().padStart(2,'0')} сек`;
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
      noteViewModal.append(crEl('section',{s:{display:'flex', flexDirection:'column', gap:'8px'}},
        crEl('h4', {s:{margin:'0'}}, note.id),
        crEl('textarea', {placeholder:'Текст', e:{change:async (e)=>{
          await updateNote(note.id, { text: e.target.value })
        }}}, note.text),
        crEl('div', {s:{display:'flex', gap:'8px'}},
          crEl('span', {}, 'Дата'),
          crEl('span', {}, new Date(note.timestamp).toLocaleString())
        ),
        note.type === 'audio' && crEl('aside', {},
          crEl('h4',{s:{margin:0}},
            note.mimeType || 'audio/webm',
            ' ',
            formatDuration(note.duration),
            ' / ',
            formatFileSize(note.audioBuffer?.byteLength)
          ),
          note?.audioBuffer && crEl({s:{display:'flex', gap:'8px', margin:'8px 0'}}, 
            crEl('audio', {
              s:{flexGrow: 1},
              controls:true,
              src:URL.createObjectURL(new Blob([note.audioBuffer], { type: note.mimeType || 'audio/webm' }))
            }),
        
          crEl('button',{c:'btn btn-outline',e:{
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
          }},'Download'))
        ),
        note.lat && note.lng && crEl('div',
          crEl('a',{href: `geo:${note.lat},${note.lng}`}, `${note.lat.toFixed(5)}, ${note.lng.toFixed(5)}`)
        ),
        crEl('footer', {s:{display:'flex', justifyContent:'space-between', gap:'8px'}},
          crEl('button',{c:'btn btn-secondary', e:{
            click: async (e) => {
              e.target.disabled = true;
              if (confirm('Удалить заметку?')) {
                await deleteNoteById(note.id);
                noteViewModal.close();
                renderNotesList();
              }
            }
          }},'Delete'),
          note.type === 'audio' && !note.uploadedAt && crEl('button',{c:'btn btn-secondary',e:{
            click: async (e) => {
              e.target.disabled = true;
              await uploadSingleNote(note);
              e.target.disabled = false;
              setTimeout(async ()=> {
                noteViewModal.close();
              renderNotesList();
              },600);
            }
          }},'Upload to cloud ☁️')
        )
      ));
      noteViewModal.showModal();
    }

    // ----------------------------- Отрисовка списка -----------------------------
    async function renderNotesList() {
      if (!db) return;
      const notes = await getAllNotes();
      if (!notes.length) {
        notesContainer.innerHTML = `<div class="empty-msg">Нет заметок</div>`;
        return;
      }
      const needToUpload = notes.filter(x =>x.type==='audio' && !x.uploadedAt)
      uploadAllBtn.textContent = `☁️ Выгрузить все ${needToUpload.length ? ` (${needToUpload.length})`:''}`

      notesContainer.innerHTML = '';

      notesContainer.append(crEl('ul',{c:'notes-list'},
        notes.map((note)=>{
          const date = new Date(note.timestamp);
          const timeStr = date.toLocaleString(
            undefined,
            {
              hour:'2-digit',
              minute:'2-digit',
              day:'2-digit',
              month: '2-digit'
          });

          return crEl('li', {e:{click: ()=> showNote(note)}},
            crEl('strong', {c:'date'}, timeStr),
            crEl('span',{c:'text'},
              crEl('em', note.text || `Rec ${formatDuration(note.duration)}`)
            ),
            note.type === 'audio' && crEl('aside', {c:'audio'},
              formatDuration(note.duration),
              ' / ',
              formatFileSize(note.audioBuffer?.byteLength)
            ),
            crEl('small', {c:'geo', s:'text-align: end'}, 
              note.lat && note.lng ? `📍` : '🌐',
              '  ',
              note.downloadURL && '✅'
            )
          )
        })
      ));
    }

    // ----------------------------- Аудиозапись -----------------------------
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
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunks.push(e.data);
        };
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
        if (mediaStream) mediaStream.getTracks().forEach(t => t.stop());
        mediaStream = null;
      }
    }

    function toggleRecording() {
      if (isRecording) stopRecording();
      else startRecording();
    }

    // ------ Текстовая заметка ------------
    async function saveTextNote() {
      const text = textNoteContent.value.trim();
      if (!text) { textInfo.innerText = 'Введите текст'; return; }
  
      const timestamp = Date.now();
  
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

    window.addEventListener('load', async () => {
      await initDB();
      await renderNotesList();
      recordBtn.onclick = toggleRecording;
      saveTextBtn.onclick = saveTextNote;
      uploadAllBtn.onclick = async () => {
        await uploadAllNotes();
        await renderNotesList();
      }
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

    });
  })()