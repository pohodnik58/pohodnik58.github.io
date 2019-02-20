
fetch('https://org.pohodnik58.ru/ajax/app/about.json')
    .then(function(response) {
        return response.json();
    }).then(function(res){
        app.el.empty().append(
            crEl('h1','about'),
            crEl('h3', 'version: '+ res.version),
            crEl('p','last update '+ new Date(Date.parse(res.date)).toLocaleString())
        )
    })