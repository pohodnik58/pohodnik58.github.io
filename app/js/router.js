var router = new Navigo('index.html', true,'#');
router.notFound(function () {
    console.log('notfound')
});
router.hooks({
    before: function(done, params) {
        app.indeterminateProgress.show(); console.log('before_nav', params);
        setTimeout(done,1);
        },
    after: function(params) {
        app.indeterminateProgress.hide()
    }
});
router
    .on({
        'about': function () {
            modules.use('about')
        },

        'hiking': function () {
            modules.use('hiking')
        },
        'members': function () {
            modules.use('members')
        },
        'route/:id': function (data) {
            modules.use('route').then(function(){
                goToPoint(data.id)
            })
        },
        'route': function () {
            modules.use('route')
        },
        'points': function () {
            modules.use('points')
        },

        'welcome': function () {
            modules.use('welcome')
        },

        '*': function () {
            modules.use('welcome')
        }
    })
    .resolve();