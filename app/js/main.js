app = {
    error: function(msg){
        M.toast({html: '<pre>'+msg+'</pre>'})
    },
    navigate: function(url){
        router.navigate(url);
    },
    el: document.getElementById('main'),
    header:document.getElementById('header'),
    headerRight:document.getElementById('headerRight'),
    search:document.getElementById('search'),
    footer:document.getElementById('footer'),
    mainFloatingButton:document.getElementById('mainFloatingButton'),
    floatingButtons:document.getElementById('floatingButtons'),
    indeterminateProgress: document.getElementById('indeterminateProgress'),
    title: document.getElementById('title'),
}

Element.prototype.empty = function(){ this.innerHTML = null; return this;}
Element.prototype.show = function(){ this.style.display = null; return this;}
Element.prototype.hide = function(){ this.style.display = 'none'; return this;}
Element.prototype.append = function(obj){
    var th = this;
    if(typeof obj === "object" && obj.nodeType === 1){ this.appendChild(obj); return th;}
    if(typeof obj === "object" && obj instanceof Array){ obj.forEach(function(x){ th.appendChild(x);});  return th;}
    if(typeof obj === "string"){  th.appendChild(document.createTextNode(obj)); return th; }
}

document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelector('.sidenav');

    app.sidenav = M.Sidenav.init(elems, {draggable:true});
    var elems = document.querySelectorAll('.fixed-action-btn');
    var instances = M.FloatingActionButton.init(elems, {});
    app.headerRight.empty();

    /*
    * .append([
        new Li( new A({onclick:function(){
            app.search.show();
            app.header.hide();
            app.search.querySelector('input').focus()
        }},
            new Icon('search')
        ))
    ])
    * */

    fetch('https://org.pohodnik58.ru/ajax/app/hiking_all_data.php?id_hiking=44').then(function(res){
        return res.json()
    }).then(function(result){
        app.hiking = result;
        var elems = document.querySelector('.sidenav');
        app.title.textContent = app.hiking.name;
        elems.empty().append([
            new Li(
              crEl({s:'padding:32px 32px 0; margin-bottom:8px;', c:'teal'},
                crEl('img',{c:'circle', width:150, height:150, src: 'https://org.pohodnik58.ru/'+app.hiking.ava}),
                  crEl({s:'font-size:16px; line-height:24px; margin-top:16px; font-weight:500', c:'white-text'}, app.hiking.name),
                  crEl({s:'font-size:16px; line-height:24px; padding-bottom:15px;', c:'white-text'}, app.hiking.desc),
              )
            ),
            new Li( new A({href:'#hiking', onclick:function(){app.sidenav.close()}}, new Icon('bookmark'), 'О походе') ),
            new Li( new A({href:'#members', onclick:function(){app.sidenav.close()}}, new Icon('group'), 'Участники') ),
            new Li( new A({href:'#route', onclick:function(){app.sidenav.close()}}, new Icon('map'), 'Маршрут') ),
            new Li( new A({href:'#about', onclick:function(){app.sidenav.close()}},'about') )
        ])

    })


});