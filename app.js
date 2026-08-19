const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  tg.setHeaderColor?.('#f4f3ee');
  tg.setBackgroundColor?.('#f4f3ee');
}

const stories = [
  {image:'./assets/story-01.svg', title:'место\nначинается\nс ощущения', action:'✦'},
  {image:'./assets/story-02.svg', title:'свет остаётся\nдаже когда\nего не видно', action:'↗'},
  {image:'./assets/story-03.svg', title:'а теперь\nможно просто\nсмотреть', action:'○'}
];
const gallery = Array.from({length:15},(_,i)=>`./assets/photo-${String(i+1).padStart(2,'0')}.svg`);

const intro=document.querySelector('#intro');
const start=document.querySelector('#start');
const storiesScreen=document.querySelector('#stories');
const galleryScreen=document.querySelector('#gallery');
const track=document.querySelector('#storyTrack');
const progress=document.querySelector('#storyProgress');
const counter=document.querySelector('#storyCounter');
const grid=document.querySelector('#galleryGrid');

stories.forEach((s)=>{
  const el=document.createElement('article'); el.className='story';
  el.innerHTML=`<img src="${s.image}" alt="" draggable="false"><div class="story-content"><h2 class="story-title">${s.title.replaceAll('\n','<br>')}</h2><button class="story-action" aria-label="Взаимодействовать"><span>${s.action}</span></button></div>`;
  track.appendChild(el);
  const p=document.createElement('i'); p.innerHTML='<b></b>'; progress.appendChild(p);
});

gallery.forEach((src,i)=>{
  const fig=document.createElement('figure');
  fig.innerHTML=`<img src="${src}" alt="Фото ${i+1}" loading="lazy" draggable="false">`;
  grid.appendChild(fig);
});

document.querySelector('#galleryCount').textContent=`${gallery.length} фото`;
let index=0, startX=0, deltaX=0, dragging=false;

function showStories(){
  intro.classList.remove('active'); storiesScreen.classList.add('active'); updateStory();
}

start.addEventListener('pointerup',()=>{
  unlockAudio();
  haptic('light');
  showStories();
},{once:true});

// Every touch on the story or gallery surface produces a subtle tactile response.
// The sound is intentionally soft and airy, like fingertips brushing silk.
document.addEventListener('pointerdown', (e) => {
  if (!storiesScreen.classList.contains('active') && !galleryScreen.classList.contains('active')) return;
  unlockAudio();
  haptic('light');
  playFabricTouch();
}, {passive:true});

function updateStory(){
  track.style.transform=`translate3d(${-index*100}%,0,0)`;
  [...progress.children].forEach((p,i)=>p.classList.toggle('active',i<=index));
  counter.textContent=`${String(index+1).padStart(2,'0')} / 03`;
}

track.addEventListener('pointerdown',e=>{dragging=true;startX=e.clientX;deltaX=0;track.setPointerCapture?.(e.pointerId)});
track.addEventListener('pointermove',e=>{if(!dragging)return;deltaX=e.clientX-startX;track.style.transform=`translate3d(calc(${-index*100}% + ${deltaX}px),0,0)`});
track.addEventListener('pointerup',()=>{if(!dragging)return;dragging=false;if(Math.abs(deltaX)>55){if(deltaX<0 && index<2) index++;else if(deltaX>0 && index>0) index--;else if(deltaX<0 && index===2){openGallery();return;}} updateStory()});
track.addEventListener('pointercancel',()=>{dragging=false;updateStory()});

function openGallery(){
  track.style.transform='translate3d(-200%,0,0)';
  setTimeout(()=>{storiesScreen.classList.remove('active');galleryScreen.classList.add('active');},350);
}

function haptic(style='light'){
  try { tg?.HapticFeedback?.impactOccurred(style); } catch (_) {}
  try { if (typeof navigator.vibrate === 'function') navigator.vibrate(style==='light' ? [10] : [20]); } catch (_) {}
}

let audioCtx = null;
let masterGain = null;
let noiseBuffer = null;

function unlockAudio(){
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = 0.32;
      masterGain.connect(audioCtx.destination);
      createFabricNoiseBuffer();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
  } catch (_) {}
}

// Airy silk texture: very short filtered noise with a feather-light envelope.
// No low thump — the old bass hit made the interaction feel heavy and mechanical.
function createFabricNoiseBuffer(){
  if (!audioCtx) return;
  const length = Math.floor(audioCtx.sampleRate * 0.13);
  noiseBuffer = audioCtx.createBuffer(1, length, audioCtx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  let last = 0;
  for (let i=0;i<length;i++) {
    const white = Math.random() * 2 - 1;
    last = last * 0.84 + white * 0.16;
    const attack = Math.min(1, i / (audioCtx.sampleRate * 0.008));
    const release = Math.exp(-i / (audioCtx.sampleRate * 0.045));
    data[i] = last * attack * release * 0.75;
  }
}

function playFabricTouch(){
  try {
    unlockAudio();
    if (!audioCtx || !masterGain || !noiseBuffer) return;
    const now = audioCtx.currentTime;

    const source = audioCtx.createBufferSource();
    source.buffer = noiseBuffer;

    const highpass = audioCtx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(900, now);

    const lowpass = audioCtx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(5200, now);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.16, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

    source.connect(highpass).connect(lowpass).connect(gain).connect(masterGain);
    source.start(now);
    source.stop(now + 0.13);
    source.onended = () => {
      source.disconnect();
      highpass.disconnect();
      lowpass.disconnect();
      gain.disconnect();
    };
  } catch (_) {}
}
