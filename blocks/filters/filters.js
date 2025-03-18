import { readBlockContent } from '../../scripts/utils.js';
import { decorateIcons } from '../../scripts/aem.js';

const { liteClient: algoliasearch } = window['algoliasearch/lite'];
const searchClient = algoliasearch('81AG9QID5C', 'c2ff4a58a6c848ca7c102f3c85ee4a39');
// eslint-disable-next-line
// eslint-disable-next-line
const { connectSearchBox, connectClearRefinements, connectRefinementList, connectHits } = instantsearch.connectors;
const checkMediaQuery = window.matchMedia('(width >= 62em)');

function toggleFilters(button, content, init) {
	const isDesktop = checkMediaQuery.matches;
	const isOpen = button.getAttribute('aria-expanded') === 'true';

	if (isDesktop) {
		button.setAttribute('aria-toggled', 'false');
		content.removeAttribute('aria-hidden');

		return;
	}

	button.setAttribute('aria-toggled', 'false');
	content.setAttribute('aria-hidden', init ? 'true' : String(isOpen));
	button.setAttribute('aria-expanded', init ? 'false' : String(!isOpen));
}

function renderSearchBox(renderOptions, isFirstRender) {
	const {
		refine, clear, widgetParams,
	} = renderOptions;
	const { container, placeholder } = widgetParams;

	if (isFirstRender) {
		const label = document.createElement('label');
		const input = document.createElement('input');
		const clearButton = document.createElement('button');
		const clearIcon = document.createElement('span');
		const submitButton = document.createElement('button');
		const submitIcon = document.createElement('span');

		label.classList.add('sr-only');
		label.htmlFor = placeholder.toLowerCase();
		input.type = 'text';
		input.name = placeholder.toLowerCase();
		input.id = placeholder.toLowerCase();
		input.placeholder = placeholder;
		clearIcon.classList.add('icon', 'icon-close');
		clearButton.hidden = true;
		clearButton.type = 'button';
		clearButton.classList.add('clear-search');
		clearButton.setAttribute('aria-label', 'Clear Search');
		clearButton.appendChild(clearIcon);
		submitIcon.classList.add('icon', 'icon-search');
		submitButton.classList.add('submit-search');
		submitButton.type = 'button';
		submitButton.setAttribute('aria-label', 'Submit Search');
		submitButton.appendChild(submitIcon);

		input.addEventListener('keyup', (event) => {
			if (event.key === 'Enter') refine(event.target.value);
		});

		input.addEventListener('input', (event) => {
			clearButton.hidden = event.target.value === '';
		});

		clearButton.addEventListener('click', () => {
			clearButton.hidden = true;
			input.value = '';
			clear();
		});

		submitButton.addEventListener('click', () => {
			if (input.value !== '') refine(input.value);
		});

		container.append(label, input, clearButton, submitButton);
	}
}

function renderClearRefinements(renderOptions, isFirstRender) {
	const { refine, widgetParams } = renderOptions;
	const { container } = widgetParams;

	if (isFirstRender) {
		const button = document.createElement('button');

		button.type = 'button';
		button.innerText = 'Clear Filters';
		button.classList.add('button', 'secondary', 'outline');
		container.classList.add('button-container');
		container.appendChild(button);

		button.addEventListener('click', () => {
			refine();
		});
	}
}

function renderHits(renderOptions, isFirstRender) {
	const { items, widgetParams } = renderOptions;
	const { container } = widgetParams;

	if (isFirstRender) return;

	// Clear previous results first
	container.innerHTML = '';

	items.forEach((hit) => {
		const resultCard = document.createElement('div');
		const resultContent = document.createElement('div');
		const resultImage = document.createElement('img');
		const resultLinkContainer = document.createElement('div');
		const resultLink = document.createElement('a');
		const resultLinkIcon = document.createElement('span');
		const resultDescription = document.createElement('p');

		resultCard.classList.add('filter-result-card');
		resultImage.width = '92';
		resultImage.height = '92';
		resultImage.src = hit.thumbnailImage;
		resultContent.classList.add('filter-result-content');
		resultLinkIcon.classList.add('icon', 'icon-arrow');
		resultLink.innerText = hit.pageName;
		resultLink.href = hit.url;
		resultLink.classList.add('button');
		resultLink.appendChild(resultLinkIcon);
		resultLinkContainer.classList.add('button-container');
		resultLinkContainer.appendChild(resultLink);
		resultDescription.innerText = hit.description;
		resultContent.append(resultLinkContainer, resultDescription);
		resultCard.append(resultImage, resultContent);
		container.appendChild(resultCard);
	});

	decorateIcons(container);
}

