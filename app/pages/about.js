app.el.empty().append(
    crEl('h1','about')
)
fetch('https://org.pohodnik58.ru/ajax/app/about.json').json().then(function(res){
    alert(res.version)
})