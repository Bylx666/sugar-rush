// click circle
window.onmousedown = 
window.ontouchstart = clickCircle;
var isMobile = false;

// resize event
window.onresize = 
window.onload = ()=>{
  window.requestAnimationFrame(resize);
  function resize() {
    const doc = document.documentElement;
    var bigger;
    if(doc.clientHeight > doc.clientWidth) {
      bigger = doc.clientHeight;
    }else {
      bigger = doc.clientWidth;
    };
    document.documentElement.style.fontSize = bigger / 20 + 'px';
  };
};

// prevent defaults
window.onselectstart = 
window.ontouchmove = 
window.oncontextmenu = (e)=>{
  if(e.preventDefault) {
    e.preventDefault();
  };
  return false
};

function clickCircle(e) {
  e.preventDefault();

  if(e.touches) {
    if(!isMobile) isMobile = true;

    if(e.touches.length===1) {
      new Audio('asset/sounds/click1.mp3').play();
    }else if(e.touches.length===2) {
      new Audio('asset/sounds/click1.mp3').play();
      new Audio('asset/sounds/click2.mp3').play();
    }else if(e.touches.length > 2){
      new Audio('asset/sounds/click1.mp3').play();
      new Audio('asset/sounds/click2.mp3').play();
      new Audio('asset/sounds/click3.mp3').play();
    }

    for(let touch of e.touches) {
      click(touch.clientX, touch.clientY);
    };
  }else{// prevent mobile to trigger 'onmousedown'
    if(isMobile) return false;

    new Audio('asset/sounds/click1.mp3').play();

    click(e.clientX, e.clientY);
  };
  
  function click(x, y) {
    const circleDiv = document.createElement('div');
    circleDiv.className = 'click-circle';
    circleDiv.style.left = x + 'px';
    circleDiv.style.top = y + 'px';
  
    document.getElementById('click-circles-container').append(circleDiv);
  
    const circleTimeout = setTimeout(()=>{
      circleDiv.remove();
    }, 1000);
  };
};

function jump(dest) {
  const destDom = document.getElementById(dest);
  for(const page of document.getElementsByClassName('page')) {
    page.className = 'page hide'
  };
  destDom.className = 'page show';
};

function get(url, cb) {
  const xhr = new XMLHttpRequest();
  xhr.open('get', url);
  xhr.send();
  xhr.onreadystatechange = ()=>{
    if(xhr.readyState===4) {
      cb(xhr.response, xhr.status);
    };
  };
};

!function(){
  function $(ele) {
    return document.getElementById(ele);
  };

  // tip before game
  $('tip-confirm').onclick = ()=> jump('home');

  // home buttons
  $('home-select').onclick = ()=> jump('select');
  $('home-settings').onclick = ()=> jump('settings');

  // music packs
  get(`scores/index.json`, (res, status)=>{
    if(status!==200) {
      $('select').textContent = 'No music pack found ne~';
    }else {
      const rsp = JSON.parse(res);
      console.log(rsp);
    }
  })
}()

function Load() {
  const loadingDom = document.getElementById('loading');
  const textDom = document.getElementById('loading-message')
  textDom.textContent = 'loading...';
  loadingDom.className = 'page show';

  this.end = function(isOk, message) {
    if(!isOk) {
      loadingDom.className = 'page show failed';
    }else {
      loadingDom.className = 'page show success';
    };
    if(message) {
      textDom.textContent = message;
      loadingDom.onclick = ()=> loadingDom.className = 'page hide';
    }else {
      loadingDom.className = 'page hide';
      textDom.textContent = '';
    };
  }
}
