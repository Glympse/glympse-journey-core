module.exports = {
  options: {
    config: '.eslintrc'
  },
  target: ['<%= config.app %>/src/**/**.js'
		  , '!<%= config.app %>/src/ph/**/**.js'
		  ]
};
