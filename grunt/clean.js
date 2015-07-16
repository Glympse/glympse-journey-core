// Empties folders to start fresh
module.exports = {
  dist: {
    files: [{
      dot: true,
      src: [
        '.tmp',
        '<%= config.dist %>/*',
        '!<%= config.dist %>/.git*',
		'<%= config.distExports %>/*'
      ]
    }]
  },
  server: '.tmp',
  postDist: {
	files: [{
      dot: true,
      src: [
        '<%= config.distExports %>/*.html',
		'public'
      ]
    }]
  }
};
