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
    elems.empty().append([
        new Li( new A({href:'#welcome', onclick:function(){app.sidenav.close()}},'welcome') ),
        new Li( new A({href:'#about', onclick:function(){app.sidenav.close()}},'about') ),
        new Li( new A({href:'#map', onclick:function(){app.sidenav.close()}},'map') ),
    ])
    app.sidenav = M.Sidenav.init(elems, {});
    var elems = document.querySelectorAll('.fixed-action-btn');
    var instances = M.FloatingActionButton.init(elems, {});
    app.headerRight.empty().append([
        new Li( new A({onclick:function(){
            app.search.show();
            app.header.hide();
            app.search.querySelector('input').focus()
        }},
            new Icon('search')
        ))
    ])

});