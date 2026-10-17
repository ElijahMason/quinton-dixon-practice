// Empty string keeps mailto off the page. A real address adds the email link.
const CONTACT_EMAIL = "";

(function () {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  let resetTimer = 0;

  function setOpen(open) {
    document.body.classList.toggle("nav-open", open);
    if (!toggle) return;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.textContent = open ? "Close" : "Menu";
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      const open = !document.body.classList.contains("nav-open");
      setOpen(open);
      if (!open) return;
      const first = nav.querySelector("a");
      if (first) first.focus();
    });

    document.addEventListener("keydown", function (event) {
      const open = document.body.classList.contains("nav-open");
      if (event.key === "Escape" && open) {
        setOpen(false);
        toggle.focus();
        return;
      }
      if (event.key !== "Tab" || !open) return;
      const focusable = [toggle].concat(Array.from(nav.querySelectorAll("a")));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) setOpen(false);
    });

    window.addEventListener("resize", function () {
      if (window.matchMedia("(min-width: 761px)").matches) setOpen(false);
    });
  }

  const form = document.querySelector("[data-brief]");
  if (!form) return;

  const output = document.querySelector("[data-brief-out]");
  const slot = document.querySelector("[data-mail-slot]");
  const button = form.querySelector("[data-brief-copy]");

  function field(name) {
    const nodes = form.querySelectorAll('[name="' + name + '"]');
    if (!nodes.length) return "";
    if (nodes[0].type === "radio") {
      const checked = Array.from(nodes).find(function (node) { return node.checked; });
      return checked ? checked.value.trim() : "";
    }
    return String(nodes[0].value || "").trim();
  }

  function compose() {
    return [
      "Brief for Quinton Dixon",
      "Name: " + field("name"),
      "Offer: " + field("offer"),
      "Owner: " + field("owner"),
      "Stop date: " + field("stop"),
      "Reason: " + field("reason"),
      "Note: " + field("note")
    ].join("\n");
  }

  function mailAddress() {
    const email = String(CONTACT_EMAIL || "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "";
    return email;
  }

  function paint() {
    const text = compose();
    if (output) output.textContent = text;
    if (!slot) return;
    slot.replaceChildren();
    const email = mailAddress();
    if (!email) return;
    const link = document.createElement("a");
    const subject = encodeURIComponent("Brief for Quinton Dixon");
    const body = encodeURIComponent(text);
    link.href = "mailto:" + email + "?subject=" + subject + "&body=" + body;
    link.textContent = "Email this brief";
    slot.appendChild(link);
  }

  function markButton(label) {
    if (!button) return;
    button.textContent = label;
    window.clearTimeout(resetTimer);
    resetTimer = window.setTimeout(function () {
      button.textContent = "Copy the brief";
    }, 2000);
  }

  function copyBrief() {
    const text = compose();
    paint();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        markButton("Copied");
      }).catch(function () {
        selectBrief();
      });
      return;
    }
    selectBrief();
  }

  function selectBrief() {
    if (!output) return;
    output.focus();
    const range = document.createRange();
    range.selectNodeContents(output);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    markButton("Brief selected");
  }

  form.addEventListener("input", paint);
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    copyBrief();
  });
  paint();
})();
