app = {
    error: function(msg){
        M.toast({html: '<pre>'+msg+'</pre>'})
    },
    navigate: function(url){
        router.navigate(url);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('.sidenav');
    var instances = M.Sidenav.init(elems, {});
    var elems = document.querySelectorAll('.fixed-action-btn');
    var instances = M.FloatingActionButton.init(elems, {});

});