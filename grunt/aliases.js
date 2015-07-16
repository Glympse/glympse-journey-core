
//var metrics = require('famous-metrics');

module.exports = function (grunt) {
  'use strict';
  grunt.registerTask('serve', function (target) {
   // if (metrics.getTracking()) {
   //   metrics.track('grunt serve', {});
   // }

    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'processhtml:dev',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('build', [
    'clean:dist',
    'lint',
	'replace:updateVersion',
    'processhtml:dist',
    'useminPrepare',
    'requirejs:compile',
    'concat',
    //'sass:dev',
    //'cssmin',
    'uglify',
    'copy:dist',
    'rev',
    'usemin',
    //'htmlmin',
	'copy:build'
	//'clean:postDist'
  ]);

  grunt.registerTask('lint', [
    'jscs',
    'eslint'
  ]);

  grunt.registerTask('test', [
    'lint'
  ]);

  grunt.registerTask('default', [
    'build'
  ]);
};
