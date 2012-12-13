var Prop = function ($elem, canvas) {
	console.log('Propify!');
	if ($elem.data('prop')) return $elem.data('prop');
	$elem.data('prop', this);
	
	var pos = $elem.position()
		, width = $elem.outerWidth()
		, height = $elem.outerHeight()
		, self = this;
	
	var $cbox = this.$cbox = $('<div class="cbox"/>').appendTo(canvas);
	$cbox.data('prop', this);
	
	this.$elem = $elem;
	
	$cbox.css({
		position: 'absolute',
		left: pos.left,
		top: pos.top,
		width: width,
		height: height
	});
	
	$cbox.bind('click', function (){
		console.log('cbox clicked', this, $(this).data('prop'))
		$($(this).data('prop')).trigger('select');
	});
}

define(function () {
	return Prop;
});