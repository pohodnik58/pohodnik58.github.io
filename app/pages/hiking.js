var section = crEl('section');
section.innerHTML = app.hiking.text;
app.el.empty().append(
    new Container(
        crEl('h1',{c:'page-header'}, app.hiking.name),
        crEl('strong',{c:'grey-text'}, app.hiking.type_name,'. ',
            new Date(Date.parse(app.hiking.start)).toLocaleString(),' - ',
            new Date(Date.parse(app.hiking.finish)).toLocaleString(),' - ',

            ),
        section
    )
)