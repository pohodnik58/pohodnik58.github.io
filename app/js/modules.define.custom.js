modules.define('welcome',{
    files:['pages/welcome.js']
});

modules.define('hiking',{
    files:['pages/hiking.js']
});
modules.define('members',{
    files:['pages/members.js']
});
modules.define('route',{
    dependensies:['leaflet','leaflet-gpx'],
    files:['pages/route.js']
});
modules.define('about',{
    files:['pages/about.js']
});
