const form = document.getElementById("bookingForm");
const checkInInput = document.getElementById("checkIn");
const checkOutInput = document.getElementById("checkOut");
const roomType = document.getElementById("roomType");
const availabilityButton = document.getElementById("checkAvailability");
const modal = document.getElementById("successModal");
const closeModalButton = document.getElementById("closeModal");
const formStatus = document.getElementById("formStatus");
const modalMessage = document.getElementById("modalMessage");

const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const setDateLimits = () => {
  const today = formatLocalDate(new Date());
  checkInInput.min = today;

  const earliestCheckOut = checkInInput.value
    ? new Date(`${checkInInput.value}T00:00:00`)
    : new Date(`${today}T00:00:00`);
  earliestCheckOut.setDate(earliestCheckOut.getDate() + 1);
  checkOutInput.min = formatLocalDate(earliestCheckOut);

  if (checkOutInput.value && checkOutInput.value < checkOutInput.min) {
    checkOutInput.value = "";
  }
};

const setFieldError = (field, message) => {
  const wrapper = field.closest(".field");
  wrapper.classList.add("invalid");
  wrapper.querySelector(".error-message").textContent = message;
  field.setAttribute("aria-invalid", "true");
};

const clearFieldError = (field) => {
  const wrapper = field.closest(".field");
  wrapper.classList.remove("invalid");
  wrapper.querySelector(".error-message").textContent = "";
  field.removeAttribute("aria-invalid");
};

const validateDatesAndRoom = () => {
  let isValid = true;
  const today = formatLocalDate(new Date());

  if (!checkInInput.value) {
    setFieldError(checkInInput, "Please choose a check-in date.");
    isValid = false;
  } else if (checkInInput.value < today) {
    setFieldError(checkInInput, "Check-in cannot be in the past.");
    isValid = false;
  } else {
    clearFieldError(checkInInput);
  }

  if (!checkOutInput.value) {
    setFieldError(checkOutInput, "Please choose a check-out date.");
    isValid = false;
  } else if (checkInInput.value && checkOutInput.value <= checkInInput.value) {
    setFieldError(checkOutInput, "Check-out must be at least one day after check-in.");
    isValid = false;
  } else {
    clearFieldError(checkOutInput);
  }

  if (!roomType.value) {
    setFieldError(roomType, "Please select a room.");
    isValid = false;
  } else {
    clearFieldError(roomType);
  }

  return isValid;
};

checkInInput.addEventListener("change", () => {
  clearFieldError(checkInInput);
  setDateLimits();
  if (checkOutInput.value && checkOutInput.value < checkOutInput.min) {
    setFieldError(checkOutInput, "Choose a check-out date after check-in.");
  } else {
    clearFieldError(checkOutInput);
  }
});

checkOutInput.addEventListener("change", () => clearFieldError(checkOutInput));

form.querySelectorAll("input, select, textarea").forEach((field) => {
  field.addEventListener("input", () => {
    if (field.value.trim()) clearFieldError(field);
    formStatus.textContent = "";
  });
  field.addEventListener("change", () => {
    if (field.value) clearFieldError(field);
    formStatus.textContent = "";
  });
});

roomType.addEventListener("change", () => {
  if (roomType.value) clearFieldError(roomType);
});

availabilityButton.addEventListener("click", () => {
  formStatus.textContent = "";
  if (!validateDatesAndRoom()) {
    form.querySelector('[aria-invalid="true"]')?.focus();
    return;
  }

  formStatus.textContent = `${roomType.value} selected for ${checkInInput.value} to ${checkOutInput.value}. Submit a booking request for confirmation.`;
});

document.querySelectorAll("[data-room]").forEach((link) => {
  link.addEventListener("click", () => {
    roomType.value = link.dataset.room;
    clearFieldError(roomType);
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  formStatus.textContent = "";

  const requiredFields = [
    [document.getElementById("fullName"), "Please enter your full name."],
    [document.getElementById("email"), "Please enter a valid email address."],
    [document.getElementById("phone"), "Please enter your phone number."],
    [document.getElementById("adults"), "Please select the number of adults."]
  ];
  let isValid = validateDatesAndRoom();

  requiredFields.forEach(([field, message]) => {
    const value = field.value.trim();
    const validEmail = field.type !== "email" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    if (!value || !validEmail) {
      setFieldError(field, message);
      isValid = false;
    } else {
      clearFieldError(field);
    }
  });

  if (!isValid) {
    form.querySelector('[aria-invalid="true"]')?.focus();
    return;
  }

  const guestName = document.getElementById("fullName").value.trim();
  modalMessage.textContent = `Thanks, ${guestName}. Your ${roomType.value} request is ready for ${checkInInput.value} to ${checkOutInput.value}.`;
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  closeModalButton.focus();
});

const closeModal = () => {
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
};

closeModalButton.addEventListener("click", closeModal);

modal.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modal.classList.contains("hidden")) closeModal();
});

setDateLimits();
