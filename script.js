
/* NEXORA - Main JavaScript */

const cards = [
  ["Video Editor","Trim, split, filters and timeline editing","https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=700","editor"],
  ["Keyframe Animation","Animate position, scale and rotation","https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=700","editor"],
  ["Effects & Filters","Cinematic, glitch, blur and glow","https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=700","editor"],
  ["Photo Studio","Adjust and enhance your pictures","https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=700","photo"],
  ["Voice Studio","Record and prepare voiceovers","https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=700","audio"],
  ["Text Animation","Titles, captions and text overlays","https://images.unsplash.com/photo-1455390582262-044cdead277a?w=700","editor"],
  ["Mask Studio","Create creative mask effects","https://images.unsplash.com/photo-1536240478700-b869070f9279?w=700","editor"],
  ["Motion Tracking","Plan object and text tracking","https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=700","editor"],
  ["Speed Curve","Control video speed and motion","https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=700","editor"],
  ["Green Screen","Chroma key editing workspace","https://images.unsplash.com/photo-1485846234645-a62644f84728?w=700","editor"],
  ["Color Grading","Adjust color, tone and contrast","https://images.unsplash.com/photo-1500534623283-312aade485b7?w=700","editor"],
  ["Audio Mixer","Manage music and voice tracks","https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=700","audio"],
  ["Thumbnail Maker","Design creator thumbnails","https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=700","photo"],
  ["Logo Animation","Create intro and outro concepts","https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=700","tools"],
  ["Subtitle Studio","Organize and style subtitles","https://images.unsplash.com/photo-1455390582262-044cdead277a?w=700","tools"],
  ["Overlay Studio","Explore overlays and visual layers","https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=700","editor"]
];

function makeCard(c) {
  return `<div class="tool-card" onclick="openTool('${c[3]}')">
    <img src="${c[2]}" alt="${c[0]}" loading="lazy">
    <div class="tool-info">
      <h4>${c[0]}</h4>
      <p>${c[1]}</p>
    </div>
  </div>`;
}

document.getElementById('homeCards').innerHTML =
  cards.slice(0,6).map(makeCard).join('');

document.getElementById('quickCards').innerHTML =
  cards.slice(6,12).map(makeCard).join('');

document.getElementById('allTools').innerHTML =
  cards.map(makeCard).join('');

/* Navigation */

function showPage(id, btn) {
  document.querySelectorAll('.page').forEach(p =>
    p.classList.remove('active')
  );

  const page = document.getElementById(id);
  if (!page) return;

  page.classList.add('active');

  document.querySelectorAll('.navbtn').forEach(b =>
    b.classList.remove('active')
  );

  if (btn) btn.classList.add('active');

  document.querySelectorAll('.navbtn').forEach(b => {
    if (b.getAttribute('onclick')?.includes("'" + id + "'")) {
      b.classList.add('active');
    }
  });

  const titles = {
    home:'Dashboard',
    editor:'Video Editing Studio',
    photo:'Photo Studio',
    audio:'Voice Studio',
    tools:'Creative Tools',
    projects:'My Projects',
    settings:'Settings',
    subscription:'VIP Membership'
  };

  document.getElementById('pageTitle').textContent =
    titles[id] || id;

  window.scrollTo(0,0);
}

function openTool(id) {
  showPage(['editor','photo','audio'].includes(id) ? id : 'tools');
}

/* Membership */

function isVIP() {
  return localStorage.getItem('nexora_vip') === 'yes';
}

function updateMembership() {
  const vip = isVIP();

  document.getElementById('planStatus').textContent =
    vip ? 'VIP UNLOCKED' : 'FREE PLAN';

  document.getElementById('settingsPlan').textContent =
    vip ? 'VIP' : 'Free';

  document.getElementById('membershipStatus').textContent =
    vip ? '♛ VIP Membership Active' : 'Free Membership';

  document.getElementById('exportStatus').textContent =
    vip ? 'VIP access active. Export is available.' :
    'Export requires VIP membership.';

  document.getElementById('exportBtn').disabled = !vip;
}

function unlockVIP() {
  const code = document.getElementById('accessCode').value;

  if (code === "CHITCODE'0987654321'") {
    localStorage.setItem('nexora_vip','yes');

    document.getElementById('codeMessage').textContent =
      'VIP unlocked successfully!';

    document.getElementById('codeMessage').style.color =
      '#ffe5a0';
  } else {
    document.getElementById('codeMessage').textContent =
      'Invalid access code. Please try again.';

    document.getElementById('codeMessage').style.color =
      '#ff8c8c';
  }

  updateMembership();
}

