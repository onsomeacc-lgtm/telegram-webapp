const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  tg.setHeaderColor?.('#f4f3ee');
  tg.setBackgroundColor?.('#f4f3ee');
}

const stories = [
  {image:'./assets/story-01.svg', title:'место\nначинается\nс ощущения', action:'✦', sound:'./assets/tkan1.mp3'},
  {image:'./assets/grass.jpg', title:'свет остаётся\nдаже когда\nего не видно', action:'↗', sound:'./assets/trava2.mp3'},
  {image:'./assets/sand3.jpg', title:'а теперь\nможно просто\nсмотреть', action:'○', sound:'./assets/pesok3.mp3'}
];
const gallery = [
  './assets/gallery/55362965963_c670475b61_o.jpg',
  './assets/gallery/55362966458_a7fe009864_k.jpg',
  './assets/gallery/55408618546_73655e5bf2_b.jpg',
  './assets/gallery/55408735368_5bcdbd95c0_b.jpg',
  './assets/gallery/55420000651_fc4e00c610_6k.jpg',
  './assets/gallery/55425794394_0816329958_o.jpg',
  './assets/gallery/55426018275_eb9e50ba27_o.jpg',
  './assets/gallery/55428295814_60989fbb19_o.jpg'
];

const intro=document.querySelector('#intro');
const start=document.querySelector('#start');
const storiesScreen=document.querySelector('#stories');
const galleryScreen=document.querySelector('#gallery');
const track=document.querySelector('#storyTrack');
const progress=document.querySelector('#storyProgress');
const counter=document.querySelector('#storyCounter');
const grid=document.querySelector('#galleryGrid');

const storySounds = stories.map((story) => {
  const audio = new Audio(story.sound);
  audio.preload = 'auto';
  return audio;
});

stories.forEach((s)=>{
  const el=document.createElement('article'); el.className='story';
  el.innerHTML=`<img src="${s.image}" alt="" draggable="false"><div class="story-content"><h2 class="story-title">${s.title.replaceAll('\n','<br>')}</h2><button class="story-action" aria-label="Взаимодействовать"><span>${s.action}</span></button></div></div>`;
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
let pressed=false;
let hapticInterval=null;

function showStories(){
  intro.classList.remove('active'); storiesScreen.classList.add('active'); updateStory();
}

start.addEventListener('pointerup',()=>{
  unlockAudio();
  showStories();
},{once:true});

track.addEventListener('pointerdown', (e) => {
  pressed = true;
  startX = e.clientX;
  deltaX = 0;
  track.setPointerCapture?.(e.pointerId);
  unlockAudio();
  startStoryInteraction();
});

track.addEventListener('pointermove', (e) => {
  if (!pressed) return;
  deltaX = e.clientX - startX;
  track.style.transform=`translate3d(calc(${-index*100}% + ${deltaX}px),0,0)`;
  pulseHapticOnMove();
});

function endStoryInteraction(){
  pressed = false;
  stopStorySound();
  stopHaptic();
}

track.addEventListener('pointerup', (e) => {
  if (!pressed) return;
  dragging=false;
  endStoryInteraction();
  if(Math.abs(deltaX)>55){
    if(deltaX<0 && index<2) index++;
    else if(deltaX>0 && index>0) index--;
    else if(deltaX<0 && index===2){openGallery();return;}
  }
  updateStory();
});
track.addEventListener('pointercancel',()=>{dragging=false;updateStory();endStoryInteraction()});
track.addEventListener('lostpointercapture',()=>{if(pressed) endStoryInteraction()});

function startStoryInteraction(){
  playStorySound(index);
  haptic('light');
  stopHaptic();
  hapticInterval = setInterval(() => haptic('light'), 80);
}

function pulseHapticOnMove(){
  haptic('light');
}

function playStorySound(storyIndex){
  try {
    stopStorySound();
    const audio = storySounds[storyIndex];
    if (!audio) return;
    audio.loop = true;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } catch (_) {}
}

function stopStorySound(){
  storySounds.forEach((audio) => {
    try {
      audio.pause();
      audio.currentTime = 0;
      audio.loop = false;
    } catch (_) {}
  });
}

function updateStory(){
  stopStorySound();
  track.style.transform=`translate3d(${-index*100}%,0,0)`;
  [...progress.children].forEach((p,i)=>p.classList.toggle('active',i<=index));
  counter.textContent=`${String(index+1).padStart(2,'0')} / 03`;
}

function openGallery(){
  stopStorySound();
  stopHaptic();
  track.style.transform='translate3d(-200%,0,0)';
  setTimeout(()=>{storiesScreen.classList.remove('active');galleryScreen.classList.add('active');},350);
}

function haptic(style='light'){
  try { tg?.HapticFeedback?.impactOccurred(style); } catch (_) {}
  try { if (typeof navigator.vibrate === 'function') navigator.vibrate(style==='light' ? [10] : [20]); } catch (_) {}
}

function stopHaptic(){
  if (hapticInterval) {
    clearInterval(hapticInterval);
    hapticInterval=null;
  }
  try { navigator.vibrate?.(0); } catch (_) {}
}

let audioUnlocked = false;
function unlockAudio(){
  if (audioUnlocked) return;
  audioUnlocked = true;
  storySounds.forEach((audio) => {
    try { audio.load(); } catch (_) {}
  });
}
