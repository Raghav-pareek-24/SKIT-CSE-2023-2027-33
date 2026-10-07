'use strict';
const $ = id => document.getElementById(id);
const words = {
  Joy: ['happy', 'joy', 'excited', 'grateful', 'love', 'delighted', 'wonderful', 'thrilled'],
  Sadness: ['sad', 'lonely', 'unhappy', 'heartbroken', 'miserable', 'cry', 'miss', 'disappointed'],
  Anger: ['angry', 'furious', 'annoyed', 'hate', 'frustrated', 'irritated'],
  Fear: ['afraid', 'scared', 'worried', 'nervous', 'anxious', 'terrified', 'fear'],
  Surprise: ['surprised', 'amazed', 'unexpected', 'astonished', 'shocked']
};
const symbols = {Joy: '☀', Sadness: '☂', Anger: 'ϟ', Fear: '〰', Surprise: '✦', Neutral: '○'};
let mode = 'text';
let previewURL = null;
function clearResult() { $('result').hidden = true; $('empty-result').hidden = false; $('error').textContent = ''; }
function clearMedia() {
  $('video-preview').pause();
  for (const id of ['image-preview', 'video-preview']) { $(id).removeAttribute('src'); $(id).hidden = true; }
  $('video-preview').load();
  if (previewURL) URL.revokeObjectURL(previewURL);
  previewURL = null; $('media-input').value = ''; $('preview').hidden = true; $('file-name').textContent = '';
}
function updateCount() { $('count').textContent = `${$('text-input').value.length} / 1000`; clearResult(); }
document.querySelector('modality-picker').addEventListener('modality-change', event => {
  mode = event.detail.mode; clearResult(); clearMedia();
  $('text-panel').hidden = mode !== 'text'; $('media-panel').hidden = mode === 'text';
  $('media-label').textContent = `Choose ${mode === 'image' ? 'an image' : 'a video'}`;
  $('media-input').accept = mode === 'image' ? 'image/jpeg,image/png,image/webp' : 'video/mp4,video/webm';
  $('media-help').textContent = mode === 'image' ? 'JPG, PNG or WebP · up to 10 MB. Preview only; recognition is planned.' : 'MP4 or WebM · up to 50 MB. Preview only; recognition is planned.';
  $('analyze-button').textContent = mode === 'text' ? 'Explore emotion →' : 'Review preview →';
  $('action-note').textContent = mode === 'text' ? 'A small experiment in emotion.' : 'No emotion model connected yet.';
});
$('text-input').addEventListener('input', updateCount);
$('media-input').addEventListener('change', () => {
  const file = $('media-input').files[0]; clearResult(); if (!file) return;
  const allowed = mode === 'image' ? ['image/jpeg', 'image/png', 'image/webp'] : ['video/mp4', 'video/webm'];
  if (!allowed.includes(file.type) || file.size > (mode === 'image' ? 10 : 50) * 1024 * 1024) { clearMedia(); $('error').textContent = 'Please choose a supported file within the size limit.'; return; }
  if (previewURL) URL.revokeObjectURL(previewURL);
  previewURL = URL.createObjectURL(file);
  const media = $(mode === 'image' ? 'image-preview' : 'video-preview');
  media.src = previewURL; media.hidden = false; $('preview').hidden = false; $('file-name').textContent = file.name;
});
for (const id of ['image-preview', 'video-preview']) $(id).addEventListener('error', () => { if (!previewURL) return; clearMedia(); $('error').textContent = 'This file could not be previewed. Please try another supported file.'; });
$('remove-file').addEventListener('click', () => { clearMedia(); clearResult(); });
$('reset').addEventListener('click', () => { $('text-input').value = ''; updateCount(); clearMedia(); if (mode === 'text') $('text-input').focus(); else $('media-input').focus(); });
$('analyze-button').addEventListener('click', () => {
  clearResult(); $('cues').replaceChildren();
  if (mode !== 'text') {
    if (!previewURL) { $('error').textContent = `Choose ${mode === 'image' ? 'an image' : 'a video'} first.`; $('media-input').focus(); return; }
    $('result-title').textContent = 'Preview ready'; $('result-symbol').textContent = '▧';
    $('result-description').textContent = 'Your file stays in this browser. Emotion recognition for this input will become available when a trained model is connected.';
  } else {
    const text = $('text-input').value.trim();
    if (!text) { $('error').textContent = 'Write a sentence or choose an example to get started.'; $('text-input').focus(); return; }
    const tokens = text.toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g) || [];
    const matches = Object.entries(words).map(([emotion, vocabulary]) => ({emotion, hits: [...new Set(tokens.filter(token => vocabulary.includes(token)))]})).filter(item => item.hits.length).sort((a, b) => b.hits.length - a.hits.length);
    const top = matches[0]; const tied = top && matches.filter(item => item.hits.length === top.hits.length).length > 1;
    $('result-title').textContent = !top ? 'No clear keyword cues' : tied ? 'Mixed emotional cues' : `${top.emotion} cues`;
    $('result-symbol').textContent = symbols[top?.emotion || 'Neutral'];
    $('result-description').textContent = !top ? 'No words from the demo vocabulary were found. This does not mean your text is emotionally neutral.' : 'These words appear in the demo vocabulary. Context, negation, sarcasm and nuance can change their meaning; this is not a model prediction.';
    matches.forEach(({emotion, hits}) => { const row = document.createElement('div'); row.className = 'cue'; const label = document.createElement('span'); label.textContent = emotion; const value = document.createElement('span'); value.textContent = hits.join(', '); row.append(label, value); $('cues').append(row); });
  }
  $('empty-result').hidden = true; $('result').hidden = false;
});
window.addEventListener('pagehide', () => { if (previewURL) URL.revokeObjectURL(previewURL); });
