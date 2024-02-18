/** @type {import('tailwindcss').Config}*/
const config = {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {},
		colors: {
			text: '#aeb7bb',
			primary: '#000',
			white: '#fff',
			black: '#000',
			transparent: '#ffffff00'
		}
	},

	plugins: []
};

module.exports = config;
