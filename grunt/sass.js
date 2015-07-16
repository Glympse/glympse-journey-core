// Copies remaining files to places other tasks can use
module.exports = {
  dev: {
    options: {
      style: 'expanded'
    },
    files: [{
        expand: true,
        cwd: '<%= config.app %>/styles/scss',
        src: ['*.scss'],
        dest: '<%= config.app %>/styles',
        ext: '.css'
    }]
  }
};

