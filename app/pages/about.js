
fetch('https://org.pohodnik58.ru/ajax/app/about.json')
    .then(function(response) {
        return response.json();
    }).then(function(res){
        var date = new Date(Date.parse(res.date));
        app.el.empty().append( new Container(
            crEl('h1','about'),
            crEl('h3', 'version: '+ res.version),
            crEl('p','last update ',
                date.toLocaleDateString('ru-RU',{ weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', era:'long'}),
                '\u00a0',
                date.toLocaleTimeString())
            )
        )
    })