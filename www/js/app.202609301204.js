(function () {
  'use strict';
  var API = window.CampusAPI;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var I = {
    home: '<svg viewBox="0 0 24 24"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9.5 21v-6h5v6"/></svg>',
    grid: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
    apps: '<svg viewBox="0 0 24 24"><circle cx="6" cy="6" r="2.4"/><circle cx="12" cy="6" r="2.4"/><circle cx="18" cy="6" r="2.4"/><circle cx="6" cy="12" r="2.4"/><circle cx="12" cy="12" r="2.4"/><circle cx="18" cy="12" r="2.4"/><circle cx="6" cy="18" r="2.4"/><circle cx="12" cy="18" r="2.4"/><circle cx="18" cy="18" r="2.4"/></svg>',
    user: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.6"/><path d="M4.5 20c1.2-3.6 4-5.4 7.5-5.4S18.3 16.4 19.5 20"/></svg>',
    book: '<svg viewBox="0 0 24 24"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 5.5v15"/></svg>',
    schedule: '<svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="M7.5 14h3.5M13.5 14h3M7.5 17.5h3.5"/></svg>',
    vpn: '<svg viewBox="0 0 24 24"><path d="M12 2.6 4.8 5.6v5.6c0 4.4 3 7.9 7.2 9.2 4.2-1.3 7.2-4.8 7.2-9.2V5.6z"/><circle cx="12" cy="10.2" r="2.3"/><path d="M12 12.5v3.3"/></svg>',
    db: '<svg viewBox="0 0 24 24"><ellipse cx="12" cy="6.6" rx="8" ry="3.1"/><path d="M4 6.6v10.8c0 1.7 3.6 3.1 8 3.1s8-1.4 8-3.1V6.6"/><path d="M4 12c0 1.7 3.6 3.1 8 3.1s8-1.4 8-3.1"/></svg>',
    cards: '<svg viewBox="0 0 24 24"><rect x="3" y="3.6" width="18" height="16.8" rx="2.4"/><path d="M3 9h18M10 9v11.4"/></svg>',
    link: '<svg viewBox="0 0 24 24"><path d="M10.2 13.8a4.2 4.2 0 0 0 6 0l2.5-2.5a4.2 4.2 0 0 0-6-6l-1.2 1.2"/><path d="M13.8 10.2a4.2 4.2 0 0 0-6 0l-2.5 2.5a4.2 4.2 0 0 0 6 6l1.2-1.2"/></svg>',
    jwgl: '<svg viewBox="0 0 24 24"><path d="M12 3.6 2.6 8.2 12 12.8l9.4-4.6z"/><path d="M6.2 10.4V15c0 1.7 2.6 3 5.8 3s5.8-1.3 5.8-3v-4.6"/><path d="M21.4 8.2v5.2"/></svg>',
    switchbox: '<svg viewBox="0 0 24 24"><rect x="3.2" y="11.6" width="17.6" height="7.2" rx="2.2"/><circle cx="7.4" cy="15.2" r="0.95" fill="currentColor" stroke="none"/><circle cx="11" cy="15.2" r="0.95" fill="currentColor" stroke="none"/><path d="M17.4 11.6V4.2M17.4 4.2 15.2 6.4M17.4 4.2l2.2 2.2"/></svg>',
    exam: '<svg viewBox="0 0 24 24"><path d="M6 3h9l5 5v13H6z"/><path d="M15 3v5h5"/><path d="M9 13h6M9 17h4"/></svg>',
    bolt: '<svg viewBox="0 0 24 24"><path d="M13 2 4.5 13.5H11L10 22l8.5-11.5H12z"/></svg>',
    wifi: '<svg viewBox="0 0 24 24"><path d="M2.5 8.5a15 15 0 0 1 19 0"/><path d="M5.5 12a10.5 10.5 0 0 1 13 0"/><path d="M8.5 15.4a6 6 0 0 1 7 0"/><circle cx="12" cy="19" r="1.2" fill="currentColor" stroke="none"/></svg>',
    card: '<svg viewBox="0 0 24 24"><rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 9.5h19"/><path d="M6 14.5h4"/></svg>',
    cal: '<svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="16" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
    door: '<svg viewBox="0 0 24 24"><path d="M4 21V4.5A1.5 1.5 0 0 1 5.5 3h9A1.5 1.5 0 0 1 16 4.5V21"/><path d="M16 21h4M2 21h2"/><circle cx="12.5" cy="12" r="1" fill="currentColor" stroke="none"/></svg>',
    award: '<svg viewBox="0 0 24 24"><circle cx="12" cy="9" r="5.5"/><path d="M8.5 13.5 7 21l5-2.5L17 21l-1.5-7.5"/></svg>',
    map: '<svg viewBox="0 0 24 24"><path d="M9 4 3 6.5v13L9 17l6 2.5 6-2.5v-13L15 6.5z"/><path d="M9 4v13M15 6.5v13"/></svg>',
    lock: '<svg viewBox="0 0 24 24"><rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/></svg>',
    id: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2.5"/><circle cx="9" cy="11" r="2"/><path d="M5.8 16.5c.8-1.6 1.9-2.4 3.2-2.4s2.4.8 3.2 2.4M15 10h3M15 13.5h3"/></svg>',
    key: '<svg viewBox="0 0 24 24"><circle cx="8" cy="14" r="4"/><path d="M11 11 20 2M17 5l2 2M14.5 7.5l2 2"/></svg>',
    shield: '<svg viewBox="0 0 24 24"><path d="M12 3 5 6v6c0 4.4 3 7.7 7 9 4-1.3 7-4.6 7-9V6z"/><path d="M9 12l2 2 4-4"/></svg>',
    refresh: '<svg viewBox="0 0 24 24"><g transform="rotate(45 12 12)"><path d="M20 12.5a8 8 0 1 1-8-8"/><path d="M14.8 4.5 11.3 2.1 11.3 6.9z" fill="currentColor" stroke="none"/></g></svg>',
    chevron: '<svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>',
    back: '<svg viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20z"/></svg>',
    info: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>',
    logout: '<svg viewBox="0 0 24 24"><path d="M15 4h3.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H15"/><path d="M10 8l-4 4 4 4M6 12h9"/></svg>'
  };
  var MODULES = [
    { k: 'schedule', t: '我的课表', ic: I.schedule, c: 'bg-blue' },
    { k: 'exams', t: '考试安排', ic: I.exam, c: 'bg-red' },
    { k: 'electricity', t: '宿舍电费', ic: I.bolt, c: 'bg-amber' },
    { k: 'net', t: '校园网认证', ic: I.wifi, c: 'bg-teal' },
    { k: 'network', t: '校园网信息', ic: I.switchbox, c: 'bg-cyan' },
    { k: 'card', t: '校园卡', ic: I.card, c: 'bg-green' },
    { k: 'rooms', t: '空教室', ic: I.door, c: 'bg-indigo' },
    { k: 'gpa', t: '绩点学业', ic: I.award, c: 'bg-violet' }
  ];
  function moduleOf(k) { for (var i = 0; i < MODULES.length; i++) if (MODULES[i].k === k) return MODULES[i]; return null; }
  var TITLES = {
    exams: '考试安排', electricity: '宿舍电费', network: '校园网信息',
    card: '校园卡', rooms: '空教室查询', calendar: '校历', gpa: '绩点与学业',
    jwgl: '教务系统', net: '校园网'
  };
  var S = {
    route: 'home',
    tab: 'home',
    schedView: 'week',
    week: 1,
    rooms: { ninghe: false, weeks: [], days: [], sections: [],
             lh: '', lhnh: '', cdlb: '', cdmc: '', qszws: '', jszws: '',
             result: null, err: '', loading: false }
  };
  var toastTimer;
  function toast(msg) {
    var t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove('show'); }, 1900);
  }
  function openSheet(html) {
    $('#sheet-panel').innerHTML = '<div class="sheet-handle"></div>' + html;
    $('#sheet').classList.remove('hidden');
  }
  function closeSheet() { $('#sheet').classList.add('hidden'); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function loading(text) { return '<div class="loading-row"><span class="spinner"></span>' + (text || '加载中…') + '</div>'; }
  function empty(ico, text) { return '<div class="empty-state"><div class="es-ico">' + ico + '</div>' + text + '</div>'; }
  function fmtDate(d) { return (d.getMonth() + 1) + '月' + d.getDate() + '日'; }
  function weekdayName(n) { return ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][n - 1]; }
  
  
  function soft(fn) {
    try { return Promise.resolve(fn()).catch(function () { return null; }); }
    catch (e) { return Promise.resolve(null); }
  }
  function num(v, digits) {
    if (v == null || v === '') return '—';
    var n = typeof v === 'number' ? v : Number(v);
    if (!isFinite(n)) return '—';
    return n.toFixed(digits == null ? 2 : digits);
  }
  function failCard(e) {
    var msg = (e && e.message) ? e.message : String(e);
    var hasCreds = API.hasCreds && API.hasCreds();
    var hint;
    if (/未登录|非 JSON|HTTP 30[123]|401|403/.test(msg)) {
      hint = hasCreds
        ? '会话已过期，已尝试自动重连通道。若仍失败，请点「重试」'
        : '会话失效或未登录，请重新登录后再试';
    } else if (/timeout|Timeout|failed to connect|Unable to resolve|unexpected end of stream|network/i.test(msg)) {
      hint = '网络不可达，已自动尝试切换通道（校内直连 ↔ WebVPN）';
    } else if (/接口未配置/.test(msg)) {
      hint = msg;
    } else {
      hint = msg;
    }
    var authBtns = hasCreds
      ? '<button class="btn-ghost" style="width:auto;padding:8px 18px" data-act="wvconnect">连接 WebVPN</button>'
      : '<button class="btn-ghost" style="width:auto;padding:8px 18px" data-act="gologin">去登录</button>';
    return '<div class="card flat" style="text-align:center;padding:26px 16px">' +
      '<div style="font-size:13px;color:var(--text-2);margin-bottom:6px">数据加载失败</div>' +
      '<div style="font-size:12px;color:var(--muted);line-height:1.6">' + esc(hint) + '</div>' +
      '<div style="margin-top:14px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap">' +
        '<button class="btn-ghost" style="width:auto;padding:8px 18px" data-act="retry">重试</button>' +
        authBtns +
      '</div>' +
    '</div>';
  }
  
  function channelSheet() {
    var cur = API.CONFIG.CHANNEL;
    var opts = [
      { k: 'auto', t: '自动（默认）', s: '默认走 WebVPN：后台静默登录，失败自动回退校内直连' },
      { k: 'direct', t: '仅校内直连', s: '不登录 WebVPN，只用校园网内网地址' },
      { k: 'webvpn', t: '仅 WebVPN', s: '强制经 webvpn.cauc.edu.cn 访问' }
    ];
    return '<div style="font-size:16px;font-weight:700;margin-bottom:4px">网络通道</div>' +
      '<div class="long-press-tip" style="margin-bottom:12px">当前：' + API.channelLabel() +
      (API.canBypassCors() ? ' · 具备 Native HTTP' : ' · 浏览器环境（受 CORS 限制）') + '</div>' +
      opts.map(function (o) {
        return '<div class="list-item" data-act="setchannel:' + o.k + '">' +
          '<div class="li-ico ' + (cur === o.k ? 'bg-blue' : 'bg-cyan') + '">' +
            (o.k === 'network' ? I.switchbox : I.wifi) + '</div>' +
          '<div class="li-main"><div class="li-t">' + o.t + (cur === o.k ? ' ✓' : '') + '</div><div class="li-s">' + o.s + '</div></div>' +
          (cur === o.k ? '' : '<span class="chev">' + I.chevron + '</span>') + '</div>';
      }).join('');
  }
  function loginModeSheet() {
    var mode = API.getLoginMode();
    var opts = [
      { k: 'auto', t: '无感登录', s: '自动识别验证码；连续失败 ' + API.CONFIG.AUTO_FALLBACK_AFTER + ' 次后自动切到网页登录' + (API.hasSolver() ? '' : '（当前未内置识别引擎，会直接走网页登录）') },
      { k: 'webview', t: '网页登录', s: '在应用内打开登录页手填验证码，最稳妥' }
    ];
    return '<div style="font-size:16px;font-weight:700;margin-bottom:4px">登录方式</div>' +
      '<div class="long-press-tip" style="margin-bottom:12px">当前：' + (mode === 'auto' ? '无感登录' : '网页登录') +
      ' · 已连续失败 ' + API.getLoginFails() + ' 次</div>' +
      opts.map(function (o) {
        return '<div class="list-item" data-act="loginmode:' + o.k + '">' +
          '<div class="li-ico ' + (mode === o.k ? 'bg-blue' : 'bg-indigo') + '">' + I.lock + '</div>' +
          '<div class="li-main"><div class="li-t">' + o.t + (mode === o.k ? ' ✓' : '') + '</div><div class="li-s">' + o.s + '</div></div>' +
          '</div>';
      }).join('');
  }
  
  var token = function () { return localStorage.getItem('cauc_token'); };
  function savedSid() { return localStorage.getItem('cauc_sid') || ''; }
  function renderLogin() {
    var mode = API.getLoginMode();
    var fallback = API.isFallback();
    var eff = API.effectiveLoginMode();
    var fails = API.getLoginFails();
    var hasSolver = API.hasSolver();
    
    var seg = '';
    var body;
    if (false) {
      if (API.hasNativeLogin()) {
        var items = ['webvpn', 'jwgl', 'network', 'ecard'].map(function (k) {
          var su = API.CONFIG.LOGIN_SYSTEMS[k];
          var on = API.isLogged(k);
          return '<div class="list-item" data-act="native-login:' + k + '">' +
            '<div class="li-ico ' + (on ? 'bg-green' : 'bg-indigo') + '">' + I.lock + '</div>' +
            '<div class="li-main"><div class="li-t">' + esc(su.title) + (on ? ' ✓ 已登录' : '') + '</div>' +
            '<div class="li-s">' + esc(su.desc) + '</div></div>' +
            '<span class="chev">' + I.chevron + '</span></div>';
        }).join('');
        body =
          '<div class="banner">' + I.info + '<div>' +
            (fallback
              ? '无感登录连续失败 <b>' + fails + '</b> 次，已自动切换到<b>网页登录</b>。'
              : '点下面任意一项，在应用内打开登录页（验证码手填）。') +
            '会话保存在本机，之后全部无感。' +
          '</div></div>' +
          '<div style="margin:0 0 12px">' + items + '</div>' +
          '<button class="btn-primary" data-act="login-done">我已登录，进入应用</button>' +
          (fallback ? '<button class="btn-ghost" data-act="loginreset">重置失败计数，回到无感登录</button>' : '');
      } else {
        body =
          '<div class="banner">' + I.info + '<div>' +
            (fallback
              ? '无感登录连续失败 <b>' + fails + '</b> 次，已自动切换到<b>网页登录</b>。'
              : '在下方页面完成登录（含验证码）。') +
          '</div></div>' +
          '<div style="border:1px solid var(--line);border-radius:12px;overflow:hidden;background:#fff">' +
            '<iframe id="login-frame" src="' + API.CONFIG.LOGIN_URLS.webvpn + '" ' +
              'style="width:100%;height:400px;border:0" referrerpolicy="no-referrer"></iframe>' +
          '</div>' +
          '<div class="long-press-tip" style="margin-top:8px;text-align:center">网页预览环境无法使用应用内登录页，请打包成 APK 使用</div>' +
          '<button class="btn-ghost" data-act="openlogin">在新窗口打开登录页</button>' +
          '<button class="btn-primary" data-act="login-done">我已完成登录，继续</button>' +
          (fallback ? '<button class="btn-ghost" data-act="loginreset">重置失败计数，回到无感登录</button>' : '');
      }
    } else {
      body =
        '<div class="field">' +
          '<label>学号 / 账号</label>' +
          '<div class="inp-wrap">' + I.id + '<input id="in-sid" type="text" inputmode="numeric" placeholder="请输入学号" value="' + esc(savedSid()) + '" autocomplete="username"/></div>' +
        '</div>' +
        '<div class="field">' +
          '<label>密码</label>' +
          '<div class="inp-wrap">' + I.key + '<input id="in-pwd" type="password" placeholder="请输入统一身份认证密码" autocomplete="current-password" value="' + esc((API.getCreds && API.getCreds().pwd) || '') + '"/></div>' +
        '</div>' +
        '<button class="btn-primary" id="btn-login">登 录</button>' +
        '<div class="login-secure">' + I.shield +
          '<div>密码仅用于<b>统一身份认证</b>与<b>校园网认证</b>，只存本会话、不落盘；校内/校外通道自动切换。</div>' +
        '</div>' +
        '<div class="login-note">登录后：校内自动一键认证校园网；校外自动切 WebVPN。账密只在本机保存，之后<b>不再重复询问</b>。</div>' +
        (token() ? '<div class="login-note" style="color:var(--warning,#b26a00)">为了校外自动登录，请再输入一次密码（只需这一次）。</div>' : '');
    }
    $('#app').innerHTML =
      '<div class="login-wrap">' +
        '<div class="login-head">' +
          '<div class="lg"><svg viewBox="0 0 64 64" width="34" height="34"><path d="M32 6 L54 20 V44 L32 58 L10 44 V20 Z" fill="none" stroke="#0B3D91" stroke-width="3" stroke-linejoin="round"/><path d="M32 22 L42 28 V40 L32 46 L22 40 V28 Z" fill="#0B3D91" opacity=".92"/></svg></div>' +
          '<h2>航大校园</h2>' +
          '<p>中国民航大学 · 校园助手</p>' +
        '</div>' +
        '<div class="login-card">' + seg + body +
          '<button class="btn-ghost" id="btn-demo">先看看演示（免登录）</button>' +
        '</div>' +
      '</div>';
    var b = $('#btn-login'); if (b) b.onclick = doLogin;
    $('#btn-demo').onclick = function () {
      API.setMode('mock');
      localStorage.setItem('cauc_mode', 'mock');
      localStorage.setItem('cauc_token', 'demo-token');
      
      localStorage.setItem('cauc_sid', '23010086');
      enterApp();
    };
    
    var sEl = $('#in-sid');
    if (sEl) sEl.addEventListener('input', function () {
      var v = sEl.value.replace(/\D/g, '');
      if (v !== sEl.value) sEl.value = v;
    });
    var p = $('#in-pwd'); if (p) p.addEventListener('keydown', function (e) { if (e.key === 'Enter') doLogin(); });
  }
  function doLogin() {
    var sid = $('#in-sid').value.trim();
    var pwd = $('#in-pwd').value;
    var btn = $('#btn-login');
    if (!sid || !pwd) { toast('请输入学号与统一身份认证密码'); return; }
    btn.disabled = true; btn.textContent = '登录中…';
    API.login(sid, pwd).then(function (res) {
      localStorage.setItem('cauc_token', res.token);
      localStorage.setItem('cauc_sid', sid);
      API.clearLoginFails();
      $('#in-pwd').value = '';
      if (API.saveCreds) API.saveCreds(sid, pwd);
      (res.notes || []).forEach(function (n, i) { setTimeout(function () { toast(n); }, 400 * (i + 1)); });
      enterApp();
    }).catch(function (e) {
      var n = API.noteLoginFail();
      toast(e.message || '登录失败');
      if (API.isFallback()) {
        setTimeout(function () {
          toast('连续失败 ' + n + ' 次，已切换到网页登录');
          renderLogin();
        }, 900);
      } else {
        btn.disabled = false; btn.textContent = '登 录';
      }
    });
  }
  
  function enterApp() {
    $('#app').classList.remove('hidden');
    S.week = API.currentWeek();
    S.route = 'home'; S.tab = 'home';
    
    NAV.stack = ['home'];
    HOME.todayCount = null; HOME.elec = null; HOME.elecUnit = null; HOME._elecAt = 0;
    
    if (!API.isMock()) {
      
      (API.probeAndApply ? API.probeAndApply(true) : API.detect()).then(function () {
        var el = document.getElementById('h-status');
        if (el) el.innerHTML = homeStatusBar();
      }).catch(function () {});
      
      setTimeout(function () {
        if (API.wvVerifyNow) API.wvVerifyNow().catch(function () {});
      }, 0);
      
      setTimeout(function () {
        if (API.warmup) API.warmup().catch(function () {});
      }, 300);
    }
    renderShell();
  }
  function renderShell() {
    var isSub = ['home', 'schedule', 'services', 'mine'].indexOf(S.route) < 0;
    var title = isSub ? (TITLES[S.route] || '详情') : ({ home: '航大校园', schedule: '我的课表', services: '校园服务', mine: '个人中心' })[S.route];
    
    
    syncShellBar(title, isSub, '');
    $('#app').innerHTML =
      '<div class="content" id="content"></div>' +
      (isSub ? '' :
        '<div class="tabbar">' +
          tabBtn('home', I.home, '首页') + tabBtn('schedule', I.schedule, '课表') +
          tabBtn('services', I.grid, '服务') + tabBtn('mine', I.user, '我的') +
        '</div>');
    renderContent();
  }
  
  function syncShellBar(title, showBack, right) {
    try {
      var LW = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LoginWebView;
      if (LW && LW.setShellBar) {
        LW.setShellBar({ title: title, showBack: !!showBack, right: right || '' });
      }
    } catch (e) {}
  }
  
  window.__caucNativeAct = function (act) {
    try {
      var d = document.createElement('button');
      d.setAttribute('data-act', act);
      d.style.cssText = 'position:fixed;left:-9999px;top:0';
      document.body.appendChild(d);
      d.click();
      setTimeout(function () { try { d.remove(); } catch (e) {} }, 0);
    } catch (e) {}
  };
  function tabBtn(k, ic, label) { return '<button class="tab' + (S.tab === k ? ' active' : '') + '" data-act="tab:' + k + '">' + ic + '<span>' + label + '</span></button>'; }
  
  var NAV = { stack: ['home'] };
  function pushNav(route) {
    if (NAV.stack[NAV.stack.length - 1] !== route) NAV.stack.push(route);
    if (NAV.stack.length > 20) NAV.stack.splice(0, NAV.stack.length - 20);
  }
  function go(route, opts) {
    pushNav(route);
    S.route = route;
    if (['home', 'schedule', 'services', 'mine'].indexOf(route) >= 0) S.tab = route;
    if (opts && opts.week) S.week = opts.week;
    if (opts && opts.schedView) S.schedView = opts.schedView;
    var c = $('#content'); if (c) c.style.animation = 'none';
    renderShell(); window.scrollTo(0, 0);
  }
  function renderContent() {
    var c = $('#content'); if (!c) return;
    c.innerHTML = loading();
    var map = {
      home: viewHome, schedule: viewSchedule, services: viewServices, mine: viewMine,
      exams: viewExams, electricity: viewElectricity, network: viewNetwork,
      card: viewCard, rooms: viewRooms, calendar: viewCalendar, gpa: viewGpa,
      jwgl: viewJwgl, net: viewNet
    };
    try {
      (map[S.route] || viewHome)(c);
    } catch (e) {
      c.innerHTML = failCard(e);
    }
  }
  
  
  
  var HOME = { todayCount: null, elec: null, _elecAt: 0 };
  
  function quickConf() {
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem('cauc_home_quick') || 'null'); } catch (e) {}
    var list = [];
    if (Array.isArray(saved)) {
      saved.forEach(function (it) {
        if (!it || !it.k) return;
        for (var j = 0; j < list.length; j++) if (list[j].k === it.k) return;   
        if (moduleOf(it.k)) list.push({ k: it.k, on: it.on !== false });
      });
    }
    MODULES.forEach(function (m) {
      for (var i = 0; i < list.length; i++) if (list[i].k === m.k) return;
      list.push({ k: m.k, on: true });    
    });
    return list;
  }
  function quickSave(list) {
    try { localStorage.setItem('cauc_home_quick', JSON.stringify(list)); } catch (e) {}
  }
  
  var HOME_CARD_DEFS = [
    { k: 'status', t: '系统状态' },
    { k: 'hero',   t: '周次统计' },
    { k: 'net',    t: '校园网信息' },
    { k: 'quick',  t: '常用服务' },
    { k: 'course', t: '今日课程' },
    { k: 'exam',   t: '近期考试' }
  ];
  
  function homeCardConf() {
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem('cauc_home_cards') || 'null'); } catch (e) {}
    var list = [];
    if (Array.isArray(saved)) {
      saved.forEach(function (it) {
        if (!it || !it.k) return;
        for (var j = 0; j < list.length; j++) if (list[j].k === it.k) return;   
        for (var i = 0; i < HOME_CARD_DEFS.length; i++) {
          if (HOME_CARD_DEFS[i].k === it.k) { list.push({ k: it.k, on: it.on !== false }); return; }
        }
      });
    }
    HOME_CARD_DEFS.forEach(function (d) {
      for (var i = 0; i < list.length; i++) if (list[i].k === d.k) return;
      list.push({ k: d.k, on: true });
    });
    return list;
  }
  function homeCardSave(list) {
    try { localStorage.setItem('cauc_home_cards', JSON.stringify(list)); } catch (e) {}
  }
  
  function homeQuickCard() {
    var items = quickConf().filter(function (x) { return x.on; })
                           .map(function (x) { return moduleOf(x.k); })
                           .filter(Boolean);
    var grid = items.length
      ? '<div class="quick-grid">' +
          items.map(function (m) {
            return '<button class="quick" data-act="go:' + m.k + '"><span class="q-ico ' + m.c + '">' + m.ic + '</span><span class="q-label">' + m.t + '</span></button>';
          }).join('') +
        '</div>'
      : '<div class="today-empty"><div class="big">🧩</div>服务入口都隐藏了，点右上「编辑」恢复</div>';
    return '<div class="card"><div class="section-title">常用服务 <span class="more" data-act="homecards">编辑 ›</span></div>' + grid + '</div>';
  }
  
  var ELEC_METER = '照明';
  
  var ELEC_PAYTYPE = '1';
  
  function fillBlock(id, promise, render, errRender) {
    Promise.resolve(promise).then(function (r) {
      var el = document.getElementById(id);
      if (!el) return;
      var html = render(r);
      if (html != null) el.innerHTML = html;
    }).catch(function (e) {
      var el = document.getElementById(id);
      if (!el) return;
      el.innerHTML = errRender ? errRender(e) : blockErr(e);
    });
  }
  
  function blockErr(e) {
    var msg = (e && e.message) ? e.message : String(e);
    var short = msg.length > 70 ? msg.slice(0, 70) + '…' : msg;
    return '<div class="card flat" style="padding:14px 16px">' +
      '<div style="font-size:12.5px;color:var(--muted);line-height:1.6">' + esc(short) + '</div>' +
      '<div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">' +
        '<button class="btn-ghost" style="width:auto;padding:6px 14px;font-size:12px" data-act="retry">重试</button>' +
        '<button class="btn-ghost" style="width:auto;padding:6px 14px;font-size:12px" data-act="testjwgl">探测教务系统</button>' +
      '</div>' +
    '</div>';
  }
  
  function heroHtml(stu, today) {
    stu = stu || {};
    
    return '<div class="hero">' +
      '<div class="h-stats">' +
        '<div class="h-stat"><div class="n">第 ' + S.week + ' 周</div><div class="l">' + esc(API.CONFIG.SEMESTER) + '</div></div>' +
        '<div class="h-stat"><div class="n" id="h-stat-course">—</div><div class="l">今日课程</div></div>' +
        '<div class="h-stat"><div class="n" id="h-stat-elec">—</div><div class="l">照明电费</div></div>' +
      '</div>' +
    '</div>';
  }
  
  function paintHeroStats() {
    var a = document.getElementById('h-stat-course');
    if (a) a.textContent = (HOME.todayCount == null) ? '—' : (HOME.todayCount + ' 节');
    var b = document.getElementById('h-stat-elec');
    if (b) b.textContent = (HOME.elec == null) ? '—' : (num(HOME.elec, 1) + ' ' + (HOME.elecUnit || '度'));
  }
  
  function homeStatusBar() {
    var mock = API.isMock();
    var probe = (API.probeLabel ? API.probeLabel() : '尚未探测');
    var chLabel = API.channelLabel ? API.channelLabel() : '';
    var ok = probe.indexOf('已登录，通道就绪') >= 0 || probe.indexOf('可达（校内') >= 0;
    var color = mock ? '#b26a00' : (ok ? '#1a7f37' : '#96241d');
    var bg = mock ? '#fff8e6' : (ok ? '#eaf7ee' : '#fdeceb');
    var bd = mock ? '#f3d99b' : (ok ? '#b7e0c3' : '#f6c3bf');
    
    var probeShort = esc(probe).replace(/^教务系统：/, '').replace(/，通道就绪$/, '');
    
    var oneLine = mock
      ? '演示数据（点「我的 → 数据源」切回真实）'
      : '<b>学校真实系统</b> · ' + probeShort;
    
    
    return '<div class="banner" data-sig="' + esc(probe + '|' + chLabel) + '" ' +
      'style="background:' + bg + ';border-color:' + bd + ';color:' + color + '">' +
      '<div style="flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' +
        oneLine +
      '</div>' +
      '<button class="btn-ghost" style="width:auto;padding:6px 12px;font-size:12px;flex:0 0 auto;align-self:center;margin-top:0" data-act="testjwgl">探测</button>' +
    '</div>';
  }
  
  
  function loadHomeTodayCount() {
    var today = API.dayOfWeek(new Date());
    Promise.resolve(API.getWeekCourses(S.week)).then(function (courses) {
      courses = courses || [];
      var todays = courses.filter(function (x) { return x.day === today; });
      HOME.todayCount = todays.length;
      setTimeout(paintHeroStats, 0);
    }).catch(function () {});
  }
  function loadHomeCourses() {
    
    if (!document.getElementById('h-course')) {
      if (document.getElementById('h-stat-course')) loadHomeTodayCount();
      return;
    }
    var today = API.dayOfWeek(new Date());
    fillBlock('h-course', API.getWeekCourses(S.week), function (courses) {
      courses = courses || [];
      var todays = courses.filter(function (x) { return x.day === today; })
                          .sort(function (a, b) { return a.start - b.start; });
      HOME.todayCount = todays.length;
      setTimeout(paintHeroStats, 0);
      if (!courses.length) return '';
      return '<div class="card"><div class="section-title">今日课程 <span class="more">' +
        fmtDate(new Date()) + ' ' + weekdayName(today) + '</span></div>' +
        (todays.length ? todays.map(function (x) { return courseRowHtml(x); }).join('') :
          '<div class="today-empty"><div class="big">☕</div>今天没有课，好好休息～</div>') +
        '</div>';
    }, function (e) {
      return '<div class="card"><div class="section-title">今日课程 <span class="more">' +
        fmtDate(new Date()) + ' ' + weekdayName(today) + '</span></div>' + blockErr(e) + '</div>';
    });
  }
  function viewHome(c) {
    var today = API.dayOfWeek(new Date());
    var conf = homeCardConf();
    var on = {};
    conf.forEach(function (x) { on[x.k] = x.on; });
    
    if (!conf.some(function (x) { return x.on; })) {
      c.innerHTML =
        '<div class="card flat" style="text-align:center;padding:30px 16px">' +
          '<div style="font-size:38px;opacity:.35">🧩</div>' +
          '<div style="font-size:13px;color:var(--text-2);margin:6px 0 14px">首页的所有卡片都已隐藏</div>' +
          '<button class="btn-ghost" style="width:auto;padding:8px 20px" data-act="homecards">去设置</button>' +
        '</div>';
      return;
    }
    
    var chunk = {
      status: function () { return '<div id="h-status">' + homeStatusBar() + '</div>'; },
      
      hero: function () { return '<div id="h-hero">' + heroHtml(null, today) + '</div>'; },
      net: function () { return '<div id="h-net">' + loading('正在读取网络信息…') + '</div>'; },
      quick: function () { return homeQuickCard(); },
      course: function () { return '<div id="h-course"></div>'; },
      exam: function () { return '<div id="h-exam"></div>'; }
    };
    var html = '';
    conf.forEach(function (x) { if (x.on && chunk[x.k]) html += chunk[x.k](); });
    c.innerHTML = html;
    
    if (on.status && API.probeAndApply) {
      API.probeAndApply().then(function () {
        var el = document.getElementById('h-status');
        if (el) el.innerHTML = homeStatusBar();
      }).catch(function () {});
    }
    
    if (on.net) {
      fillBlock('h-net', API.getNetOverview(false), function (n) {
        setTimeout(function () { patchNetCard(n); }, 0);
        return netMiniCard(n);
      }, function (e) {
        
        return '<div class="card"><div class="section-title">校园网信息</div>' +
          '<div class="long-press-tip" style="padding:4px 0 8px">暂时读不到网络信息：' +
          esc(String((e && e.message) || e)).slice(0, 80) + '</div>' +
          '<button class="btn-ghost" style="width:auto;padding:6px 14px;font-size:12px" data-act="netrefresh">重试</button></div>';
      });
      
      
      refreshHomeDevices(false);
    }
    
    if (on.course || on.hero) loadHomeCourses();
    
    if (on.hero) {
      var elecTtl = (API.getCacheTtlMin ? API.getCacheTtlMin('elec', 5) : 5) * 60 * 1000;
      if (HOME.elec != null && HOME._elecAt && (Date.now() - HOME._elecAt) < elecTtl) {
        paintHeroStats();
      } else {
        Promise.resolve(API.getElectricity ? API.getElectricity() : null).then(function (r) {
          var v = (r && r.light && r.light.remain != null) ? Number(r.light.remain) : null;
          if (v != null) {
            HOME.elec = v;
            HOME.elecUnit = (r.light && r.light.unit) || '度';
            HOME._elecAt = Date.now();
            setTimeout(paintHeroStats, 0);
          }
        }).catch(function () {});
      }
    }
    
    if (on.exam) {
      fillBlock('h-exam', API.getExams(), function (exams) {
        exams = exams || [];
        return '<div class="card"><div class="section-title">即将到来的考试 <span class="more" data-act="go:exams">全部 ›</span></div>' +
          (exams.length ? exams.slice(0, 2).map(function (e) { return examMini(e); }).join('') : empty('🎉', '本学期暂无考试安排')) +
          '</div>';
      }, function (e) {
        return '<div class="card"><div class="section-title">即将到来的考试</div>' + blockErr(e) + '</div>';
      });
    }
  }
  
  
  function homeCardsSheet() {
    var list = homeCardConf();
    function titleOf(k) {
      for (var i = 0; i < HOME_CARD_DEFS.length; i++) if (HOME_CARD_DEFS[i].k === k) return HOME_CARD_DEFS[i].t;
      return k;
    }
    var rows = list.map(function (it, idx) {
      return '<div class="list-item">' +
        '<div class="li-main"><div class="li-t">' + esc(titleOf(it.k)) + '</div></div>' +
        '<button class="card-arr' + (idx === 0 ? ' dim' : '') + '" data-act="homecard:up:' + it.k + '" aria-label="上移">↑</button>' +
        '<button class="card-arr' + (idx === list.length - 1 ? ' dim' : '') + '" data-act="homecard:down:' + it.k + '" aria-label="下移">↓</button>' +
        '<div class="home-switch' + (it.on ? ' on' : '') + '" data-act="homecard:toggle:' + it.k + '"></div>' +
      '</div>';
    }).join('');
    
    var qlist = quickConf();
    var qrows = qlist.map(function (it, idx) {
      var m = moduleOf(it.k) || {};
      return '<div class="list-item">' +
        '<div class="li-main"><div class="li-t">' + esc(m.t || it.k) + '</div></div>' +
        '<button class="card-arr' + (idx === 0 ? ' dim' : '') + '" data-act="homequick:up:' + it.k + '" aria-label="上移">↑</button>' +
        '<button class="card-arr' + (idx === qlist.length - 1 ? ' dim' : '') + '" data-act="homequick:down:' + it.k + '" aria-label="下移">↓</button>' +
        '<div class="home-switch' + (it.on ? ' on' : '') + '" data-act="homequick:toggle:' + it.k + '"></div>' +
      '</div>';
    }).join('');
    return '<div style="font-size:16px;font-weight:700;margin-bottom:4px">自定义首页卡片</div>' +
      '<div class="long-press-tip" style="margin-bottom:12px">开关控制显示/隐藏，箭头调整上下顺序，改动立即生效并自动保存。</div>' +
      '<div class="card flat" style="padding:4px 16px">' + rows + '</div>' +
      '<div style="font-size:16px;font-weight:700;margin:18px 0 4px">常用服务入口</div>' +
      '<div class="long-press-tip" style="margin-bottom:12px">控制首页九宫格里出现哪些服务图标，同样支持排序。</div>' +
      '<div class="card flat" style="padding:4px 16px">' + qrows + '</div>' +
      '<button class="btn-ghost" style="margin-top:16px" data-act="homecard:reset">恢复默认</button>';
  }
  
  
  var CACHE_TTL_DEFS = [
    { k: 'kb',      t: '课表',           def: 1440, s: '内存缓存；落盘的冷启动秒开不受影响' },
    { k: 'profile', t: '个人信息',       def: 43200, s: '姓名/学院/专业等学籍信息；换账号登录后建议调回实时刷一次' },
    { k: 'devices', t: '校园网在线设备', def: 3,  s: '会话内短缓存，刷新按钮始终强制现拉' },
    { k: 'exams',   t: '考试安排',       def: 1440, s: '考试时间地点一天变不了几次' },
    { k: 'elec',    t: '宿舍电费',       def: 5,  s: '照明/空调余量；充值后建议调回实时刷一次' },
    { k: 'ip',      t: '公网 IP',        def: 10, s: '仅充值下单时用，平时不影响显示' }
  ];
  var TTL_UNITS = [
    { k: 'sec', t: '秒', s: 1 },
    { k: 'min', t: '分钟', s: 60 },
    { k: 'hour', t: '小时', s: 3600 },
    { k: 'day', t: '天', s: 86400 },
    { k: 'week', t: '周', s: 604800 },
    { k: 'month', t: '月', s: 2592000 },
    { k: 'year', t: '年', s: 31536000 }
  ];
  
  function ttlSecToNumUnit(sec) {
    if (!sec) return { n: 0, u: 'min' };
    for (var i = TTL_UNITS.length - 1; i >= 0; i--) {
      if (sec % TTL_UNITS[i].s === 0) return { n: sec / TTL_UNITS[i].s, u: TTL_UNITS[i].k };
    }
    return { n: sec, u: 'sec' };
  }
  function ttlSecText(sec) {
    if (!sec) return '实时';
    var r = ttlSecToNumUnit(sec), ut = '秒';
    for (var i = 0; i < TTL_UNITS.length; i++) { if (TTL_UNITS[i].k === r.u) ut = TTL_UNITS[i].t; }
    
    if (r.u === 'month') return r.n + ' 个月';
    return r.n + ' ' + ut;
  }
  
  function ttlApply(key) {
    var ne = $('#ttl-num-' + key), ue = $('#ttl-u-' + key);
    if (!ne || !ue) return null;
    var n = parseFloat(ne.value);
    if (isNaN(n) || n < 0) n = 0;
    if (n > 9999) n = 9999;
    var sec = 0;
    for (var i = 0; i < TTL_UNITS.length; i++) { if (TTL_UNITS[i].k === ue.value) sec = Math.round(n * TTL_UNITS[i].s); }
    var conf = {};
    try { conf = JSON.parse(localStorage.getItem('cauc_cache_ttl') || '{}'); } catch (e) {}
    conf[key] = sec;
    try { localStorage.setItem('cauc_cache_ttl', JSON.stringify(conf)); } catch (e) {}
    var cur = $('#ttl-cur-' + key);
    if (cur) cur.textContent = ttlSecText(sec);
    return sec;
  }
  function cacheTtlSheet() {
    var cur = {};
    try { cur = JSON.parse(localStorage.getItem('cauc_cache_ttl') || '{}'); } catch (e) {}
    var blocks = CACHE_TTL_DEFS.map(function (d) {
      var effSec = (cur[d.k] == null) ? d.def * 60 : Number(cur[d.k]) || 0;
      var r = ttlSecToNumUnit(effSec);
      return '<div style="margin:14px 0 6px">' +
          '<div style="font-size:14px;font-weight:600">' + esc(d.t) +
            '<span id="ttl-cur-' + d.k + '" style="font-weight:400;font-size:12px;color:var(--muted)"> · 当前 ' + ttlSecText(effSec) + '（默认 ' + ttlSecText(d.def * 60) + '）</span></div>' +
          '<div class="long-press-tip">' + esc(d.s) + '</div>' +
        '</div>' +
        '<div style="display:flex;gap:8px;align-items:center">' +
          '<input id="ttl-num-' + d.k + '" class="txt-in" type="number" inputmode="decimal" min="0" step="any" value="' + r.n + '" style="flex:1;min-width:0"/>' +
          '<select id="ttl-u-' + d.k + '" class="txt-in" style="flex:1;min-width:0">' +
            TTL_UNITS.map(function (u) { return '<option value="' + u.k + '"' + (r.u === u.k ? ' selected' : '') + '>' + u.t + '</option>'; }).join('') +
          '</select>' +
        '</div>';
    }).join('');
    return '<div style="font-size:16px;font-weight:700;margin-bottom:4px">缓存时长</div>' +
      '<div class="long-press-tip" style="margin-bottom:4px">每类数据填一个数字、选一个单位（秒到年都行）；0 = 实时（每次现拉，更准但更慢）。改动即时生效。</div>' +
      blocks +
      '<button class="btn-ghost" style="margin-top:16px" data-act="ttlreset">恢复默认</button>';
  }
  function courseRowHtml(x) {
    return '<div class="course-row" data-act="course:' + x.id + '">' +
      '<div class="cr-time"><div class="s">' + x.start + '-' + x.end + '</div><div class="e">' + (API.SECTIONS[x.start - 1] || {}).t + '</div></div>' +
      '<div class="cr-bar" style="background:' + x.hex + '"></div>' +
      '<div class="cr-main"><div class="cr-name">' + esc(x.name) + '</div>' +
      '<div class="cr-info"><span>' + esc(x.teacher) + '</span><span>' + esc(x.room) + '</span><span>' + x.weeks.length + ' 周</span></div></div>' +
      '</div>';
  }
  function examMini(e) {
    
    return '<div class="list-item"><div class="li-ico bg-red">' + I.exam + '</div>' +
      '<div class="li-main"><div class="li-t">' + esc(e.course) + '</div><div class="li-s">' + esc(e.date) + ' ' + esc(e.time) + ' · ' + esc(e.room) + '</div></div>' +
      '<div class="li-v" style="font-size:12px;color:var(--danger)">' + esc(e.type) + '</div></div>';
  }
  
  function viewSchedule(c) {
    Promise.all([S.schedView === 'week' ? API.getWeekCourses(S.week) : API.getAllCourses()]).then(function (r) {
      var head =
        '<div class="seg">' +
          '<button class="' + (S.schedView === 'week' ? 'on' : '') + '" data-act="schedview:week">周课表</button>' +
          '<button class="' + (S.schedView === 'all' ? 'on' : '') + '" data-act="schedview:all">总课表</button>' +
        '</div>';
      
      if (S.route !== 'schedule') return;
      c.innerHTML = head + (S.schedView === 'week' ? weekTable(r[0]) : allTable(r[0]));
    }).catch(function (e) {
      if (S.route !== 'schedule') return;
      c.innerHTML = failCard(e);
    });
  }
  function weekTable(courses) {
    var mon = API.weekStartDate(S.week), today = API.dayOfWeek(new Date()), curW = API.currentWeek();
    var head = '<div class="sched-head"><div class="sh-d"></div>';
    for (var d = 1; d <= 7; d++) {
      var dd = new Date(mon); dd.setDate(dd.getDate() + (d - 1));
      head += '<div class="sh-d' + (d === today && S.week === curW ? ' today' : '') + '">' + weekdayName(d).replace('周', '') + '<span class="dd">' + (dd.getMonth() + 1) + '/' + dd.getDate() + '</span></div>';
    }
    head += '</div>';
    var body = '<div class="sched-body"><div class="sched-col">';
    for (var s = 1; s <= 10; s++) {
      var sec = API.SECTIONS[s - 1] || {};
      body += '<div class="slot-num"><b>' + s + '</b>' + String(sec.t || '').slice(0, 5) + '</div>';
    }
    body += '</div>';
    for (var d2 = 1; d2 <= 7; d2++) {
      var isToday = (d2 === today && S.week === curW);
      body += '<div class="sched-day" style="position:relative">';
      for (var s2 = 1; s2 <= 10; s2++) body += '<div class="slot-cell' + (isToday ? ' today' : '') + '"></div>';
      courses.filter(function (x) { return x.day === d2; }).forEach(function (x) {
        var top = (x.start - 1) * 52 + 2, h = (x.end - x.start + 1) * 52 - 4;
        body += '<div class="course-block" data-act="course:' + x.id + '" style="top:' + top + 'px;height:' + h + 'px;background:' + x.hex + '">' +
          '<div class="cb-name">' + esc(x.name) + '</div>' +
          '<div class="cb-room">' + esc(x.room) + '</div>' +
        '</div>';
      });
      body += '</div>';
    }
    body += '</div>';
    var sw =
      '<div class="week-switch">' +
        '<button class="ws-btn" data-act="week:-1"' + (S.week <= 1 ? ' disabled' : '') + '><svg viewBox="0 0 24 24" style="width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round;transform:rotate(180deg)"><path d="M9 6l6 6-6 6"/></svg></button>' +
        '<div class="ws-center"><div class="w1">第 ' + S.week + ' 周</div><div class="w2">' +
          (function () { var e = new Date(mon); e.setDate(e.getDate() + 6); return fmtDate(mon) + ' - ' + fmtDate(e); })() +
          ' · 共 ' + API.CONFIG.TOTAL_WEEKS + ' 周</div></div>' +
        '<button class="ws-btn" data-act="week:1"' + (S.week >= API.CONFIG.TOTAL_WEEKS ? ' disabled' : '') + '><svg viewBox="0 0 24 24" style="width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round"><path d="M9 6l6 6-6 6"/></svg></button>' +
      '</div>';
    return sw + '<div class="sched-wrap">' + head + body + '</div>' +
      '<div class="long-press-tip" style="text-align:center;margin-top:12px">点击课程查看详情 · 左右滑动或点箭头切换周次</div>';
  }
  function allTable(courses) {
    if (!courses.length) return empty('📚', '暂无课程');
    var groups = { '必修': [], '选修': [], '实践': [] };
    courses.forEach(function (c) { (groups[c.type] || groups['必修']).push(c); });
    var html = '<div class="card">';
    ['必修', '选修', '实践'].forEach(function (k) {
      if (!groups[k].length) return;
      html += '<div class="section-title">' + k + '课 <span class="more">' + groups[k].length + ' 门</span></div>';
      groups[k].forEach(function (x) {
        var wk = x.weeks.length ? x.weeks[0] + '-' + x.weeks[x.weeks.length - 1] + '周' + (x.weeks.length === 8 ? '(1-8周)' : '') : '-';
        html += '<div class="all-course" data-act="course:' + x.id + '">' +
          '<div class="ac-bar" style="background:' + x.hex + '"></div>' +
          '<div class="ac-main"><div class="ac-name">' + esc(x.name) + '</div>' +
          '<div class="ac-tags">' +
            '<span class="tag">' + num(x.credits, 1) + ' 学分</span>' +
            '<span class="tag grey">' + weekdayName(x.day) + ' ' + x.start + '-' + x.end + '节</span>' +
            '<span class="tag grey">' + esc(x.room) + '</span>' +
            '<span class="tag grey">' + esc(x.teacher) + '</span>' +
            '<span class="tag ' + (x.type === '实践' ? 'orange' : 'green') + '">' + esc(wk) + '</span>' +
          '</div></div>' +
          '<span class="chev">' + I.chevron + '</span>' +
        '</div>';
      });
    });
    html += '</div>';
    var total = courses.reduce(function (a, b) { return a + (Number(b.credits) || 0); }, 0);
    html += '<div class="card flat" style="text-align:center;color:var(--text-2);font-size:13px">本学期共 <b>' + courses.length + '</b> 门课程，合计 <b>' + num(total, 1) + '</b> 学分</div>';
    
    html += '<div style="text-align:center;margin-top:12px">' +
      '<button class="btn-ghost" style="width:auto;padding:8px 22px" data-act="kbpdf">⬇ 下载课表 PDF（保存到 Download）</button></div>';
    return html;
  }
  function showCourse(id) {
    Promise.all([API.getAllCourses()]).then(function (r) {
      var x = r[0].filter(function (c) { return c.id === id; })[0]; if (!x) return;
      openSheet(
        '<div style="display:flex;gap:12px;align-items:center;margin-bottom:16px">' +
          '<div style="width:6px;height:44px;border-radius:6px;background:' + x.hex + '"></div>' +
          '<div><div style="font-size:18px;font-weight:700">' + esc(x.name) + '</div>' +
          '<div class="long-press-tip">' + esc(x.type) + ' · ' + num(x.credits, 1) + ' 学分</div></div>' +
        '</div>' +
        '<div class="kv"><span class="k">授课教师</span><span class="v">' + esc(x.teacher) + '</span></div>' +
        '<div class="kv"><span class="k">上课时间</span><span class="v">' + weekdayName(x.day) + ' 第 ' + x.start + '-' + x.end + ' 节</span></div>' +
        '<div class="kv"><span class="k">时间点</span><span class="v">' +
          (API.sectionTime ? (API.sectionTime(x.start) + ' ~ ' +
            (((API.SECTIONS[x.end - 1] || {}).e) || (API.SECTIONS[x.end - 1] || {}).t || ''))
            : ((API.SECTIONS[x.start - 1] || {}).t + ' - ' + (API.SECTIONS[x.end - 1] || {}).t)) +
          '</span></div>' +
        '<div class="kv"><span class="k">上课地点</span><span class="v">' + esc(x.room) + '</span></div>' +
        '<div class="kv"><span class="k">上课周次</span><span class="v">' + x.weeks[0] + '-' + x.weeks[x.weeks.length - 1] + ' 周</span></div>' +
        '<button class="btn-primary" style="margin-top:18px" data-act="closesheet">知道了</button>'
      );
    }).catch(function (e) {
      
      toast('课程详情加载失败：' + String((e && e.message) || e).slice(0, 60));
    });
  }
  
  function viewServices(c) {
    
    
    var mapItem = { t: '校园地图', ic: I.map, c: 'bg-lime', sub: '南苑 / 北苑手绘地图' };
    c.innerHTML =
      '<div class="card"><div class="section-title">学习与教务</div>' +
        MODULES.map(function (m) {
          return '<div class="list-item" data-act="go:' + m.k + '"><div class="li-ico ' + m.c + '">' + m.ic + '</div>' +
            '<div class="li-main"><div class="li-t">' + m.t + '</div></div><span class="chev">' + I.chevron + '</span></div>';
        }).join('') +
        '<div class="list-item"><div class="li-ico ' + mapItem.c + '">' + mapItem.ic + '</div>' +
          '<div class="li-main"><div class="li-t">' + mapItem.t + '</div><div class="li-s">' + mapItem.sub + '</div></div>' +
          '<span class="chev">' + I.chevron + '</span></div>' +
      '</div>';
  }
  
  function profileSkeleton() {
    return '<div class="card"><div class="profile-head">' +
      '<div class="p-ava">…</div>' +
      '<div><div class="p-name">正在读取学生信息…</div><div class="p-sub">' + esc(savedSid()) + '</div></div>' +
      '</div></div>';
  }
  function profileUnavailable(detail) {
    var msg = detail ? String(detail).slice(0, 80) : '学生信息暂未取到（WebVPN 会话建立中，稍候自动重试）';
    return '<div class="card" style="padding:16px">' +
      '<div class="profile-head"><div class="p-ava">?</div>' +
      '<div><div class="p-name">学生信息未取到</div><div class="p-sub">' + esc(savedSid()) + '</div></div></div>' +
      '<div class="long-press-tip" style="margin-top:10px">' + esc(msg) + '</div>' +
      '<button class="btn-ghost" style="width:auto;padding:8px 18px;margin-top:10px" data-act="testjwgl">探测教务系统</button>' +
    '</div>';
  }
  function profileCard(stu) {
    return '<div class="card">' +
      '<div class="profile-head"><div class="p-ava">' + esc(String(stu.name).slice(0, 1)) + '</div>' +
      '<div><div class="p-name">' + esc(stu.name) + '</div>' +
      '<div class="p-sub">' + esc(stu.sid) + (stu.grade ? ' · ' + esc(stu.grade) : '') + '</div></div></div>' +
      (stu.college ? '<div class="kv"><span class="k">学院</span><span class="v">' + esc(stu.college) + '</span></div>' : '') +
      (stu.major ? '<div class="kv"><span class="k">专业</span><span class="v">' + esc(stu.major) + '</span></div>' : '') +
      (stu.className ? '<div class="kv"><span class="k">班级</span><span class="v">' + esc(stu.className) + '</span></div>' : '') +
      (stu.dorm ? '<div class="kv"><span class="k">宿舍</span><span class="v">' + esc(stu.dorm) + '</span></div>' : '') +
      (stu.campus ? '<div class="kv"><span class="k">校区</span><span class="v">' + esc(stu.campus) + '</span></div>' : '') +
    '</div>';
  }
  function viewMine(c) {
    
    var menu =
      '<div class="card">' +
        '<div class="list-item" data-act="go:jwgl"><div class="li-ico bg-blue">' + I.jwgl + '</div><div class="li-main"><div class="li-t">教务系统（免登入口）</div><div class="li-s">成绩 / 修读计划 / 考试 · 手动操作全部功能</div></div><span class="chev">' + I.chevron + '</span></div>' +
        '<div class="list-item" data-act="openwebvpn"><div class="li-ico bg-indigo">' + I.vpn + '</div><div class="li-main"><div class="li-t">WebVPN</div><div class="li-s">校园网门户 · 已登录态直达全部资源</div></div><span class="chev">' + I.chevron + '</span></div>' +
        
        '<div class="list-item" data-act="channel"><div class="li-ico bg-cyan">' + I.link + '</div><div class="li-main"><div class="li-t">网络通道</div><div class="li-s">当前：' + API.channelLabel() + (API.canBypassCors() ? ' · 原生HTTP' : ' · 浏览器') + '</div></div><span class="chev">' + I.chevron + '</span></div>' +
        
        '<div class="list-item" data-act="homecards"><div class="li-ico bg-violet">' + I.cards + '</div><div class="li-main"><div class="li-t">首页卡片设置</div><div class="li-s">显示/隐藏与排序</div></div><span class="chev">' + I.chevron + '</span></div>' +
        '<div class="list-item" data-act="cachettl"><div class="li-ico bg-teal">' + I.refresh + '</div><div class="li-main"><div class="li-t">缓存时长</div><div class="li-s">课表 / 设备 / 考试 / 电费 · 分数据源自定义</div></div><span class="chev">' + I.chevron + '</span></div>' +
        '<div class="list-item" data-act="darkmode"><div class="li-ico bg-slate">' + I.bolt + '</div><div class="li-main"><div class="li-t">深色模式</div><div class="li-s">当前：' + (localStorage.getItem('cauc_dark') === '1' ? '开' : localStorage.getItem('cauc_dark') === '0' ? '关' : '跟随系统') + ' · 点击切换（开→关→跟随系统）</div></div></div>' +
        '<div class="list-item" data-act="togglemode"><div class="li-ico bg-lime">' + I.db + '</div><div class="li-main"><div class="li-t">数据源</div><div class="li-s">当前：' +
          (API.isMock() ? '演示数据（点此切回真实系统）' : '学校真实系统（点此切到演示）') + '</div></div><span class="chev">' + I.chevron + '</span></div>' +
        
        '<div class="list-item" data-act="clearcreds"><div class="li-ico bg-amber">' + I.lock + '</div><div class="li-main"><div class="li-t">已保存账密</div><div class="li-s">' +
          (API.hasCreds && API.hasCreds() ? '已记住（' + esc(savedSid()) + '）· 点此清除' : '未保存') + '</div></div><span class="chev">' + I.chevron + '</span></div>' +
        '<div class="list-item"><div class="li-ico bg-green">' + I.shield + '</div><div class="li-main"><div class="li-t">账号安全</div><div class="li-s">密码仅存于本机，不保存明文</div></div></div>' +
      '</div>' +
      '<div class="card"><div class="list-item" data-act="logout"><div class="li-ico bg-red">' + I.logout + '</div><div class="li-main"><div class="li-t" style="color:var(--danger)">退出登录</div></div></div></div>' +
      '<div style="text-align:center;color:var(--muted);font-size:11.5px;padding:8px 0 20px">航大校园 v1.0 · 无广告版<br/>数据来源：' +
        (API.isMock() ? '演示数据' : '学校系统') + '</div>';
    c.innerHTML = '<div id="m-profile">' + profileSkeleton() + '</div>' + menu;
    
    if (API.hasCreds && API.hasCreds()) {
      fillBlock('m-profile', API.getStudent(), function (stu) {
        return (stu && stu.name) ? profileCard(stu) : profileUnavailable();
      }, function (e) {
        return profileUnavailable(e && e.message);
      });
    } else {
      var el = document.getElementById('m-profile');
      if (el) el.innerHTML = profileUnavailable('尚未登录');
    }
  }
  
  function viewExams(c) {
    API.getExams().then(function (list) {
      
      if (S.route !== 'exams') return;
      if (!list.length) { c.innerHTML = empty('🎉', '本学期暂无考试安排'); return; }
      var html = '';
      list.forEach(function (e) {
        html += '<div class="exam-card"><div class="ex-row"><div class="ex-name">' + esc(e.course) + '</div>' +
          '<div class="ex-count">' + esc(e.status) + '</div></div>' +
          '<div class="ex-meta">' +
            '<div class="m">' + I.cal + esc(e.date) + '</div>' +
            '<div class="m">' + I.info + esc(e.time) + '</div>' +
            '<div class="m">' + I.map + esc(e.room) + '</div>' +
            '<div class="m">' + I.id + '座位 ' + esc(e.seat) + ' 号</div>' +
          '</div></div>';
      });
      c.innerHTML = '<div class="banner">' + I.info + '<div>考试信息以教务处最终公布为准，请提前 20 分钟到场并携带学生证。</div></div>' + html;
    }).catch(function (e) {
      if (S.route !== 'exams') return;
      c.innerHTML = failCard(e);
    });
  }
  
  
  var ES = { campus: '东丽', area: null, building: null, floor: null, room: null, areas: null, buildings: null, floors: null, rooms: null, err: '' };
  function viewElectricity(c) {
    
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem('cauc_elec_room') || 'null'); } catch (e) {}
    var base = '';
    if (saved && saved.room) {
      base = String(typeof saved.room === 'string' ? saved.room
        : ((saved.room && (saved.room.roomid || saved.room.room)) || '')).replace(/(空调|照明)$/, '');
    }
    
    if (!API.isMock() && !saved) {
      c.innerHTML = '<div id="elec-main"></div>';
      var main0 = $('#elec-main');
      if (!ES.areas && !ES.err) {
        main0.innerHTML = loading('正在读取宿舍区域…');
        esLoad(1).then(function () { var m = $('#elec-main'); if (m) renderElecSetup(m); },
                       function () { var m = $('#elec-main'); if (m) renderElecSetup(m); });
      } else { renderElecSetup(main0); }
      return;
    }
    var campusName = (saved && saved.area && (saved.area.areaname || saved.area.area)) || '';
    var buildName = (saved && saved.building && saved.building.building) || '';
    var isNinghe = /宁河/.test((saved && saved.area && (saved.area.areaname || saved.area.area)) || '');
    var isMock = API.isMock();
    
    var meterCards = isNinghe
      ? '<div class="card"><div class="section-title">当前剩余电费</div>' +
          '<div class="meter">' +
            '<div class="m-box" style="background:linear-gradient(135deg,#f7a52b,#e08600);flex:1"><div class="mt">⚡ 电费余额</div>' +
              '<div class="mv" id="elec-light-remain">—</div><div class="mu">元</div></div>' +
          '</div></div>' +
        '<div class="card"><div class="section-title">用电明细</div>' +
          '<div class="kv"><span class="k">剩余金额</span><span class="v" id="elec-light-remain2">—</span></div>' +
        '</div>'
      : '<div class="card"><div class="section-title">当前剩余电量</div>' +
          '<div class="meter">' +
            '<div class="m-box" style="background:linear-gradient(135deg,#f7a52b,#e08600)"><div class="mt">' + I.bolt + ' 照明</div>' +
              '<div class="mv" id="elec-light-remain">—</div><div class="mu">度</div></div>' +
            '<div class="m-box" style="background:linear-gradient(135deg,#2a72de,#0b3d91)"><div class="mt">❄ 空调</div>' +
              '<div class="mv" id="elec-ac-remain">—</div><div class="mu">度</div></div>' +
          '</div></div>' +
        '<div class="card"><div class="section-title">用电明细 <span class="more" id="elec-fresh"></span></div>' +
          '<div class="kv"><span class="k">照明 · 剩余(收费电量)</span><span class="v" id="elec-light-remain2">—</span></div>' +
          '<div class="kv"><span class="k">照明 · 免费额度</span><span class="v" id="elec-light-free">—</span></div>' +
          '<div class="kv"><span class="k">照明 · 累计用电</span><span class="v" id="elec-light-total">—</span></div>' +
          '<div class="kv"><span class="k">空调 · 剩余(收费电量)</span><span class="v" id="elec-ac-remain2">—</span></div>' +
          '<div class="kv"><span class="k">空调 · 累计用电</span><span class="v" id="elec-ac-total">—</span></div>' +
        '</div>';
    var meterPills = isNinghe ? '' :
      '<div class="pill-row" style="margin-bottom:8px">' +
        '<button class="pill' + (ELEC_METER === '照明' ? ' on' : '') + '" data-act="elec-meter-light">⚡ 照明</button>' +
        '<button class="pill' + (ELEC_METER === '空调' ? ' on' : '') + '" data-act="elec-meter-ac">❄ 空调</button>' +
      '</div>';
    c.innerHTML =
      '<div class="banner">' + I.info + '<div id="elec-banner">' +
        esc(campusName) + ' ' + esc(buildName) + ' ' + esc(base) +
        ' · ' + (isNinghe ? '单表按金额计费' : '照明与空调分开计量') + '（' + (isMock ? '演示数据' : '学校一卡通实时数据') + '）</div></div>' +
      meterCards +
      '<div class="card"><div class="section-title">电费充值</div>' +
        meterPills +
        '<div class="pill-row" style="margin-bottom:10px">' +
          '<button class="pill' + (ELEC_PAYTYPE === '1' ? ' on' : '') + '" data-act="elec-pay-1">一卡通余额</button>' +
          '<button class="pill' + (ELEC_PAYTYPE === '5' ? ' on' : '') + '" data-act="elec-pay-5">支付宝</button>' +
          '<button class="pill' + (ELEC_PAYTYPE === '8' ? ' on' : '') + '" data-act="elec-pay-8">工行聚合</button>' +
        '</div>' +
        '<div style="display:flex;gap:8px;align-items:center">' +
          '<input id="elec-amt" type="number" inputmode="decimal" min="0.01" step="0.01" placeholder="金额（元）" ' +
            'style="flex:1;height:42px;border:1px solid var(--line,#e5e7eb);border-radius:10px;padding:0 12px;font-size:15px;background:var(--card);color:var(--text)">' +
          '<button class="btn-primary" style="width:auto;height:42px;padding:0 22px;margin-top:0;align-self:center" data-act="elec-recharge"><span class="btn-label">充值</span></button>' +
        '</div>' +
        '<div class="long-press-tip elec-pay-hint" style="margin-top:8px">' +
          (ELEC_PAYTYPE === '1' ? '从一卡通余额直接扣款、实时到账。' : '下单后跳转收银台，在页面内完成支付。') +
          (isNinghe ? '' : '照明与空调分开计量，请分别充值。') + '</div>' +
      '</div>' +
      '<div style="display:flex;gap:8px">' +
        '<button class="btn-ghost" style="flex:1" data-act="elecrefresh">刷新电量</button>' +
        '<button class="btn-ghost" style="flex:1" data-act="elec-reset">更换宿舍房间</button>' +
      '</div>' +
      '<div id="elec-err" class="long-press-tip" style="text-align:center;margin-top:8px"></div>';
    
    var setTxt = function (id, txt) {
      var el = document.getElementById(id);
      if (el) el.textContent = txt;
    };
    API.getElectricity().then(function (e) {
      var unit = (e.light && e.light.unit) || '度';
      setTxt('elec-light-remain', e.light.remain);
      if (!isNinghe) {
        setTxt('elec-ac-remain', e.ac.remain);
        setTxt('elec-light-remain2', e.light.remain + ' 度');
        setTxt('elec-light-free', (e.light.free != null ? e.light.free : 0) + ' 度');
        setTxt('elec-light-total', (e.light.total != null ? e.light.total : 0) + ' 度');
        setTxt('elec-ac-remain2', e.ac.remain + ' 度');
        setTxt('elec-ac-total', (e.ac.total != null ? e.ac.total : 0) + ' 度');
      } else {
        setTxt('elec-light-remain2', e.light.remain + ' 元');
      }
      setTxt('elec-fresh', '刚刚更新');
    }).catch(function (err) {
      setTxt('elec-light-remain', '—');
      setTxt('elec-ac-remain', '—');
      var box = document.getElementById('elec-err');
      if (box) {
        box.innerHTML = esc(String((err && err.message) || err)) +
          ' <span style="text-decoration:underline" data-act="elecrefresh">点此重试</span>';
      }
    });
  }
  
  function renderElecSetup(c) {
    
    var pillRow = function (list, sel, key, act, displayKey) {
      if (!list) return loading();
      if (!list.length) return '<div class="long-press-tip">暂无数据</div>';
      return list.map(function (x) {
        var v = x[key] || x[key + 'id'] || '';
        var txt = displayKey ? (x[displayKey] || v) : v;
        return '<button class="pill' + (sel === v ? ' on' : '') + '" data-act="' + act + ':' + esc(v) + '">' + esc(txt) + '</button>';
      }).join('');
    };
    var isNingheCampus = ES.campus === '宁河';
    var hasAnyArea = isNingheCampus || !!(ES.areas && ES.areas.length);
    var html =
      '<div class="card"><div class="section-title">校区</div><div class="pill-row">' +
        '<button class="pill' + (!isNingheCampus ? ' on' : '') + '" data-act="escampus:东丽">东丽校区</button>' +
        '<button class="pill' + (isNingheCampus ? ' on' : '') + '" data-act="escampus:宁河">宁河校区</button>' +
      '</div></div>';
    if (!isNingheCampus && hasAnyArea) {
      html += '<div class="card"><div class="section-title">公寓</div><div class="pill-row">' +
        pillRow(ES.areas, ES.area && ES.area.area, 'area', 'es:area', 'areaname') + '</div></div>';
    }
    if (isNingheCampus || ES.area) {
      html += '<div class="card"><div class="section-title">楼栋</div><div class="pill-row">' +
        pillRow(ES.buildings, ES.building && ES.building.buildingid, 'buildingid', 'es:building', 'building') + '</div></div>';
    }
    if (ES.building) html += '<div class="card"><div class="section-title">楼层</div><div class="pill-row">' +
      pillRow(ES.floors, ES.floor && ES.floor.floorid, 'floorid', 'es:floor', 'floor') + '</div></div>';
    if (ES.floor) html += '<div class="card"><div class="section-title">房间</div><div class="pill-row">' +
      pillRow(ES.rooms, ES.room && ES.room.roomid, 'roomid', 'es:room', 'room') + '</div></div>';
    if (ES.err && !isNingheCampus && !hasAnyArea) {
      html += '<div class="banner" style="background:#fff8e6;border-color:#ffe0a3;color:#8a5a00;margin-top:12px">' + I.info +
        '<div>查询失败</div>' +
        '<button class="btn-ghost" style="width:auto;padding:6px 12px;font-size:12px;flex:0 0 auto;align-self:center;margin-top:0" data-act="es-retry">重试</button></div>';
    } else {
      html += '<div class="long-press-tip" style="text-align:center;margin-top:12px">选好房间后自动记住，下次不用再选。</div>';
    }
    c.innerHTML = html;
  }
  function esLoad(levelNo) {
    var p;
    if (levelNo === 1) p = API.elecArea().then(function (l) { ES.areas = l; });
    else if (levelNo === 2) p = API.elecBuilding(ES.area).then(function (l) { ES.buildings = l; });
    else if (levelNo === 3) p = API.elecFloor(ES.area, ES.building).then(function (l) { ES.floors = l; });
    else if (levelNo === 4) p = API.elecRoom(ES.area, ES.building, ES.floor).then(function (l) { ES.rooms = l; });
    else p = Promise.resolve();
    ES.err = '';
    return p.catch(function (e) { ES.err = e.message || String(e); });
  }
  
  
  function netStateLabel(n) {
    if (n.channel === 'webvpn') return '校外 · WebVPN 通道';
    if (n.online === null || n.online === undefined) return '认证状态检测中…';
    if (n.online) return '校园网已认证';
    if (n.netIn || n.campusIp) return '校园网未认证 · 内网可达，认证后才能上外网';
    return '当前不在校园网';
  }
  
  
  function netPageHtml(n) {
    var on = n.online;
    return '<div class="card">' +
      '<div class="kv"><span class="k">本机 IP</span><span class="v mono">' +
        (n.ip ? esc(n.ip) + (n.prefix ? '/' + n.prefix : '') : '—') + '</span></div>' +
      '<div class="kv"><span class="k">本机校园网 IP</span><span class="v mono" style="font-weight:700">' +
        (n.campusIp ? esc(n.campusIp) : '—') + '</span></div>' +
      '<div class="kv"><span class="k">接入通道</span><span class="v">' +
        esc(n.channelLabel || '未就绪') + (on ? '' : ' · 外网受限') + '</span></div>' +
      '<button class="btn-ghost" style="width:100%;margin-top:10px" data-act="netrefresh">刷新网络信息</button>' +
    '</div>';
  }
  function renderNetPage(fresh) {
    var box = $('#net-box');
    if (!box) return Promise.resolve();
    return Promise.resolve(API.getNetOverview(fresh)).then(function (n) {
      n = n || {};
      box.innerHTML = netPageHtml(n);
      
      Promise.all([
        (n.whenOnline ? n.whenOnline : Promise.resolve({ online: n.online, netIn: n.netIn })),
        (n.whenCampusIp ? n.whenCampusIp : Promise.resolve(n.campusIp))
      ]).then(function (r) {
        var s = r[0];
        
        if (s && typeof s === 'object') {
          n.online = !!s.online;
          n.netIn = !!s.netIn;
          if (s.ip) n.campusIp = s.ip;
        } else {
          n.online = !!s;
        }
        n.campusIp = r[1] || n.campusIp;
        var b2 = $('#net-box');
        
        var html2 = netPageHtml(n);
        if (b2 && b2.innerHTML !== html2) b2.innerHTML = html2;
      }).catch(function () {});
    }).catch(function (e) {
      box.innerHTML = failCard(e);
    });
  }
  function viewNetwork(c) {
    
    
    c.innerHTML =
      '<div id="self-box"></div>' +
      
      '<div id="self-logcard"></div>' +
      '<div id="net-box">' + loading('正在读取网络信息…') + '</div>' +
      '<div id="netfee-box"></div>' +
      '<div class="card flat" style="padding:12px 14px"><div class="long-press-tip">' +
        '校园网账号切换、断线重连请到「校园网认证」页操作；' +
        '设备列表来自学校「用户自助服务系统」，与校园网认证是两套账号体系（同一份账密）。' +
      '</div></div>';
    renderNetPage(false);
    selfRender();
    
    renderLogCard();
    renderNetFee($('#netfee-box'));
  }
  
  function openCashier(cashier) {
    var url = String((cashier && cashier.url) || '').trim();
    var fields = (cashier && cashier.fields) || {};
    
    if (!url && String(fields.package || fields.packageValue || '').indexOf('WXPay') >= 0) {
      toast('微信支付已停用，请选择其他支付方式（一卡通余额 / 支付宝 / 工行聚合）');
      return;
    }
    if (!url) { toast('该渠道未返回收银台地址'); return; }
    var names = Object.keys(fields);
    
    
    var LW = (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LoginWebView) || null;
    if (LW && LW.openPost) {
      LW.openPost({ url: url, fields: fields, title: '支付' }).catch(function () {});
      return;
    }
    
    var f = document.createElement('form');
    f.action = url; f.method = 'POST';
    names.forEach(function (k) {
      var i = document.createElement('input');
      i.type = 'hidden'; i.name = k; i.value = fields[k];
      f.appendChild(i);
    });
    document.body.appendChild(f);
    f.submit();
  }
  
  var NET_PAYTYPE = '1';
  function renderNetFee(box) {
    if (!box || !API.netInfo) return;
    if (!API.isLogged || !API.savedElecRoom) {  }
    
    box.innerHTML =
      '<div class="card"><div class="section-title">校园网费 <span class="more" id="netfee-acc">新中新</span></div>' +
        '<div class="long-press-tip" id="netfee-status" style="margin-bottom:10px">正在读取账户信息…</div>' +
        '<div class="pill-row" style="margin-bottom:10px">' +
          '<button class="pill' + (NET_PAYTYPE === '1' ? ' on' : '') + '" data-act="net-pay-1">一卡通余额</button>' +
          '<button class="pill' + (NET_PAYTYPE === '5' ? ' on' : '') + '" data-act="net-pay-5">支付宝</button>' +
          '<button class="pill' + (NET_PAYTYPE === '8' ? ' on' : '') + '" data-act="net-pay-8">工行聚合</button>' +
        '</div>' +
        '<div style="display:flex;gap:8px;align-items:center">' +
          '<input id="net-amt" type="number" inputmode="decimal" min="0.01" step="0.01" placeholder="金额（元）" ' +
            'style="flex:1;height:42px;border:1px solid var(--line,#e5e7eb);border-radius:10px;padding:0 12px;font-size:15px;background:var(--card);color:var(--text)">' +
          '<button class="btn-primary" style="width:auto;height:42px;padding:0 22px;margin-top:0;align-self:center" data-act="net-recharge"><span class="btn-label">充值</span></button>' +
        '</div>' +
        '<div class="long-press-tip" style="margin-top:8px">' +
          (NET_PAYTYPE === '1' ? '从一卡通余额直接扣款、实时到账。' : '下单后跳转收银台，在页面内完成支付。') +
        '</div>' +
      '</div>';
    API.netInfo().then(function (r) {
      var s1 = document.getElementById('netfee-status');
      if (s1) s1.textContent = r.status || '';
      var a1 = document.getElementById('netfee-acc');
      if (a1) a1.textContent = '新中新 · ' + (r.netacc || '');
    }).catch(function (e) {
      var s1 = document.getElementById('netfee-status');
      if (s1) s1.textContent = String((e && e.message) || e);
    });
  }
  
  function refreshHomeDevices(force) {
    if (!API.selfDevices) return;
    
    if (S.route !== 'home') return;
    if (!force) {
      if (refreshHomeDevices._at && (Date.now() - refreshHomeDevices._at) < 2000) return;
      refreshHomeDevices._at = Date.now();
      var onNet = false;
      try {
        homeCardConf().forEach(function (x) { if (x.k === 'net' && x.on) onNet = true; });
      } catch (e) {}
      if (!onNet) return;
    }
    try { if (force && API.invalidateSelfDevices) API.invalidateSelfDevices(); } catch (e) {}
    var tries = 0, attempts = 0;
    var tick = function () {
      var el = document.querySelector('#h-net .js-net-dev');
      
      if (!el) { if (tries++ < 120) setTimeout(tick, 500); return; }
      var go = function () {
        
        if (API.selfCaptchaCooling && API.selfCaptchaCooling()) {
          var eStop = document.querySelector('#h-net .js-net-dev');
          if (eStop) eStop.innerHTML =
            '<div class="long-press-tip" style="padding:6px 0 2px">' +
            '学校系统暂时要求验证码（约 10 分钟冷却）。' +
            '到「校园网信息」页点「打开学校登录页登录」登一次即可恢复。</div>';
          return;
        }
        
        var devWd = setTimeout(function () {
          var ew = document.querySelector('#h-net .js-net-dev');
          if (ew && /正在读取设备信息/.test(ew.textContent || '')) {
            var s = ew.querySelector('span');
            if (s) s.textContent = '（校外通道较慢，仍在读取，请稍候…）';
          }
        }, 20000);
        var devWd2 = setTimeout(function () {
          var ew = document.querySelector('#h-net .js-net-dev');
          if (ew && /正在读取设备信息/.test(ew.textContent || '')) {
            ew.innerHTML =
              '<div class="long-press-tip" style="padding:6px 0 2px">' +
              '这次没读到在线设备（校外通道较慢或自助服务系统不可用）。' +
              '可点上方「刷新」重试，回到校内会快很多。</div>';
          }
        }, 60000);
        API.selfDevices().then(function (res) {
          clearTimeout(devWd); clearTimeout(devWd2);
          var e = document.querySelector('#h-net .js-net-dev');
          if (!e) return;
          if (res && res.ok) {
            e.innerHTML = netDevicesHtml(res, 3);
            e.setAttribute('data-filled', '1');
            return;
          }
          
          if (attempts++ < 6) {
            e.innerHTML = '<div class="long-press-tip" style="padding:6px 0 2px">' +
              '正在登录自助服务并读取在线设备…（第 ' + attempts + ' 次）</div>';
            setTimeout(go, 6000);
          } else {
            e.innerHTML = '<div class="long-press-tip" style="padding:6px 0 2px">' +
              '在线设备暂时没读回来，可到「校园网信息」页重试</div>';
          }
        }).catch(function () {
          if (attempts++ < 6) setTimeout(go, 6000);
        });
      };
      go();
    };
    setTimeout(tick, 0);
  }
  
  function netMiniCard(n) {
    n = n || {};
    var on = n.online;
    return '<div class="card">' +
      '<div class="section-title">校园网信息 <span class="more" data-act="go:network">详情 ›</span></div>' +
      '<div class="net-status"><span class="net-dot js-net-dot' + (on ? '' : ' off') + '"></span>' +
        '<div><div style="font-size:15px;font-weight:700"><span class="js-net-state">' + esc(netStateLabel(n)) + '</span></div></div>' +
        '<button class="btn-ghost" style="width:auto;padding:5px 10px;font-size:12px;flex:0 0 auto" ' +
          'data-act="netrefresh">刷新</button>' +
      '</div>' +
      '<div class="kv"><span class="k">本机校园网 IP</span><span class="v mono js-campus-ip" style="font-weight:700">' +
        (n.campusIp ? esc(n.campusIp) : '—') + '</span></div>' +
      
      
      '<div class="section-title" style="margin:12px 0 0;font-size:13px">校园网在线设备</div>' +
      '<div class="js-net-dev">' +
        netDevicesHtml((API.selfDevicesCached && API.selfDevicesCached()) || null, 3) +
      '</div>' +
    '</div>';
  }
  
  
  function devRow(d) {
    var mins = Math.round((d.useTime || 0) / 60);
    var dur = mins >= 60 ? (Math.floor(mins / 60) + ' 小时 ' + (mins % 60) + ' 分') : (mins + ' 分钟');
    return '<div class="kv"><span class="k">' +
        (d.hostName ? esc(d.hostName) : '未知设备') +
        (d.terminalType ? ' · ' + esc(d.terminalType) : '') +
        '<br><span style="color:var(--muted);font-size:12px">' +
          esc(d.mac || '') + (d.loginTime ? ' · 上线 ' + esc(d.loginTime) : '') +
          ' · 已用 ' + esc(dur) + '</span></span>' +
      '<span class="v mono" style="font-size:14px">' + esc(d.ip || '—') + '</span></div>';
  }
  function netDevicesHtml(res, limit) {
    if (res === null || res === undefined) {
      
      var slow = (API.channel && API.channel() === 'webvpn')
        ? '<span style="opacity:.75">（校外通道较慢，首次约需 30 秒）</span>' : '';
      return '<div class="long-press-tip" style="padding:6px 0 2px">正在读取设备信息…' + slow + '</div>';
    }
    var devs = res.devices || [];
    if (!res.ok) {
      var head = '<div class="long-press-tip" style="padding:6px 0 2px">' +
        (res.needCaptcha
          ? '学校系统本次要求验证码：点「去登录」填一次即可（平时无需验证码）。'
          : '未登录学校「自助服务」，看不到设备 IP。') +
        '</div>';
      var body = devs.slice(0, limit || 9).map(devRow).join('');
      return head + body +
        '<button class="btn-ghost" style="width:auto;padding:7px 16px;margin-top:10px" data-act="go:network">去登录</button>';
    }
    if (!devs.length) {
      return '<div class="long-press-tip" style="padding:6px 0 2px">学校系统里当前没有在线设备。</div>';
    }
    return devs.slice(0, limit || 9).map(devRow).join('');
  }
  
  function patchNetCard(n) {
    if (!n) return;
    function set(sel, txt) {
      var el = document.querySelector('#h-net ' + sel);
      if (el) el.textContent = txt;
    }
    if (n.whenCampusIp) {
      n.whenCampusIp.then(function (ip) { set('.js-campus-ip', ip || '—'); }).catch(function () {});
    }
    if (n.whenOnline) {
      n.whenOnline.then(function (s) {
        
        if (s && typeof s === 'object') {
          n.online = !!s.online;
          n.netIn = !!s.netIn;
          if (s.ip) n.campusIp = s.ip;
        } else {
          n.online = !!s;
        }
        var d = document.querySelector('#h-net .js-net-dot');
        if (d) d.className = 'net-dot js-net-dot' + (n.online ? '' : ' off');
        set('.js-net-state', netStateLabel(n));
      }).catch(function () {});
    }
    
  }
  
  
  function selfLoginCard(prep) {
    prep = prep || {};
    var c = (API.getCreds && API.getCreds()) || {};
    return '<div class="card">' +
      '<div class="section-title">校园网设备 <span class="more">自助服务</span></div>' +
      '<div class="long-press-tip">读学校「用户自助服务系统」里已注册/在线设备的 IP。</div>' +
      (prep.msg ? '<div class="long-press-tip" style="color:#96241d;margin-top:8px">' +
        esc(prep.msg) + '</div>' : '') +
      '<button class="btn-primary" data-act="selfopen">打开学校登录页登录</button>' +
      '<button class="btn-ghost" style="width:100%;margin-top:10px" data-act="selfrefresh">重试自动登录</button>' +
      '<div class="long-press-tip" style="margin-top:10px;text-align:center">' +
        '正常情况账号 ' + esc(c.sid || '') + ' 会自动登录（平时不需要验证码）。</div>' +
    '</div>';
  }
  var selfLastDevices = [];   
  function selfDevicesCard(res) {
    var devs = res.devices || [];
    selfLastDevices = devs;
    
    var html = '<div class="card"><div class="section-title">校园网在线设备 ' +
      '<span class="more" data-act="selfrefresh">刷新</span></div>' +
      (devs.length ? devs.map(function (d, i) {
        
        var mins = Math.round((d.useTime || 0) / 60);
        var dur = mins >= 60 ? (Math.floor(mins / 60) + ' 小时 ' + (mins % 60) + ' 分') : (mins + ' 分钟');
        return '<div class="kv"><span class="k">' +
            (d.hostName ? esc(d.hostName) : '未知设备') +
            (d.terminalType ? ' · ' + esc(d.terminalType) : '') +
            '<br><span style="color:var(--muted);font-size:12px">' +
              esc(d.mac || '') + (d.loginTime ? ' · 上线 ' + esc(d.loginTime) : '') +
              ' · 已用 ' + esc(dur) + '</span></span>' +
          '<span class="v mono" style="font-size:14px">' + esc(d.ip || '—') +
            (d.sessionId ? '<button class="kickbtn" data-act="selfkick:' + i + '">下线</button>' : '') +
          '</span></div>';
      }).join('') : '<div class="long-press-tip" style="padding:6px 0 2px">学校系统里当前没有在线设备。</div>') +
      '</div>';
    
    return html;
  }
  
  var _logRange = null;
  function _fmtDay(d) {
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }
  function _logRangeDefault(days) {
    var to = new Date(), from = new Date(Date.now() - ((days || 7) - 1) * 86400000);
    return { from: _fmtDay(from), to: _fmtDay(to) };
  }
  function _logEntry(x) {
    var a = x.loginAt ? new Date(x.loginAt) : null, b = x.logoutAt ? new Date(x.logoutAt) : null;
    function hm(d) {
      return d ? (('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2) + ' ' +
        ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2)) : '';
    }
    var mins = Number(x.minutes) || 0;
    var dur = mins >= 60 ? (Math.floor(mins / 60) + '小时' + (mins % 60) + '分') : (mins + ' 分钟');
    var mb = Number(x.flow) || 0;   
    var flow = mb >= 1024 ? (mb / 1024).toFixed(2) + ' GB' : (mb.toFixed(1) + ' MB');
    return '<div class="kv"><span class="k">' + esc(hm(a) || '—') + ' → ' + esc(hm(b) || '在线') +
      '<br><span style="color:var(--muted);font-size:12px">时长 ' + esc(dur) + ' · 流量 ' + esc(flow) +
      '</span></span><span class="v mono" style="font-size:13px">' + esc(x.ip || '—') + '</span></div>';
  }
  function renderLogCard() {
    var box = $('#self-logcard');
    if (!box || !API.selfOnlineLog) return;
    if (!_logRange) _logRange = _logRangeDefault(7);
    var r = _logRange;
    
    var inp = 'style="flex:1;min-width:118px;padding:6px 8px;border:1px solid var(--line);border-radius:8px;font-size:13px;background:var(--card);color:var(--text)"';
    var qbtn = 'class="pill" style="padding:4px 10px;font-size:12.5px"';
    box.innerHTML = '<div class="card"><div class="section-title">上网记录 ' +
        '<span class="more" id="log-total"></span></div>' +
      
      '<div style="display:flex;gap:6px;align-items:center;margin:2px 0 8px;flex-wrap:wrap">' +
        '<input type="date" id="log-from" value="' + r.from + '" ' + inp + '>' +
        '<span style="color:var(--muted)">~</span>' +
        '<input type="date" id="log-to" value="' + r.to + '" ' + inp + '>' +
      '</div>' +
      
      '<div style="display:flex;gap:6px;align-items:center;margin-bottom:8px">' +
        '<button ' + qbtn + ' data-act="logquick:1">今天</button>' +
        '<button ' + qbtn + ' data-act="logquick:7">近 7 天</button>' +
        '<button ' + qbtn + ' data-act="logquick:30">近 30 天</button>' +
        '<button class="pill" style="margin-left:auto;padding:4px 14px;font-size:12.5px;font-weight:500" data-act="logquery">查询</button>' +
      '</div>' +
      '<div id="log-list"><div class="long-press-tip" style="padding:6px 0 2px">' +
        '选好日期后点「查询」加载（默认不会自动请求，避免影响上方设备加载）</div></div>' +
      '</div>';
  }
  function loadOnlineLog() {
    var el = $('#log-list');
    if (!el || !API.selfOnlineLog) return;
    if (!_logRange) _logRange = _logRangeDefault(7);
    el.innerHTML = '<div class="long-press-tip" style="padding:6px 0 2px">正在查询上网记录…</div>';
    API.selfOnlineLog(_logRange.from, _logRange.to, 20, 0).then(function (res) {
      var box = $('#log-list');
      if (!box) return;
      var rows = (res && res.rows) || [];
      var totalEl = $('#log-total');
      if (totalEl) totalEl.textContent = (res && res.total ? res.total : rows.length) + ' 条';
      
      var sid = savedSid();
      if (rows.length && rows[0].userName && sid && rows[0].userName !== sid) {
        box.innerHTML = failCard(new Error('返回的数据身份不符（' + rows[0].userName + ' ≠ ' + sid +
          '），已停止展示。'));
        return;
      }
      if (!rows.length) {
        box.innerHTML = '<div class="long-press-tip" style="padding:6px 0 2px">' +
          esc((res && res.raw) || '该日期范围内没有上网记录。') + '</div>';
        return;
      }
      box.innerHTML = rows.map(_logEntry).join('') +
        (res.total > rows.length ? '<div class="long-press-tip" style="margin-top:8px">共 ' +
          res.total + ' 条，已显示最近 ' + rows.length + ' 条</div>' : '');
    }).catch(function (e) {
      var box = $('#log-list');
      if (box) box.innerHTML = failCard(new Error('查询失败：' + ((e && e.message) || e)));
    });
  }
  var NEED_LOGIN_MSG = '学校系统本次要求验证码 —— 用官方登录页登一次即可（平时不需要验证码）。';
  
  function selfOpenLogin() {
    var base = API.selfBase ? API.selfBase() : 'https://www.cauc.edu.cn';
    var url = base + '/Self/login/?302=LI';
    var LW = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LoginWebView;
    if (!LW || !LW.open) { window.open(url, '_blank'); return; }
    var c = (API.getCreds && API.getCreds()) || {};
    
    var openIt = function () {
    
    var mc = (url.indexOf('webvpn') >= 0);
    if (API.syncMapCampus) { try { mc = API.syncMapCampus() || mc; } catch (e) {} }
    toast('已打开学校登录页（App 内置浏览器）');
    
    LW.open({
      url: url, fallbackUrl: url, title: '校园网自助服务',
      domains: [], browse: true, mapCampus: mc,
      user: c.sid || '', pwd: c.pwd || '', auto: false
    }).then(function (r) {
      
      try { if (r && r.ok && API.selfResetCaptcha) API.selfResetCaptcha(); } catch (e) {}
      
      var after = function () {
        try { if (S.route === 'network') selfRender(); } catch (e) {}
      };
      if (r && r.ok && API.selfSyncSession) {
        toast('已登录，正在同步会话…');
        API.selfSyncSession().then(function (n) {
          try {
            if (API.invalidateSelfDevices) API.invalidateSelfDevices();
            if (API.selfResetCaptcha) API.selfResetCaptcha();
          } catch (e) {}
          if (n) toast('会话已同步，正在刷新设备…');
          after();
        }, after);
      } else {
        after();
      }
    }).catch(function (e) { toast('打开失败：' + ((e && e.message) || e)); });
    };
    if (API.wvSessionEnsure) {
      API.wvSessionEnsure('https://https-www-cauc-edu-cn-443.webvpn.cauc.edu.cn/')
        .then(function (s) {
          if (s && s.ok === false && s.reason === 'no-cred') { toast('未保存账号密码，请先登录'); return; }
          if (s && s.via === 'silent-login') toast('会话已刷新，正在打开…');
          openIt();
        }).catch(function () { openIt(); });
    } else { openIt(); }
  }
  
  
  var _selfSig = '';
  
  function devSig(res) {
    var devs = (res && res.devices) || [];
    return 'dev:' + devs.map(function (d) {
      return [d.hostName || '', d.mac || '', d.ip || '', d.loginTime || ''].join('#');
    }).join('|');
  }
  function selfSetHtml(box, html, sig) {
    if (!box) return false;
    if (sig != null && sig === _selfSig) return false;   
    if (sig != null) _selfSig = sig;
    box.innerHTML = html;
    return true;
  }
  function selfRender(force) {
    var box = $('#self-box');
    if (!box) return;
    
    if (!force) {
      var now = Date.now();
      if (selfRender._at && (now - selfRender._at) < 1200) return;
      selfRender._at = now;
    }
    
    
    
    var snap = (API.selfDevicesCached && API.selfDevicesCached()) || null;
    if (snap) {
      var sig0 = 'snap:' + JSON.stringify(snap);
      selfSetHtml(box, selfDevicesCard(snap), sig0);
      API.selfDevicesForce().then(function (res) {
        var el = $('#self-box');
        if (el && res && res.ok) {
          
          selfSetHtml(el, selfDevicesCard(res), devSig(res));
        } else if (el && res && res.needCaptcha) {
          selfSetHtml(el, selfLoginCard(res), 'cap:' + JSON.stringify(res));
        }
      }).catch(function () {});
      return;   
    }
    selfSetHtml(box, '<div class="card">' +
      '<div class="section-title">校园网在线设备 <span class="more">自助服务</span></div>' +
      '<div class="long-press-tip" style="padding:6px 0 2px">正在读取在线设备…</div></div>');
    
    function fill(el, html) {
      if (!el) return;
      selfSetHtml(el, html, 'html:' + html.length + ':' + html.slice(0, 120));
    }
    function devices() {
      return API.selfOnline().then(function (d) {
        var res = { ok: true, devices: d };
        
        selfSetHtml($('#self-box'), selfDevicesCard(res), devSig(res));
      });
    }
    function form(p) { fill($('#self-box'), selfLoginCard(p || {})); }
    API.selfAlive(true).then(function (ok) {
      if (ok) return devices();
      
      return API.ensureWebvpn().catch(function () { return false; })
        .then(function () {
          
          if (API.selfCaptchaCooling && API.selfCaptchaCooling()) {
            return { needCaptcha: true, ok: false };
          }
          return API.selfPrepare();
        })
        .then(function (p) {
          if (p && p.loggedIn) return devices();
          
          if (p && p.ok === false && p.error) return form({ msg: p.error });
          var c = (API.getCreds && API.getCreds()) || {};
          if (!c.sid || !c.pwd) return form(p);
          
          return API.selfLogin(c.sid, c.pwd, '').then(function (r) {
            if (r && r.ok) return devices();
            if (r && r.code === 'captcha') return form({ msg: NEED_LOGIN_MSG });
            return form({ msg: (r && r.msg) || '' });
          });
        });
    }).catch(function (e) {
      
      form({ msg: String((e && e.message) || e) });
    });
  }
  
  function fmtExpire(s) {
    s = String(s || '');
    return s.length === 8 ? s.slice(0, 4) + '-' + s.slice(4, 6) + '-' + s.slice(6) : s;
  }
  
  function renderXzxBalance(box) {
    if (!box || !API.getEcardBalance) return;
    Promise.all([
      API.getEcardBalance(),
      API.getElecBalance ? API.getElecBalance() : Promise.resolve({ balance: 0 })
    ]).then(function (r) {
      var card = r[0] || {}, elec = r[1] || {};
      box.innerHTML =
        '<div class="card">' +
          '<div class="section-title">实时余额 <span class="more">新中新 · 自动登录</span></div>' +
          '<div class="meter">' +
            '<div class="m-box" style="background:linear-gradient(135deg,#2a72de,#0b3d91)">' +
              '<div class="mt">饭卡余额</div><div class="mv">￥' + num(card.balance) + '</div></div>' +
            '<div class="m-box" style="background:linear-gradient(135deg,#f7a52b,#e08600)">' +
              '<div class="mt">电费余额</div><div class="mv">￥' + num(elec.balance) + '</div></div>' +
          '</div>' +
          '<div class="cb-id" style="padding-top:2px">' +
            esc([card.name, card.cardType, card.status].filter(Boolean).join(' · ')) +
            (card.account ? ' · 卡号 ' + esc(card.account) : '') +
          '</div>' +
        '</div>';
    }).catch(function (e) {
      box.innerHTML = '<div class="card"><div class="section-title">实时余额</div>' +
        '<div class="long-press-tip">' + esc(String((e && e.message) || e)) + '</div></div>';
    });
  }
  function viewCard(c) {
    
    var flowBox = c;
    API.getCard().then(function (k) {
      var stats = k.stats;
      var html =
        '<div class="card-balance">' +
          '<div class="cb-label">校园卡</div>' +
          '<div class="cb-num">￥' + num(k.balance) + '</div>' +
          '<div class="cb-id">' + esc(k.cardNo) + ' · ' + esc(k.type) + ' · ' + esc(k.status) +
            (k.expire ? ' · 有效期至 ' + esc(fmtExpire(k.expire)) : '') +
            (k.balance == null ? '<br/>该余额来自校内一卡通系统，校外不可达' : '') + '</div>' +
        '</div>';
      if (stats) {
        html += '<div class="card" style="margin-top:14px"><div class="section-title">本月收支</div>' +
          '<div class="meter">' +
            '<div class="m-box" style="background:linear-gradient(135deg,#f2665c,#e0342c)"><div class="mt">支出</div><div class="mv">￥' + num(stats.expenses) + '</div></div>' +
            '<div class="m-box" style="background:linear-gradient(135deg,#22c06a,#12a150)"><div class="mt">收入</div><div class="mv">￥' + num(stats.income) + '</div></div>' +
          '</div></div>';
      }
      
      html += '<div class="card" style="margin-top:14px"><div class="section-title">卡片服务</div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px">' +
          '<button class="btn-ghost" style="width:auto;padding:9px 18px;margin-top:0;color:#c0392b" data-act="cardops">挂失 / 解挂</button>' +
          '<button class="btn-ghost" style="width:auto;padding:9px 18px;margin-top:0" data-act="cardfound">捡获卡招领</button>' +
        '</div>' +
        '<div class="long-press-tip" style="margin-top:8px">挂失 / 解挂都在学校官方页面完成（App 内免登直达，不会跳到系统浏览器）；成功与失败提示由学校页面给出。</div>' +
      '</div>';
      var tx = k.transactions || [];
      html += '<div class="card" style="margin-top:14px"><div class="section-title">近期交易 <span class="more">' + tx.length + ' 条</span></div>' +
        (tx.length
          ? tx.map(function (t) {
              return '<div class="tx"><div><div class="tx-t">' + esc(t.title) + '</div><div class="tx-d">' + esc(t.date) + '</div></div>' +
                '<div class="tx-a ' + (t.inflow ? 'in' : 'out') + '">' + (t.inflow ? '+' : '') + num(t.amount) + '</div></div>';
            }).join('')
          : empty('🧾', '暂无交易记录')) +
        '</div>';
      if (flowBox) flowBox.innerHTML = html;
    }).catch(function (e) {
      if (flowBox) {
        flowBox.innerHTML = '<div class="card"><div class="section-title">校园卡</div>' +
          '<div class="long-press-tip">' + esc(String((e && e.message) || e)) +
          '<br/>流水来自校内一卡通系统，校外不可达。</div></div>';
      }
    });
  }
  
  
  function roomBuildList(r) {
    if (!r.ninghe) return API.ROOM_BUILDS;
    var nh = (API.roomBuildsNinghe && API.roomBuildsNinghe()) || [];
    return [{ v: '', t: '全部楼号' }].concat(nh.map(function (n) { return { v: n, t: n }; }));
  }
  function lhVal(r) { return r.ninghe ? (r.lhnh || '') : (r.lh || ''); }
  function viewRooms(c) {
    var r = S.rooms;
    
    if (!r._restored) {
      r._restored = true;
      try {
        var saved = JSON.parse(localStorage.getItem('cauc_rooms_v2') || 'null');
        if (saved) {
          r.ninghe = !!saved.ninghe; r.weeks = saved.weeks || []; r.days = saved.days || [];
          r.sections = saved.sections || []; r.lh = saved.lh || ''; r.lhnh = saved.lhnh || '';
          r.cdlb = saved.cdlb || '';
          r.cdmc = saved.cdmc || ''; r.qszws = saved.qszws || ''; r.jszws = saved.jszws || '';
        }
      } catch (e) {}
    }
    var WEEKS = 20;   
    
    
    function multiRow(key, items, label, cols) {
      var sel = r[key] || [];
      var cls = cols ? 'pill-row pill-grid' : 'pill-row';
      var sty = cols ? ' style="grid-template-columns:repeat(' + cols + ',1fr)"' : '';
      return '<div class="card"><div class="section-title">' + label +
        '<span class="more"><button class="pill" style="padding:2px 10px;font-size:11px" data-act="roomall:' + key + ':1">全选</button>' +
        '<button class="pill" style="padding:2px 10px;font-size:11px;margin-left:6px" data-act="roomall:' + key + ':0">清空</button></span></div>' +
        '<div class="' + cls + '"' + sty + '>' + items.map(function (x) {
          var v = x.v, on = sel.indexOf(v) >= 0;
          return '<button class="pill' + (on ? ' on' : '') + '" data-act="roompick:' + key + ':' + v + '">' + x.t + '</button>';
        }).join('') + '</div></div>';
    }
    var weekItems = []; for (var wi = 1; wi <= WEEKS; wi++) {
      weekItems.push({ v: wi, t: wi === API.currentWeek() ? '本周' : ('' + wi) });
    }
    var dayItems = [1, 2, 3, 4, 5, 6, 7].map(function (d) { return { v: d, t: weekdayName(d).replace('星期', '') }; });
    
    var jcItems = []; for (var ji = 1; ji <= 12; ji++) { jcItems.push({ v: ji, t: '第' + ji + '节' }); }
    
    var resHtml;
    if (r.loading) resHtml = loading('正在查询空教室…');
    else if (r.err) resHtml = failCard(new Error(r.err));
    else if (r.result) {
      var rooms = r.result.rooms || [];
      resHtml = '<div class="card"><div class="section-title">空闲教室 <span class="more">' +
        rooms.length + (r.result.total > rooms.length ? ' / ' + r.result.total : '') + ' 间</span></div>' +
        (rooms.length
          ? '<div class="room-grid">' + rooms.map(function (x) {
              var nm = x.name || x.room || '';
              return '<div class="room"><div class="r-n">' + esc(nm) + '</div>' +
                '<div class="r-s">' + (x.seats ? x.seats + ' 座' : '') +
                (x.floor ? ' · ' + x.floor + ' 层' : '') + '</div></div>';
            }).join('') + '</div>' +
            '<div class="long-press-tip" style="margin-top:12px">按' +
              (r.weeks.length === 1 ? '第' + r.weeks[0] + '周' : r.weeks.length + '个周次') + ' · ' +
              r.days.map(function (d) { return weekdayName(d).replace('星期', '周'); }).join('/') + ' · ' +
              (r.sections.length === 1 ? '第' + r.sections[0] + '节' : r.sections.length + '个节次') +
              (API.isMock() ? ' · 演示数据' : ' · 实时') + '</div></div>'
          : '<div class="long-press-tip" style="padding:6px 0 2px">该时段没有空闲教室，换个时段试试。</div></div>');
    } else {
      resHtml = '<div class="card"><div class="long-press-tip" style="padding:6px 0 2px">' +
        '选好 <b>周次、星期、节次</b>（必选，可多选）后点「查询」。<br/>' +
        '楼号 / 类别 / 名称 / 座位数都不选 = 不筛选。</div></div>';
    }
    c.innerHTML =
      '<div class="card"><div class="section-title">校区</div><div class="pill-row">' +
        '<button class="pill' + (!r.ninghe ? ' on' : '') + '" data-act="roomcampus:0">东丽校区</button>' +
        '<button class="pill' + (r.ninghe ? ' on' : '') + '" data-act="roomcampus:1">宁河校区</button>' +
      '</div></div>' +
      multiRow('weeks', weekItems, '周次', 5) +
      multiRow('days', dayItems, '星期', 4) +
      multiRow('sections', jcItems, '节次', 4) +
      '<div class="card"><div class="section-title">筛选（可不选）</div>' +
        '<div class="pill-row" style="margin-bottom:8px">' +
          '<select id="room-lh" class="txt-in" style="flex:1;min-width:0;width:100%">' +
            roomBuildList(r).map(function (b) { return '<option value="' + esc(b.v) + '"' + (lhVal(r) === b.v ? ' selected' : '') + '>' + esc(b.t) + '</option>'; }).join('') +
          '</select>' +
          '<select id="room-cdlb" class="txt-in" style="flex:1;min-width:0;width:100%">' +
            API.ROOM_TYPES.map(function (b) { return '<option value="' + b.v + '"' + (r.cdlb === b.v ? ' selected' : '') + '>' + esc(b.t) + '</option>'; }).join('') +
          '</select></div>' +
        '<input id="room-cdmc" class="txt-in" type="text" placeholder="按场地名称/编号搜索（可不填）" value="' + esc(r.cdmc) + '" style="width:100%;margin-bottom:8px"/>' +
        '<div style="display:flex;gap:8px;align-items:center">' +
          '<input id="room-qszws" class="txt-in" type="number" inputmode="numeric" placeholder="座位数≥" value="' + esc(r.qszws) + '" style="flex:1;min-width:0;width:100%"/>' +
          '<span style="color:var(--muted);flex:0 0 auto">~</span>' +
          '<input id="room-jszws" class="txt-in" type="number" inputmode="numeric" placeholder="座位数≤" value="' + esc(r.jszws) + '" style="flex:1;min-width:0;width:100%"/>' +
        '</div></div>' +
      '<button class="btn-primary" data-act="roomquery">查 询 空 教 室</button>' +
      '<div id="rooms-result" style="margin-top:14px">' + resHtml + '</div>';
  }
  
  function roomsReadInputs() {
    var r = S.rooms;
    var g = function (id) { var el = $('#' + id); return el ? el.value : ''; };
    
    if (r.ninghe) r.lhnh = g('room-lh'); else r.lh = g('room-lh');
    r.cdlb = g('room-cdlb');
    r.cdmc = g('room-cdmc'); r.qszws = g('room-qszws'); r.jszws = g('room-jszws');
  }
  
  function roomsQuery() {
    var r = S.rooms;
    roomsReadInputs();
    if (!r.weeks.length || !r.days.length || !r.sections.length) {
      toast('周次、星期、节次至少各选一个'); return;
    }
    try { localStorage.setItem('cauc_rooms_v2', JSON.stringify({
      ninghe: r.ninghe, weeks: r.weeks, days: r.days, sections: r.sections,
      lh: r.lh, lhnh: r.lhnh, cdlb: r.cdlb, cdmc: r.cdmc, qszws: r.qszws, jszws: r.jszws
    })); } catch (e) {}
    r.loading = true; r.err = ''; r.result = null;
    var el = $('#rooms-result');
    if (el) el.innerHTML = loading('正在查询空教室…');
    API.getEmptyRooms({ ninghe: r.ninghe, weeks: r.weeks, days: r.days, sections: r.sections,
                        lh: r.ninghe ? '' : r.lh, bldg: r.ninghe ? r.lhnh : '',
                        cdlb: r.cdlb, cdmc: r.cdmc, qszws: r.qszws, jszws: r.jszws })
      .then(function (res) {
        r.loading = false; r.result = res;
        var el2 = $('#rooms-result');
        if (!el2 || S.route !== 'rooms') return;
        
        if (r.ninghe) {
          var sel = $('#room-lh');
          if (sel) {
            var cur = sel.value;
            sel.innerHTML = roomBuildList(r).map(function (b) {
              return '<option value="' + esc(b.v) + '"' + (cur === b.v ? ' selected' : '') + '>' + esc(b.t) + '</option>';
            }).join('');
          }
        }
        var rooms = res.rooms || [];
        el2.innerHTML = '<div class="card"><div class="section-title">空闲教室 <span class="more">' +
          rooms.length + (res.total > rooms.length ? ' / ' + res.total : '') + ' 间</span></div>' +
          (rooms.length
            ? '<div class="room-grid">' + rooms.map(function (x) {
                var nm = x.name || x.room || '';
                return '<div class="room"><div class="r-n">' + esc(nm) + '</div>' +
                  '<div class="r-s">' + (x.seats ? x.seats + ' 座' : '') +
                  (x.floor ? ' · ' + x.floor + ' 层' : '') +
                  (x.type ? ' · ' + esc(x.type) : '') + '</div></div>';
              }).join('') + '</div>' +
              '<div class="long-press-tip" style="margin-top:12px">共 ' + res.total + ' 间空闲' +
              (API.isMock() ? '（演示数据）' : '') + '</div></div>'
            : '<div class="long-press-tip" style="padding:6px 0 2px">该时段没有空闲教室，换个时段试试。</div></div>');
      })
      .catch(function (e) {
        r.loading = false; r.err = (e && e.message) || String(e);
        var el2 = $('#rooms-result'); if (el2) el2.innerHTML = failCard(e);
      });
  }
  
  function viewCalendar(c) {
    API.getCalendar().then(function (list) {
      if (S.route !== 'calendar') return;   
      c.innerHTML = '<div class="card"><div class="section-title">' + esc(API.CONFIG.SEMESTER) + ' 校历</div>' +
        '<div class="timeline">' + list.map(function (x) {
          return '<div class="tl-item' + (x.done ? ' done' : '') + '"><div class="tl-d">' + esc(x.date) + '</div>' +
            '<div class="tl-t">' + esc(x.title) + '</div><div class="tl-s">' + esc(x.sub) + '</div></div>';
        }).join('') + '</div></div>';
    }).catch(function (e) {
      if (S.route !== 'calendar') return;
      c.innerHTML = failCard(e);
    });
  }
  
  function viewGpa(c) {
    API.getGPA().then(function (g) {
      if (S.route !== 'gpa') return;   
      var pct = Math.min(100, g.credits / g.required * 100);
      c.innerHTML =
        '<div class="hero" style="text-align:center"><div class="h-meta">平均学分绩点 GPA</div>' +
          '<div style="font-size:46px;font-weight:800;margin:6px 0 4px">' + num(g.total) + '</div>' +
          '<div class="h-meta">修读情况 ' + esc(g.rank) + '</div></div>' +
        '<div class="card"><div class="section-title">学分进度</div>' +
          '<div class="bar-track"><div class="bar-fill" style="width:' + pct + '%"></div></div>' +
          '<div class="kv" style="border:none"><span class="k">已修学分</span><span class="v">' + g.credits + ' / ' + g.required + '</span></div>' +
          '<div class="long-press-tip">毕业学分要求 ' + g.required + ' 学分，完成度 ' + num(pct, 1) + '%</div>' +
        '</div>';
    }).catch(function (e) {
      if (S.route !== 'gpa') return;
      c.innerHTML = failCard(e);
    });
  }
  
  function viewNet(c) {
    c.innerHTML = loading('正在检测校园网…');
    Promise.all([
      API.netStatus().catch(function () { return { online: false, status: 0 }; })
    ]).then(function (r) {
      if (S.route !== 'net') return;   
      var st = r[0];
      var sid = savedSid();
      var hasPwd = API.hasSessionPwd && API.hasSessionPwd();
      
      var heroTxt = st.online ? '已在线'
        : (st.netIn ? '校园网内 · 未认证' : '未认证');
      var heroSub = st.online ? '外网可达'
        : (st.netIn ? '内网可达；认证后才能上外网' : '外网被门户拦截 / 不在校园网');
      var h =
        '<div class="hero" style="text-align:center">' +
          '<div class="h-meta">校园网认证状态</div>' +
          '<div style="font-size:30px;font-weight:800;margin:6px 0 2px">' + heroTxt + '</div>' +
          '<div class="h-meta">' + (esc(sid) || '未登录') + ' · ' + heroSub + '</div>' +
        '</div>' +
        '<div class="card">' +
          '<button class="btn-primary" data-act="netlogin">' + (st.online ? '重新认证' : '一键登录校园网') + '</button>' +
          '<button class="btn-ghost" data-act="netlogout" style="margin-top:8px">注销校园网</button>' +
          (hasPwd ? '' : '<div class="long-press-tip">本次会话未保存密码。请先退出并重新用「学号 + 统一身份认证密码」登录一次，之后即可一键认证。</div>') +
        '</div>' +
        '<div class="card"><div class="section-title">网络连通性测试 <span class="more" data-act="nettest">重新测试</span></div>' +
          '<div id="net-test-result" class="long-press-tip">点击右上角「重新测试」开始</div>' +
        '</div>' +
        '<div class="card"><div class="section-title">说明</div>' +
          '<div class="long-press-tip">校园网使用 Dr.COM 门户认证（eportal），账号为学号、密码与统一身份认证一致。' +
          '登录后 IPv6 免流量通道（test6.ustc.edu.cn 等）通常随之可用。</div>' +
        '</div>';
      c.innerHTML = h;
    }).catch(function (e) {
      if (S.route !== 'net') return;
      c.innerHTML = failCard(e);
    });
  }
  function runNetTest() {
    var box = $('#net-test-result'); if (!box) return;
    box.innerHTML = '测试中…';
    API.netTest().then(function (list) {
      box.innerHTML = list.map(function (t) {
        return '<div class="kv"><span class="k">' + esc(t.name) + (t.v6 ? ' · IPv6' : ' · IPv4') + '</span>' +
          '<span class="v" style="color:' + (t.ok ? 'var(--ok,#22a06b)' : 'var(--danger,#e0342c)') + '">' +
          (t.ok ? '可达 ' + t.ms + 'ms' : '不可达') + '</span></div>';
      }).join('');
    }).catch(function (e) { box.textContent = '测试失败：' + (e.message || e); });
  }
  
  
  
  function doWebvpnLogin() {
    var LW = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LoginWebView;
    if (!LW || !LW.open) { toast('当前环境不支持'); return; }
    if (!(API.hasCreds && API.hasCreds())) { toast('请先登录以保存账密'); return; }
    localStorage.removeItem('cauc_wv_ask_at');
    localStorage.removeItem('cauc_wv_ok_at');
    localStorage.removeItem('cauc_wv_off');
    var c = API.getCreds();
    toast('正在打开 WebVPN（自动填充并提交）…');
    LW.open({
      url: 'https://webvpn.cauc.edu.cn/',
      title: 'WebVPN 自动登录',
      domains: ['webvpn.cauc.edu.cn'],
      user: c.sid,
      pwd: c.pwd,
      auto: true
    }).then(function (r) {
      if (r && r.ok) {
        localStorage.setItem('cauc_wv_ok_at', String(Date.now()));
        localStorage.removeItem('cauc_wv_off');
        localStorage.removeItem('cauc_wv_fail_at');
        toast('✅ WebVPN 已登录');
        renderContent();
      } else {
        toast('未检测到登录成功（可返回重试或手动点登录）');
      }
    }).catch(function (e) { toast('打开失败：' + ((e && e.message) || e)); });
  }
  function doTestJwgl() {
    
    toast('正在重登 WebVPN…');
    API.reloginWebvpn().then(function (r) {
      if (r && r.ok) {
        toast(r.verified ? '✅ WebVPN 已重登'
                         : ('⚠️ ' + (r.reason || '登录已发起，稍后自动确认')));
        
        API.probeAndApply(true).catch(function () {});
      } else {
        toast('❌ 重登失败：' + ((r && r.reason) || '未知原因'));
      }
      if (S.route === 'home') {
        var el = document.getElementById('h-status');
        if (el) el.innerHTML = homeStatusBar();
      }
    }).catch(function (e) {
      toast('❌ 重登异常：' + ((e && e.message) || e));
    });
  }
  function doNetLogin() {
    var sid = savedSid();
    if (!sid) { toast('请先登录'); return; }
    if (!API.hasSessionPwd || !API.hasSessionPwd()) {
      toast('本机没有可用密码，请重新登录一次');
      return;
    }
    toast('正在认证…');
    API.netLogin().then(function (r) {
      toast(r.msg || '认证成功');
      renderContent();
    }).catch(function (e) { toast('认证失败：' + (e.message || e)); });
  }
  function doNetLogout() {
    API.netLogout().then(function (r) {
      toast(r.msg || (r.ok ? '已注销' : '注销返回异常'));
      renderContent();
    }).catch(function (e) { toast('注销失败：' + (e.message || e)); });
  }
  
  
  var JWGL_HOSTS = {
    campus: 'http://jwgl.cauc.edu.cn',
    webvpn: 'https://http-jwgl-cauc-edu-cn-80.webvpn.cauc.edu.cn'
  };
  
  var JWGL_PAGES = [
    { t: '学业情况（GPA·修读进度·成绩）', u: 'xsxy/xsxyqk_cxXsxyqkIndex.html?echarts=1&gnmkdm=N105515&layout=default', d: '一站式：平均绩点 / 学分要求与获得 / 全部课程成绩' },
    { t: '教务门户（全部功能）', u: 'xtgl/index_initMenu.html', d: '成绩 / 课表 / 考试 / 选课 / 学籍 / 教材等全部功能' }
  ];
  function openJwgl(pageUrl) {
    var sid = savedSid();
    if (!sid) { toast('请先在"我的"中登录'); return; }
    
    var host = (API.webvpnBlocked && API.webvpnBlocked())
      ? JWGL_HOSTS.campus
      : (API.jwglBase ? API.jwglBase() : JWGL_HOSTS.campus);
    var q = 'mhsso/ltappiotlogin?loginName=' + encodeURIComponent(sid) +
            '&url=' + encodeURIComponent(pageUrl);
    var url = (API.jwglEntryUrl && !API.webvpnBlocked())
      ? API.jwglEntryUrl(pageUrl)
      : host + '/' + q;
    var fallbackUrl = JWGL_HOSTS.campus + '/' + q;
    var LW = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LoginWebView;
    function doOpen() {
      if (!LW || !LW.open) { window.open(url, '_blank'); return; }
      LW.open({
        url: url,
        fallbackUrl: fallbackUrl,
        title: '教务系统',
        domains: [],
        browse: true,
        
        mapCampus: (url.indexOf('webvpn.cauc.edu.cn') >= 0)
      }).then(function (r) {
        
        if (r && r.webvpnLoginBounce) {
          if (API.wvSessionInvalidate) API.wvSessionInvalidate('jwgl-bounce');
          var now = Date.now();
          if (now - (openJwgl._lastBounce || 0) > 30000) {
            openJwgl._lastBounce = now;
            
            toast('会话已失效（可能被其他设备登录顶掉），正在重新登录…');
            var refreshP = (API.jwglRefreshSession
              ? API.jwglRefreshSession().catch(function () { return null; })
              : Promise.resolve(null));
            refreshP.then(function () {
              if (host.indexOf('webvpn') < 0) {
                toast('免登链接已刷新，正在重新打开…');
                setTimeout(doOpen, 500);
                return null;
              }
              return API.wvSessionEnsure(host, true);
            }).then(function (rr) {
              if (rr === null || rr === undefined) return;
              if (rr && rr.ok) {
                toast('已重新登录，正在打开…');
                setTimeout(doOpen, 600);
              } else {
                var why = String((rr && rr.reason) || '');
                toast(/not-allowed/i.test(why)
                  ? '登录被学校网关拒绝（可能账号已在其他设备登录），请到「我的」重新登录一次'
                  : '自动登录未成功，请到「我的」重新登录一次');
              }
            }).catch(function () { toast('恢复失败，请到「我的」重新登录一次'); });
          } else {
            toast('刚尝试过自动登录，请稍候或到「我的」手动登录');
          }
          return;
        }
        
        if (r && r.webvpnRejected && API.markWebvpnBlocked) {
          API.markWebvpnBlocked();
          if (API.probeAndApply) API.probeAndApply(true);
        }
        if (S.route === 'jwgl') renderContent();
      }).catch(function (e) {
        toast('打开失败：' + ((e && e.message) || e));
      });
    }
    
    if (API.wvSessionEnsure) {
      API.wvSessionEnsure(host).then(function (s) {
        if (s && s.ok === false && s.reason === 'no-cred') {
          toast('未保存账号密码，请到「我的」登录一次');
        } else if (s && s.ok === false && API.wvSessionInvalidate) {
          API.wvSessionInvalidate('ensure-failed:' + s.reason);
        }
      }).catch(function () {});
    }
    doOpen();
  }
  function viewJwgl(c) {
    var sid = savedSid();
    var h = '<div class="card"><div class="section-title">免登说明</div>' +
      '<div class="long-press-tip">利用教务与校园 App 的集成通道，点击下方任一入口即可' +
      '<b>免密码、免验证码</b>直接进入登录态页面（在 App 内置页面中打开）。会话有效期约 20-30 分钟，过期后重新点击即可。</div>' +
      '<div class="kv"><span class="k">学号</span><span class="v">' + esc(sid || '未登录') + '</span></div>' +
      '<div class="kv"><span class="k">实际通道</span>' +
        '<span class="v">' + esc(API.channelLabel()) + ' · ' + esc(API.probeLabel()) + '</span></div>' +
      '<div class="kv" style="border:none"><span class="k">地址</span>' +
        '<span class="v" style="font-size:11.5px;word-break:break-all">' + esc(API.jwglBase ? API.jwglBase() : '') + '</span></div>' +
      '<div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">' +
        ((API.webvpnOff && API.webvpnOff())
          ? '<button class="btn-ghost" style="width:auto;padding:8px 16px" data-act="wvconnect">连接 WebVPN（默认通道）</button>'
          : '<button class="btn-ghost" style="width:auto;padding:8px 16px" data-act="wvdisconnect">断开 WebVPN（复原校内地址）</button>') +
        '<button class="btn-ghost" style="width:auto;padding:8px 16px" data-act="wvrelogin">手动登录 WebVPN</button>' +
      '</div>' +
      '</div>';
    h += '<div class="card"><div class="section-title">功能入口</div>';
    JWGL_PAGES.forEach(function (p) {
      h += '<div class="list-item" data-act="jwglopen" data-url="' + esc(p.u) + '">' +
        '<div class="li-main"><div class="li-t">' + esc(p.t) + '</div>' +
        '<div class="li-s">' + esc(p.d) + '</div></div>' +
        '<span class="chev">' + I.chevron + '</span></div>';
    });
    h += '</div>';
    c.innerHTML = h;
  }
  document.addEventListener('click', function (ev) {
    var el = ev.target.closest('[data-act]');
    if (!el) return;
    var act = el.getAttribute('data-act');
    var parts = act.split(':');
    switch (parts[0]) {
      case 'tab': go(parts[1]); break;
      case 'go': go(parts[1]); break;
      case 'jwglmode': {
        var cur = localStorage.getItem('cauc_jwgl_mode') || 'campus';
        localStorage.setItem('cauc_jwgl_mode', cur === 'campus' ? 'webvpn' : 'campus');
        renderContent();
        break;
      }
      case 'jwglopen': openJwgl(el.getAttribute('data-url')); break;
      
      case 'cardops': {
        
        toast('正在打开卡片操作页…');
        API.cardOpsUrl().then(function (u) {
          var LWc = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LoginWebView;
          if (LWc && LWc.open) return LWc.open({ url: u, title: '挂失 / 解挂', browse: true });
          window.open(u, '_blank');
        }).catch(function (e) { toast('❌ 打开失败：' + ((e && e.message) || e)); });
        break;
      }
      case 'cardlost': {
        
        if (!confirm('确认挂失校园卡？挂失后卡片将暂停消费（可解挂恢复）。')) break;
        toast('正在挂失…');
        API.cardLost().then(function (r) {
          toast('✅ ' + (r && r.msg || '挂失成功'));
        }).catch(function (e) { toast('❌ ' + ((e && e.message) || e)); });
        break;
      }
      case 'cardunlost': {
        
        openSheet(
          '<div class="section-title">解挂校园卡</div>' +
          '<div class="long-press-tip" style="margin:2px 0 12px">请输入一卡通查询密码（不是学校统一身份认证密码，通常是 6 位）。仅本次使用、不保存。</div>' +
          '<input id="unlost-pwd" class="txt-in" type="password" autocomplete="off" ' +
            'placeholder="一卡通查询密码" style="width:100%;margin-bottom:12px"/>' +
          '<button class="btn-primary" data-act="cardunlost-do">确认解挂</button>' +
          '<button class="btn-ghost" style="width:100%;margin-top:8px" data-act="closesheet">取消</button>'
        );
        break;
      }
      case 'cardunlost-do': {
        var pwEl = $('#unlost-pwd');
        var pw = (pwEl && pwEl.value) || '';
        if (!pw) { toast('请输入一卡通查询密码'); break; }
        closeSheet();
        toast('正在解挂…');
        API.cardUnlost(pw).then(function (r) {
          toast('✅ ' + ((r && r.msg) || '解挂成功'));
        }).catch(function (e) { toast('❌ ' + ((e && e.message) || e)); });
        break;
      }
      case 'cardfound': {
        
        toast('正在获取捡获卡入口…');
        API.cardFoundUrl().then(function (u) {
          var LWf = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LoginWebView;
          if (LWf && LWf.open) {
            return LWf.open({ url: u, title: '捡获卡招领', browse: true });
          }
          window.open(u, '_blank');
        }).catch(function (e) { toast('❌ ' + ((e && e.message) || e)); });
        break;
      }
      case 'kbpdf': {
        toast('正在生成课表 PDF…');
        API.getKbPdfInfo().then(function (info) {
          var LWd = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LoginWebView;
          if (!LWd || !LWd.downloadToDownloads) { toast('当前环境不支持下载'); return; }
          return LWd.downloadToDownloads({ url: info.url, fields: info.fields, filename: info.filename })
            .then(function (r) { toast('✅ 已保存到 ' + r.path); })
            .catch(function (e) { toast('下载失败：' + ((e && e.message) || e)); });
        }).catch(function (e) { toast('生成失败：' + ((e && e.message) || e)); });
        break;
      }
      case 'togglemode': {
        var toMock = !API.isMock();
        API.setMode(toMock ? 'mock' : 'real');
        localStorage.setItem('cauc_mode', toMock ? 'mock' : 'real');
        if (toMock) { localStorage.setItem('cauc_token', 'demo-token'); toast('已切到演示数据'); renderContent(); }
        else {
          if (localStorage.getItem('cauc_token') === 'demo-token') localStorage.removeItem('cauc_token');
          var cc = API.getCreds && API.getCreds();
          toast('已切回真实系统');
          if (cc && cc.sid && cc.pwd) {
            API.login(cc.sid, cc.pwd).then(function (res) {
              localStorage.setItem('cauc_token', res.token); enterApp();
            }).catch(function () { renderLogin(); });
          } else { renderLogin(); }
        }
        break;
      }
      case 'wvlogin': {
        toast('正在打开 WebVPN 登录页…');
        API.ensureWebvpn().then(function (ok) {
          toast(ok ? 'WebVPN 已登录' : '未完成登录');
          renderContent();
        }).catch(function (e) { toast('打开失败：' + (e.message || e)); });
        break;
      }
      case 'clearcreds': {
        if (window.confirm('清除本机保存的账号密码？清除后需要重新输入一次。')) {
          API.clearCreds();
          toast('已清除');
          renderContent();
        }
        break;
      }
      case 'netlogin': doNetLogin(); break;
      case 'netlogout': doNetLogout(); break;
      case 'nettest': runNetTest(); break;
      case 'testjwgl': doTestJwgl(); break;
      
      case 'selfopen': selfOpenLogin(); break;
      case 'selfrefresh':
        
        try { if (API.selfResetCaptcha) API.selfResetCaptcha(); } catch (e) {}
        API.selfDevicesForce().then(function (res) {
          var el = $('#self-box');
          if (el && res) el.innerHTML = selfDevicesCard(res);
        }).catch(function () { selfRender(); });
        break;
      
      case 'logquery': {
        var f = (($('#log-from') || {}).value || '').trim();
        var tt = (($('#log-to') || {}).value || '').trim();
        if (!f || !tt) { toast('请选择起止日期'); break; }
        if (f > tt) { toast('开始日期不能晚于结束日期'); break; }
        _logRange = { from: f, to: tt };
        loadOnlineLog();
        break;
      }
      case 'logquick': {
        var days = parseInt(parts[1], 10) || 7;
        _logRange = _logRangeDefault(days);
        var a1 = $('#log-from'), a2 = $('#log-to');
        if (a1) a1.value = _logRange.from;
        if (a2) a2.value = _logRange.to;
        loadOnlineLog();
        break;
      }
      case 'selfkick': {
        
        var ki = parseInt(parts[1], 10);
        var dv = selfLastDevices[ki] || (API.selfDevicesCached() || { devices: [] }).devices[ki];
        if (!dv || !dv.sessionId) { toast('该设备无会话信息，无法下线'); break; }
        if (!confirm('确认将 ' + (dv.hostName || dv.ip || '该设备') + ' 强制下线？')) break;
        toast('正在下线…');
        API.selfKick(dv.sessionId).then(function () {
          toast('已下线');
          var el = $('#self-box');
          if (el) el.innerHTML = loading('正在刷新设备列表…');
          return API.selfDevicesForce();
        }).then(function (res) {
          var el = $('#self-box');
          if (el && res) el.innerHTML = selfDevicesCard(res);
        }).catch(function (e) { toast((e && e.message) || '下线失败'); });
        break;
      }
      case 'selflogout': {
        
        API.selfLogout().then(function () { toast('已退出自助服务'); selfRender(); });
        break;
      }
      case 'netrefresh': {
        
        try { if (API.invalidateSelfDevices) API.invalidateSelfDevices(); } catch (e) {}
        
        var netBox = $('#h-net');
        if (netBox) {
          netBox.innerHTML = loading('正在刷新网络信息…');
          API.getNetOverview(true).then(function (n) {
            netBox.innerHTML = netMiniCard(n);
            patchNetCard(n);
            
            refreshHomeDevices(true);
          }).catch(function () { netBox.innerHTML = ''; });
          toast('正在刷新网络信息…');
        } else {
          toast('正在刷新网络信息…');
          renderNetPage(true);
        }
        break;
      }
      case 'openwebvpn': {
        
        toast('正在打开 WebVPN 门户…');
        var openPortal = function () {
          var LWv = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LoginWebView;
          var portalUrl = 'https://webvpn.cauc.edu.cn/site-nav/';
          if (LWv && LWv.open) {
            LWv.open({ url: portalUrl, fallbackUrl: 'https://webvpn.cauc.edu.cn/',
                       title: 'WebVPN 门户', domains: [], browse: true })
              .then(function () { if (S.route === 'mine') renderContent(); })
              .catch(function (e) { toast('打开失败：' + ((e && e.message) || e)); });
          } else {
            window.open(portalUrl, '_blank');
          }
        };
        (API.wvHttpLogin ? API.wvHttpLogin().catch(function () { return null; })
                         : Promise.resolve(null))
          .then(function () { setTimeout(openPortal, 200); });
        break;
      }
      case 'webvpnlogin': {
        if (API.webvpnOff && API.webvpnOff()) {
          toast('正在连接 WebVPN（后台静默登录）…');
          API.connectWebvpn().then(function (ch) {
            toast(ch === 'webvpn' ? '✅ 已连接 WebVPN' : 'WebVPN 不可用（校内会拒绝登录），已回退校内直连');
            renderContent();
          }).catch(function (e) { toast('连接失败：' + ((e && e.message) || e)); });
        } else {
          toast('WebVPN 为默认通道 · ' + API.channelLabel());
          renderContent();
        }
        break;
      }
      case 'wvconnect': {
        toast('正在连接 WebVPN（后台静默登录）…');
        API.connectWebvpn().then(function (ch) {
          toast(ch === 'webvpn' ? '✅ 已连接 WebVPN' : 'WebVPN 不可用（校内网会拒绝登录），已回退校内直连');
          renderContent();
        }).catch(function (e) { toast('连接失败：' + ((e && e.message) || e)); });
        break;
      }
      case 'wvrelogin': doWebvpnLogin(); break;
      case 'wvdisconnect': {
        toast('正在断开 WebVPN…');
        API.disconnectWebvpn().then(function () {
          toast('已断开 · 当前通道：' + API.channelLabel());
          if (S.route === 'jwgl' || S.route === 'home' || S.route === 'mine') renderContent();
        }).catch(function (e) { toast('断开失败：' + ((e && e.message) || e)); });
        break;
      }
      
      case 'back': handleBack(); break;
      case 'schedview': S.schedView = parts[1]; renderContent(); break;
      case 'week': S.week += parseInt(parts[1], 10); renderContent(); break;
      case 'course': showCourse(act.split(':').slice(1).join(':')); break;
      
      case 'roomcampus':
        S.rooms.ninghe = parts[1] === '1';
        renderContent(); break;
      case 'roompick': {
        
        var rk = parts[1], rv = (rk === 'lh' || rk === 'cdlb') ? parts[2] : parseInt(parts[2], 10);
        var arr = S.rooms[rk] || [], ix = arr.indexOf(rv);
        if (ix >= 0) arr.splice(ix, 1); else arr.push(rv);
        S.rooms[rk] = arr;
        renderContent(); break;
      }
      case 'roomall': {
        
        var ak = parts[1], on = parts[2] === '1', n = ak === 'weeks' ? 20 : ak === 'days' ? 7 : 12;
        S.rooms[ak] = on ? Array.from({ length: n }, function (_, i) { return i + 1; }) : [];
        renderContent(); break;
      }
      case 'roomquery':
        roomsQuery(); break;
      case 'refresh': if (API.invalidateCourses) API.invalidateCourses(); toast('已刷新'); renderContent(); break;
      case 'retry': if (API.invalidateCourses) API.invalidateCourses(); renderContent(); break;
      case 'gologin':
        API.setLoginMode('webview');
        localStorage.removeItem('cauc_token');
        S.route = 'home'; S.tab = 'home';
        $('#app').innerHTML = '';
        renderLogin();
        break;
      case 'channel': openSheet(channelSheet()); break;
      
      case 'homecards': openSheet(homeCardsSheet()); break;
      case 'homecard': {
        var op = parts[1], ck = parts[2];
        var hc = homeCardConf();
        
        if (op === 'reset') {
          localStorage.removeItem('cauc_home_cards');
          localStorage.removeItem('cauc_home_quick');
          hc = homeCardConf();
        } else {
          var hi = -1;
          for (var hx = 0; hx < hc.length; hx++) if (hc[hx].k === ck) hi = hx;
          if (hi < 0) break;
          if (op === 'toggle') hc[hi].on = !hc[hi].on;
          else if (op === 'up' && hi > 0) { var hu = hc[hi - 1]; hc[hi - 1] = hc[hi]; hc[hi] = hu; }
          else if (op === 'down' && hi < hc.length - 1) { var hd = hc[hi + 1]; hc[hi + 1] = hc[hi]; hc[hi] = hd; }
          else break;
          homeCardSave(hc);
        }
        openSheet(homeCardsSheet());
        
        if (S.route === 'home') renderContent();
        break;
      }
      
      case 'homequick': {
        var qop = parts[1], qk = parts[2];
        var qc = quickConf();
        if (qop === 'reset') {
          localStorage.removeItem('cauc_home_quick');
          qc = quickConf();
        } else {
          var qi = -1;
          for (var qx = 0; qx < qc.length; qx++) if (qc[qx].k === qk) qi = qx;
          if (qi < 0) break;
          if (qop === 'toggle') qc[qi].on = !qc[qi].on;
          else if (qop === 'up' && qi > 0) { var qu = qc[qi - 1]; qc[qi - 1] = qc[qi]; qc[qi] = qu; }
          else if (qop === 'down' && qi < qc.length - 1) { var qd = qc[qi + 1]; qc[qi + 1] = qc[qi]; qc[qi] = qd; }
          else break;
          quickSave(qc);
        }
        openSheet(homeCardsSheet());
        if (S.route === 'home') renderContent();
        break;
      }
      
      case 'cachettl': openSheet(cacheTtlSheet()); break;
      case 'darkmode': {
        
        var cur = localStorage.getItem('cauc_dark');
        var nxt = cur == null ? '1' : (cur === '1' ? '0' : null);
        if (nxt == null) localStorage.removeItem('cauc_dark');
        else localStorage.setItem('cauc_dark', nxt);
        applyDark();
        toast(nxt == null ? '深色模式：跟随系统' : (nxt === '1' ? '深色模式：开' : '深色模式：关'));
        renderContent();
        break;
      }
      case 'ttlreset': {
        localStorage.removeItem('cauc_cache_ttl');
        toast('已恢复默认');
        openSheet(cacheTtlSheet());
        break;
      }
      
      case 'escampus': {
        var nc = parts[1];
        if (ES.campus === nc) break;
        ES.campus = nc;
        ES.area = null; ES.building = null; ES.floor = null; ES.room = null;
        ES.areas = null; ES.buildings = null; ES.floors = null; ES.rooms = null;
        ES.err = '';
        renderContent();
        if (nc === '东丽') {
          esLoad(1).then(function () { var m = $('#elec-main'); if (m) renderElecSetup(m); },
                         function () { var m = $('#elec-main'); if (m) renderElecSetup(m); });
        } else {
          ES.area = { area: '1', areaname: '宁河校区' };
          esLoad(2).then(function () { var m = $('#elec-main'); if (m) renderElecSetup(m); },
                         function () { var m = $('#elec-main'); if (m) renderElecSetup(m); });
        }
        break;
      }
      
      case 'es': {
        var lv = parts[1];
        var val = act.split(':').slice(2).join(':');   
        var find = function (list, key) {
          list = list || [];
          for (var i = 0; i < list.length; i++) {
            var x = list[i];
            if (String(x[key] || '') === val || String(x[key + 'id'] || '') === val) return x;
          }
          return null;
        };
        if (lv === 'area') {
          if (val === '宁河校区') {
            ES.area = { area: '1', areaname: '宁河校区', ninghe: true };
          } else {
            ES.area = find(ES.areas, 'area');
          }
          ES.building = ES.floor = ES.room = null;
          ES.buildings = ES.floors = ES.rooms = null;
          renderContent();
          esLoad(2).then(function () { var m = $('#elec-main'); if (m) renderElecSetup(m); },
                          function () { var m = $('#elec-main'); if (m) renderElecSetup(m); });
        } else if (lv === 'building') {
          ES.building = find(ES.buildings, 'buildingid');
          ES.floor = ES.room = null;
          ES.floors = ES.rooms = null;
          renderContent();
          esLoad(3).then(function () { var m = $('#elec-main'); if (m) renderElecSetup(m); },
                          function () { var m = $('#elec-main'); if (m) renderElecSetup(m); });
        } else if (lv === 'floor') {
          ES.floor = find(ES.floors, 'floorid');
          ES.room = null;
          ES.rooms = null;
          renderContent();
          esLoad(4).then(function () { var m = $('#elec-main'); if (m) renderElecSetup(m); },
                          function () { var m = $('#elec-main'); if (m) renderElecSetup(m); });
        } else if (lv === 'room') {
          ES.room = find(ES.rooms, 'roomid');
          if (!ES.room) ES.room = { roomid: val, room: val };
          
          API.setElecRoom(ES.area, ES.building, ES.floor, ES.room).then(function () {
            toast('已选择 ' + (ES.room.room || val));
            renderContent();   
          });
        }
        break;
      }
      
      case 'es-retry': {
        ES.err = '';
        var mR = $('#elec-main') || $('#content');
        if (mR) renderElecSetup(mR);
        esLoad(1).then(function () {
          var m2 = $('#elec-main');
          if (m2) renderElecSetup(m2);
        });
        break;
      }
      
      case 'elecrefresh': {
        
        var tip = document.getElementById('elec-err');
        if (tip) tip.textContent = '正在刷新…';
        var setv = function (id, v) { var el = document.getElementById(id); if (el) el.textContent = v; };
        API.getElectricity(true).then(function (e) {
          
          if (e && e.light && e.light.remain != null) {
            HOME.elec = Number(e.light.remain);
            HOME.elecUnit = (e.light && e.light.unit) || '度';
            HOME._elecAt = Date.now();
          }
          setv('elec-light-remain', e.light.remain);
          setv('elec-ac-remain', e.ac.remain);
          setv('elec-light-remain2', e.light.remain + ' 度');
          setv('elec-light-free', (e.light.free != null ? e.light.free : 0) + ' 度');
          setv('elec-light-total', (e.light.total != null ? e.light.total : 0) + ' 度');
          setv('elec-ac-remain2', e.ac.remain + ' 度');
          setv('elec-ac-total', (e.ac.total != null ? e.ac.total : 0) + ' 度');
          var f = document.getElementById('elec-fresh'); if (f) f.textContent = '刚刚更新';
          if (tip) tip.textContent = '';
        }).catch(function (err) {
          if (tip) tip.textContent = String((err && err.message) || err);
        });
        break;
      }
      case 'elec-meter-light':
      case 'elec-meter-ac': {
        ELEC_METER = (act === 'elec-meter-ac') ? '空调' : '照明';
        var pills = document.querySelectorAll('[data-act^="elec-meter-"]');
        for (var pi = 0; pi < pills.length; pi++) {
          pills[pi].classList.toggle('on',
            pills[pi].getAttribute('data-act') === 'elec-meter-' + (ELEC_METER === '照明' ? 'light' : 'ac'));
        }
        break;
      }
      case 'net-pay-1':
      case 'net-pay-5':
      case 'net-pay-8': {
        NET_PAYTYPE = act.replace('net-pay-', '');
        var npp = document.querySelectorAll('[data-act^="net-pay-"]');
        for (var ni = 0; ni < npp.length; ni++) {
          npp[ni].classList.toggle('on', npp[ni].getAttribute('data-act') === 'net-pay-' + NET_PAYTYPE);
        }
        break;
      }
      case 'netfeerefresh':
        renderContent();
        break;
      case 'net-recharge': {
        var nAmt = parseFloat(($('#net-amt') || {}).value || '0');
        if (!(nAmt > 0)) { toast('请输入充值金额'); break; }
        var nlabel = { '1': '一卡通余额', '5': '支付宝', '8': '工行聚合' }[NET_PAYTYPE] || NET_PAYTYPE;
        if (!confirm('确认使用【' + nlabel + '】为校园网费充值 ' + nAmt.toFixed(2) + ' 元？')) break;
        var nbtnRestore = function () {
          var b = document.querySelector('[data-act="net-recharge"]');
          if (b) { b.disabled = false; b.classList.remove('btn-loading'); }
        };
        var nbtn = document.querySelector('[data-act="net-recharge"]');
        if (nbtn) { nbtn.disabled = true; nbtn.classList.add('btn-loading'); }
        API.netRecharge(nAmt, NET_PAYTYPE).then(function (r) {
          nbtnRestore();
          if (r && r.cashier) {
            
            openCashier(r.cashier);
            return;
          }
          toast('✅ ' + ((r && r.msg) || '充值成功'));
          setTimeout(function () { if (S.route === 'network') renderContent(); }, 1500);
        }).catch(function (e) {
          nbtnRestore();
          toast('❌ ' + ((e && e.message) || e));
        });
        break;
      }
      case 'elec-pay-1':
      case 'elec-pay-5':
      case 'elec-pay-8': {
        
        ELEC_PAYTYPE = act.replace('elec-pay-', '');
        var pp = document.querySelectorAll('[data-act^="elec-pay-"]');
        for (var qi = 0; qi < pp.length; qi++) {
          pp[qi].classList.toggle('on', pp[qi].getAttribute('data-act') === 'elec-pay-' + ELEC_PAYTYPE);
        }
        var hint = document.querySelector('.elec-pay-hint');
        if (hint) {
          hint.textContent = (ELEC_PAYTYPE === '1'
            ? '从一卡通余额直接扣款、实时到账。'
            : '下单后跳转收银台，在页面内完成支付。') + '照明与空调分开计量，请分别充值。';
        }
        break;
      }
      case 'elec-recharge': {
        var savedRoom = API.savedElecRoom && API.savedElecRoom();
        var amt = parseFloat(($('#elec-amt') || {}).value || '0');
        if (!savedRoom || !savedRoom.room) { toast('请先选择宿舍房间'); break; }
        if (!(amt > 0)) { toast('请输入充值金额'); break; }
        var base = String(typeof savedRoom.room === 'string' ? savedRoom.room :
          ((savedRoom.room && (savedRoom.room.roomid || savedRoom.room.room)) || ''))
          .replace(/(空调|照明)$/, '');
        var meter = ELEC_METER;
        var payLabel = { '1': '一卡通余额', '4': '微信', '5': '支付宝', '8': '工行聚合' }[ELEC_PAYTYPE] || ELEC_PAYTYPE;
        if (!confirm('确认使用【' + payLabel + '】充值 ' + amt.toFixed(2) + ' 元到【' + base + meter + '】？')) break;
        
        var btnRestore = function () {
          var b = document.querySelector('[data-act="elec-recharge"]');
          if (b) { b.disabled = false; b.classList.remove('btn-loading'); }
        };
        var btn = document.querySelector('[data-act="elec-recharge"]');
        if (btn) { btn.disabled = true; btn.classList.add('btn-loading'); }
        API.elecRecharge(savedRoom.area, savedRoom.building, savedRoom.floor,
                         base, meter, amt, ELEC_PAYTYPE).then(function (r) {
          btnRestore();
          if (r && r.cashier) {
            
            openCashier(r.cashier);
            return;
          }
          toast('✅ ' + ((r && r.msg) || '充值成功'));
          setTimeout(function () { if (S.route === 'electricity') renderContent(); }, 1500);
        }).catch(function (e) {
          btnRestore();
          toast('❌ ' + ((e && e.message) || e));
        });
        break;
      }
      case 'elec-reset':
        localStorage.removeItem('cauc_elec_room');
        ES.area = ES.building = ES.floor = ES.room = null;
        ES.areas = ES.buildings = ES.floors = ES.rooms = null;
        ES.err = '';
        renderContent();
        break;
      case 'loginmode':
        API.setLoginMode(parts[1]);
        if (parts[1] === 'auto') API.clearLoginFails();
        renderLogin();
        break;
      case 'openlogin':
        window.open(API.CONFIG.LOGIN_URLS.webvpn, '_blank');
        break;
      case 'native-login': {
        var lk = parts[1];
        var lsu = API.CONFIG.LOGIN_SYSTEMS[lk];
        if (!lsu) break;
        toast('正在打开：' + lsu.title);
        API.openNativeLogin(lk).then(function (r) {
          if (r && r.ok) {
            toast('已登录：' + lsu.title);
          } else {
            toast('未检测到登录状态，可重试或点「我已登录」');
          }
          renderLogin();
        }).catch(function (e) {
          toast(String((e && e.message) || e));
        });
        break;
      }
      case 'login-done':
        localStorage.setItem('cauc_token', 'session');
        API.clearLoginFails();
        enterApp();
        break;
      case 'loginreset':
        API.clearLoginFails();
        API.setLoginMode('auto');
        renderLogin();
        toast('已重置失败计数，回到无感登录');
        break;
      case 'loginmode-sheet': openSheet(loginModeSheet()); break;
      case 'setchannel':
        closeSheet();
        API.setChannel(parts[1]).then(function () {
          toast('通道：' + API.channelLabel());
          renderContent();
        });
        break;
      case 'closesheet': closeSheet(); break;
      case 'logout':
        API.logout().then(function () {
          localStorage.removeItem('cauc_token');
          S.route = 'home'; S.tab = 'home';
          $('#app').innerHTML = '';
          renderLogin();
          toast('已退出登录');
        });
        break;
    }
  });
  $('#sheet').addEventListener('click', function (e) { if (e.target.id === 'sheet') closeSheet(); });
  
  document.addEventListener('input', function (e) {
    var id = (e.target && e.target.id) || '';
    if (id.indexOf('ttl-num-') === 0) ttlApply(id.slice(8));
  });
  document.addEventListener('change', function (e) {
    var id = (e.target && e.target.id) || '';
    if (id.indexOf('ttl-num-') === 0) { ttlApply(id.slice(8)); toast('已保存'); }
    else if (id.indexOf('ttl-u-') === 0) { ttlApply(id.slice(6)); toast('已保存'); }
  });
  
  var tx0 = null;
  document.addEventListener('touchstart', function (e) { if (S.route === 'schedule' && S.schedView === 'week') tx0 = e.touches[0].clientX; });
  document.addEventListener('touchend', function (e) {
    if (tx0 == null) return;
    var dx = e.changedTouches[0].clientX - tx0; tx0 = null;
    if (Math.abs(dx) < 55) return;
    if (dx < 0 && S.week < API.CONFIG.TOTAL_WEEKS) { S.week++; renderContent(); }
    else if (dx > 0 && S.week > 1) { S.week--; renderContent(); }
  });
  
  
  var LOGIN_PENDING = false;   
  var BOOT_SHELL = '<div style="min-height:100vh;display:flex;align-items:center;' +
    'justify-content:center;color:#8994a8;font-size:14px">正在启动…' +
    '<span style="margin-left:6px;opacity:.8"></span></div>';
  function showBootShell() {
    var a = $('#app');
    if (!a) return;
    a.classList.remove('hidden');
    if (!a.innerHTML) a.innerHTML = BOOT_SHELL;
  }
  
  function caucSetDark(on) {
    try {
      if (on) document.documentElement.setAttribute('data-theme', 'dark');
      else document.documentElement.removeAttribute('data-theme');
    } catch (e) {}
  }
  
  function caucCachedSysDark() {
    try { return localStorage.getItem('cauc_sys_dark') === '1'; } catch (e) { return false; }
  }
  
  function caucPushDarkToNative(dark) {
    try {
      var LW = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LoginWebView;
      if (LW && LW.setDarkMode) LW.setDarkMode({ dark: !!dark });
    } catch (e) {}
  }
  function applyDark(cb) {
    var p = null;
    try { p = localStorage.getItem('cauc_dark'); } catch (e) {}
    if (p === '1') { caucSetDark(true); caucPushDarkToNative(true); if (cb) cb(); return; }
    if (p === '0') { caucSetDark(false); caucPushDarkToNative(false); if (cb) cb(); return; }
    
    caucSetDark(caucCachedSysDark());
    var LW = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LoginWebView;
    if (LW && LW.isSystemDark) {
      LW.isSystemDark().then(function (r) {
        var d = !!(r && r.dark);
        try { localStorage.setItem('cauc_sys_dark', d ? '1' : '0'); } catch (e) {}
        caucSetDark(d);
        caucPushDarkToNative(d);
        if (cb) cb();
      }).catch(function () { if (cb) cb(); });
    } else { if (cb) cb(); }
  }
  applyDark();
  
  window.addEventListener('cauc:native-theme', function () {
    console.log('[CaucDiag] 系统主题变化 → 重算深色模式');
    applyDark();
  });
  
  try {
    var caucMq = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
    if (caucMq) {
      var caucMqOn = function () { applyDark(); };
      if (caucMq.addEventListener) caucMq.addEventListener('change', caucMqOn);
      else if (caucMq.addListener) caucMq.addListener(caucMqOn);
    }
  } catch (e) {}
  
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) applyDark();
  });
  function boot() {
    showBootShell();
    
    var wdWaited = 0;
    (function watchdog() {
      setTimeout(function () {
        var a = $('#app');
        if (!a || a.innerHTML !== BOOT_SHELL) return;
        if (LOGIN_PENDING && wdWaited < 60000) {
          wdWaited += 10000;
          var sp = a.querySelector('span');
          if (sp) sp.textContent = '（正在自动登录，校外约需 30 秒…）';
          watchdog();
          return;
        }
        if (token() && API.hasCreds && API.hasCreds()) enterApp();
        else renderLogin();
      }, 10000);
    })();
    
    try {
      localStorage.removeItem('cauc_wv_ask_at');
      
      localStorage.removeItem('cauc_wv_fail_at');
      console.log('[CaucDiag] wv_ok=' + localStorage.getItem('cauc_wv_ok_at') +
        ' wv_off=' + localStorage.getItem('cauc_wv_off') +
        ' wv_fail=' + localStorage.getItem('cauc_wv_fail_at') +
        ' channel=' + (API.CONFIG ? API.CONFIG.CHANNEL : '?'));
    } catch (e) {}
    if (API.hasNativeLogin && API.hasNativeLogin()) {
      API.nativeRestoreCookies().then(function (n) {
        if (n > 0) console.log('[cookie] 已恢复 ' + n + ' 条会话 Cookie');
      }).catch(function () {});
    }
    
    
    try { API.setMode(localStorage.getItem('cauc_mode') === 'mock' ? 'mock' : 'real'); } catch (e) {}
    if (API.hasCreds && API.hasCreds()) {
      if (token()) { enterApp(); }
      else {
        var c0 = API.getCreds();
        LOGIN_PENDING = true;
        API.login(c0.sid, c0.pwd).then(function (res) {
          LOGIN_PENDING = false;
          localStorage.setItem('cauc_token', res.token);
          enterApp();
        }).catch(function (e) {
          LOGIN_PENDING = false;
          
          var m = String((e && e.message) || e);
          if (/密码|账号|不正确/.test(m)) { renderLogin(); return; }
          localStorage.setItem('cauc_token', 'real-offline-' + Date.now());
          enterApp();
          console.log('[CaucDiag] 启动校验失败（网络类）→ 用本地会话进入，后台重试：' + m.slice(0, 60));
          if (API.warmup) setTimeout(function () { API.warmup().catch(function () {}); }, 800);
        });
      }
    }
    else {
      $('#app').classList.remove('hidden');
      renderLogin();
    }
    
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(function (rs) {
        rs.forEach(function (r) { r.unregister(); });
      }).catch(function () {});
    }
    if (window.caches && caches.keys) {
      caches.keys().then(function (ks) {
        ks.forEach(function (k) { caches.delete(k); });
      }).catch(function () {});
    }
  }
  
  var _lastBackAt = 0;
  function handleBack() {
    var sh = $('#sheet');
    if (sh && !sh.classList.contains('hidden')) { closeSheet(); return; }
    if (NAV.stack.length > 1) {
      NAV.stack.pop();
      var r = NAV.stack[NAV.stack.length - 1];
      S.route = r;
      if (['home', 'schedule', 'services', 'mine'].indexOf(r) >= 0) S.tab = r;
      
      renderShell(); window.scrollTo(0, 0);
      return;
    }
    if (S.route !== 'home') { NAV.stack = ['home']; go('home'); return; }
    var now = Date.now();
    if (now - _lastBackAt < 2000) {
      var CapApp = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App;
      if (CapApp && CapApp.exitApp) CapApp.exitApp();
    } else {
      _lastBackAt = now;
      toast('再按一次返回退出应用');
    }
  }
  (function initBackKey() {
    var CapApp = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App;
    if (CapApp && CapApp.addListener) CapApp.addListener('backButton', function () { handleBack(); });
    window.addEventListener('cauc:back', handleBack);
    
    window.addEventListener('cauc:webvpn-ok', function () {
      console.log('[CaucDiag] WebVPN 已登录');
      
      try { if (API.selfPrewarm) API.selfPrewarm(); } catch (e) {}
      
      setTimeout(function () { refreshHomeDevices(true); }, 300);
      
      if (S.route === 'home') {
        var el = document.getElementById('h-status');
        if (el) el.innerHTML = homeStatusBar();
      }
      
      if (S.route === 'network') selfRender();
      if (S.route === 'schedule') renderContent();
    });
    
    window.addEventListener('cauc:kb-updated', function () {
      if (S.route === 'schedule') renderContent();
      if (S.route === 'home') loadHomeCourses();
    });
    
    window.addEventListener('cauc:channel-ready', function () {
      try { API.prewarmAll(); } catch (e) {}
      
      try { if (API.ecardPrewarm) setTimeout(function () { API.ecardPrewarm(); }, 600); } catch (e) {}
      setTimeout(function () { refreshHomeDevices(false); }, 200);
      
      try {
        var host = document.getElementById('h-status');
        var cur = host && host.querySelector('.banner');
        if (cur) {
          var want = homeStatusBar();
          var sig = (want.match(/data-sig="([^"]*)"/) || [])[1] || '';
          if (cur.getAttribute('data-sig') !== sig) cur.outerHTML = want;
        }
      } catch (e) {}
    });
    
    window.addEventListener('cauc:prewarm-done', function () {
      if (S.route === 'home') {
        try { loadHomeCourses(); } catch (e) {}
        try { refreshHomeDevices(false); } catch (e) {}
      }
    });
    
    window.addEventListener('cauc:channel-changed', function () {
      try { if (API.invalidateCourses) API.invalidateCourses(); } catch (e) {}
      console.log('[CaucDiag] 通道已切换');
      if (S.route === 'home' || S.route === 'mine' || S.route === 'jwgl') renderContent();
    });
  })();
  
  (function initForegroundReprobe() {
    if (!API.reprobeForeground) return;
    var lastAt = 0;
    var awaySince = 0;                        
    var markAway = function () { if (!awaySince) awaySince = Date.now(); };
    var reprobe = function () {
      
      var now = Date.now();
      if (now - lastAt < 2000) return;
      lastAt = now;
      var away = awaySince ? (now - awaySince) : 0;   
      awaySince = 0;
      console.log('[CaucDiag] 回到前台（离开 ' + Math.round(away / 1000) + 's）→ 重新探测');
      
      API.reprobeForeground(away).catch(function () {});
    };
    var CapApp = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App;
    if (CapApp && CapApp.addListener) {
      try {
        CapApp.addListener('appStateChange', function (st) {
          if (st && st.isActive) reprobe(); else markAway();
        });
      } catch (e) {}
      try { CapApp.addListener('pause', markAway); } catch (e) {}
      try { CapApp.addListener('resume', function () { reprobe(); }); } catch (e) {}
    }
    
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) reprobe(); else markAway();
    });
    window.addEventListener('focus', reprobe);
    window.addEventListener('blur', markAway);
    
    setInterval(function () {
      if (document.hidden) return;                 
      try { if (API.wvVerifyNow) API.wvVerifyNow().catch(function () {}); } catch (e) {}
    }, 10 * 60 * 1000);
  })();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();