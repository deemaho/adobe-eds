import { readBlockContent, buildButton } from '../../scripts/utils.js';
import { toClassName, decorateIcons } from '../../scripts/aem.js';

function matchPattern(input, pattern, name, error, message) {
	if (input.value.match(pattern)) {
		input.removeAttribute('aria-invalid');
		input.removeAttribute('aria-describedby');

		return;
	}

	input.setAttribute('aria-invalid', 'true');
	input.setAttribute('aria-describedby', `${name}-error`);
	error.innerText = message;
}

function buildSelect(values, options) {
	const select = document.createElement('select');

	select.id = values.formName;
	select.name = values.formName;

	options.split('\n').forEach((option, index) => {
		const optionValue = index === 0 ? '' : option;
		const selectOption = new Option(option, optionValue);

		select.appendChild(selectOption);
	});

	return select;
}

function buildTextarea(values) {
	const textarea = document.createElement('textarea');

	textarea.id = toClassName(values.formName);
	textarea.name = toClassName(values.formName);
	textarea.placeholder = values.formName;

	return textarea;
}

function buildInput(values) {
	const input = document.createElement('input');

	input.type = values.formType.toLowerCase();
	input.id = toClassName(values.formName);
	input.name = toClassName(values.formName);
	input.placeholder = values.formName;
	if (values.formValue) input.value = values.formValue;
	if (values.formMode) input.setAttribute('inputmode', values.formMode);

	return input;
}

function buildFormField(values, options) {
	switch (values.formType) {
	case ('Select'):
		return buildSelect(values, options);
	case ('textarea'):
		return buildTextarea(values);
	default:
		return buildInput(values);
	}
}

export default async function decorate(block) {
	// Get block data from table
	const blockData = readBlockContent(block);
	const { pathname } = new URL(blockData.path.textContent);
	const formData = await fetch(pathname);
	const formJson = await formData.json();
	const form = document.createElement('form');
	const formButton = blockData.button;
	const buttonIcon = document.createElement('span');
	const formContent = blockData.content;

	// Clear initial block content
	block.textContent = '';

	// Build Form
	formJson.data.forEach((data) => {
		const formGroup = document.createElement('div');
		const formLabel = document.createElement('label');
		const formField = document.createElement('div');
		const formErrorMessage = document.createElement('span');
		const formValues = {
			formType: data.Type,
			formMode: data['Input Mode'],
			formName: data.Name,
			formValue: data.Value,
		};
		const formInput = buildFormField(formValues, data.Options);

		if (data.Style) formGroup.classList.add(toClassName(data.Style));
		if (data.Required) formInput.required = true;
		if (data.Pattern) formInput.pattern = data.Pattern;
		if (data.Autofocus) formInput.autofocus = true;
		formGroup.classList.add('form-group');
		formLabel.htmlFor = toClassName(data.Name);
		if (formValues.formType !== 'checkbox') formLabel.classList.add('sr-only');
		formLabel.innerText = data.Name;
		formField.classList.add('form-field');
		formField.appendChild(formInput);
		if (formValues.formType !== 'checkbox') {
			formErrorMessage.classList.add('form-error-message');
			formErrorMessage.id = `${data.Name}-error`;
			formField.appendChild(formErrorMessage);
		}
		if (formValues.formType === 'checkbox') formGroup.append(formField, formLabel);
		else formGroup.append(formLabel, formField);
		form.appendChild(formGroup);

		formInput.addEventListener('keydown', () => {
			if (formInput.getAttribute('aria-invalid') === 'true' && !data.Pattern) {
				formInput.removeAttribute('aria-invalid');
				formInput.removeAttribute('aria-describedby');
			}
		});
		formInput.addEventListener('change', () => {
			if (formInput.getAttribute('aria-invalid') === 'true' && !data.Pattern) {
				formInput.removeAttribute('aria-invalid');
				formInput.removeAttribute('aria-describedby');
			}
		});
		formInput.addEventListener('blur', () => {
			if (data.Pattern && formInput.value !== '') matchPattern(formInput, data.Pattern, data.Name, formErrorMessage, data['Error Message']);
		});
	});

	form.noValidate = true;
	form.addEventListener('submit', (event) => {
		event.preventDefault();
		const requiredFields = event.target.querySelectorAll('[required]');

		requiredFields.forEach((field) => {
			if (field.value === '') {
				field.setAttribute('aria-invalid', 'true');
				field.setAttribute('aria-describedby', `${field.id}-error`);
				field.nextElementSibling.innerText = 'This field is required.';
			}
		});
	});

	if (formContent) {
		const fullWidth = document.createElement('div');

		fullWidth.classList.add('form-group', 'full-width');
		fullWidth.appendChild(formContent);
		form.appendChild(fullWidth);
	}

	formButton.classList.add('form-button');
	buttonIcon.classList.add('icon', 'icon-arrow');
	formButton.appendChild(buttonIcon);
	form.appendChild(buildButton(formButton));
	formButton.type = 'submit';
	block.appendChild(form);
	decorateIcons(form);
}
