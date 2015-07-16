// Copies remaining files to places other tasks can use
module.exports = {
  dist: {
    files: [{
      expand: true,
      dot: true,
      cwd: '<%= config.app %>',
      dest: '<%= config.distExports %>',
	  //flatten: true,
      src: [
        'content/**/**.*',
        '.htaccess',
        'images/{,*/}*.webp',
        // '{,*/}*.html',
        'styles/fonts/{,*/}*.*'
      ]
    }]
  },
  build: {
	files: [{
      expand: true,
      cwd: '<%= config.distExports %>',
      dest: '<%= config.buildsDir %>/<%= config.moduleVersion %>',
      src: [ '*.min.*' ]
    },
	{
      expand: true,
      cwd: '<%= config.distExports %>',
      dest: '<%= config.buildsDir %>/css',
      src: [ '*.css' ],
	  cssVersions: '<%= config.cssVersions %>',
	  rename: function(dest, src) {
		var name = src.split('.')[0];
		var css = this.cssVersions[name];
		var ver = (css && css.version) || '0.0.1';
		var id = (css && css.name) || name;
		console.log(src + ' -> ' + id + '-' + ver + '.css');
		return (dest + '/' + name + '/' + ver + '/' + id + '-' + ver + '.css');
	  }
    }]
  }
};
