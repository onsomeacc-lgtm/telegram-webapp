const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  tg.setHeaderColor?.('#f4f3ee');
  tg.setBackgroundColor?.('#f4f3ee');
}

const stories = [
  {image:'./assets/story-01.svg', title:'место\nначинается\nс ощущения', action:'✦', sound:'./assets/tkan1.mp3'},
  {image:'./assets/story-02.svg', title:'свет остаётся\nдаже когда\nего не видно', action:'↗', sound:'./assets/trava2.mp3'},
  {image:'./assets/story-03.svg', title:'а теперь\nможно просто\nсмотреть', action:'○', sound:'./assets/pesok3.mp3'}
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

// Custom sounds: story 1 -> tkan1, story 2 -> trava2, story 3 -> pesok3.
const storySounds = stories.map((story) => {
  const audio = new Audio(story.sound);
  audio.preload = 'auto';
  return audio;
});

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

// Play the custom sound belonging to the currently visible story.
document.addEventListener('pointerdown', () => {
  if (!storiesScreen.classList.contains('active')) return;
  unlockAudio();
  haptic('light');
  playStorySound(index);
}, {passive:true});

function playStorySound(storyIndex){
  try {
    const audio = storySounds[storyIndex];
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } catch (_) {}
}

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

// Unlock audio playback after the first user gesture. The actual story sounds
// are external files in ./assets/ and are no longer synthesized by Web Audio.
let audioUnlocked = false;
function unlockAudio(){
  if (audioUnlocked) return;
  audioUnlocked = true;
  storySounds.forEach((audio) => {
    try { audio.load(); } catch (_) {}
  });
}
