function updatePointsPosition(currentLat, currentLon){

    ls.set('lastUpdatePoints', new Date().toString());
    ls.set('lastPositionTime', new Date().toString());
    ls.set('lastPosition', JSON.stringify([currentLat, currentLon]));

    if(!app.hiking.route_objects){app.error('no data');return;}
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

    const currentPosition = [currentLat,currentLon];
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

    for( var i=0; i<app.hiking.route_objects.length;i++ ){
        var poi = app.hiking.route_objects[i];
        if(poi.id_typeobject==1){
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
            poi.myDistance = point2PointDistance;
            poi.byTrackDistance = byTrackDistance;
        } else {
            const points = JSON.parse(poi.coordinates);
            const curToTrack = nearPointOnTrack(currentPosition,points);
            const trimedTrack = points.slice.apply(points, [curToTrack.indexOnTrack,points.length-1].sort((a,b)=>a-b));
            poi.myDistance = curToTrack+trimedTrack;
            poi.toDistance = curToTrack;
        }
    }
    ls.set('data', JSON.stringify(app.hiking));
    return app.hiking.route_objects;
}