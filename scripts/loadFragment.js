import { loadBlock } from './aem.js';
import { decorateMain } from './scripts.js';

// reset base path for media to fragment base
function resetAttributeBase(element, tag, attr, path) {
	element.querySelectorAll(`${tag}[${attr}^="./media_"]`).forEach((elem) => {
		elem[attr] = new URL(elem.getAttribute(attr), new URL(path, window.location)).href;
	});
}

/**
* Loads a fragment
* @param {String} path Path to the fragment docx file
* @param {String} blockName Class name of block to return
* @returns {HTMLElement} The fragment dom element
*/
export default async function loadFragment(path, blockName = null) {
	if (path && path.startsWith('/')) {
		const resp = await fetch(`${path}.plain.html`);

		if (resp.ok) {
			const main = document.createElement('div');

			main.innerHTML = await resp.text();

			resetAttributeBase(main, 'img', 'src', path);
			resetAttributeBase(main, 'source', 'srcset', path);

			decorateMain(main);
			await loadBlock(main);

			if (blockName) {
				if (blockName === 'section') return [...main.querySelector(`.${blockName}`).children];
				return main.querySelector(`.${blockName}`);
			}

			return main;
		}
	}

	return null;
}
