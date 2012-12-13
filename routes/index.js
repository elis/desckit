
/*
 * GET home page.
 */

var months = [
'January', 'February', 'March', 'April', 'May', 'June',
'July', 'August', 'September', 'October', 'November', 'December'
];

exports.index = function(req, res){
	var date = new Date;
  res.render('index', {
  	title: 'Eli\'s Wallpaper Generator',
  	time: date.toString('HH:mm'),
  	date: date,
  	scriptID: req.query.script || 'eli1',
  	output: 'Test'
  });
};