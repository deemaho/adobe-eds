import { readBlockContent, buildButton } from '../../scripts/utils.js';
import { loadCSS } from '../../scripts/aem.js';

function buildCustomColumns(block, data) {
	const columnRow = document.createElement('div');
	const section = block.closest('.section');
	const columnWrappers = section.querySelectorAll('.column-wrapper');

	// Clear initial block content
	block.textContent = '';

	data.columns.forEach((column) => {
		const columnReference = column.column.textContent.toLowerCase().trim().replace('ref:', '');
		const columnType = columnReference.split('(').pop().replace(')', '');
		const matchedColumn = [...columnWrappers].filter((wrapper) => wrapper.querySelector('.column')?.classList.contains(columnType));
		const columnDiv = matchedColumn[0].querySelector('.column');

		columnRow.appendChild(columnDiv);
	});

	columnWrappers.forEach((wrapper) => wrapper.remove());

	columnRow.classList.add('column-row');
	block.appendChild(columnRow);
	block.classList.add(`columns-${data.columns.length}`);
}

function buildDefaultColumns(block) {
	const cols = [...block.firstElementChild.children];

	block.classList.add(`columns-${cols.length}`);

	// setup image columns
	[...block.children].forEach((row) => {
		row.classList.add('column-row');

		[...row.children].forEach((col) => {
			const pic = col.querySelector('picture');
			const allButtons = col.querySelectorAll('.button-container');

			col.classList.add('column');

			if (allButtons.length > 0) {
				allButtons.forEach((button) => {
					const buttonType = button.querySelector('.button').classList[1];

					button.classList.add(buttonType);
					button.classList.remove('button-container');
				});

				const buttons = buildButton(allButtons[0]);

				col.insertBefore(buttons, allButtons[0]);
				allButtons.forEach((button) => button.remove());
			}

			if (pic) {
				const picWrapper = pic.closest('div');
				const picParent = pic.parentNode;

				// Remove uneccesary p tag around the picture
				if (picParent.tagName === 'P') {
					picWrapper.insertBefore(pic, picParent);
					picParent.remove();
				}

				if (picWrapper && picWrapper.children.length === 1) {
					// picture is only content in column
					picWrapper.classList.add('image-column');
				}
			}
		});
	});

	loadCSS(`${window.hlx.codeBasePath}/blocks/column/column.css`);
}

export default function decorate(block) {
	const paragraphs = block.querySelectorAll('p');
	const hasReferenceColumn = Array.from(paragraphs).some((paragraph) => paragraph.textContent === 'Column');

	if (hasReferenceColumn) {
		const loopTargets = {
			columns: ['column'],
		};

		// Get block data from table
		const blockData = readBlockContent(block, loopTargets);
		buildCustomColumns(block, blockData);
	} else buildDefaultColumns(block);
}
