const form = document.querySelector('#invite-form');
const coverInput = document.querySelector('#cover');
const fileName = document.querySelector('#file-name');
const coverPreview = document.querySelector('#cover-preview');
const styleToggle = document.querySelector('#style-toggle');
const styleLabel = document.querySelector('#style-label');
const dialog = document.querySelector('#success-dialog');

const messages = {
  valueMissing: 'Campo obrigatório',
  typeMismatch: 'Informe um e-mail válido',
};

function setError(input, message = '') {
  const field = input.closest('.field');
  if (!field) return;
  field.classList.toggle('invalid', Boolean(message));
  const output = field.querySelector('.error');
  if (output) output.textContent = message;
  input.setAttribute('aria-invalid', String(Boolean(message)));
}

function validateField(input) {
  let message = '';
  if (input.validity.valueMissing) message = messages.valueMissing;
  else if (input.validity.typeMismatch) message = messages.typeMismatch;
  else if (input.id === 'phone' && input.value.replace(/\D/g, '').length < 10) message = 'Informe um telefone válido';
  else if (input.id === 'end' && input.value && document.querySelector('#start').value && new Date(input.value) <= new Date(document.querySelector('#start').value)) message = 'O fim deve ser posterior ao início';
  else if (input.id === 'cover' && input.files[0] && input.files[0].size > 5 * 1024 * 1024) message = 'A imagem deve ter no máximo 5 MB';
  setError(input, message);
  return !message;
}

form.querySelectorAll('input[required]:not([type=radio]):not([type=checkbox]), textarea[required]').forEach((input) => {
  input.addEventListener('blur', () => validateField(input));
  input.addEventListener('input', () => { if (input.closest('.field')?.classList.contains('invalid')) validateField(input); });
});

document.querySelectorAll('input[name="color"]').forEach((input) => input.addEventListener('change', () => {
  document.documentElement.style.setProperty('--brand', input.value);
}));

styleToggle.addEventListener('change', () => {
  document.body.classList.toggle('light-preview', styleToggle.checked);
  styleLabel.textContent = styleToggle.checked ? 'Claro' : 'Escuro';
});

coverInput.addEventListener('change', () => {
  const file = coverInput.files[0];
  fileName.textContent = file?.name || 'Nenhum arquivo selecionado';
  if (coverPreview.src.startsWith('blob:')) URL.revokeObjectURL(coverPreview.src);
  if (file && validateField(coverInput)) {
    coverPreview.src = URL.createObjectURL(file);
    coverPreview.hidden = false;
  } else {
    coverPreview.hidden = true;
  }
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const requiredFields = [...form.querySelectorAll('input[required]:not([type=radio]):not([type=checkbox]), textarea[required]')];
  const fieldsValid = requiredFields.map(validateField).every(Boolean);
  const themeSelected = form.querySelector('input[name="theme"]:checked');
  document.querySelector('#theme-error').textContent = themeSelected ? '' : 'Escolha um tema';
  const terms = document.querySelector('#terms');
  document.querySelector('#terms-error').textContent = terms.checked ? '' : 'Você precisa aceitar os termos';

  if (!fieldsValid || !themeSelected || !terms.checked) {
    (form.querySelector('.invalid input, .invalid textarea') || document.querySelector('#theme-error:not(:empty)') || terms).scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const data = new FormData(form);
  document.querySelector('#dialog-title').textContent = data.get('title');
  document.querySelector('#dialog-details').textContent = `${data.get('theme')} • ${data.get('eventType')} • contato: ${data.get('email')}`;
  dialog.showModal();
});

document.querySelector('#close-dialog').addEventListener('click', () => dialog.close());
