import { readBlockContent } from '../../scripts/utils.js';
import loadFragment from '../../scripts/loadFragment.js';

export default async function decorate(block) {
	const blockData = readBlockContent(block);
	const fragmentPath = blockData.path.textContent.replace('{xf::', '').replace('}', '');
	const fragment = await loadFragment(`/${fragmentPath}`, blockData.block.textContent);
	const wrapper = block.closest('.fragment-wrapper');

	// Clear initial block content
	block.textContent = '';

	wrapper.classList.remove('fragment-wrapper');
	wrapper.classList.add(`${blockData.block.textContent}-wrapper`);
	setTimeout(() => {
		block.replaceWith(fragment);
	}, 200);
}
