// Performs rewrite based on rev and the useminPrepare configuration
module.exports = {
  options: {
    assetsDirs: ['<%= config.dist %>', '<%= config.dist %>/images'],
	blockReplacements: {
		css: function (block) {
			return '<!-- ' + block.dest + ' -->';
		}
	}
  },
  html: ['<%= config.distExports %>/{,*/}*.html'],
  css: ['<%= config.dist %>/css/{,*/}*.css']
};
