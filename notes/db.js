// ----------------------------- IndexedDB -----------------------------
const DB_NAME = 'pohNotesDB';
const DB_VERSION = 8;
const STORE_NAME = 'notes';
let db = null;

function initDB() {
return new Promise((resolve, reject) => {
  const request = indexedDB.open(DB_NAME, DB_VERSION);
  request.onerror = (e) => reject('DB error: ' + e.target.error);
  request.onsuccess = (e) => { db = e.target.result; resolve(db); };
  request.onupgradeneeded = (e) => {
    const dbRef = e.target.result;
    if (!dbRef.objectStoreNames.contains(STORE_NAME)) {
      dbRef.createObjectStore(STORE_NAME, { keyPath: 'id' });
    }
  };
});
}

async function saveNote(note) {
  const tx = db.transaction([STORE_NAME], 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  store.put(note);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = (e) => reject(e);
  });
}

async function getAllNotes() {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => {
      const notes = request.result || [];
      notes.sort((a,b) => b.timestamp - a.timestamp);
      resolve(notes);
    };
    request.onerror = (e) => reject(e);
  });
}

async function getNoteById(id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = (e) => reject(e);
  });
}

async function updateNote(id, updates) {
  const note = await getNoteById(id);
  if (!note) return;
  Object.assign(note, updates);
  await saveNote(note);
}

async function deleteNoteById(id) {
  const tx = db.transaction([STORE_NAME], 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  store.delete(id);
  return new Promise(resolve => tx.oncomplete = resolve);
}