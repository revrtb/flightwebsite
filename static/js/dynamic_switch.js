document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);

  function setText(el, text) {
    el.textContent = text;
  }

  function setAttr(el, name, value) {
    el.setAttribute(name, value);
  }

  // Buttons State
  function initButtonsState() {
    const enabledBtn = $("enabledBtn");
    const disabledBtn = $("disabledBtn");
    const toggleDisableBtn = $("toggleDisableBtn");
    const buttonMessage = $("buttonMessage");

    enabledBtn.addEventListener("click", () => {
      setText(buttonMessage, "Enabled button clicked");
      setAttr(buttonMessage, "data-state", "clicked");
    });

    disabledBtn.addEventListener("click", () => {
      setText(buttonMessage, "Disabled button clicked");
      setAttr(buttonMessage, "data-state", "disabled-clicked");
    });

    toggleDisableBtn.addEventListener("click", () => {
      disabledBtn.toggleAttribute("disabled");
    });
  }

  // Visibility
  function initVisibility() {
    const toggleVisibilityBtn = $("toggleVisibilityBtn");
    const secretSection = $("secretSection");

    toggleVisibilityBtn.addEventListener("click", () => {
      secretSection.classList.toggle("hidden");
    });
  }

  // Delayed Text
  function initDelayedText() {
    const delayedTextBtn = $("delayedTextBtn");
    const delayedText = $("delayedText");

    delayedTextBtn.addEventListener("click", () => {
      setText(delayedText, "Waiting...");
      setTimeout(() => {
        setText(delayedText, "Text Loaded");
      }, 3000);
    });
  }

  // Status Badge
  function initStatusBadge() {
    const statusBadge = $("statusBadge");
    const toggleStatusBtn = $("toggleStatusBtn");

    toggleStatusBtn.addEventListener("click", () => {
      const isActive = statusBadge.classList.toggle("active");
      statusBadge.classList.toggle("inactive", !isActive);

      const state = isActive ? "active" : "inactive";
      setText(statusBadge, state.toUpperCase());
      setAttr(statusBadge, "data-status", state);
    });
  }

  // Input Validation
  function initInputValidation() {
    const nameInput = $("nameInput");
    const inputError = $("inputError");

    nameInput.addEventListener("input", () => {
      const isValid = nameInput.value.length >= 3;
      inputError.classList.toggle("hidden", isValid);
    });
  }

  // Ambiguous Submit Buttons
  function initSubmitButtons() {
    const submitBtn1 = $("submitBtn1");
    const submitBtn2 = $("submitBtn2");
    const submitResult = $("submitResult");

    let submitClickCount = 0;

    function handleSubmitClick(index) {
      submitClickCount++;
      setText(submitResult, `Submit button ${index} clicked`);
      setAttr(submitResult, "data-last-clicked", index);
      setAttr(submitResult, "data-click-count", submitClickCount);
    }

    submitBtn1.addEventListener("click", () => handleSubmitClick("1"));
    submitBtn2.addEventListener("click", () => handleSubmitClick("2"));
  }

  // Selection Controls
  function initSelectionControls() {
    const countrySelect = $("countrySelect");
    const countryResult = $("countryResult");
    const paymentResult = $("paymentResult");
    const featureResult = $("featureResult");

    // Dropdown
    countrySelect.addEventListener("change", () => {
      const value = countrySelect.value;
      setText(
        countryResult,
        value ? `Selected: ${value}` : "No country selected"
      );
      setAttr(countryResult, "data-selected", value || "none");
    });

    // Radio
    document.querySelectorAll("input[name='payment']").forEach((radio) => {
      radio.addEventListener("change", () => {
        setText(paymentResult, `Payment: ${radio.value}`);
        setAttr(paymentResult, "data-payment", radio.value);
      });
    });

    // Checkbox
    const checkboxes = document.querySelectorAll("input[type='checkbox']");

    checkboxes.forEach((box) => {
      box.addEventListener("change", () => {
        const selected = [...checkboxes]
          .filter((cb) => cb.checked)
          .map((cb) => cb.value);

        setText(featureResult, `Selected: ${selected.join(", ")}`);
        setAttr(featureResult, "data-selected-count", selected.length);
      });
    });
  }

  // Dynamic Elements
  function initDynamicElements() {
    const addItemBtn = $("addItemBtn");
    const addDelayedItemBtn = $("addDelayedItemBtn");
    const itemsContainer = $("itemsContainer");
    const emptyState = $("emptyState");

    let itemCounter = 0;

    function updateContainerState() {
      const count = itemsContainer.querySelectorAll(".dynamic-item").length;
      setAttr(itemsContainer, "data-count", count);
      emptyState.style.display = count === 0 ? "block" : "none";
    }

    function createItem() {
      itemCounter++;

      const item = document.createElement("div");
      item.className = "dynamic-item";
      item.dataset.testid = "dynamic-item";
      item.dataset.index = itemCounter;
      item.dataset.status = "active";
      item.style.marginTop = "8px";

      item.innerHTML = `
        Item ${itemCounter}
        <button class="btn danger remove-btn"
                data-testid="remove-btn">
          Remove
        </button>
      `;

      itemsContainer.appendChild(item);
      updateContainerState();
    }

    addItemBtn.addEventListener("click", createItem);

    addDelayedItemBtn.addEventListener("click", () => {
      setTimeout(createItem, 2000);
    });

    itemsContainer.addEventListener("click", (e) => {
      if (e.target.classList.contains("remove-btn")) {
        const item = e.target.closest(".dynamic-item");
        item?.remove();
        updateContainerState();
      }
    });
  }

  function initAutoModal() {
    const autoModal = $("autoModal");
    const closeModal = $("closeModal");

    function showModal() {
      autoModal.classList.remove("hidden");
    }

    function hideModal() {
      autoModal.classList.add("hidden");
    }

    // Close button
    closeModal.addEventListener("click", hideModal);

    // Close when clicking outside content
    autoModal.addEventListener("click", (e) => {
      if (e.target === autoModal) hideModal();
    });

    // Check URL for ?modal=yes
    if (window.location.search.includes("modal=yes")) {
      showModal();
    }
  }

  // Initialize all
  initButtonsState();
  initVisibility();
  initDelayedText();
  initStatusBadge();
  initInputValidation();
  initSubmitButtons();
  initSelectionControls();
  initDynamicElements();
  initAutoModal();
});

