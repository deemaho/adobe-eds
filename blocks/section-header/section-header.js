import { readBlockContent } from '../../scripts/utils.js';

export default function decorate(block) {
	// Get block data from table
	const blockData = readBlockContent(block);

	// Clear initial block content
	block.textContent = '';

	block.appendChild(blockData.title);
}
