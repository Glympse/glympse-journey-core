module.exports = {
  dev: {
    files: [{
      expand: true,
      cwd: '<%= config.app %>',
      dest: '.tmp',
      src: [ '*.html' ]
    }]
  },
  dist: {
    files: [{
      expand: true,
      cwd: '<%= config.app %>',
      dest: '<%= config.distExports %>',
      src: [ '*.html' ]
    }]
  },
  options: {
    commentMarker: 'process'
  }
};
