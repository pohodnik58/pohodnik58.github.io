(function(){
    var lastUpdate = ls.get('currentLastUpdate')
    app.el.empty().append(
        new Container(
            crEl('ul',{c:'collection'},
                new Li({c:'collection-item'},
                    'Серебряная нить 2019  ',
                    crEl('small',lastUpdate?new Date(Date.parse(lastUpdate)).toLocaleString():'Надо загрузить'),
                    crEl('button',{c:'btn btn-primary secondary-content', onclick: function(){
                        var th = this;
                            fetch('https://org.pohodnik58.ru/ajax/app/hiking_all_data.php?id_hiking=44').then(function(res){
                                return res.json()
                            }).then(function(result){
                                app.hiking = result;
                                ls.set('data', JSON.stringify(result));
                                ls.set('currentLastUpdate', new Date().toString());
                                th.parentNode.querySelector('small').textContent = new Date().toLocaleString();
                                app.init()
                            })
                        }}, new Icon('system_update'))
                ),
                 
                new Li({c:'collection-item'},
                    'Самара 2019  ',
                    crEl('small',lastUpdate?new Date(Date.parse(lastUpdate)).toLocaleString():'Надо загрузить'),
                    crEl('button',{c:'btn btn-primary secondary-content', onclick: function(){
                        var th = this;
                            fetch('https://org.pohodnik58.ru/ajax/app/hiking_all_data.php?id_hiking=45').then(function(res){
                                return res.json()
                            }).then(function(result){
                                app.hiking = result;
                                ls.set('data', JSON.stringify(result));
                                ls.set('currentLastUpdate', new Date().toString());
                                th.parentNode.querySelector('small').textContent = new Date().toLocaleString();
                                app.init()
                            })
                        }}, new Icon('system_update'))
                )
                 
            )
        )
    )
})()
