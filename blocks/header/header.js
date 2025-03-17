import {
	readBlockContent,
	setCurrentPage,
} from '../../scripts/utils.js';
import { getMetadata } from '../../scripts/aem.js';
import loadFragment from '../../scripts/loadFragment.js';
import getScrollWidth from '../../scripts/getScrollWidth.js';

const checkMediaQuery = window.matchMedia('(width >= 48em)');

function setNavAttributes(navWrapper, mobileNavButton) {
	const isDesktop = checkMediaQuery.matches;

	if (isDesktop) {
		navWrapper.removeAttribute('aria-hidden');
		mobileNavButton.removeAttribute('aria-expanded');
		document.documentElement.classList.remove('lock-scroll');

		return;
	}

	navWrapper.setAttribute('aria-hidden', 'true');
	mobileNavButton.setAttribute('aria-expanded', 'false');
}

function toggleMobileNav(mobileNavButton, navWrapper) {
	const isOpen = mobileNavButton.getAttribute('aria-expanded') === 'true';

	mobileNavButton.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
	navWrapper.setAttribute('aria-hidden', isOpen ? 'true' : 'false');
	getScrollWidth(isOpen);
}

/**
* loads and decorates the header, mainly the nav
* @param {Element} block The header block element
*/
export default async function decorate(block) {
	// load nav as fragment
	const navMeta = getMetadata('nav');
	const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
	const fragment = await loadFragment(navPath, 'header');
	const blockData = readBlockContent(fragment);
	const headerLogo = blockData.logo.querySelector('a');
	const nav = document.createElement('nav');
	const navLinks = blockData.links;
	const mobileNavButton = document.createElement('button');
	const mobileNavSpan1 = document.createElement('span');
	const mobileNavSpan2 = document.createElement('span');

	// Clear initial block content
	block.textContent = '';

	if (headerLogo) {
		headerLogo.classList.add('logo');
		block.appendChild(headerLogo);
	}

	if (navLinks) {
		nav.classList.add('header-nav');
		navLinks.role = 'list';
		navLinks.classList.add('header-nav-links');
		nav.appendChild(navLinks);
		block.append(nav);
	}

	// Build Mobile Nav Button
	mobileNavButton.classList.add('mobile-nav-button');
	mobileNavButton.setAttribute('aria-expanded', 'false');
	mobileNavButton.setAttribute('aria-label', 'Toggle Nav');
	mobileNavButton.append(mobileNavSpan1, mobileNavSpan2);

	mobileNavButton.addEventListener('click', () => {
		toggleMobileNav(mobileNavButton, nav);
	});

	setNavAttributes(nav, mobileNavButton);
	checkMediaQuery.addEventListener('change', () => {
		setNavAttributes(nav, mobileNavButton);
	});
	block.appendChild(mobileNavButton);

	setCurrentPage(block.querySelectorAll('a'));
}
