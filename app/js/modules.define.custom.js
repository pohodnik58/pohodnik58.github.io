modules.define('welcome',{
    files:['pages/welcome.js']
});

modules.define('about',{
    files:['pages/about.js']
});
modules.define('map',{
    dependensies:['leaflet','leaflet-gpx'],
    files:['pages/map.js']
});