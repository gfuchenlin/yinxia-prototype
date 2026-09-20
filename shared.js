(function () {
  function toast(msg) {
    var phone = document.querySelector(".phone");
    if (!phone) return;
    var el = phone.querySelector(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      phone.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.classList.remove("show"); }, 1600);
  }
  window.yxToast = toast;

  function goBack(fallback) {
    if (history.length > 1) history.back();
    else location.href = fallback || "library.html";
  }

  document.addEventListener("click", function (e) {
    var save = e.target.closest("[data-save-library]");
    if (save) setLibrary(true);
    var like = e.target.closest("[data-like]");
    if (like) {
      like.classList.toggle("on");
      toast(like.classList.contains("on") ? "已加入喜欢" : "已取消喜欢");
      return;
    }

    var star = e.target.closest("[data-star]");
    if (star) {
      var n = Number(star.getAttribute("data-star"));
      var box = star.parentElement;
      box.querySelectorAll("[data-star]").forEach(function (el) {
        el.classList.toggle("on", Number(el.getAttribute("data-star")) <= n);
      });
      toast(n ? "已评为 " + n + " 星" : "已取消评分");
      return;
    }

    var confirmEl = e.target.closest("[data-confirm]");
    if (confirmEl) {
      e.preventDefault();
      if (!window.confirm(confirmEl.getAttribute("data-confirm"))) return;
      if (confirmEl.hasAttribute("data-clear-library")) setLibrary(false);
      if (confirmEl.hasAttribute("data-clear-queue")) clearQueueExtras();
      var msg = confirmEl.getAttribute("data-toast");
      if (msg) toast(msg);
      var go = confirmEl.getAttribute("data-go");
      var back = confirmEl.getAttribute("data-back");
      setTimeout(function () {
        if (go) location.href = go;
        else if (back !== null) goBack(back || "player-playing.html");
      }, msg ? 500 : 0);
      return;
    }

    var backEl = e.target.closest("[data-back]");
    if (backEl && backEl.tagName !== "A") {
      if (backEl.hasAttribute("data-confirm")) return;
      e.preventDefault();
      var fallback = backEl.getAttribute("data-back");
      if (backEl.hasAttribute("data-toast")) {
        toast(backEl.getAttribute("data-toast"));
        setTimeout(function () { goBack(fallback); }, 500);
      } else {
        goBack(fallback);
      }
    }
  });

  document.querySelectorAll("[data-toast]").forEach(function (el) {
    if (el.hasAttribute("data-confirm") || el.hasAttribute("data-like") || el.hasAttribute("data-back")) return;
    el.addEventListener("click", function (e) {
      if (el.tagName === "A" && el.getAttribute("href")) return;
      e.preventDefault();
      toast(el.getAttribute("data-toast"));
    });
  });

  document.querySelectorAll("[data-filter]").forEach(function (input) {
    var root = document.querySelector(input.getAttribute("data-filter"));
    if (!root) return;
    input.addEventListener("input", function () {
      var q = input.value.trim().toLowerCase();
      root.querySelectorAll("[data-key]").forEach(function (row) {
        var key = (row.getAttribute("data-key") || "").toLowerCase();
        row.hidden = Boolean(q) && key.indexOf(q) === -1;
      });
    });
  });

  var params = new URLSearchParams(location.search);
  var service = params.get("s");
  if (service) {
    document.querySelectorAll("[data-service]").forEach(function (el) {
      el.textContent = service;
    });
  }
  var host = params.get("host");
  if (host) {
    document.querySelectorAll("[data-host]").forEach(function (el) {
      el.textContent = host;
    });
  }

  var form = document.querySelector("[data-connect-form]");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = form.querySelector("[name=host]");
      var value = (input && input.value.trim()) || "music.example.com";
      var s = new URLSearchParams(location.search).get("s") || "Navidrome";
      setLibrary(true);
      location.href = "library.html";
    });
  }

  var splash = document.querySelector("[data-splash]");
  if (splash) {
    splash.addEventListener("click", function (e) {
      e.preventDefault();
      location.href = hasLibrary() ? "library.html" : "connect.html";
    });
  }

  function hasLibrary() {
    try {
      if (localStorage.getItem("yinxia-library") === "1") return true;
    } catch (err) {}
    return window.name.indexOf("yinxia-library=1") !== -1;
  }

  function setLibrary(on) {
    try {
      if (on) localStorage.setItem("yinxia-library", "1");
      else localStorage.removeItem("yinxia-library");
    } catch (err) {}
    if (on) {
      if (window.name.indexOf("yinxia-library=1") === -1) {
        window.name = (window.name + " yinxia-library=1").trim();
      }
    } else {
      window.name = window.name.replace("yinxia-library=1", "").trim();
    }
  }

  var BASE_QUEUE = ["发如雪", "黑色毛衣", "枫", "浪漫手机", "逆鳞", "麦芽糖", "珊瑚海", "一路向北"];

  function queueExtras() {
    try { return JSON.parse(sessionStorage.getItem("yinxia-queue-extra") || "[]"); }
    catch (err) { return []; }
  }

  function inQueue(title) {
    if (BASE_QUEUE.indexOf(title) !== -1) return true;
    return queueExtras().some(function (song) { return song.title === title; });
  }

  function clearQueueExtras() {
    try { sessionStorage.removeItem("yinxia-queue-extra"); } catch (err) {}
  }

  document.querySelectorAll(".rec-row[data-title]").forEach(function (row) {
    var title = row.getAttribute("data-title");
    var btn = row.querySelector(".add-queue");
    if (!btn) return;
    btn.hidden = inQueue(title);
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (inQueue(title)) {
        btn.hidden = true;
        return;
      }
      var extras = queueExtras();
      extras.push({ title: title, artist: row.getAttribute("data-artist") || "" });
      try { sessionStorage.setItem("yinxia-queue-extra", JSON.stringify(extras)); } catch (err) {}
      btn.hidden = true;
      toast("已添加到播放列表");
    });
  });

  var queueNext = document.getElementById("queue-next");
  if (queueNext) {
    var extras = queueExtras();
    extras.forEach(function (song) {
      var row = document.createElement("div");
      row.className = "qrow";
      row.innerHTML = '<span class="grip">≡</span><span class="grow"><b></b><span class="subline"></span></span><button class="icon-btn" type="button" aria-label="移除">×</button>';
      row.querySelector("b").textContent = song.title;
      row.querySelector(".subline").textContent = song.artist;
      row.querySelector("button").addEventListener("click", function () {
        var left = queueExtras().filter(function (item) { return item.title !== song.title; });
        try { sessionStorage.setItem("yinxia-queue-extra", JSON.stringify(left)); } catch (err) {}
        row.remove();
        var count = document.getElementById("queue-count");
        if (count) count.textContent = "共 " + (BASE_QUEUE.length + left.length) + " 首 · 列表循环";
        toast("已从队列移除");
      });
      queueNext.appendChild(row);
    });
    var count = document.getElementById("queue-count");
    if (count) count.textContent = "共 " + (BASE_QUEUE.length + extras.length) + " 首 · 列表循环";
  }
})();
