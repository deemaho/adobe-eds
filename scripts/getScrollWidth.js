export default function getScrollWidth(isOpen) {
	const html = document.documentElement;
	const windowWidth1 = html.clientWidth;
	const windowWidth2 = window.innerWidth;
	const scrollWidth = windowWidth2 - windowWidth1;

	html.classList.toggle('lock-scroll', !isOpen);
	html.style.setProperty('--scroll-width', `${scrollWidth}px`);
}
