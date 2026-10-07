'use strict';
// Light-DOM components share the site's design tokens and remain easy to style.
// Set id-prefix when placing multiple copies of an input component on one page.
const emotionTemplates = {"modality-picker": "<div class=\"tabs\" role=\"group\" aria-label=\"Input type\"><button class=\"tab active\" data-mode=\"text\" aria-pressed=\"true\">Aa <span>Text</span></button><button class=\"tab\" data-mode=\"image\" aria-pressed=\"false\">\u25a7 <span>Image</span></button><button class=\"tab\" data-mode=\"video\" aria-pressed=\"false\">\u25b7 <span>Video</span></button></div>", "emotion-text-input": "<div class=\"panel\" id=\"text-panel\"><div class=\"panel-heading\"><label for=\"text-input\">What\u2019s on your mind?</label><span class=\"badge\">KEYWORD DEMO</span></div><p class=\"hint\" id=\"text-help\">Write a sentence or try an example below.</p><textarea id=\"text-input\" maxlength=\"1000\" placeholder=\"I feel excited about what\u2019s ahead, even if I\u2019m a little nervous\u2026\" aria-describedby=\"text-help count error\"></textarea><div class=\"text-meta\"><span>Only you can see your input</span><span id=\"count\">0 / 1000</span></div><div class=\"samples\"><span>Try an example</span><button data-sample=\"I feel happy and grateful to spend time with my friends.\">A happy moment</button><button data-sample=\"I am worried and nervous about my exam tomorrow.\">Before an exam</button><button data-sample=\"I feel sad and lonely after saying goodbye.\">A difficult goodbye</button></div></div>", "emotion-media-input": "<div class=\"panel\" id=\"media-panel\" hidden><div class=\"panel-heading\"><label for=\"media-input\" id=\"media-label\">Choose an image</label><span class=\"badge\">PREVIEW ONLY</span></div><p class=\"hint\" id=\"media-help\"></p><label class=\"upload\" for=\"media-input\"><span aria-hidden=\"true\">\u21a5</span><strong id=\"upload-title\">Choose a file</strong><span>Click to browse \u00b7 stays on your device</span><input id=\"media-input\" type=\"file\" aria-describedby=\"media-help error\"></label><div id=\"preview\" hidden><img id=\"image-preview\" alt=\"Your selected image\" hidden><video id=\"video-preview\" controls hidden></video><p id=\"file-name\"></p><button class=\"text-button\" id=\"remove-file\">Remove file</button></div></div>"};
class EmotionComponent extends HTMLElement {
  connectedCallback() {
    if (this.dataset.initialized) return;
    this.dataset.initialized = 'true';
    const template = document.createElement('template');
    template.innerHTML = emotionTemplates[this.localName];
    const fragment = template.content.cloneNode(true);
    const prefix = this.getAttribute('id-prefix') || '';
    if (prefix) {
      fragment.querySelectorAll('[id]').forEach(node => node.id = prefix + node.id);
      for (const attr of ['for', 'aria-describedby']) fragment.querySelectorAll(`[${attr}]`).forEach(node => {
        node.setAttribute(attr, node.getAttribute(attr).split(' ').filter(id => attr !== 'aria-describedby' || fragment.getElementById(prefix + id)).map(id => prefix + id).join(' '));
      });
    }
    this.append(fragment);
    if (this.localName === 'emotion-media-input') {
      this.querySelector('input').accept = 'image/jpeg,image/png,image/webp';
      this.querySelector('.hint').textContent = 'JPG, PNG or WebP · upload interface preview.';
    }
    if (this.localName === 'modality-picker') {
      this.addEventListener('click', event => {
        const button = event.target.closest('[data-mode]');
        if (!button || !this.contains(button)) return;
        this.querySelectorAll('[data-mode]').forEach(tab => {
          const active = tab === button;
          tab.classList.toggle('active', active);
          tab.setAttribute('aria-pressed', String(active));
        });
        this.dispatchEvent(new CustomEvent('modality-change', {bubbles: true, detail: {mode: button.dataset.mode}}));
      });
    }
    if (this.localName === 'emotion-text-input') {
      const input = this.querySelector('textarea');
      const count = this.querySelector('.text-meta span:last-child');
      input.addEventListener('input', () => { count.textContent = `${input.value.length} / ${input.maxLength}`; });
      this.addEventListener('click', event => {
        const sample = event.target.closest('[data-sample]');
        if (!sample || !this.contains(sample)) return;
        input.value = sample.dataset.sample;
        input.dispatchEvent(new Event('input', {bubbles: true}));
        input.focus();
      });
    }
  }
}
for (const name of Object.keys(emotionTemplates)) {
  customElements.define(name, class extends EmotionComponent {});
}
