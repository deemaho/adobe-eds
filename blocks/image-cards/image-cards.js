import { readBlockContent, buildButton } from '../../scripts/utils.js';

export default function decorate(block) {
	const loopTargets = {
		imageCards: ['image', 'button', 'button-label'],
	};

	// Get block data from table
	const blockData = readBlockContent(block, loopTargets);

	// Clear initial block content
	block.textContent = '';

	blockData.imageCards.forEach((obj) => {
		const card = document.createElement('div');

		card.classList.add('image-card');
		card.appendChild(obj.image);
		if (obj.button) card.appendChild(buildButton(obj.button));
		block.appendChild(card);
	});
}
