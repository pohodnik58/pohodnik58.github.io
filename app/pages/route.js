
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
        var point = app.hiking.route_objects.filter(function(x){return x.id = id})[0];
    L.popup()
        .setLatLng(JSON.parse(point.coordinates))
        .setContent(point.name)
        .openOn(map);
    map.setView(JSON.parse(point.coordinates), 16);
}