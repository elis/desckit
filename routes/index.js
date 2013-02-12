
/*
 * GET home page.
 */

module.exports = function(debug) {
    function index(req, res) {
        var date = new Date;
        res.render('index', {
            title: 'Eli\'s Wallpaper Generator',
            time: date.toString('HH:mm'),
            date: date,
            scriptID: req.query.script || 'eli1',
            output: 'Test'
        });
    };
    return { 'index' : index };
}