
    app.footer.hide()
    var mapEl = crEl({s:'width:100%;height:calc(100vh - 64px)'});
    app.el.empty().append(
        mapEl
    )
    var map = L.map(mapEl).setView([53.09897176800468, 45.218009948730476], 12);
    L.tileLayer(
'https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=f2b9fd5a71384f37a108e8657a7fae3c',
        {
            maxZoom: 18
        }).addTo(map);
app.mainFloatingButton.show().empty().append(new Icon('my_location'))
    app.floatingButtons.empty();
    app.mainFloatingButton.onclick = function () {
        map.locate({setView: true, maxZoom: 16});
    }

    function onLocationFound(e) {
        var radius = e.accuracy / 2;
        L.popup()
            .setLatLng(e.latlng)
            .setContent("Вы находитесь в радиусе " + parseInt(radius) + " м. от этой точки")
            .openOn(map);

        ls.set('lastPositionTime', new Date().toString());
        ls.set('lastPosition', JSON.stringify([e.latlng.lat, e.latlng.lng]));

    }
    function onLocationError(e) {
        app.error(e.message);
    }

    map.on('locationerror', onLocationError);
    map.on('locationfound', onLocationFound);

    function showGPX(url){
        new L.GPX(url, {
            async: true,
            marker_options:{
                wptIcons:{'':new L.divIcon({html:'<div></div>'})},
                startIcon:new L.divIcon({html:'<div></div>'}),
                endIcon:new L.divIcon({html:'<div></div>'}),
            },
            polyline_options: {
                color: 'red',
                opacity: 0.75,
                weight: 3,
                lineCap: 'round'
            }
        }).on('loaded', function(e) {
            map.fitBounds(e.target.getBounds());
        }).addTo(map);
    }

    showGPX('gpx/sn_classic.gpx')
    showGPX('gpx/sn_more.gpx')



function goToPoint(id){
        var poi = app.hiking.route_objects.filter(function(x){return x.id == id})[0];
    L.popup()
        .setLatLng(JSON.parse(poi.coordinates))
        .setContent(crEl({},
            crEl('h5', poi.name),
            crEl('p',
                crEl('div',{c:'text-grey'},'Напрямую: '),
                poi.myDistance?crEl('strong', formatDistance( poi.myDistance )):'-',
                crEl('ul',{}, poi.byTrackDistance?poi.byTrackDistance.map(y=>{
                    return crEl('li',{c:'blue-text'},
                        y.name+': ' +formatDistance(y.toTrackDistance+y.fromTrackDistance+y.onTrackDistance),
                        crEl('ul',{c:'browser-default'},
                            y.toTrackDistance>50?new Li(formatDistance(y.toTrackDistance)+' oт текущего места до трека'):null,
                            new Li(formatDistance(y.onTrackDistance)+' по треку;'),
                            y.fromTrackDistance>50?new Li(formatDistance(y.fromTrackDistance)+' oт трека до точки «'+poi.name+'»;'):null
                            )
                        )
                }):'~')
            )
        ))
        .openOn(map);
    map.setView(JSON.parse(poi.coordinates), 15);
    app.msg(new Date(Date.parse(ls.get('lastPositionTime'))).toLocaleString())
}