function returnFree() {
  localStorage.removeItem('nexora_vip');
  updateMembership();
  alert('You are now on the Free Plan.');
}

function selectPlan(name) {
  document.getElementById('selectedPlan').textContent = name;

  alert(
    name + ' selected. Enter your membership access code to unlock VIP features.'
  );
}

/* Themes */

function setTheme(theme) {
  const colors = {
    dark:'#a78bfa',
    purple:'#c084fc',
    gold:'#e8bd54'
  };

  document.documentElement.style.setProperty(
    '--accent',
    colors[theme] || colors.dark
  );
}

updateMembership();

/* Video Editor */

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let videoURL = null;
let keyframes = [];
let voiceBlob = null;
let voiceURL = null;
let recorder = null;
let recordChunks = [];

document.getElementById('videoFile').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;

  if (videoURL) URL.revokeObjectURL(videoURL);

  videoURL = URL.createObjectURL(file);
  video.src = videoURL;

  video.onloadedmetadata = () => {
    document.getElementById('videoStatus').textContent =
      file.name + ' • ' + video.duration.toFixed(1) + ' seconds';

    document.getElementById('videoTrackLabel').textContent =
      file.name;
  };
});

function drawFrame() {
  ctx.fillStyle = '#080a10';
  ctx.fillRect(0,0,canvas.width,canvas.height);

  if (video.readyState >= 2) {
    const scale = Math.min(
      canvas.width/video.videoWidth,
      canvas.height/video.videoHeight
    );

    const w = video.videoWidth * scale;
    const h = video.videoHeight * scale;

    const x = (canvas.width-w)/2;
    const y = (canvas.height-h)/2;

    const b = document.getElementById('brightness').value;
    const c = document.getElementById('contrast').value;
    const s = document.getElementById('saturation').value;
    const blur = document.getElementById('blur').value;

    ctx.filter =
      `brightness(${b}%) contrast(${c}%) saturate(${s}%) blur(${blur}px)`;

    ctx.drawImage(video,x,y,w,h);
    ctx.filter = 'none';

    const text = document.getElementById('overlayText').value;

    if (text) {
      ctx.font =
        `bold ${document.getElementById('textSize').value}px Inter,Arial`;

      ctx.textAlign = 'center';
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'black';
      ctx.fillStyle = 'white';

      const pos = document.getElementById('textPosition').value;

      const ty =
        pos === 'top' ? 80 :
        pos === 'center' ? canvas.height/2 :
        canvas.height-65;

      ctx.strokeText(text,canvas.width/2,ty);
      ctx.fillText(text,canvas.width/2,ty);
    }

    document.getElementById('seek').value =
      video.duration ? (video.currentTime/video.duration)*100 : 0;
  }

  requestAnimationFrame(drawFrame);
}

drawFrame();

function playVideo() {
  if (video.src) video.play();
}

function pauseVideo() {
  video.pause();
}

function resetVideo() {
  video.pause();
  video.currentTime = 0;
}

function seekVideo(value) {
  if (video.duration) {
    video.currentTime = (value/100)*video.duration;
  }
}

function updatePreview() {}

function changeSpeed() {
  video.playbackRate =
    Number(document.getElementById('speed').value);
}

/* Basic Keyframe Markers */

function addKeyframe() {
  if (!video.src) {
    alert('Import a video first.');
    return;
  }

  keyframes.push({
    time:video.currentTime,
    scale:1,
    rotation:0
  });

  document.getElementById('keyTrackLabel').textContent =
    keyframes.length + ' keyframe(s) added';

  document.getElementById('keyStatus').textContent =
    'Keyframes: ' + keyframes.length;
}

function clearKeyframes() {
  keyframes = [];

  document.getElementById('keyTrackLabel').textContent =
    'No keyframes yet';

  document.getElementById('keyStatus').textContent =
    'Keyframes: 0';
}

/* Video Export */

