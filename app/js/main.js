app = {
    error: function(msg){ M.toast({html: '<pre>'+msg+'</pre>'})},
    msg: function(msg){ M.toast({html: msg})},
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
    init: function(){
        if(!app.hiking){
            app.hiking = ls.get('data');
            if(!app.hiking){
                app.error('Нет данных');
                return false;
            } else {
                app.hiking = JSON.parse(app.hiking);
            }
        }
        app.title.textContent = app.hiking.name;
        var elems = document.querySelector('.sidenav');
        elems.empty().append([
            new Li(
                crEl({c:'user-view teal'},
                    crEl('img',{c:'circle', src: 'https://org.pohodnik58.ru/'+app.hiking.ava}),
                    new A(crEl({c:'white-text name'}, app.hiking.name)),
                    new A(crEl({c:'white-text email'}, app.hiking.type_name)),
                )
            ),
            new Li( new A({href:'#welcome', onclick:function(){app.sidenav.close()}}, new Icon('public'), 'Главная') ),
            new Li(crEl({c:'divider'})),
            new Li( new A({href:'#hiking', onclick:function(){app.sidenav.close()}}, new Icon('bookmark'), 'О походе') ),
            new Li( new A({href:'#members', onclick:function(){app.sidenav.close()}},
                new Icon('group'),
                'Участники',
                crEl('span',{d:{}, c:'badge'}, app.hiking.members.length.toString())
            )),
            new Li( new A({href:'#route', onclick:function(){app.sidenav.close()}}, new Icon('map'), 'Маршрут') ),
            new Li( new A({href:'#points', onclick:function(){app.sidenav.close()}}, new Icon('map'), 'Маршрутные точки') ),
            new Li(crEl({c:'divider'})),
            new Li( new A({href:'#about', onclick:function(){app.sidenav.close()}}, new Icon('perm_device_information'),'О приложении') )
        ])
    }
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

    app.init()
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



        router.resolve()
});

function isLocalStorageAvailable() { try { return 'localStorage' in window && window['localStorage'] !== null; } catch (e) { return false; } }
if (isLocalStorageAvailable()) {
    ls = {
        set: function(key, value) { localStorage.setItem(key, value) },
        get: function(key) { return localStorage.getItem(key) },
        unset: function(key) { localStorage.removeItem(key) },
        clear: function() { localStorage.clear() },
        empty: function(key) { return !(localStorage.getItem(key)) }
    }
    window.ls = ls;
} else {
    alert("You need in modern browser");
}
function formatDistance(ditanceKM){
    if(ditanceKM<=0){return '~';}
    if(ditanceKM<1){
        return Math.round(ditanceKM/1000).toString()+'\u00a0м.'
    } else {
        return ditanceKM.toFixed(2)+'\u00a0км.'
    }
}