// wallmate.js

define(function() {
	function Wallmate () {
		
	}
	
	var w = {};
	
	w.activate = function (event) {
		var $elem = (event && event.target ? $(event.target) : false);
		
		this.initialize();
		
		if (this.editMode) {
			this.stopEdit();
			$elem.removeClass('active');
		} else {
			$.when(this.startEdit()).then(function(){
				console.log('start edit');
				$elem.addClass('active');
			});
		}
	}
	
	w.initialize = function () {
		if (this.initialized) return;
		var self = this;
		
		require(['modules/plugins'], function (Plugins) {
			self.plugins = Plugins;
			$(self).trigger('plugins-init');
		})
	}
	
	w.startEdit = function () {
		var $dfr = $.Deferred();
		if (this.editReady) {
			$('#editor').addClass('active');
			$(this).trigger('editor.activate');
			return $dfr.resolve();
		}
		
		var canvas = this.canvas = $('<div id="canvas"/>').hide().appendTo('#editor');
		$.when(this.processProps($('#wallpaper'))).then(function () {
			canvas.show('fast');
			$('#editor').addClass('active');
			$(this).trigger('editor.activate');
			$dfr.resolve();
		});
		
		return $dfr.promise();
	}
	
	w.processProps = function ($container) {
		var props = this.props = []
			, collection = $container.find('.prop')
			, $dfr = $.Deferred()
			, self = this;
		
		console.log(collection);
		collection.each(function (i, item) {
			
			$.when(self.propify.call(self, item)).then(function (prop) {
				props.push(prop);
				
				$(prop).bind('select', function (event) {
					console.log('prop select event', event);
					self.propSelect();
				});
				
				if (collection.length == props.length) {
					$dfr.resolve();
					$(self).trigger('props-ready');
				}
			});
		})
		
		return $dfr.promise();
		// a prop will have an editor attached to it via a box
		// bouding the same size as the prop with controls on it
	}
	
	w.propify = function (element) {
		var $elem = $(element)
			, $dfr = $.Deferred()
			, self = this;
			
		if (this.Prop) {
			return new Prop($elem, this.canvas);
		}
		
		require(['modules/prop'], function (Prop) {
			self.Prop = Prop;
			var prop = new Prop($elem, this.canvas);
			$dfr.resolve(prop);
		})
		
		return $dfr.promise();
	}
	$.extend(Wallmate.prototype, w);
	
	
	return {
		init: function () {
			var wallmate = new Wallmate();
			// Bind activator
			$('#activator').bind('click', wallmate.activate.bind(wallmate));
			
			return wallmate;
		}
	}
});