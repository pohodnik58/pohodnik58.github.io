app.el.empty().append(
    new Container(
        crEl('ul',{c:'collection'}
            app.hiking.members.map(function(x){
                return new Li({c:'collection-item  avatar'},
                    crEl('img',{c:'circle', src:'https://org.pohodnik58.ru/'+x.ava}),
                    crEl('span', {c:'title'} ,x.name + ' ' + x.surname),
                    crEl('p', x.date)
                    )
            })
        )
    )
)