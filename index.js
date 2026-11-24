"use strict";
(function() {

  /**
   * Name: Robin Luo
   * Date: September 3, 2026
   * HTML for practice job application
   */

  window.addEventListener("load", init);
  window.addEventListener('beforeunload', saveFields);
  document.addEventListener('DOMContentLoaded', () => {
      wireFileInputs();
      restoreFields();
      qsa('[data-field]').forEach((el) => {
        if (el.type === 'file') return;
        el.addEventListener('input', saveFields);
        el.addEventListener('change', saveFields);
      });
    });

  const STORAGE_KEY = 'jobAppPracticeData';

  /** this function initiates the code when the page loads and adds event listeners to my buttons */
  function init() {
    // Auto-wire: restore on load, save continuously as the user types,
    // and save once more right before navigating away (covers browser back/forward).

    let applyButtons = document.getElementsByClassName("apply");
    for (let i = 0; i < applyButtons.length; i++) {
        applyButtons[i].addEventListener('click', apply, false);
    }

    id("two").addEventListener("click", two);
    id("three").addEventListener("click", three);
    id("four").addEventListener("click", four);
    id("five").addEventListener("click", five);
    id("six").addEventListener("click", six);
    id("finish").addEventListener("click", finish);
    id("home").addEventListener("click", home);
    id("reset").addEventListener("click", reset);
  }

  function apply() {
    console.log("apply button clicked");
    window.location.href = "pageone.html";
  }

  function reset() {
    console.log("reset button clicked");
    clearStoredData();
    window.location.href = "index.html";
  }

  function home() {
    console.log("home button clicked");
    window.location.href = "index.html";
  }

  function two() {
    console.log("hii");
    // id("names").requestSubmit();
    window.location.href = "pagetwo.html";
  }

  function three() {
    window.location.href = "pagethree.html";
  }

  function four() {
    window.location.href = "pagefour.html";
  }

  function five() {
    window.location.href = "pagefive.html";
  }

  function six() {
    window.location.href = "pagesix.html";
  }

  function finish() {
    window.location.href = "finish.html";
  }
  

  function getStoredData() {
    try {
      return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  }

  function setStoredData(data) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      // Most likely QuotaExceededError — sessionStorage is typically capped
      // around 5-10MB per origin, and base64 file data eats into that fast.
      console.error('Could not save form data (storage may be full):', err);
      alert('That file is too large to save while switching pages. Try a smaller file.');
    }
  }

  // Restore saved values into any field on the current page.
  // File inputs can't be restored (browsers block that for security), so instead
  // we look for a matching [data-file-preview] element and show what was uploaded.
  function restoreFields() {
    const data = getStoredData();
    qsa('[data-field]').forEach((el) => {
      const key = el.dataset.field;
      if (!(key in data)) return;

      if (el.type === 'file') {
        renderFilePreview(key, data[key]);
      } else if (el.type === 'checkbox') {
        el.checked = Boolean(data[key]);
      } else if (el.type === 'radio') {
        el.checked = el.value === data[key];
      } else {
        el.value = data[key];
      }
    });
  }

  // Save the current page's fields into the shared record.
  // File inputs are handled separately (see wireFileInputs) since reading
  // a file is asynchronous and produces a {name, type, dataUrl} object, not a string.
  function saveFields() {
    const data = getStoredData();
    document.querySelectorAll('[data-field]').forEach((el) => {
      if (el.type === 'file') return; // handled by its own change listener
      const key = el.dataset.field;
      if (el.type === 'checkbox') {
        data[key] = el.checked;
      } else if (el.type === 'radio') {
        if (el.checked) data[key] = el.value;
      } else {
        data[key] = el.value;
      }
    });
    setStoredData(data);
  }

  // Show a filename + preview/download link wherever the page has
  // <div data-file-preview="sameKeyAsInput"></div>
  function renderFilePreview(key, fileData) {
    const preview = document.querySelector(`[data-file-preview="${key}"]`);
    if (!preview || !fileData) return;
    preview.innerHTML = `<a href="${fileData.dataUrl}" download="${fileData.name}">${fileData.name}</a> <button type="button" class="file-clear" data-clear-field="${key}">Remove</button>`;
  }

  // Wire up file inputs: read the chosen file as base64 and store it,
  // and wire up "Remove" buttons to clear a stored file.
  function wireFileInputs() {
    qsa('input[type="file"][data-field]').forEach((input) => {
      const key = input.dataset.field;

      input.addEventListener('change', () => {
        const file = input.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
          const data = getStoredData();
          data[key] = { name: file.name, type: file.type, dataUrl: reader.result };
          setStoredData(data);
          renderFilePreview(key, data[key]);
        };
        reader.readAsDataURL(file);
      });
    });

    document.addEventListener('click', (e) => {
      if (!e.target.matches('[data-clear-field]')) return;
      const key = e.target.dataset.clearField;
      const data = getStoredData();
      delete data[key];
      setStoredData(data);
      const preview = qs(`[data-file-preview="${key}"]`);
      if (preview) preview.innerHTML = '';
      const input = qs(`input[type="file"][data-field="${key}"]`);
      if (input) input.value = '';
    });
  }

  // Wipe everything (call this after a real "final submit")
  function clearStoredData() {
    sessionStorage.removeItem(STORAGE_KEY);
  }

  /* ------------------------------ Helper Functions  ------------------------------ */

  /**
   * Returns a new element with the given tag name.
   * @param {string} tagName - HTML tag name for new DOM element.
   * @returns {object} New DOM object for given HTML tag.
   */
  function gen(tagName) {
    return document.createElement(tagName);
  }

  /**
   * Helper function to return the response's result text if successful, otherwise
   * returns the rejected Promise result with an error status and corresponding text
   * @param {object} res - response to check for success/error
   * @return {object} - valid response if response was successful, otherwise rejected
   *                    Promise result
   */
  async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

  /**
   * Returns the element that has the ID attribute with the specified value.
   * @param {string} id - element ID
   * @return {object} DOM object associated with id.
   */
  function id(id) {
    return document.getElementById(id);
  }

  function cl(selector) {
    return document.getElementsByClassName(selector);
  }

  function qs(selector) {
    return document.querySelector(selector);
  }

  function qsa(selector) {
    return document.querySelectorAll(selector);
  }
})();