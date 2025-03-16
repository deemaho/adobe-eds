import { readBlockContent, buildButton } from '../../scripts/utils.js';

export default function decorate(block) {
	const blockData = readBlockContent(block);
	const heroContent = document.createElement('div');
	const heroImage = document.createElement('div');

	// Clear initial block content
	block.textContent = '';

	// Hero Content
	heroContent.classList.add('hero-content');
	heroContent.appendChild(blockData.title);

	if (blockData.content) {
		heroContent.appendChild(blockData.content);
	}

	block.appendChild(heroContent);

	// Hero Image
	if (blockData.image) {
		heroImage.classList.add('hero-image');
		heroImage.appendChild(blockData.image);

		// Conditionally append hero button
		if (blockData.button) heroImage.appendChild(buildButton(blockData.button, blockData['button-label']));
		block.appendChild(heroImage);
	}
}
