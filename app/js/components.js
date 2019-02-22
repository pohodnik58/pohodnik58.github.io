function DOM() {
    var self = crEl.apply(this, arguments);
    self.c = function(cname, rem) {
        var method = (rem === false ? 'remove' : 'add');
        typeof cname === 'string' ? self.classList[method](cname) : cname.forEach(function(x) { self.classList[method](x) })
        return self;
    }

    self.a = function() {
        [].forEach.call(arguments, function(x) {
            if (typeof x === 'string') {
                self.appendChild(document.createTextNode(x));
            } else if (typeof(x) === 'object' && x.length) {
                x.forEach(function(a) { self.a(a) })
            } else {
                self.appendChild(x);
            }
        })
        return self;
    }

    return self;
}

function A() {
    [].unshift.call(arguments, 'a');
    var a = DOM.apply(this, arguments);
    a.addEventListener('click', function(event){
        if(this.href && this.href.length && this.href.indexOf(':')==-1){
            event.preventDefault();
            event.stopPropagation();
            app.navigate(this.getAttribute('href'))
            return false;
        }
    })
    if(!a.href || !a.href.length){
        a.href = 'javascript:void(0)'
    }
    return a;
}

function Li() {
    [].unshift.call(arguments, 'li')
    return DOM.apply(this, arguments)
}

function Icon() {
    [].unshift.call(arguments, 'i')
    return DOM.apply(this, arguments).c('material-icons')
}

function Container() {
    [].unshift.call(arguments, 'div')
    return DOM.apply(this, arguments).c('container')
}

function ContainerFluid() {
    [].unshift.call(arguments, 'div')
    return DOM.apply(this, arguments).c('container-fluid')
}


function PageHeader() {
    [].unshift.call(arguments, 'h2')
    var el = DOM.apply(this, arguments).c('page-header');
    return el;
}


function Row() {
    [].unshift.call(arguments, 'div')
    return DOM.apply(this, arguments).c('row')
}




function Col() {
    [].unshift.call(arguments, 'div');
    var addClass = [],
        szs = ['xs', 'sm', 'md', 'lg', 'xl'];
    var szsEq = {
        xs: 'col-xs-',
        sm: 'col-sm-',
        md: 'col-md-',
        lg: 'col-lg-',
        xl: 'col-xl-'
    }
    for (var i = 0, l = arguments.length; i < l; i++) {
        if (Object.prototype.toString.call(arguments[i]) == '[object Object]') {
            for (var k in arguments[i]) {
                if (szs.indexOf(k) != -1) {
                    addClass.push((k === 'xs' ? '' : (szsEq[k]) + arguments[i][k].toString()));
                    delete arguments[i][k];
                }

                if (k == 'offset') {
                    for (var ok in arguments[i][k]) {
                        if (szs.indexOf(ok) != -1) {
                            addClass.push('col-offset-' + (szsEq[ok]) + arguments[i][k][ok].toString());
                        }
                    }
                    delete arguments[i][k];
                }

            }
        } else if (typeof(arguments[i]) === 'number' || szs.indexOf(arguments[i]) != -1) {
            addClass.push('col-sm-' + arguments[i].toString())
            delete arguments[i][k];
        }

    }

    return DOM.apply(this, arguments).c( addClass )
}