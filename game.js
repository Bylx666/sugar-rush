var isMobile = false;

// click circle
window.onmousedown = 
window.ontouchstart = function(e) {
  e.preventDefault();

  if(e.touches) {
    if(!isMobile) {
      isMobile = true;
      document.documentElement.classList.add('mobile');
    };

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

// resize event
window.onresize = 
window.onload = ()=>{
  window.requestAnimationFrame(resize);
  function resize() {
    const doc = document.documentElement;
    var bigger;
    if(doc.clientHeight > doc.clientWidth) {
      bigger = doc.clientHeight;
      doc.classList.add('vertical');
    }else {
      bigger = doc.clientWidth;
      doc.classList.remove('vertical');
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
  return false;
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
  $('tip-confirm').onclick = ()=> {
    jump('home');
    document.documentElement.requestFullscreen();
  };

  // home buttons
  $('home-select').onclick = ()=> jump('select');
  $('home-settings').onclick = ()=> jump('settings');

  // music packs
  get(`scores/index.json`, (res, status)=>{
    if(status!==200) {
      $('select').textContent = 'No music pack found ne~';
      return false;
    };
    res = JSON.parse(res);
    console.log(res);

    // cache files
    const aLoad = new Load();
    !function() {
      var cacheList = [
        "asset/sounds/click1.mp3",
        "asset/sounds/click2.mp3",
        "asset/sounds/click3.mp3"
      ];
      for(const pack of res.packs) {
        for(const music of pack.music) {
          cacheList.push(`scores/${pack.name}/${music.name}/${music.cover || 'folder.jpg'}`);
        };
      };

      var progress = 0;
      var errorMessage = '';
    
      for(const resource of cacheList) {
        get(resource, (res, status)=>{
          if(status!==200) {
            errorMessage += 'Cannot load "'+resource+'"\n';
          };
          const _progress = ++progress;
          if(_progress===cacheList.length) {
            if(errorMessage) {
              aLoad.end(false, errorMessage);
            }else {
              aLoad.end(true);
            };
          };
        });
      };
    }();

    // select page
    !function () {
      // saves
      var save = {
        _: JSON.parse(localStorage.getItem('save')) || {
          pack: 0,
          music: 0,
          scores: {}
        },
        get dif() {
          try {
            return this._.scores[res.packs[save._.pack].name][
              res.packs[save._.pack].music[save._.music].name
            ]["dif"];
          } catch {
            return null;
          }
        },
        set dif(dif) {
          if(!this._.scores[res.packs[save._.pack].name]) {
            this._.scores[res.packs[save._.pack].name] = {};
          };
          if(!this._.scores[res.packs[save._.pack].name][
            res.packs[save._.pack].music[save._.music].name
          ]) {
            this._.scores[res.packs[save._.pack].name][
              res.packs[save._.pack].music[save._.music].name
            ] = {};
          };
          this._.scores[res.packs[save._.pack].name][
            res.packs[save._.pack].music[save._.music].name
          ]["dif"] = dif;
        },
      };
      Object.defineProperty(window, "save", {get: function(){return save}});

      // inits at start
      $('select-return').onclick = ()=> jump('home');

      // reselect pack event
      reselectPack();
      res.packs.forEach((pack, i)=>{
        const span = document.createElement('span');
        span.textContent = pack.title;
        span.onclick = ()=>{
          if(save._.pack===i) return false;
          save._.pack = i;
          reselectPack();
          save._.music = 0;
          reselect();
        };
        $('select-pack-list').append(span);
      });
      function reselectPack() {
        $('select-list').textContent = null;
        $('select-pack-name').textContent = res.packs[save._.pack].title;
        $('select-total-number').textContent = res.packs[save._.pack].music.length;
        for(const music of res.packs[save._.pack].music) {
          const div = document.createElement('div');
          div.innerHTML = `
            <img src="scores/${res.packs[save._.pack].name}/${music.name}/${music.cover 
              || 'folder.jpg'}" alt="folder"/>
            <span>${music.title || 'untitled'}</span>
          `;
          $('select-list').append(div);
        };
        $('select-selected-index').onclick = function click(){
          $('select-pack').classList.add('expanded');
          $('select-selected-index').onclick = ()=>{
            $('select-pack').classList.remove('expanded');
            $('select-selected-index').onclick = click;
          };
        };
      };
      
      // reselect music events
      reselect();
      $('select-list').onwheel = $('select-go').onwheel = e=>{
        e.preventDefault();
        if(e.deltaY > 0) ++ save._.music;
        if(e.deltaY < 0) -- save._.music;
        reselect();
      };
      var isMoving = false;
      $('select-list').onmousedown = $('select-list').ontouchstart
       = $('select-go').onmousedown = $('select-go').ontouchstart = e=>{
        e.preventDefault();
        const startSelected = save._.music;
        document.onmousemove = document.ontouchmove = ev=>{
          ev.preventDefault();
          isMoving = true;
          let movingDistance;
          if(e.touches) {
            movingDistance = e.touches[0].clientX - ev.touches[0].clientX;
          }else {
            movingDistance = e.clientX - ev.clientX;
          };
          const destSelected = startSelected + Math.round(
            movingDistance / $('select-list').children[0].clientWidth * 2
          );
          if(destSelected===save._.music) {
            isMoving = false;
          }else {
            isMoving = true;
            save._.music = destSelected;
            reselect();
          };
        };
        document.onmouseup = document.ontouchend = ev=>{
          ev.preventDefault();
          isMoving = false;
          document.onmousemove = document.ontouchmove
          = document.onmouseup = document.ontouchend = null;
        };
      };
      function reselect() {
        if(save._.music >= $('select-list').children.length) {
          save._.music = $('select-list').children.length - 1;
        }else if(save._.music < 0) {
          save._.music = 0;
        };
        const selectedDom = $('select-list').children[save._.music];
        for(let i = 0;i < $('select-list').children.length;++i) {
          $('select-list').children[i].classList.remove('selected');
          $('select-list').children[i].onmouseup = 
           $('select-list').children[i].ontouchend = ()=>{
            if(isMoving) return false;
            save._.music = i;
            reselect();
          };
        };
        selectedDom.classList.add('selected');
        $('select-list').style.transform = `translate(${
          - selectedDom.offsetLeft
          - selectedDom.clientWidth / 2
          + document.documentElement.clientWidth / 2
        }px, -50%)`;
        $('select-selected-number').textContent = save._.music + 1;
        $('select-go').onclick = ()=>{
          console.log(res.packs[save._.pack].music[save._.music].name, save.dif);
        };
  
        // difficulty list
        $('select-difficulty').textContent = null;
        if(res.packs[save._.pack].music[save._.music].scores.length===0) {
          return false;
        };
        for(const dif of ["o", "i", "f", "q", "k"]) {
          if(res.packs[save._.pack].music[save._.music].scores[dif]) {
            const span = document.createElement('span');
            span.textContent = (()=>{
              switch(dif) {
                case "o": return "On";
                case "i": return "In";
                case "f": return "Fal";
                case "q": return "Q";
                case "k": return "K";
              };
            })();
            span.classList.add('select-difficulty-'+dif);
            span.onclick = ()=>{
              for(const dom of $('select-difficulty').children) {
                dom.classList.remove('selected');
              };
              span.classList.add('selected');
              save.dif = dif;
            };
            if(dif===save.dif||!save.dif) {
              span.classList.add('selected');
              save.dif = dif;
            };
            $('select-difficulty').append(span);
          };
        };
      };

      // save before close
      // window.onbeforeunload = ()=>
      //  localStorage.setItem('save', JSON.stringify(save._));
    }();
  });

  // settings
  $('settings-return').onclick = ()=> jump('home');
  // languege
  $('settings-langs').onclick = e=>e.stopPropagation();
  $('translate-change-lang').onclick = (e)=>{
    e.stopPropagation();
    $('settings-langs').classList.remove('disabled');
    $('settings').onclick = ()=>{
      $('settings').onclick = null;
      $('settings-langs').classList.add('disabled');
    };
  };
}();



function Load() {
  const loadingDom = document.getElementById('loading');
  const textDom = document.getElementById('loading-message')
  textDom.textContent = 'loading...';
  loadingDom.className = 'page show';

  this.end = function(isOk, message) {
    if(message) {
      if(!isOk) {
        loadingDom.className = 'page show failed';
      }else {
        loadingDom.className = 'page show success';
      };
      textDom.textContent = message;
      loadingDom.onclick = ()=> loadingDom.className = 'page hide';
    }else {
      loadingDom.className = 'page hide';
      textDom.textContent = '';
    };
  }
}
