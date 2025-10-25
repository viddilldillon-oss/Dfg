// p-ho-script.js — minimal UI helpers (skeleton)
(function(){
  function pad(n){ return String(n).padStart(2,'0'); }
  function tick(){
    const now = new Date();
    const h = pad(now.getHours()), m = pad(now.getMinutes());
    const wdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const time = `${h}:${m}`;
    const date = `${wdays[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;
    const tEl=document.getElementById('time'), dEl=document.getElementById('date');
    if(tEl) tEl.textContent=time;
    if(dEl) dEl.textContent=date;
  }
  tick(); setInterval(tick, 1000);
})();