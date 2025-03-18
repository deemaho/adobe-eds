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
		query, refine, clear, widgetParams,
	} = renderOptions;
	const { container } = widgetParams;

	if (isFirstRender) {
		const input = document.createElement('input');
		const button = document.createElement('button');
		const icon = document.createElement('span');

		icon.classList.add('icon', 'icon-close');
		button.type = 'button';
		button.setAttribute('aria-label', 'Clear Search');
		button.appendChild(icon);
		input.addEventListener('input', (event) => {
			refine(event.target.value);
		});

		button.addEventListener('click', () => {
			clear();
		});

		container.appendChild(input);
		container.appendChild(button);
	}

	container.querySelector('input').value = query;
	container.querySelector('button').hidden = query === '';
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
		const resultLink = document.createElement('a');

		resultCard.classList.add('result-card');
		resultContent.classList.add('result-content');
		resultLink.innerText = hit.pagename;
		resultLink.href = hit.url;
		resultContent.appendChild(resultLink);
		resultCard.appendChild(resultContent);
		container.appendChild(resultCard);
	});
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
		const input = document.createElement('input');
		const itemLabel = document.createElement('label');
		const { label } = item;

		input.type = 'checkbox';
		input.name = attribute;
		input.value = label;
		input.id = label;
		itemLabel.htmlFor = label;
		itemLabel.innerText = String(label).charAt(0).toUpperCase() + String(label).slice(1);
		listItem.append(input, itemLabel);
		containerList.appendChild(listItem);

		if (item.isRefined) {
			input.checked = true;
		}
	});

	if (items.length === 0 && !isFirstRender) {
		const noFilters = document.createElement('p');

		noFilters.classList.add('no-filters');
		noFilters.innerText = 'No filters to apply';
		container.appendChild(noFilters);
		return;
	}

	container.querySelectorAll('input').forEach((input) => {
		input.addEventListener('click', () => {
			refine(input.value);
		});
	});
}

export default function decorate(block) {
	// eslint-disable-next-line
	const search = instantsearch({
		indexName: 'demo_EDS',
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
