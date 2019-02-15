var router = new Navigo('index.html', true,'#');
router.notFound(function () {
    console.log('notfound')
});
router.hooks({
    before: function(done, params) { console.log('before_nav', params); done(); },
    after: function(params) {

    }
});
router
    .on({
        'about': function () {
            console.log('aboutPage');
        },
        '*': function () {
            console.log('mainPage')
        }
    })
    .resolve();