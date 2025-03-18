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
	const logoContainer = document.createElement('div');
	const footerColumn2 = document.createElement('div');

	// Clear initial block content
	block.textContent = '';

	[footerColumn1, footerColumn2].forEach((column) => column.classList.add('column'));
	logoContainer.classList.add('footer-logo-container');
	if (blockData['logo-aria']) footerLogo.setAttribute('aria-label', blockData['logo-aria'].textContent);
	footerLogo.classList.add('logo');
	logoContainer.append(footerLogo, blockData.content);
	if (socialMedia) {
		socialMedia.role = 'list';
		socialMedia.classList.add('social-media-links');
		socialMedia.querySelectorAll('a').forEach((link) => {
			const iconName = Array.from(link.querySelector('.icon').classList)
				.find((c) => c.startsWith('icon-'))
				.substring(5);

			link.setAttribute(
				'aria-label',
				`Go to ${String(iconName).charAt(0).toUpperCase() + String(iconName).slice(1)} page`,
			);
		});
	}
	footerColumn1.append(logoContainer, socialMedia);
	if (footerLinks) {
		footerLinks.role = 'list';
		footerLinks.classList.add('footer-links');
	}
	footerColumn2.appendChild(footerLinks);

	block.append(footerColumn1, footerColumn2);
}
