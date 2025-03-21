module.exports = {
	root: true,
	extends: 'airbnb-base',
	env: {
		browser: true,
	},
	parser: '@babel/eslint-parser',
	parserOptions: {
		allowImportExportEverywhere: true,
		sourceType: 'module',
		requireConfigFile: false,
	},
	rules: {
		// allow reassigning param
		"indent": ["error", "tab"],
		"no-tabs": 0,
		'no-param-reassign': [2, { props: false }],
		'linebreak-style': ['error', 'unix'],
		'import/extensions': ['error', {
			js: 'always',
		}],
	},
};
