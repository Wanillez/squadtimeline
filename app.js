(() => {
  const BAKED_BACKUP = window.HENRI_NANCY_WEDDING_BACKUP || {};
  const BAKED_DETAILS = BAKED_BACKUP.details || {};
  const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

  function contentPath(element) {
    const parts = [];
    let current = element;
    while (current && current !== document.body) {
      let position = 1;
      let sibling = current.previousElementSibling;
      while (sibling) {
        if (sibling.tagName === current.tagName) position += 1;
        sibling = sibling.previousElementSibling;
      }
      parts.unshift(`${current.tagName.toLowerCase()}${position}`);
      current = current.parentElement;
    }
    return parts.join("-");
  }

  function makeContentAddressable() {
    const roots = [document.querySelector("main"), document.querySelector("footer")].filter(Boolean);
    const textNodes = [];

    roots.forEach((root) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let textNode = walker.nextNode();
      while (textNode) {
        const parent = textNode.parentElement;
        const excluded = parent?.closest("a, button, input, select, textarea, script, style, #updatedDate, [data-editable]");
        if (!excluded && textNode.textContent.trim()) textNodes.push(textNode);
        textNode = walker.nextNode();
      }
    });

    textNodes.forEach((textNode) => {
      const parent = textNode.parentElement;
      const original = textNode.textContent;
      const leading = original.match(/^\s*/)?.[0] || "";
      const trailing = original.match(/\s*$/)?.[0] || "";
      const content = original.slice(leading.length, original.length - trailing.length);
      if (!content) return;

      const textPosition = [...parent.childNodes]
        .filter((node) => node.nodeType === Node.TEXT_NODE)
        .indexOf(textNode) + 1;
      const wrapper = document.createElement("span");
      wrapper.dataset.editable = "";
      wrapper.dataset.key = `auto-${contentPath(parent)}-text${textPosition}`;
      wrapper.textContent = content;
      textNode.replaceWith(document.createTextNode(leading), wrapper, document.createTextNode(trailing));
    });
  }

  function updateEmptyDutyRow(node) {
    const dutyRow = node.closest(".person-card li");
    if (!dutyRow) return;
    dutyRow.classList.toggle("is-empty-editable", !node.textContent.trim());
  }

  makeContentAddressable();

  document.querySelectorAll("[data-editable]").forEach((node) => {
    if (hasOwn(BAKED_DETAILS, node.dataset.key)) {
      node.textContent = BAKED_DETAILS[node.dataset.key];
    }
    node.removeAttribute("contenteditable");
    updateEmptyDutyRow(node);
  });

  document.getElementById("printButton")?.addEventListener("click", () => window.print());
})();
