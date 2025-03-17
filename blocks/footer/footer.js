import { readBlockContent } from '../../scripts/utils.js';
import { getMetadata } from '../../scripts/aem.js';
import loadFragment from '../../scripts/loadFragment.js';

/**
* loads and decorates the footer
* @param {Element} block The footer block element
*/
export default async function decorate(block) {
	// load footer as fragment
	const footerMeta = getMetadata('footer');
	const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
	const fragment = await loadFragment(footerPath, 'footer');
	const blockData = readBlockContent(fragment);
	const footerLogo = blockData.logo.querySelector('a');
	const socialMedia = blockData['social-media'];
	const footerLinks = blockData.links;
	const footerColumn1 = document.createElement('div');
	const footerColumn2 = document.createElement('div');

	// Clear initial block content
	block.textContent = '';

	[footerColumn1, footerColumn2].forEach((column) => column.classList.add('column'));
	if (footerLogo) footerLogo.classList.add('logo');
	if (socialMedia) {
		socialMedia.role = 'list';
		socialMedia.classList.add('social-media-links');
	}
	footerColumn1.append(footerLogo, socialMedia);
	if (footerLinks) {
		footerLinks.role = 'list';
		footerLinks.classList.add('footer-links');
	}
	footerColumn2.appendChild(footerLinks);

	block.append(footerColumn1, footerColumn2);
}
