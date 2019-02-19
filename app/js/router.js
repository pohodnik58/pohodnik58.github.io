var router = new Navigo('index.html', true,'#');
router.notFound(function () {
    console.log('notfound')
});
router.hooks({
    before: function(done, params) { app.indeterminateProgress.show(); console.log('before_nav', params); setTimeout(done,1); },
    after: function(params) {
        app.indeterminateProgress.hide()
    }
});
router
    .on({
        'about': function () {
            modules.use('about')
        },

        'map': function () {
            modules.use('map')
        },
        '*': function () {
            modules.use('welcome')
        }
    })
    .resolve();