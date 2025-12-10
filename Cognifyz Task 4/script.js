// Grab elements
const form = document.getElementById("registerForm");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const termsCheckbox = document.getElementById("terms");
const submitBtn = document.getElementById("submitBtn");
const successMessage = document.getElementById("successMessage");

// Error elements
const nameError = document.getElementById("nameError");
const emailError = document.getElementById("emailError");
const phoneError = document.getElementById("phoneError");
const passwordError = document.getElementById("passwordError");
const confirmPasswordError = document.getElementById("confirmPasswordError");
const termsError = document.getElementById("termsError");

// Password strength elements
const strengthText = document.getElementById("strengthText");
const strengthBar = document.getElementById("strengthBar");

// Tabs (client-side routing)
const tabButtons = document.querySelectorAll(".tab-button");
const tabSections = document.querySelectorAll(".tab-section");

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.getAttribute("data-target");

    tabButtons.forEach((b) => b.classList.remove("active"));
    tabSections.forEach((sec) => sec.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById(target).classList.add("active");
  });
});

// Validation helpers
function setValid(input, errorElement, message = "") {
  input.classList.remove("invalid");
  input.classList.add("valid");
  errorElement.textContent = message;
}

function setInvalid(input, errorElement, message) {
  input.classList.remove("valid");
  input.classList.add("invalid");
  errorElement.textContent = message;
}

// Individual field validation
function validateName() {
  const value = nameInput.value.trim();
  if (value.length < 3) {
    setInvalid(nameInput, nameError, "Name must be at least 3 characters.");
    return false;
  }
  setValid(nameInput, nameError);
  return true;
}

function validateEmail() {
  const value = emailInput.value.trim();
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(value)) {
    setInvalid(emailInput, emailError, "Enter a valid email address.");
    return false;
  }
  setValid(emailInput, emailError);
  return true;
}

function validatePhone() {
  const value = phoneInput.value.trim();
  const regex = /^[0-9]{10}$/;
  if (!regex.test(value)) {
    setInvalid(phoneInput, phoneError, "Enter a 10-digit phone number.");
    return false;
  }
  setValid(phoneInput, phoneError);
  return true;
}

function calculatePasswordStrength(value) {
  let score = 0;
  if (value.length >= 8) score++;
  if (/[A-Z]/.test(value)) score++;
  if (/[a-z]/.test(value)) score++;
  if (/[0-9]/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;
  return score;
}

function updateStrengthMeter(score) {
  const percent = (score / 5) * 100;
  strengthBar.style.width = `${percent}%`;

  if (score <= 2) {
    strengthText.textContent = "Weak";
    strengthBar.style.background = "#ef4444";
  } else if (score === 3) {
    strengthText.textContent = "Medium";
    strengthBar.style.background = "#eab308";
  } else {
    strengthText.textContent = "Strong";
    strengthBar.style.background = "#22c55e";
  }
}

function validatePassword() {
  const value = passwordInput.value;
  const score = calculatePasswordStrength(value);
  updateStrengthMeter(score);

  if (score < 3) {
    setInvalid(
      passwordInput,
      passwordError,
      "Password must be 8+ chars with upper, lower, number & symbol."
    );
    return false;
  }
  setValid(passwordInput, passwordError);
  return true;
}

function validateConfirmPassword() {
  if (confirmPasswordInput.value !== passwordInput.value || !passwordInput.value) {
    setInvalid(
      confirmPasswordInput,
      confirmPasswordError,
      "Passwords do not match."
    );
    return false;
  }
  setValid(confirmPasswordInput, confirmPasswordError);
  return true;
}

function validateTerms() {
  if (!termsCheckbox.checked) {
    termsError.textContent = "You must accept the terms.";
    return false;
  }
  termsError.textContent = "";
  return true;
}

// Enable/disable submit
function updateSubmitState() {
  const allValid =
    validateName() &&
    validateEmail() &&
    validatePhone() &&
    validatePassword() &&
    validateConfirmPassword() &&
    validateTerms();

  submitBtn.disabled = !allValid;
}

// Live events
nameInput.addEventListener("input", () => {
  validateName();
  updateSubmitState();
});

emailInput.addEventListener("input", () => {
  validateEmail();
  updateSubmitState();
});

phoneInput.addEventListener("input", () => {
  validatePhone();
  updateSubmitState();
});

passwordInput.addEventListener("input", () => {
  validatePassword();
  validateConfirmPassword();
  updateSubmitState();
});

confirmPasswordInput.addEventListener("input", () => {
  validateConfirmPassword();
  updateSubmitState();
});

termsCheckbox.addEventListener("change", () => {
  validateTerms();
  updateSubmitState();
});

// Submit handler
form.addEventListener("submit", (e) => {
  e.preventDefault(); // no page reload

  if (!submitBtn.disabled) {
    successMessage.textContent =
      "Registration successful! (Client-side demo only, no data saved.)";
    successMessage.style.display = "block";

    // Optional: reset form but keep success visible briefly
    form.reset();
    [
      nameInput,
      emailInput,
      phoneInput,
      passwordInput,
      confirmPasswordInput,
    ].forEach((input) => {
      input.classList.remove("valid", "invalid");
    });
    strengthBar.style.width = "0";
    strengthText.textContent = "Weak";
    submitBtn.disabled = true;

    setTimeout(() => {
      successMessage.style.display = "none";
    }, 4000);
  }
});
