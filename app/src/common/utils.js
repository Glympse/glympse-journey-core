///////////////////////////////////////////////////////////////////////////////
// General utilities
///////////////////////////////////////////////////////////////////////////////

define(function(require, exports, module)
{
	// Simple lib export
	var utils =
	{
		randString: function(len)
		{
			return Array(len).join().replace(/(.|$)/g, function()
			{
				return ((Math.random() * 36) | 0).toString(36)[Math.random() < 0.5 ? 'toString' : 'toUpperCase']();
			});
		}

		, usePixels: function(val)
		{
			return (val !== null && val.indexOf && (val.indexOf('%') >= 0)) ? '' : 'px';
		}

		, numPad: function(val, len)
		{
			val = val.toString();
			return '0000000000'.substr(0, (len || 2) - val.length) + val;
		}

		, formatHM: function(date, alt, altIgnore)
		{
			var h = date.getHours();
			var m = date.getMinutes();

			return utils.numPad((h % 12) || 12, 1) + ':' + utils.numPad(m) + ((altIgnore) ? '' : ((alt) ? ((h >=12) ? ' PM' : ' AM') : ((h >=12) ? 'pm' : 'am')));
		}

		, format5Min: function(seconds)
		{
			var mins = Math.round(seconds / 60);
			var rnd = Math.round(mins / 10) * 10;
			var start = rnd - ((rnd <= mins) ? 0 : 5);	// Round up
			var end = rnd + ((rnd <= mins) ? 5 : 0);	// Round up

			//console.log('secs=' + seconds + ', mins=' + mins);
			return ((end <= 0) ? '0'
							   : (((start > 0) ? (start + '-')
											   : '<')
								  + end)
				   );
		}
		, decodeShortGuid: function(shortGuid, spacer)
		{
			if (typeof spacer === 'undefined')
			{
				spacer = '-';
			}

			var s = shortGuid.replace(/-/g, '+').replace(/_/g, '/') + '==';
			var a, e = {}, r = '', len = s.length;
			var markers = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
			for (var i = 0; i < 64; i++)
			{
				e[markers.charAt(i)] = i;
			}

			for (var x = 0, b = 0, l = 0; x < len; x++)
			{
				b = (b << 6) + e[s.charAt(x)];
				l += 6;
				while (l >= 8)
				{
					/*eslint-disable */
					((a = (b >>> (l -= 8)) & 0xff) || (x < (len - 2))) && (r += String.fromCharCode(a));
					/*eslint-enable */
				}
			}

			// Flip endian-ness
			function gc(idx)
			{
				return ('0' + r.charCodeAt(idx).toString(16)).substr(-2);
			}

			// Final full-form
			return gc(3) + gc(2) + gc(1) + gc(0) + spacer +
				   gc(5) + gc(4) + spacer +
				   gc(7) + gc(6) + spacer +
				   gc(8) + gc(9) + spacer +
				   gc(10) + gc(11) + gc(12) + gc(13) + gc(14) + gc(15);
		}

		, registerClick: function(container, callbackRelease, callbackPress, callbackCancel)
		{
			var c = $(container);

			c.off();
			c.unbind();

			c.tap(function(e)
			{
				if (callbackRelease)
				{
					callbackRelease(e);
				}
			}, function(e)
			{
				if (callbackPress)
				{
					callbackPress(e);
				}
			});

			if (callbackCancel)
			{
				c.on('tap-failed', callbackCancel);
				c.on('exceed-tap-threshold', callbackCancel);
			}
		}
	};


	////////////////////
	// Static helpers //
	////////////////////

	function handleEvent(e, callback)
	{
		e.stopPropagation();
		e.preventDefault();

		if (e.handled !== true)
		{
			if (callback)
			{
				callback(e);
			}

			e.handled = true;
		}
		else
		{
			return false;
		}
	}

	// Better (but expensive) text measurement
	$.fn.textWidth = function()
	{
		var org = $(this);
		var html = $('<span style="postion:absolute;width:auto;left:-9999px;">' + org.html() + '</span>');
		html.css({ fontFamily: org.css('fontFamily'), fontSize: org.css('fontSize'), fontWeight: org.css('fontWeight') });
		$('body').append(html);
		var width = html.width();
		html.remove();

		return width;
	};


	module.exports = utils;
});
