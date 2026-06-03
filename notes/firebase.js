// Выгрузка (без изменений)
async function uploadToCloud(note) {
  if (!navigator.onLine) throw new Error('Нет интернета');

  const formData = new FormData();

  const blob = new Blob([note.audioBuffer], { type: note.mimeType || 'audio/webm' });
  formData.append('voice', blob, `recording-${new Date(note.timestamp).toISOString()}.webm`);
  formData.append('id_hiking', 87);
  formData.append('comment', note.text);
  formData.append('created_at', new Date(note.timestamp).toISOString());
  formData.append('coordinates', [note.lat, note.lng].filter(Boolean).join(','))


  const response = await fetch('http://localhost:8002/ajax/hiking/notes/note_add.php', 
    { method: 'POST', body: formData });
    const data = await response.json();
    if (data.success) {
        console.log('Текст:', data);
    } else {
        console.error(data.error);
    }

  const downloadURL = data.audio_url;
  return { downloadURL, uploadedAt: Date.now() };
}

async function uploadSingleNote(note) {
  if (!navigator.onLine) { alert('Нет интернета'); return false; }
  if (note.downloadURL) { alert('Уже выгружена'); return true; }
  try {
    const { downloadURL, uploadedAt } = await uploadToCloud(note);
    await updateNote(note.id, { downloadURL, uploadedAt });
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
  geoStatus.innerText = `☁️ Выгружаю ${notUploaded.length}...`;
  let success = 0;
  for (const note of notUploaded) {
    try {
      const { downloadURL, uploadedAt } = await uploadToCloud(note);
      await updateNote(note.id, { downloadURL, uploadedAt });
      success++;
    } catch(e) { console.warn(e); }
  }
  geoStatus.innerText = `✅ Выгружено ${success} из ${notUploaded.length}`;
  setTimeout(() => { geoStatus.innerText = `...`; }, 3000);
}
