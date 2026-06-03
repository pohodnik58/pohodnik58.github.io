
  
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
          .register("sw.js")
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

