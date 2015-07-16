module.exports =  {
  compile: {
    options: {
      optimize: 'uglify2',
      uglify2: {
        mangler: {
          toplevel: true
        }
      },
      baseUrl: '<%= config.app %>/src',
      mainConfigFile: '<%= config.app %>/src/requireConfig.js',
      name: 'almond',
      include: '<%= config.moduleIn %>',
      insertRequire: ['<%= config.moduleIn %>'],
      out: '<%= config.dist %>/<%= config.moduleOut %>-<%= config.moduleVersion %>.min.js',
      generateSourceMaps: true,
      preserveLicenseComments: false,
      //waitSeconds: 5,
      wrap: {
        startFile: "frag.start",
        endFile: "frag.end"
      },
	}
  }
};