async function exportVideo() {
  if (!isVIP()) {
    showPage('subscription');
    alert('VIP membership is required to export.');
    return;
  }

  if (!video.src) {
    alert('Please import a video first.');
    return;
  }

  if (!window.MediaRecorder || !canvas.captureStream) {
    alert('Video export is not supported by this browser.');
    return;
  }

  try {
    video.pause();
    video.currentTime = 0;
    await video.play();

    const stream = canvas.captureStream(30);

    const mime =
      MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';

    const mr = new MediaRecorder(stream,{mimeType:mime});
    const chunks = [];

    mr.ondataavailable = e => {
      if (e.data.size) chunks.push(e.data);
    };

    mr.onstop = () => {
      const blob = new Blob(chunks,{type:'video/webm'});
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'NEXORA-Export.webm';
      a.click();

      document.getElementById('exportStatus').textContent =
        'Export complete.';

      stream.getTracks().forEach(t => t.stop());
    };

    document.getElementById('exportStatus').textContent =
      'Export recording in progress...';

    mr.start();

    video.onended = () => {
      if (mr.state === 'recording') mr.stop();
    };

  } catch(err) {
    alert('Export error: ' + err.message);
  }
}

/* Photo Studio */

let photoImage = null;

document.getElementById('photoFile').addEventListener('change',e => {
  const file = e.target.files[0];
  if (!file) return;

  photoImage = new Image();

  photoImage.onload = drawPhoto;
  photoImage.src = URL.createObjectURL(file);
});

function drawPhoto() {
  const c = document.getElementById('photoCanvas');
  const p = c.getContext('2d');

  p.fillStyle = '#080a10';
  p.fillRect(0,0,c.width,c.height);

  if (!photoImage) return;

  const scale = Math.min(
    c.width/photoImage.width,
    c.height/photoImage.height
  );

  const w = photoImage.width*scale;
  const h = photoImage.height*scale;

  p.filter =
    `brightness(${document.getElementById('photoBright').value}%) ` +
    `contrast(${document.getElementById('photoContrast').value}%) ` +
    `saturate(${document.getElementById('photoSat').value}%)`;

  p.drawImage(
    photoImage,
    (c.width-w)/2,
    (c.height-h)/2,
    w,
    h
  );

  p.filter = 'none';
}

function savePhoto() {
  if (!photoImage) {
    alert('Choose a photo first.');
    return;
  }

  const a = document.createElement('a');
  a.download = 'NEXORA-Photo.png';

  a.href = document.getElementById('photoCanvas')
    .toDataURL('image/png');

  a.click();
}

/* Voice Recording */

async function startRecording() {
  try {
    const stream =
      await navigator.mediaDevices.getUserMedia({audio:true});

    recordChunks = [];

    recorder = new MediaRecorder(stream);

    recorder.ondataavailable = e => {
      if (e.data.size) recordChunks.push(e.data);
    };

    recorder.onstop = () => {
      voiceBlob = new Blob(
        recordChunks,
        {type:recorder.mimeType || 'audio/webm'}
      );

      if (voiceURL) URL.revokeObjectURL(voiceURL);

      voiceURL = URL.createObjectURL(voiceBlob);

      document.getElementById('voicePlayer').src = voiceURL;

      document.getElementById('voiceTrackLabel').textContent =
        'Recorded voiceover';

      document.getElementById('recordStatus').textContent =
        'Recording saved. Preview or add it to your project.';

      stream.getTracks().forEach(t => t.stop());
    };

    recorder.start();

    document.getElementById('recordBtn').disabled = true;
    document.getElementById('stopBtn').disabled = false;

    document.getElementById('recordStatus').textContent =
      'Recording...';

  } catch(e) {
    document.getElementById('recordStatus').textContent =
      'Microphone permission denied or unavailable.';
  }
}

function stopRecording() {
  if (recorder && recorder.state === 'recording') {
    recorder.stop();
  }

  document.getElementById('recordBtn').disabled = false;
  document.getElementById('stopBtn').disabled = true;
}

function addVoiceToTimeline() {
  if (!voiceBlob) {
    alert('Record your voice first.');
    return;
  }

  document.getElementById('voiceTrackLabel').textContent =
    '✓ Voice recording added to project';

  alert('Voice recording added to the project timeline.');
}

document.getElementById('voicePlayer').addEventListener('play',function() {
  this.volume =
    Number(document.getElementById('voiceVolume').value)/100;

  this.playbackRate =
    Number(document.getElementById('voiceSpeed').value)/100;
});

/* Keyboard shortcuts */

document.addEventListener('keydown', e => {
  if (['INPUT','TEXTAREA','SELECT'].includes(
    document.activeElement.tagName
  )) return;

  if (e.code === 'Space' && currentPage === 'editor') {
    e.preventDefault();

    if (video.paused) playVideo();
    else pauseVideo();
  }

  if (e.ctrlKey && e.key.toLowerCase() === 's') {
    e.preventDefault();
    alert('Project workspace is stored locally in this browser.');
  }
});
