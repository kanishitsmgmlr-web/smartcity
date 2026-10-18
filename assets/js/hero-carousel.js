/* smartcity hero crossfade + airbnb save-heart (small, safe, ascii) */
(function(w){
  "use strict";
  var hero=document.querySelector(".hero-img.main");
  if(!hero||hero.getAttribute("data-init")){return;}
  hero.setAttribute("data-init","1");
  var slides=Array.prototype.slice.call(hero.querySelectorAll(".slide"));
  var next=hero.querySelector(".h-ctr.next");
  var prev=hero.querySelector(".h-ctr.prev");
  var dotsBox=hero.querySelector(".dots");
  var auto=parseInt(hero.getAttribute("data-auto")||"5000",10);
  var cur=slides.reduce(function(a,s,i){return s.classList.contains("on")?i:a;},0);
  var timer=null,busy=false;

  function render(){
    slides.forEach(function(s,i){s.classList.toggle("on",i===cur);});
    if(dotsBox){
      while(dotsBox.firstChild){dotsBox.removeChild(dotsBox.firstChild);}
      slides.forEach(function(s,i){
        var d=document.createElement("i");
        d.setAttribute("role","tab");
        d.setAttribute("aria-label","Slide "+(i+1));
        if(i===cur){d.classList.add("on");}
        d.addEventListener("click",function(){go(i);});
        dotsBox.appendChild(d);
      });
    }
  }
  function go(i){
    if(busy){return;}
    busy=true;
    cur=(i+slides.length)%slides.length;
    render();
    setTimeout(function(){busy=false;},700);
    restart();
  }
  function restart(){
    if(timer){clearTimeout(timer);}
    timer=setTimeout(function(){go(cur+1);},auto);
  }
  if(next){next.addEventListener("click",function(){go(cur+1);});}
  if(prev){prev.addEventListener("click",function(){go(cur-1);});}

  /* airbnb save heart on .card figure */
  Array.prototype.forEach.call(document.querySelectorAll(".card figure"),function(fig){
    var fave=document.createElement("button");
    fave.type="button";
    fave.className="fave";
    fave.setAttribute("aria-label","Save to shortlist");
    fave.innerHTML="&#9825;";
    fave.addEventListener("click",function(e){
      e.preventDefault();e.stopPropagation();
      var on=fig.classList.toggle("faved");
      fave.classList.toggle("on",on);
      fave.innerHTML=on?"&#9829;":"&#9825;";
    });
    fig.appendChild(fave);
  });

  render();
  restart();
})(window);
