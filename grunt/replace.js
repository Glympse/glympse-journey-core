module.exports =
{
	updateVersion: {
		src: ['app/src/JourneyCore.js'],
		overwrite: true,                 // overwrite matched source files
		replacements: [
			{
				from: / v\(.*?\)/,
				to: ' v(<%= config.moduleVersion %>)'
			}
		]
	}
};
