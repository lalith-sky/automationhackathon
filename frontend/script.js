/* ---------------------------
   Generative Conqueror Poster
   --------------------------- */
const poster = document.getElementById('poster');
const pctx = poster.getContext('2d');

function hashSeed(str){
  let h=2166136261>>>0;
  for(let i=0;i<str.length;i++){ h += (h<<1) + str.charCodeAt(i); h = h>>>0; }
  return h;
}

function seededRandom(seed){
  return function(){
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0x100000000;
  }
}

function drawPoster(seedInput){
  const w = poster.width = poster.clientWidth * devicePixelRatio;
  const h = poster.height = 300 * devicePixelRatio;
  const rand = seededRandom(seedInput);
  pctx.clearRect(0,0,w,h);

  // background gradient
  const g = pctx.createLinearGradient(0,0,w,h);
  g.addColorStop(0, `rgba(${Math.floor(rand()*60+10)}, ${Math.floor(rand()*60+10)}, ${Math.floor(rand()*80+10)}, 1)`);
  g.addColorStop(1, `rgba(${Math.floor(rand()*20)}, ${Math.floor(rand()*80+40)}, ${Math.floor(rand()*120+80)}, 1)`);
  pctx.fillStyle = g;
  pctx.fillRect(0,0,w,h);

  // draw concentric organic blobs
  for (let i=0;i<7;i++){
    pctx.beginPath();
    const cx = w * (0.2 + rand()*0.6);
    const cy = h * (0.3 + rand()*0.4);
    const radius = (Math.min(w,h) * 0.12) * (1 + i*0.6);
    const jitter = 0.35 + rand()*0.9;

    for (let a=0;a<Math.PI*2;a+=0.3){
      const rr = radius * (1 + (Math.sin(a*6 + i + rand()*6)*0.18 + (rand()-0.5)*0.08) * jitter);
      const x = cx + Math.cos(a) * rr;
      const y = cy + Math.sin(a) * rr;
      if(a===0) pctx.moveTo(x,y); else pctx.lineTo(x,y);
    }
    pctx.closePath();
    pctx.fillStyle = `rgba(${Math.floor(200*rand())}, ${Math.floor(200*rand())}, ${Math.floor(255*rand())}, ${0.06 + 0.12*rand()})`;
    pctx.fill();
  }

  // text overlay
  pctx.font = `${32*devicePixelRatio}px "Segoe UI", Roboto, sans-serif`;
  pctx.fillStyle = "rgba(255,255,255,0.92)";
  pctx.textAlign = "left";
  const title = "CONQUEROR";
  pctx.fillText(title, 24*devicePixelRatio, 62*devicePixelRatio);

  pctx.font = `${14*devicePixelRatio}px monospace`;
  pctx.fillStyle = "rgba(255,255,255,0.7)";
  const timeTxt = `session:${new Date().toLocaleString()}`;
  pctx.fillText(timeTxt, 24*devicePixelRatio, 92*devicePixelRatio);
}

function initPoster(){
  const seedStr = navigator.userAgent + '|' + (new Date()).toISOString().slice(0,13);
  const seed = hashSeed(seedStr);
  drawPoster(seed);
}
document.getElementById('regenPoster').addEventListener('click', () => {
  const s = Math.floor(Math.random()*1e9);
  drawPoster(s);
});
document.getElementById('downloadPoster').addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = `conqueror_poster_${Date.now()}.png`;
  link.href = poster.toDataURL('image/png');
  link.click();
});
initPoster();

/* ---------------------------
   Live Code Playground + Evaluator
   --------------------------- */
const editor = document.getElementById('editor');
const runBtn = document.getElementById('runCode');
const sandbox = document.getElementById('sandbox');
const results = document.getElementById('results');
const saveAttempt = document.getElementById('saveAttempt');
const clearEditor = document.getElementById('clearEditor');

const defaultTemplate = `// Implement function conquerSum(a, b)
function conquerSum(a, b) {
  // your code here
}
`;

// safe runner: construct an HTML page as srcdoc for the iframe
function buildRunnerSrc(userCode){
  // we'll run tests and post results to parent
  const tests = [
    {args:[1,2], expected:3},
    {args:[-5,5], expected:0},
    {args:[100,200], expected:300},
    {args:[0,0], expected:0},
  ];
  return `
<!doctype html>
<html>
  <body>
    <script>
      try {
        ${userCode}
        const out = [];
        const _tests = ${JSON.stringify(tests)};
        _tests.forEach((t, i) => {
          let passed=false, got;
          try {
            got = typeof conquerSum === 'function' ? conquerSum.apply(null, t.args) : '__NO_FN__';
            passed = (got === t.expected);
          } catch(e) {
            got = 'ERR:' + (e && e.toString ? e.toString() : String(e));
          }
          out.push({i, args: t.args, expected: t.expected, got, passed});
        });
        parent.postMessage({type:'results', payload: out}, '*');
      } catch(e) {
        parent.postMessage({type:'error', payload: (e && e.toString ? e.toString() : String(e))}, '*');
      }
    <\/script>
  </body>
</html>
`;
}

runBtn.addEventListener('click', ()=>{
  const userCode = editor.value;
  sandbox.srcdoc = buildRunnerSrc(userCode);
  results.textContent = 'Running tests...';
});

