(function () {
  'use strict';

  const SHELL = new Set(['library', 'search', 'settings']);
  const PLAYER = new Set([
    'player-song-playing',
    'player-song-paused',
    'player-recommend',
    'player-lyrics',
  ]);
  const PLAYER_SONG = new Set(['player-song-playing', 'player-song-paused']);
  const PLAYLIST_LIKE = new Set([
    'playlist',
    'playlist-liked',
    'playlist-all-songs',
    'playlist-genre-pop',
    'playlist-genre-rnb',
    'playlist-local',
  ]);

  let current = 'splash';
  let history = [];
  let isPlaying = true;
  let toastTimer = null;

  const toastEl = document.getElementById('toast');
  const hotspotToggle = document.getElementById('showHotspots');

  function screenEl(id) {
    return document.getElementById(id);
  }

  function showScreen(id, { push = true, replace = false } = {}) {
    if (!screenEl(id)) return;
    if (id === current && !replace) return;

    if (push && current && !replace) {
      history.push(current);
    }

    const prev = screenEl(current);
    const next = screenEl(id);
    if (prev) prev.classList.remove('on');
    next.classList.add('on');
    current = id;

    if (PLAYER_SONG.has(id)) {
      isPlaying = id === 'player-song-playing';
    }
  }

  function go(id, opts) {
    showScreen(id, opts || { push: true });
  }

  function replace(id) {
    showScreen(id, { push: false, replace: true });
  }

  function back() {
    if (history.length === 0) {
      if (!SHELL.has(current) && current !== 'splash') {
        replace('library');
      }
      return;
    }
    const prevId = history.pop();
    const prev = screenEl(current);
    const next = screenEl(prevId);
    if (prev) prev.classList.remove('on');
    if (next) {
      next.classList.add('on');
      current = prevId;
      if (PLAYER_SONG.has(prevId)) {
        isPlaying = prevId === 'player-song-playing';
      }
    }
  }

  function switchShell(id) {
    history = [];
    replace(id);
  }

  function openPlayer(preferTab) {
    if (preferTab === 'recommend') {
      go('player-recommend');
      return;
    }
    if (preferTab === 'lyrics') {
      go('player-lyrics');
      return;
    }
    go(isPlaying ? 'player-song-playing' : 'player-song-paused');
  }

  function playerTab(tab) {
    if (tab === 'recommend') {
      replace('player-recommend');
    } else if (tab === 'lyrics') {
      replace('player-lyrics');
    } else {
      replace(isPlaying ? 'player-song-playing' : 'player-song-paused');
    }
  }

  function togglePlayPause() {
    if (!PLAYER_SONG.has(current)) return;
    isPlaying = !isPlaying;
    replace(isPlaying ? 'player-song-playing' : 'player-song-paused');
  }

  function dismissPlayer() {
    while (PLAYER.has(current) || current === 'queue' || current === 'song-sheet') {
      if (history.length === 0) {
        replace('library');
        return;
      }
      back();
    }
  }

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1600);
  }

  function clearQueue() {
    if (window.confirm('确定清空播放队列？')) {
      toast('队列已清空');
      setTimeout(() => back(), 200);
    }
  }

  function hs(parentId, rect, onClick, title) {
    const parent = screenEl(parentId);
    if (!parent) return;
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'hotspot';
    el.style.top = rect.t + '%';
    el.style.left = rect.l + '%';
    el.style.width = rect.w + '%';
    el.style.height = rect.h + '%';
    el.setAttribute('aria-label', title || 'hotspot');
    if (title) el.title = title;
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      onClick();
    });
    parent.appendChild(el);
  }

  function bottomTabs(screenId) {
    hs(screenId, { t: 92, l: 0, w: 33.3, h: 7.5 }, () => switchShell('search'), '搜索');
    hs(screenId, { t: 92, l: 33.3, w: 33.4, h: 7.5 }, () => switchShell('library'), '曲库');
    hs(screenId, { t: 92, l: 66.7, w: 33.3, h: 7.5 }, () => switchShell('settings'), '设置');
  }

  function miniPlayer(screenId) {
    hs(screenId, { t: 83.5, l: 3, w: 94, h: 7.5 }, () => openPlayer(), '迷你播放器');
  }

  function playerChrome(screenId, opts) {
    const { tab } = opts;
    hs(screenId, { t: 5.5, l: 0, w: 14, h: 5.5 }, () => dismissPlayer(), '关闭播放器');
    hs(screenId, { t: 5.5, l: 22, w: 18, h: 5.5 }, () => playerTab('recommend'), '推荐');
    hs(screenId, { t: 5.5, l: 41, w: 18, h: 5.5 }, () => playerTab('song'), '歌曲');
    hs(screenId, { t: 5.5, l: 60, w: 18, h: 5.5 }, () => playerTab('lyrics'), '歌词');

    hs(screenId, { t: 84, l: 40, w: 20, h: 9 }, () => {
      if (tab === 'song') togglePlayPause();
      else {
        isPlaying = !isPlaying;
        toast(isPlaying ? '继续播放' : '已暂停');
      }
    }, '播放/暂停');
    hs(screenId, { t: 85, l: 78, w: 16, h: 8 }, () => go('queue'), '队列');
  }

  function trackRows(screenId, startT, rowH, count, gap) {
    for (let i = 0; i < count; i++) {
      const t = startT + i * (rowH + gap);
      hs(screenId, { t, l: 4, w: 78, h: rowH }, () => openPlayer(), '播放曲目');
      hs(screenId, { t, l: 84, w: 12, h: rowH }, () => go('song-sheet'), '更多');
    }
  }

  function playlistChrome(screenId) {
    hs(screenId, { t: 5, l: 0, w: 28, h: 6 }, () => back(), '返回');
    hs(screenId, { t: 27, l: 4, w: 55, h: 5 }, () => toast('已全部追加到队列'), '全部播放');
    trackRows(screenId, 40, 6.2, 6, 0.8);
  }

  // —— splash → connect ——
  hs('splash', { t: 0, l: 0, w: 100, h: 100 }, () => {
    history = [];
    replace('connect');
  }, '进入连接');

  // —— connect: pick service ——
  // four service cards (2x2)
  hs('connect', { t: 22, l: 6, w: 42, h: 18 }, () => go('connect-form'), 'Navidrome');
  hs('connect', { t: 22, l: 52, w: 42, h: 18 }, () => go('connect-form'), 'Jellyfin');
  hs('connect', { t: 44, l: 6, w: 42, h: 18 }, () => go('connect-form'), 'Emby');
  hs('connect', { t: 44, l: 52, w: 42, h: 18 }, () => go('connect-form'), 'Plex');

  // —— connect form ——
  hs('connect-form', { t: 5, l: 0, w: 18, h: 6 }, () => back(), '返回');
  hs('connect-form', { t: 62, l: 8, w: 84, h: 7 }, () => {
    history = [];
    replace('connect-success');
  }, '连接');
  hs('connect-form', { t: 72, l: 20, w: 60, h: 5 }, () => back(), '改用其他服务');

  // —— connect success → library ——
  hs('connect-success', { t: 0, l: 0, w: 100, h: 100 }, () => {
    history = [];
    replace('library');
  }, '进入曲库');

  // —— library grid：3 列，图标在上 ——
  // 歌曲 | 我喜欢的 | 本地音乐
  // 专辑 | 流派 | 歌手
  bottomTabs('library');
  miniPlayer('library');
  hs('library', { t: 11.5, l: 4, w: 92, h: 8.5 }, () => toast('已连接'), '服务器');
  const libTile = { w: 29.23, h: 13.43 };
  hs('library', { t: 21.64, l: 4.1, ...libTile }, () => go('playlist-all-songs'), '歌曲');
  hs('library', { t: 21.64, l: 35.38, ...libTile }, () => go('playlist-liked'), '我喜欢的');
  hs('library', { t: 21.64, l: 66.67, ...libTile }, () => go('playlist-local'), '本地音乐');
  hs('library', { t: 36.18, l: 4.1, ...libTile }, () => go('album'), '专辑');
  hs('library', { t: 36.18, l: 35.38, ...libTile }, () => go('genre-list'), '流派');
  hs('library', { t: 36.18, l: 66.67, ...libTile }, () => go('singer-list'), '歌手');
  hs('library', { t: 56.5, l: 4, w: 92, h: 6 }, () => go('playlist-liked'), '喜欢的音乐');
  hs('library', { t: 63, l: 4, w: 92, h: 6 }, () => go('playlist'), '我的歌单');

  // —— search ——
  bottomTabs('search');
  miniPlayer('search');
  hs('search', { t: 20, l: 4, w: 78, h: 7 }, () => openPlayer(), '歌曲');
  hs('search', { t: 20, l: 84, w: 12, h: 7 }, () => go('song-sheet'), '更多');
  hs('search', { t: 27.5, l: 4, w: 78, h: 7 }, () => openPlayer(), '歌曲');
  hs('search', { t: 27.5, l: 84, w: 12, h: 7 }, () => go('song-sheet'), '更多');
  hs('search', { t: 35, l: 4, w: 78, h: 7 }, () => openPlayer(), '歌曲');
  hs('search', { t: 35, l: 84, w: 12, h: 7 }, () => go('song-sheet'), '更多');

  // —— settings ——
  bottomTabs('settings');
  miniPlayer('settings');
  hs('settings', { t: 68, l: 4, w: 92, h: 6 }, () => go('about'), '关于音匣');
  hs('settings', { t: 12, l: 4, w: 92, h: 8 }, () => go('connect'), '服务器');

  hs('about', { t: 5, l: 0, w: 18, h: 6 }, () => back(), '返回');

  // —— album ——
  hs('album', { t: 5, l: 0, w: 28, h: 6 }, () => back(), '返回');
  hs('album', { t: 27, l: 4, w: 55, h: 5 }, () => toast('已全部追加到队列'), '全部播放');
  trackRows('album', 40, 6.2, 6, 0.8);

  // —— playlists ——
  playlistChrome('playlist');
  playlistChrome('playlist-liked');
  playlistChrome('playlist-all-songs');
  playlistChrome('playlist-genre-pop');
  playlistChrome('playlist-genre-rnb');
  playlistChrome('playlist-local');

  // —— genre list：2 列大方块 ——
  hs('genre-list', { t: 5, l: 0, w: 28, h: 7 }, () => back(), '返回');
  const genreTile = { w: 42.4, h: 20.3 };
  const genreGo = (id, label) => () => {
    if (id) {
      go(id);
      return;
    }
    toast(label + ' · 示意进入流派歌单');
    go('playlist-genre-pop');
  };
  hs('genre-list', { t: 10.6, l: 6.2, ...genreTile }, genreGo('playlist-genre-pop'), 'Pop');
  hs('genre-list', { t: 10.6, l: 51.6, ...genreTile }, genreGo('playlist-genre-rnb'), 'R&B');
  hs('genre-list', { t: 32.2, l: 6.2, ...genreTile }, genreGo(null, 'Rock'), 'Rock');
  hs('genre-list', { t: 32.2, l: 51.6, ...genreTile }, genreGo(null, 'Jazz'), 'Jazz');
  hs('genre-list', { t: 53.7, l: 6.2, ...genreTile }, genreGo(null, 'Electronic'), 'Electronic');
  hs('genre-list', { t: 53.7, l: 51.6, ...genreTile }, genreGo(null, 'Classical'), 'Classical');
  hs('genre-list', { t: 75.3, l: 6.2, ...genreTile }, genreGo(null, 'Hip-Hop'), 'Hip-Hop');
  hs('genre-list', { t: 75.3, l: 51.6, ...genreTile }, genreGo(null, 'Indie'), 'Indie');

  // —— singer list：2 列大方块 ——
  hs('singer-list', { t: 5, l: 0, w: 28, h: 7 }, () => back(), '返回');
  const singerTile = { w: 42.4, h: 20.3 };
  const singerGo = (label) => () => {
    toast(label + ' · 进入艺人');
    go('artist-albums');
  };
  hs('singer-list', { t: 10.6, l: 6.2, ...singerTile }, singerGo('周杰伦'), '周杰伦');
  hs('singer-list', { t: 10.6, l: 51.6, ...singerTile }, singerGo('陈粒'), '陈粒');
  hs('singer-list', { t: 32.2, l: 6.2, ...singerTile }, singerGo('颜人中'), '颜人中');
  hs('singer-list', { t: 32.2, l: 51.6, ...singerTile }, singerGo('赵雷'), '赵雷');
  hs('singer-list', { t: 53.7, l: 6.2, ...singerTile }, singerGo('于文文'), '于文文');
  hs('singer-list', { t: 53.7, l: 51.6, ...singerTile }, singerGo('邓紫棋'), '邓紫棋');
  hs('singer-list', { t: 75.3, l: 6.2, ...singerTile }, singerGo('陈奕迅'), '陈奕迅');
  hs('singer-list', { t: 75.3, l: 51.6, ...singerTile }, singerGo('林俊杰'), '林俊杰');

  // —— artist ——
  hs('artist-albums', { t: 5, l: 0, w: 14, h: 6 }, () => back(), '返回');
  hs('artist-albums', { t: 22, l: 18, w: 20, h: 5 }, () => replace('artist-albums'), '专辑');
  hs('artist-albums', { t: 22, l: 40, w: 20, h: 5 }, () => replace('artist-songs'), '歌曲');
  hs('artist-albums', { t: 22, l: 62, w: 20, h: 5 }, () => replace('artist-similar'), '相似');
  hs('artist-albums', { t: 30, l: 4, w: 30, h: 18 }, () => go('album'), '专辑封面');
  hs('artist-albums', { t: 30, l: 35, w: 30, h: 18 }, () => go('album'), '专辑封面');
  hs('artist-albums', { t: 30, l: 66, w: 30, h: 18 }, () => go('album'), '专辑封面');

  hs('artist-songs', { t: 5, l: 0, w: 14, h: 6 }, () => back(), '返回');
  hs('artist-songs', { t: 22, l: 18, w: 20, h: 5 }, () => replace('artist-albums'), '专辑');
  hs('artist-songs', { t: 22, l: 40, w: 20, h: 5 }, () => replace('artist-songs'), '歌曲');
  hs('artist-songs', { t: 22, l: 62, w: 20, h: 5 }, () => replace('artist-similar'), '相似');
  hs('artist-songs', { t: 28, l: 4, w: 55, h: 5 }, () => toast('已全部追加到队列'), '全部播放');
  trackRows('artist-songs', 40, 6.5, 7, 0.5);

  hs('artist-similar', { t: 5, l: 0, w: 14, h: 6 }, () => back(), '返回');
  hs('artist-similar', { t: 22, l: 18, w: 20, h: 5 }, () => replace('artist-albums'), '专辑');
  hs('artist-similar', { t: 22, l: 40, w: 20, h: 5 }, () => replace('artist-songs'), '歌曲');
  hs('artist-similar', { t: 22, l: 62, w: 20, h: 5 }, () => replace('artist-similar'), '相似');

  playerChrome('player-song-playing', { tab: 'song' });
  playerChrome('player-song-paused', { tab: 'song' });
  hs('player-song-playing', { t: 62, l: 10, w: 80, h: 10 }, () => playerTab('lyrics'), '歌词预览');
  hs('player-song-paused', { t: 62, l: 10, w: 80, h: 10 }, () => playerTab('lyrics'), '歌词预览');
  hs('player-song-playing', { t: 55, l: 84, w: 12, h: 5 }, () => toast('已加入喜欢'), '喜欢');
  hs('player-song-paused', { t: 55, l: 84, w: 12, h: 5 }, () => toast('已加入喜欢'), '喜欢');

  playerChrome('player-recommend', { tab: 'recommend' });
  for (let i = 0; i < 6; i++) {
    const t = 14 + i * 8;
    if (t > 68) break;
    hs('player-recommend', { t, l: 4, w: 92, h: 7 }, () => toast('已追加到队列'), '推荐歌曲');
  }

  playerChrome('player-lyrics', { tab: 'lyrics' });

  hs('queue', { t: 0, l: 0, w: 72, h: 12 }, () => back(), '关闭队列');
  hs('queue', { t: 12, l: 0, w: 100, h: 20 }, () => back(), '关闭队列');
  hs('queue', { t: 5.5, l: 72, w: 26, h: 6 }, () => clearQueue(), '清空');

  hs('song-sheet', { t: 0, l: 0, w: 100, h: 40 }, () => back(), '关闭');
  hs('song-sheet', { t: 55, l: 4, w: 92, h: 7 }, () => { toast('已设为下一首播放'); back(); }, '下一首播放');
  hs('song-sheet', { t: 63, l: 4, w: 92, h: 7 }, () => { toast('已追加到队列'); back(); }, '追加到队列');
  hs('song-sheet', { t: 71, l: 4, w: 92, h: 7 }, () => { back(); go('artist-albums'); }, '查看艺人');
  hs('song-sheet', { t: 79, l: 4, w: 92, h: 7 }, () => { back(); go('album'); }, '查看专辑');
  hs('song-sheet', { t: 90, l: 10, w: 80, h: 7 }, () => back(), '取消');
  hs('song-sheet', { t: 42, l: 82, w: 14, h: 6 }, () => toast('已更新喜欢'), '喜欢');

  if (hotspotToggle) {
    hotspotToggle.addEventListener('change', () => {
      document.body.classList.toggle('show-hotspots', hotspotToggle.checked);
    });
  }

  screenEl('splash').classList.add('on');
})();
