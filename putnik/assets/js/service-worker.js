var dataCacheName = 'putnik-v1';
var cacheName = 'putnik-1';
var filesToCache = [
	'/putnik/index.html',
	'/putnik/assets/fonts/material-design-icons/material-icons.css',
	'/putnik/assets/fonts/material-design-icons/MaterialIcons-Regular.eot',
	'/putnik/assets/fonts/material-design-icons/MaterialIcons-Regular.ijmap',
	'/putnik/assets/fonts/material-design-icons/MaterialIcons-Regular.svg',
	'/putnik/assets/fonts/material-design-icons/MaterialIcons-Regular.ttf',
	'/putnik/assets/fonts/material-design-icons/MaterialIcons-Regular.woff',
	'/putnik/assets/fonts/material-design-icons/MaterialIcons-Regular.woff2',
	'/putnik/assets/fonts/roboto/Roboto-Bold.eot',
	'/putnik/assets/fonts/roboto/Roboto-Bold.ttf',
	'/putnik/assets/fonts/roboto/Roboto-Bold.woff',
	'/putnik/assets/fonts/roboto/Roboto-Bold.woff2',
	'/putnik/assets/fonts/roboto/Roboto-Light.eot',
	'/putnik/assets/fonts/roboto/Roboto-Light.ttf',
	'/putnik/assets/fonts/roboto/Roboto-Light.woff',
	'/putnik/assets/fonts/roboto/Roboto-Light.woff2',
	'/putnik/assets/fonts/roboto/Roboto-Medium.eot',
	'/putnik/assets/fonts/roboto/Roboto-Medium.ttf',
	'/putnik/assets/fonts/roboto/Roboto-Medium.woff',
	'/putnik/assets/fonts/roboto/Roboto-Medium.woff2',
	'/putnik/assets/fonts/roboto/Roboto-Regular.eot',
	'/putnik/assets/fonts/roboto/Roboto-Regular.ttf',
	'/putnik/assets/fonts/roboto/Roboto-Regular.woff',
	'/putnik/assets/fonts/roboto/Roboto-Regular.woff2',
	'/putnik/assets/fonts/roboto/Roboto-Thin.eot',
	'/putnik/assets/fonts/roboto/Roboto-Thin.ttf',
	'/putnik/assets/fonts/roboto/Roboto-Thin.woff',
	'/putnik/assets/fonts/roboto/Roboto-Thin.woff2',
	'/putnik/assets/js/crel.min.js',
	'/putnik/assets/js/eWysiwyg.js',
	'/putnik/assets/js/jquery-1.12.0.min.js',
	//'/putnik/assets/js/main.js',
	'/putnik/assets/js/materialize.min.js',
	//'/putnik/assets/css/main.css',
	'/putnik/assets/css/materialize.css',
	'/putnik/assets/css/materialize.min.css',
	'/putnik/assets/css/normalize.css'
];

self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', function(e) {
  console.log('[ServiceWorker] Activate');
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== cacheName && key !== dataCacheName) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  /*
   * Fixes a corner case in which the app wasn't returning the latest data.
   * You can reproduce the corner case by commenting out the line below and
   * then doing the following steps: 1) load app for first time so that the
   * initial New York City data is shown 2) press the refresh button on the
   * app 3) go offline 4) reload the app. You expect to see the newer NYC
   * data, but you actually see the initial data. This happens because the
   * service worker is not yet activated. The code below essentially lets
   * you activate the service worker faster.
   */
  return self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  console.log('[Service Worker] Fetch', e.request.url);
  var dataUrl = 'https://query.yahooapis.com/v1/public/yql';
  if (e.request.url.indexOf(dataUrl) > -1) {
    /*
     * When the request URL contains dataUrl, the app is asking for fresh
     * weather data. In this case, the service worker always goes to the
     * network and then caches the response. This is called the "Cache then
     * network" strategy:
     * https://jakearchibald.com/2014/offline-cookbook/#cache-then-network
     */
    e.respondWith(
      caches.open(dataCacheName).then(function(cache) {
        return fetch(e.request).then(function(response){
          cache.put(e.request.url, response.clone());
          return response;
        });
      })
    );
  } else {
    /*
     * The app is asking for app shell files. In this scenario the app uses the
     * "Cache, falling back to the network" offline strategy:
     * https://jakearchibald.com/2014/offline-cookbook/#cache-falling-back-to-network
     */
    e.respondWith(
      caches.match(e.request).then(function(response) {
        return response || fetch(e.request);
      })
    );
  }
});
