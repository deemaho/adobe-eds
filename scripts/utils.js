import { toClassName } from './aem.js';
import getScrollWidth from './getScrollWidth.js';

function getLocalePath() {
	const url = new URL(window.location.href);
	const paths = url.pathname.split('/').filter(Boolean).slice(0, 2);
	const localePath = `/${paths.join('/')}`;

	return localePath;
}

/**
 * Extracts the content from KVP structured blocks.
 * Borrowed from aem.js readBlockConfig which handles specific column contents.
 * readBlockContent() is to blindly serve any HTML content from a provided block key-value pair.
 * @param {Element} block The block element
 * @returns {object} The block config
 */
function readBlockContent(block, loopTargets = null) {
	const config = {};
	let array = [];
	let currentObject = {};
	let currentKey = '';

	// Helper to parse text content for key and class names
	function parseColumnKey(textContent) {
		const keyValue = textContent.includes(' (') ? textContent.split(' (', 1)[0] : textContent;
		const classNames = textContent.match(/\(([^)]+)\)/);
		const classArray = classNames ? classNames[1].split(',').map((name) => name.trim()) : null;

		return { keyValue: toClassName(keyValue), classArray };
	}

	// Helper to add classes to an element
	function addClassesToElement(element, classes) {
		if (classes) classes.forEach((className) => element.classList.add(toClassName(className)));
	}

	// Wrap multiple elements in a div
	function buildElements(elements, classArray) {
		const text = document.createElement('div');

		text.classList.add('text');
		if (classArray) addClassesToElement(text, classArray);

		elements.forEach((element) => {
			text.appendChild(element);
		});

		return text;
	}

	block.querySelectorAll(':scope > div').forEach((row) => {
		if (!row.children) return;

		const cols = [...row.children];

		if (!cols[1]) return;

		const columnChildren = cols[1].children;
		const { keyValue: name, classArray } = parseColumnKey(cols[0].textContent);

		// Add classes to element if applicable
		if (classArray && columnChildren.length < 2) addClassesToElement(columnChildren[0], classArray);

		// Collect column children or fallback to a single element
		const elements = [...columnChildren];
		const valueToStore = elements.length > 1
			? buildElements(elements, classArray)
			: columnChildren[0];

		// Create array of loopTargets if provided
		if (loopTargets) {
			// eslint-disable-next-line
			const foundPair = Object.entries(loopTargets).find(([_, targetValues]) => targetValues.includes(name));
			const foundKey = foundPair?.[0] || null;
			const isTargetValue = foundPair?.[1]?.[0] === name;
			const isSameKey = foundKey === currentKey;
			const isEmptyObject = Object.keys(currentObject).length === 0;

			if (isTargetValue) {
				if (isEmptyObject) {
					currentObject[name] = valueToStore;
					currentKey = foundKey;
				} else {
					array.push(currentObject);

					if (!isSameKey) {
						config[currentKey] = array;
						array = [];
					}

					currentObject = { [name]: valueToStore };
					currentKey = foundKey;
				}
			} else if (!isEmptyObject && isSameKey) {
				currentObject[name] = valueToStore;
			} else {
				config[name] = valueToStore;
			}
		} else {
			// Fallback logic when no loopTargets are provided
			config[name] = valueToStore;
		}
	});

	// Finalize the last set if loopTargets exist
	if (loopTargets && Object.keys(currentObject).length > 0) {
		array.push(currentObject);
		config[currentKey] = array;
	}

	return config;
}

/**
* Builds button and button container
* Can take a single button or an array of buttons
* Can take an array of the button and button label
* Removes the strong or em tag if they are authored but neither need to be authored
* Button class (primary, secondary)
* is authored with the button key and added to the button class list
* @param {Array} args The block element
* @returns {HTMLElement} The button container and buttons
*/
function buildButton(...args) {
	const buttonContainer = document.createElement('div');

	const createButtonTag = (obj) => {
		const buttonElement = document.createElement('button');
		const buttonText = obj.querySelector('a') ? obj.querySelector('a').innerHTML : obj.innerHTML;

		buttonElement.type = 'button';
		buttonElement.innerHTML = buttonText;

		return buttonElement;
	};
	const updateButton = (obj, label) => {
		const child = obj.children;
		const objClassList = obj.classList;
		let button = null;

		if (child.length === 0 || child[0].tagName === 'SPAN') button = createButtonTag(obj);
		else {
			const firstChild = child[0];

			button = firstChild.tagName === 'A' ? firstChild : firstChild.children[0];

			if (button.href.includes('#')) {
				const elementLink = button.href.split('#').pop();

				button = createButtonTag(obj);
				button.addEventListener('click', () => {
					const element = document.querySelector(`#${elementLink}`);

					if (!element) return;
					if (element.tagName === 'DIALOG') {
						element.showModal();
						getScrollWidth();
					}
				});
			}
		}

		button.className = 'button';
		if (objClassList) {
			objClassList.forEach((className) => button.classList.add(toClassName(className)));
		}
		button.removeAttribute('title');
		if (label) button.setAttribute('aria-label', label.textContent.trim());
		else button.removeAttribute('aria-label');
		buttonContainer.appendChild(button);
	};

	if (args.length === 1 && Array.isArray(args[0])) {
		args[0].forEach((item) => updateButton(item.button, item['button-label']));
	}

	if ((args.length >= 1 && !Array.isArray(args[0]))) updateButton(args[0], args[1]);

	buttonContainer.classList.add('button-container');

	return buttonContainer;
}

function setCurrentPage(links) {
	links.forEach((link) => {
		if (new URL(link.href).pathname === window.location.pathname) {
			link.setAttribute('aria-current', 'page');
		}
	});
}

export {
	readBlockContent,
	getLocalePath,
	setCurrentPage,
	buildButton,
};
