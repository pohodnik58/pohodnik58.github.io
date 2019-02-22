var section = crEl('section');
section.innerHTML = app.hiking.text;
app.el.empty().append(
    new Container(
        crEl('h3',{c:'page-header'}, app.hiking.name),
        crEl('p',app.hiking.desc),
        crEl('strong',{c:'grey-text'},
            new Date(Date.parse(app.hiking.start)).toLocaleString(),' - ',
            new Date(Date.parse(app.hiking.finish)).toLocaleString(),

            ),
        section
    )
)