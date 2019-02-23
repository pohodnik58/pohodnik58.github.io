function pointsRender(){
    app.el.empty().append(
        new Container(
            crEl('ul',{c:'collection with-header'},
                new Li({c:'collection-header'}, crEl('h4','Маршрутные точки')),
                app.hiking.route_objects
                    .filter(function(x){return x.id_typeobject==1})
                    .map(function(poi){
                        return new A({href:'#route/'+poi.id, title:poi.id, c:'collection-item avatar'},
                            new Icon({c:'circle red'},'place'),
                            crEl('span',{c:'title'}, crEl('strong', poi.name)),
                            crEl('p',
                                crEl('small',{c:'text-grey'},'Напрямую: '),
                                    poi.myDistance?crEl('strong', formatDistance( poi.myDistance )):'-',
                                crEl('small',{s:'margin-left:15px'}, poi.byTrackDistance?poi.byTrackDistance.map(y=>{
                                    return crEl('a',{href:'javascript:void(0)', s:'margin-left:8px;', onclick: function(){
                                            alert(
                                                'От текущего мп до трека (напрямую): ' + formatDistance(y.toTrackDistance)+'\n' +
                                                'По треку: ' + formatDistance(y.onTrackDistance)+'\n' +
                                                'От трека до точки «'+poi.name+'»: ' + formatDistance(y.fromTrackDistance)+'\n'

                                            )
                                        }}, y.name+': ' +formatDistance(y.toTrackDistance+y.fromTrackDistance+y.onTrackDistance))
                                }):'~')
                            )
                        )
                    })
            )
        )
    )
}

app.mainFloatingButton.show().empty().append(new Icon('my_location'))
app.mainFloatingButton.onclick = updatePosition;
function updatePosition(){
    var options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };
    function success(pos) {
      var crd = pos.coords;
      modules.use('pointsPosition').then(function(){
          updatePointsPosition(crd.latitude, crd.longitude);
          app.msg(new Icon('wifi_tethering').outerHTML+' \u00a0 '+ formatDistance(crd.accuracy/2))
          pointsRender();
      })
    };
    function error(err) {
      app.error(err.message);
    };
    navigator.geolocation.getCurrentPosition(success, error, options);
}
updatePosition();

app.msg(new Date(Date.parse(ls.get('lastPositionTime'))).toLocaleString())