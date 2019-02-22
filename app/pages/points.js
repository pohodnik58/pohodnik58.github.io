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
