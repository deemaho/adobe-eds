import { readBlockContent, buildButton } from '../../scripts/utils.js';

export default function decorate(block) {
	const loopTargets = {
		cards: ['content', 'button', 'button-label'],
	};

	// Get block data from table
	const blockData = readBlockContent(block, loopTargets);

	// Clear initial block content
	block.textContent = '';

	blockData.cards.forEach((card) => {
		const cardContainer = document.createElement('div');
		const cardContent = document.createElement('div');

		cardContainer.classList.add('numbered-card');
		cardContent.classList.add('numbered-card-content');
		cardContent.append(card.content, buildButton(card.button, card['button-label']));
		cardContainer.appendChild(cardContent);
		block.appendChild(cardContainer);
	});
}