window.addEventListener('message',(ev)=>{
  if(!ev.data) return;
  if(ev.data.type === 'results') {
    const out = ev.data.payload;
    let passCount = out.filter(x=>x.passed).length;
    results.innerHTML = `<strong>Score: ${passCount} / ${out.length}</strong><pre style="margin-top:8px;">` 
      + out.map(o=>`test ${o.i+1} — args:${JSON.stringify(o.args)} — expected:${o.expected} — got:${o.got} — ${o.passed? '✅':'❌'}`).join('\n') + '</pre>';
  } else if(ev.data.type === 'error') {
    results.innerHTML = `<strong style="color:#ff9b9b">Runtime error</strong><pre>${ev.data.payload}</pre>`;
  }
});

saveAttempt.addEventListener('click', ()=>{
  const saved = JSON.parse(localStorage.getItem('conqueror_attempts'||'[]') || '[]');
  saved.unshift({time:Date.now(), code:editor.value});
  localStorage.setItem('conqueror_attempts', JSON.stringify(saved.slice(0,20)));
  results.innerHTML = `<em>Saved attempt #${saved.length+1}</em>`;
});

clearEditor.addEventListener('click', ()=> editor.value = defaultTemplate);

// initialize editor content if not present
if(!editor.value || editor.value.trim().length<20) editor.value = defaultTemplate;

/* ---------------------------
   Persona Mirror (webcam + TTS)
   --------------------------- */
const video = document.getElementById('video');
const vcanvas = document.getElementById('videoCanvas');
const vctx = vcanvas.getContext('2d');
const captureBtn = document.getElementById('capture');
const downloadSnap = document.getElementById('downloadSnap');
const visitorName = document.getElementById('visitorName');
const snapshots = document.getElementById('snapshots');

async function startCamera(){
  try{
    const stream = await navigator.mediaDevices.getUserMedia({video:{width:640, height:360}, audio:false});
    video.srcObject = stream;
    video.onloadedmetadata = ()=> video.play();
    requestAnimationFrame(drawVideoEffect);
  } catch(e) {
    console.warn('Camera access denied or not available', e);
    vctx.fillStyle = '#111';
    vctx.fillRect(0,0,vcanvas.width, vcanvas.height);
    vctx.fillStyle = '#999';
    vctx.fillText('Camera not available', 20, 50);
  }
}

function drawVideoEffect(){
  const w = vcanvas.width = video.clientWidth * devicePixelRatio;
  const h = vcanvas.height = video.clientHeight * devicePixelRatio;
  try {
    vctx.drawImage(video, 0, 0, w, h);
    // simple shader: invert + noise overlay + vignette
    let img = vctx.getImageData(0,0,w,h);
    for(let i=0;i<img.data.length;i+=4){
      // invert subtle
      img.data[i] = 255 - img.data[i];     // R
      img.data[i+1] = 255 - img.data[i+1]; // G
      img.data[i+2] = 255 - img.data[i+2]; // B
      // add faint noise
      const v = (Math.random()-0.5) * 12;
      img.data[i] = Math.max(0, Math.min(255, img.data[i] + v));
      img.data[i+1] = Math.max(0, Math.min(255, img.data[i+1] + v));
      img.data[i+2] = Math.max(0, Math.min(255, img.data[i+2] + v));
    }
    vctx.putImageData(img, 0, 0);

    // vignette
    vctx.fillStyle = 'rgba(0,0,0,0.12)';
    vctx.beginPath();
    vctx.ellipse(w/2,h/2,w*0.7,h*0.6,0,0,Math.PI*2);
    vctx.fill('evenodd');
  } catch(e){}
  requestAnimationFrame(drawVideoEffect);
}

function speak(text){
  try {
    const s = new SpeechSynthesisUtterance(text);
    s.rate = 1;
    s.pitch = 1.1;
    s.volume = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(s);
  } catch(e){ console.warn('TTS failed', e); }
}

captureBtn.addEventListener('click', ()=>{
  const w = vcanvas.width;
  const h = vcanvas.height;
  const snap = document.createElement('canvas');
  snap.width = w; snap.height = h;
  const sCtx = snap.getContext('2d');
  sCtx.drawImage(vcanvas, 0, 0, w, h);
  // add small overlay label
  sCtx.fillStyle = 'rgba(0,0,0,0.3)';
  sCtx.fillRect(0, h-40, 320, 40);
  sCtx.fillStyle='#fff';
  sCtx.font = `${14*devicePixelRatio}px sans-serif`;
  const name = visitorName.value ? visitorName.value : 'Guest';
  sCtx.fillText(`Conqueror Snapshot • ${name}`, 8*devicePixelRatio, h - 12*devicePixelRatio);

  // store thumb
  const dataUrl = snap.toDataURL('image/png');
  const img = document.createElement('img');
  img.src = dataUrl;
  snapshots.prepend(img);

  // save last snapshot to localStorage (small)
  try{
    localStorage.setItem('conqueror_last_snap', dataUrl);
  }catch(e){ /* storage might be full */ }

  // greet
  speak(`Hello ${name}. Welcome to Lalith's Conqueror portfolio. Good luck at the hackathon.`);
  // enable download link
  downloadSnap.onclick = ()=> {
    const link = document.createElement('a');
    link.download = `conqueror_snap_${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  }
});

startCamera();

// load previous snapshot if present
const last = localStorage.getItem('conqueror_last_snap');
if(last){
  const img = document.createElement('img'); img.src = last;
  snapshots.appendChild(img);
}
