import { readBlockContent } from '../../scripts/utils.js';

const { liteClient: algoliasearch } = window['algoliasearch/lite'];
// eslint-disable-next-line
const { configure } = instantsearch.widgets;
const searchClient = algoliasearch('81AG9QID5C', 'c2ff4a58a6c848ca7c102f3c85ee4a39');
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

export default function decorate(block) {
	// eslint-disable-next-line
	const search = instantsearch({
		indexName: 'demo_EDS',
		searchClient,
	});
	const loopTargets = {
		listFilters: ['list-filter-title', 'list-filter-value'],
	};
	const blockData = readBlockContent(block, loopTargets);
	const filtersSidebar = document.createElement('div');
	const filtersSidebarButton = document.createElement('button');
	const filtersSidebarContent = document.createElement('div');
	const filtersSearch = document.createElement('div');
	const filtersReset = document.createElement('div');
	const filtersMain = document.createElement('div');
	const filtersResults = document.createElement('div');

	// Clear initial block content
	block.textContent = '';

	filtersSidebar.classList.add('filters-sidebar');
	filtersSidebarButton.type = 'button';
	filtersSidebarButton.classList.add('filters-sidebar-button', 'button', 'secondary', 'outline');
	filtersSidebarButton.innerText = 'Clear Filters';
	filtersSidebarContent.classList.add('filters-sidebar-content');
	filtersSearch.classList.add('filters-search');
	const filtersGroup = document.createElement('div');
	const filters = document.createElement('div');
	const filterTitle = document.createElement('legend');
	// const customRefinementList = connectRefinementList(renderRefinementList);
	filtersMain.classList.add('filters-main');

	// Content for Sidebar
	filtersReset.classList.add('filters-reset');
	filtersSidebarContent.appendChild(filtersReset);
	filtersSidebar.append(filtersSidebarButton, filtersSidebarContent);
	filters.classList.add('filters-widget');
	filtersGroup.classList.add('filters-group');
	filterTitle.classList.add('filter-title');
	filterTitle.innerHTML = blockData.listFilters['list-filter-title'].textContent;
	filtersGroup.append(filterTitle, filters);
	filtersSidebarContent.appendChild(filtersGroup);

	filtersSidebarButton.addEventListener('click', () => {
		toggleFilters(filtersSidebarButton, filtersSidebarContent);
	});

	toggleFilters(filtersSidebarButton, filtersSidebarContent, true);
	checkMediaQuery.addEventListener('change', () => {
		toggleFilters(filtersSidebarButton, filtersSidebarContent, true);
	});

	// Content for Results
	filtersResults.classList.add('filters-results');

	filtersMain.append(filtersSearch, filtersResults);
	block.append(filtersSidebar, filtersMain);
}
