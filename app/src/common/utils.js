///////////////////////////////////////////////////////////////////////////////
// General utilities
///////////////////////////////////////////////////////////////////////////////

define(function(require, exports, module)
{
	var strPx = 'px';
	var strGlConf = '__glconf';
	
	// Simple lib export
	var utils =
	{
		dbg: function(id, minLevel)
		{
			return function(info, data, level)
			{
				// Never allow logging if minLevel < 0
				// Allow all logging if minLevel is !truthy
				// Otherwise, must match min level on a log request
				if (!minLevel || (minLevel >= 0 && level >= minLevel))
				{
					console.log('[' + id + '] ' + info + (((arguments.length > 1) && (': ' + JSON.stringify(data, null, '  '))) || ''));
				}
			};
		}

		, syncAdapter: function()
		{
			return window.appViewClientAdapter;
		}
		
		, randString: function(len)
		{
			return Array(len).join().replace(/(.|$)/g, function()
			{
				return ((Math.random() * 36) | 0).toString(36)[Math.random() < 0.5 ? 'toString' : 'toUpperCase']();
			});
		}
		
		, usePixels: function(val)
		{
			return (val !== null && val.indexOf && (val.indexOf('%') >= 0)) ? '' : strPx;
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
		
		, addElement: function(elementContainer, elementType, elementClass, elementCss, elementText)
		{
			if (elementType)
			{
				var o = $(document.createElement(elementType));
				if (elementClass)
				{
					o.addClass(elementClass);
				}
				
				if (elementCss)
				{
					o.css(elementCss);
				}
				
				if (elementText)
				{
					o.text(elementText);
				}
				
				if (elementContainer)
				{
					elementContainer.append(o);
				}
			}
			
			return o;
		}
		, updateElement: function(element, elementContainer, elementClass, elementCss)
		{
			if (element)
			{
				if (elementClass)
				{
					element.addClass(elementClass);
				}
				if (elementCss)
				{
					element.css(elementCss);
				}
				if (elementContainer)
				{
					elementContainer.append(element);
				}
			}
			
			return element;
		}

		, domain: window.location.hostname
		, getCookie: function(cName)
		{
			var c, i, idx, x, y, cookies = document.cookie.split(';');
			for (i = 0; i < cookies.length; i++)
			{
				c = cookies[i];
				idx = c.indexOf('=');
				x = c.substr(0, idx);
				y = c.substr(idx + 1);
				if (x.replace(/^\s+|\s+$/g, '') === cName)
				{
					return window.unescape(y);
				}
			}

			return null;
		}

		, setCookie: function(cName, value, daysExpire)
		{
			var d = new Date();
			d.setTime(d.getTime() + (daysExpire || 365) * 24 * 3600 * 1000);
			document.cookie = cName + '=' + (value + '; expires=' + d.toGMTString() + '; domain=' + utils.domain + '; path=/');
		}

		, getConfigValue: function(name)
		{
			var cookie = utils.getCookie(strGlConf);
			if (!cookie)
			{
				return null;
			}
			cookie = JSON.parse(cookie);
			return (cookie && cookie.args) ? cookie.args[name] : null;
		}

		, setConfigValue: function(name, value)
		{
			var cookie = (utils.getCookie(strGlConf)) ? JSON.parse(cookie) : {};
			if (!cookie.args)
			{
				cookie.args = {};
			}
			cookie.args[name] = value;
			utils.setCookie(strGlConf, JSON.stringify(cookie));
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
		, setTextSize: function(o, txt, startSize, minSize, minLineHeight, maxWidth, doEllipsis, maxHeight, callback)
		{
			if (txt)
			{
				setTimeout(function()
				{
					utils._fitText(o, startSize, minSize, minLineHeight, maxWidth, doEllipsis, maxHeight, callback);
				}, 50);
			}

			o.css({ fontSize: (startSize + strPx) });//, visibility: 'hidden' });
			//if (!callback)
			//{
			//	//$(o).css({ maxWidth: (maxWidth + strPx) });
			//}
			
			o.text(txt);
		}
		, _fitText: function(o, startSize, minSize, minLineHeight, maxWidth, doEllipsis, maxHeight, callback)
		{
			var len;
			var dontStop = true;

			while (dontStop)
			{
				if (o.textWidth() < maxWidth)
				{
					o.css({ lineHeight: Math.max(minLineHeight, startSize) + strPx });
					if (callback)
					{
						setTimeout(callback, 50);
					}
					return;
				}
				
				if (--startSize < minSize)
				{
					dontStop = false;
					break;
				}
				
				o.css({ fontSize: startSize + strPx });
			}

			var txt = o.text();

			if (maxHeight > o.height())
			{
				o.css({ whiteSpace: 'normal', lineHeight: Math.max(minLineHeight, startSize + 2) + strPx });
				if (doEllipsis && txt)
				{
					len = txt.length - 1;
					while (o.height() > maxHeight && len)
					{
						o.text(txt.substr(0, len--) + '...');
					}
				}

				if (callback)
				{
					setTimeout(callback, 50);
				}
				return;
			}

			if (doEllipsis && txt)
			{
				len = txt.length - 1;
				while (o.width() > maxWidth && len)
				{
					o.text(txt.substr(0, len--) + '...');
				}
			}

			if (callback)
			{
				setTimeout(callback, 50);
			}
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
		var html = $('<span style="postion:absolute;width:auto;left:-9999px">' + org.html() + '</span>');
		html.css({ fontFamily: org.css('fontFamily'), fontSize: org.css('fontSize'), fontWeight: org.css('fontWeight') });
		$('body').append(html);
		var width = html.width();
		html.remove();
		
		return width;
	};


	module.exports = utils;
});
