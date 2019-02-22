var RADIUS = 6371;

var toRad = function(n) {
    return n * Math.PI / 180;
};

var getDistance = function(from, to) {
    var fromLat = from[0];
    var fromLon = from[1];
    var toLat = to[0];
    var toLon = to[1];

    var dLat = toRad(toLat - fromLat);
    var dLon = toRad(toLon - fromLon);
    var fromLat = toRad(fromLat);
    var toLat = toRad(toLat);

    var a = Math.pow(Math.sin(dLat / 2), 2) +
        (Math.pow(Math.sin(dLon / 2), 2) * Math.cos(fromLat) * Math.cos(toLat));
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return RADIUS * c;
};

var measurePath = function(points) {
    return points.reduce(function(memo, point) {
        var distance = memo.lastPoint === null ? 0 : getDistance(memo.lastPoint, point);
        return { lastPoint: point, distance: distance + memo.distance };
    }, { lastPoint: null, distance: 0 }).distance;
};

function formatDistance(ditanceKM){
    if(ditanceKM<=0){return '~';}
    if(ditanceKM<1){
        return Math.round(ditanceKM/1000).toString()+'\u00a0м.'
    } else {
        return ditanceKM.toFixed(2)+'\u00a0км.'
    }
}
app.el.empty().append(
    new Container( crEl('h5','Маршрутные точки'),
        crEl({c:'collection'},
            app.hiking.route_objects
                .filter(function(x){return x.id_typeobject==1})
                .map(function(x){
                    return new A({href:'#route/'+x.id,c:'collection-item avatar'},
                     new Icon({c:'circle red'},'place'),
                        crEl('span',{c:'title'}, x.name),
                        crEl('p', x.desc || x.coordinates)
                    )
                })
        )
    )
)

app.mainFloatingButton.show().empty().append(new Icon('my_location'))
app.mainFloatingButton.onclick = function(){
updatePosition();
}

function updatePosition(){
    var options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };

    function success(pos) {
      var crd = pos.coords;

      console.log('Your current position is:');
      console.log(`Latitude : ${crd.latitude}`);
      console.log(`Longitude: ${crd.longitude}`);
      console.log(`More or less ${crd.accuracy} meters.`);
        
        
const currentPosition = [crd.latitude,crd.longitude];
const tracks  = app.hiking.route_objects.filter(x=>x.id_typeobject==2);
const points  = app.hiking.route_objects.filter(x=>x.id_typeobject==1);
function nearPointOnTrack(point, trackPoints){
    const nearPoint = {
        point:[],
        distance:9999,
        indexOnTrack:0
    }
    trackPoints.forEach((x,i)=>{
        const curDist = getDistance(point,x);
        if(curDist < nearPoint.distance){
            nearPoint.distance =  curDist;
            nearPoint.point = x;
            nearPoint.indexOnTrack = i;
        }
    })
    return nearPoint;
}
        
        
app.el.empty().append(
    new Container( crEl('h5','Маршрутные точки'),
        crEl({c:'collection'},
             
             
        points.map(poi=>{
            const poiCoordinates = JSON.parse(poi.coordinates);
            const point2PointDistance = getDistance(currentPosition, poiCoordinates );
            const byTrackDistance = tracks.map(x=>{
                const points = JSON.parse(x.coordinates);
                const curToTrack = nearPointOnTrack(currentPosition,points);
                const targetToTrack = nearPointOnTrack(poiCoordinates,points);
                const trimedTrack = points.slice.apply(points, [curToTrack.indexOnTrack,targetToTrack.indexOnTrack].sort((a,b)=>a-b));
                return {
                    name:x.name,
                    toTrackDistance:curToTrack.distance,
                    fromTrackDistance:targetToTrack.distance,
                    onTrackDistance:measurePath(trimedTrack)
                }
            })
            
             return new A({href:'#route/'+poi.id,c:'collection-item avatar'},
                     new Icon({c:'circle red'},'place'),
                        crEl('span',{c:'title'}, poi.name),
                        crEl('p', 
                             crEl('strong', formatDistance( point2PointDistance )),
crEl('sub', byTrackDistance.map(y=>{
                    return crEl('a',{href:'javascript:void(0)', onclick: function(){
                        alert(
                            'От текущего мп до трека (напрямую): ' + formatDistance(y.toTrackDistance)+'\n' +
                            'По треку: ' + formatDistance(y.onTrackDistance)+'\n' +
                            'От трека до точки «'+poi.name+'»: ' + formatDistance(y.fromTrackDistance)+'\n'

                        )
                    }}, y.name+': ' +formatDistance(y.toTrackDistance+y.fromTrackDistance+y.onTrackDistance))
                }))
                       )
                    )
            

        })
             
             

        )
    )
)
        
        

        
        
    };

    function error(err) {
      app.error(err.message);
    };

    navigator.geolocation.getCurrentPosition(success, error, options);
}
