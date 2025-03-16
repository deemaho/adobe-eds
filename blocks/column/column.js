import { readBlockContent, buildButton } from '../../scripts/utils.js';

export default function decorate(block) {
	const loopTargets = {
		buttons: ['button', 'button-label'],
	};
	// Get block data from table
	const blockData = readBlockContent(block, loopTargets);
	const columnImage = blockData.image;
	const columnEyebrow = blockData.eyebrow;
	const columnTitle = blockData.title;
	const columnSubtitle = blockData.subtitle;
	const columnContent = blockData.content;
	const columnButtons = blockData.buttons;

	// Clear initial block content
	block.textContent = '';

	if (columnImage) block.appendChild(columnImage);
	if (columnEyebrow) block.appendChild(columnEyebrow);
	if (columnTitle) block.appendChild(columnTitle);
	if (columnSubtitle) block.appendChild(columnSubtitle);
	if (columnContent) block.appendChild(columnContent);
	if (columnButtons) block.appendChild(buildButton(columnButtons));
}