function renderRefinementList(renderOptions, isFirstRender) {
	const { items, refine, widgetParams } = renderOptions;
	const { container, attribute } = widgetParams;
	const searchParams = new URLSearchParams(window.location.search);

	if (isFirstRender) {
		const list = document.createElement('ul');

		list.role = 'list';
		container.appendChild(list);

		searchParams.forEach((param, key) => {
			if (widgetParams.attribute === key) refine(param);
		});
	}

	const containerList = container.querySelector('ul');

	// Clear previous results first
	containerList.innerHTML = '';
	container.querySelector('.no-filters')?.remove();

	items.forEach((item) => {
		const listItem = document.createElement('li');
		const inputContainer = document.createElement('div');
		const input = document.createElement('input');
		const inputIcon = document.createElement('span');
		const itemLabel = document.createElement('label');
		const { label } = item;

		inputContainer.classList.add('filter-checkbox');
		input.type = 'checkbox';
		input.name = attribute;
		input.value = label;
		input.id = label;
		inputIcon.classList.add('icon', 'icon-checkmark');
		inputContainer.append(input, inputIcon);
		itemLabel.htmlFor = label;
		itemLabel.innerText = String(label).charAt(0).toUpperCase() + String(label).slice(1);
		listItem.append(inputContainer, itemLabel);
		containerList.appendChild(listItem);

		if (item.isRefined) {
			input.checked = true;
		}

		input.addEventListener('click', () => {
			refine(input.value);
		});
	});

	if (items.length === 0 && !isFirstRender) {
		const noFilters = document.createElement('p');

		noFilters.classList.add('no-filters');
		noFilters.innerText = 'No filters to apply';
		container.appendChild(noFilters);
	}

	decorateIcons(container);
}

export default function decorate(block) {
	// eslint-disable-next-line
	const search = instantsearch({
		indexName: 'Sample Index',
		searchClient,
	});
	const blockData = readBlockContent(block);
	const filtersSidebar = document.createElement('div');
	const filtersSidebarButton = document.createElement('button');
	const filtersSidebarContent = document.createElement('div');
	const filtersSearch = document.createElement('div');
	const filtersClear = document.createElement('div');
	const filtersMain = document.createElement('div');
	const filtersResults = document.createElement('div');

	// Clear initial block content
	block.textContent = '';

	filtersMain.classList.add('filters-main');
	filtersSidebar.classList.add('filters-sidebar');
	filtersSidebarButton.type = 'button';
	filtersSidebarButton.classList.add('filters-sidebar-button', 'button', 'secondary', 'outline');
	filtersSidebarButton.innerText = 'Show Filters';
	filtersSidebarContent.classList.add('filters-sidebar-content');
	filtersSearch.classList.add('filters-search');

	const filtersGroup = document.createElement('div');
	const filters = document.createElement('div');
	const filterTitle = document.createElement('legend');
	const customSearchBox = connectSearchBox(renderSearchBox);
	const customClearRefinements = connectClearRefinements(renderClearRefinements);
	const customRefinementList = connectRefinementList(renderRefinementList);

	// Content for Sidebar
	filtersSidebar.append(filtersSidebarButton, filtersSidebarContent);
	filtersClear.classList.add('filters-clear');
	filters.classList.add('filters-widget');
	filtersGroup.classList.add('filters-group');
	filterTitle.classList.add('filter-title');
	filterTitle.innerHTML = blockData['list-filter-title'].textContent;
	filtersGroup.append(filterTitle, filters);
	filtersSidebarContent.append(filtersSearch, filtersClear, filtersGroup);

	filtersSidebarButton.addEventListener('click', () => {
		toggleFilters(filtersSidebarButton, filtersSidebarContent);
	});

	toggleFilters(filtersSidebarButton, filtersSidebarContent, true);
	checkMediaQuery.addEventListener('change', () => {
		toggleFilters(filtersSidebarButton, filtersSidebarContent, true);
	});

	filters.classList.add('filters-widget');
	filtersGroup.classList.add('filters-group');
	filterTitle.classList.add('filter-title');
	filterTitle.innerHTML = blockData['list-filter-title'].textContent;
	filtersGroup.append(filterTitle, filters);
	filtersSidebarContent.appendChild(filtersGroup);

	// Content for Results
	filtersResults.classList.add('filters-results');
	const customHits = connectHits(renderHits);

	search.addWidgets([
		customSearchBox({
			container: filtersSearch,
			placeholder: 'Search',
		}),
		customClearRefinements({
			container: filtersClear,
		}),
		customRefinementList({
			container: filters,
			attribute: blockData['list-filter-value'].textContent,
			sortBy: ['name:asc'],
		}),
		customHits({
			container: filtersResults,
		}),
	]);

	filtersMain.appendChild(filtersResults);
	block.append(filtersSidebar, filtersMain);
	search.start();
	decorateIcons(filtersSidebar);
}
