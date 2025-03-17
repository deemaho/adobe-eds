import { readBlockContent, buildButton } from '../../scripts/utils.js';

export default function decorate(block) {
	const loopTargets = {
		cards: ['image', 'title', 'content', 'button', 'button-label'],
	};

	// Get block data from table
	const blockData = readBlockContent(block, loopTargets);

	// Clear initial block content
	block.textContent = '';

	blockData.cards.forEach((obj) => {
		const card = document.createElement('div');
		const cardContainer = document.createElement('div');
		const cardContent = document.createElement('div');

		card.classList.add('card');
		cardContainer.classList.add('card-container');
		cardContent.classList.add('card-content');
		cardContent.append(obj.title, obj.content, buildButton(obj.button, obj['button-label']));
		cardContainer.append(obj.image, cardContent);
		card.appendChild(cardContainer);
		block.appendChild(card);
	});
}
