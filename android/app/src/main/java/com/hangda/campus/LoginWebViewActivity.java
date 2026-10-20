package com.hangda.campus;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.webkit.CookieManager;
import android.webkit.WebChromeClient;
import android.webkit.ValueCallback;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import org.json.JSONObject;

public class LoginWebViewActivity extends AppCompatActivity {

    public static final String EXTRA_URL = "url";
    public static final String EXTRA_POST_DATA = "postData";
    public static final String EXTRA_TITLE = "title";
    public static final String EXTRA_DOMAINS = "domains";
    public static final String EXTRA_USER = "user";
    public static final String EXTRA_PWD = "pwd";
    public static final String EXTRA_COOKIES = "cookies";
    public static final String EXTRA_FINAL_URL = "finalUrl";
    public static final String EXTRA_AUTO = "auto";
    public static final String EXTRA_BROWSE = "browse";
    public static final String EXTRA_FALLBACK_URL = "fallbackUrl";

    public static final String EXTRA_WV_REJECTED = "webvpnRejected";

    public static final String EXTRA_MAP_CAMPUS = "mapCampus";
    public static final String EXTRA_WV_LOGIN_BOUNCE = "webvpnLoginBounce";

    public static final String EXTRA_AUTO_EVAL = "autoEval";

    public static final String EXTRA_PAY = "pay";
    private static final String EVAL_AUTO_JS = "(function(){\nif(window.__evalAutoRunning)return;window.__evalAutoRunning=true;\nvar sleep=function(ms){return new Promise(function(r){setTimeout(r,ms)})};\nvar pick=function(){\n  var radios=[].slice.call(document.querySelectorAll('.jqradio'));\n  var groups={};\n  radios.forEach(function(r){var k=r.name||('q'+radios.indexOf(r));(groups[k]=groups[k]||[]).push(r);});\n  Object.keys(groups).forEach(function(k){\n    var opts=groups[k];\n    var idx=Math.random()<0.65?1:0;\n    var el=opts[idx]||opts[0];\n    if(el&&el.click){el.click();}\n  });\n};\nvar guard=0;\nvar run=function(){\n  if(guard++>60){alert('\u8bc4\u6559\u81ea\u52a8\u6d41\u7a0b\u7ed3\u675f\uff08\u8d85\u65f6\u4fdd\u62a4\uff09');return;}\n  sleep(3000).then(function(){\n    var tasks=[].slice.call(document.querySelectorAll('button')).filter(function(b){return (b.textContent||'').indexOf('\u6211\u8981\u8bc4\u4ef7')>=0;});\n    if(!tasks.length){\n      var tab=document.querySelector(\"a[status='0']\");\n      if(tab){tab.click();return sleep(2000).then(run);}\n      alert('\u8bc4\u6559\u5b8c\u6210\u6216\u6682\u65e0\u4efb\u52a1');return;\n    }\n    tasks[0].click();\n    return sleep(3000).then(function(){pick();return sleep(600);}).then(function(){\n      var sb=document.getElementById('but_tj');\n      if(sb){sb.click();}\n      return sleep(2000);\n    }).then(function(){\n      var ok=document.querySelector('.layui-layer-btn0,.bootbox-accept,#btn_ok');\n      if(ok){ok.click();}\n      return sleep(2000);\n    }).then(function(){\n      var tab=document.querySelector(\"a[status='0']\");\n      if(tab){tab.click();}\n      run();\n    });\n  });\n};\nrun();\n})();";

    private static final String REJECT_JS =
        "(function(){try{var t=document.body?String(document.body.innerText||''):'';" +
        "if(t.length>4000)t=t.slice(0,4000);" +
        "var hasForm=document.querySelectorAll('input').length>0;" +
        "var hit=/仅限[^。]{0,10}校外使用|访问权限提示|不允许登录|无权访问该系统|请通过.{0,10}学校主页/.test(t);" +
        "return (hit&&!hasForm)?'1':'0';" +
        "}catch(e){return '0';}})()";

    private WebView webView;
    private TextView titleView;
    private TextView hintView;
    private android.widget.ProgressBar progressBar;
    private String[] domains = new String[0];
    private boolean triedFallback = false;
    private boolean webvpnRejected = false;
    private boolean webvpnLoginBounce = false;
    private boolean mapCampus = false;
    private boolean mapCampusExplicit = false;
    private boolean autoEval = false;
    private boolean triedBounceClose = false;

    private static volatile boolean sMapCampus = false;
    static void setMapCampusGlobal(boolean b) { sMapCampus = b; }

    private final Handler handler = new Handler(Looper.getMainLooper());
    private boolean closed = false;
    private int ticks = 0;

    private LinearLayout topBar;
    private final java.util.ArrayList<ImageView> topIcons = new java.util.ArrayList<ImageView>();
    private View pageRoot;

    private final Runnable poll = new Runnable() {
        @Override
        public void run() {
            if (closed) return;
            ticks++;
            unmaskPasswords();
            if (checkLogin()) return;
            if (ticks < 400) handler.postDelayed(this, 1000);
        }
    };

    private static final String UNMASK_JS =
            "(function(){try{var a=document.querySelectorAll('input[type=password]');" +
            "for(var i=0;i<a.length;i++){a[i].type='text';" +
            "try{a[i].style.webkitTextSecurity='none';}catch(e){}}}catch(e){}})()";

    private static final String WV_CAPTURE_HOOK_JS =
            "(function(){try{if(window.__caucCap)return;window.__caucCap=1;" +
            "function cap(t,s){try{console.log('[WVCap] '+t+' '+String(s).slice(0,420));}catch(e){}}" +
            "var of=window.fetch;" +
            "if(of){window.fetch=function(u,o){try{cap('FETCH',((o&&o.method)||'GET')+' '+(typeof u==='string'?u:(u&&u.url)));}catch(e){}return of.apply(window,arguments);};}" +
            "var xo=XMLHttpRequest.prototype.open;" +
            "XMLHttpRequest.prototype.open=function(m,u){try{this.__cm=m;this.__cu=u;cap('XHR',m+' '+u);}catch(e){}return xo.apply(this,arguments);};" +
            "var xs=XMLHttpRequest.prototype.send;" +
            "XMLHttpRequest.prototype.send=function(b){try{cap('XHRS',(this.__cm||'')+' '+(this.__cu||'')+(b?' BODY '+String(b).slice(0,300):''));}catch(e){}return xs.apply(this,arguments);};" +
            "var ow=window.open;" +
            "if(ow){window.open=function(u){try{cap('OPEN',u);}catch(e){}return ow.apply(window,arguments);};}" +
            "var fs=HTMLFormElement.prototype.submit;" +
            "HTMLFormElement.prototype.submit=function(){try{cap('FORMSUBMIT',(this.action||'')+' method='+(this.method||'GET'));}catch(e){}return fs.apply(this,arguments);};" +
            "document.addEventListener('submit',function(ev){try{var f=ev.target;if(f&&f.tagName==='FORM')cap('FORMEV',(f.action||'')+' method='+(f.method||'GET'));}catch(e){}},true);" +
            "document.addEventListener('click',function(ev){try{var a=ev.target.closest?ev.target.closest('a,button,[onclick]'):null;if(a)cap('CLICK',(a.textContent||'').trim().slice(0,24)+' href='+(a.href||a.getAttribute('href')||'')+' onclick='+String(a.getAttribute&&a.getAttribute('onclick')||'').slice(0,280));}catch(e){}},true);" +
            "}catch(e){}})()";

    private boolean autoSubmit = false;
    private boolean browseMode = false;
    private static final int AUTO_SUBMIT_MAX = 8;
    private int autoSubmitTries = 0;
    private final java.util.Set<String> navNormalized = new java.util.HashSet<String>();

    private boolean payMode = false;
    private long lastExternalAt = 0L;

    private static boolean isAlipayTarget(String url) {
        if (url == null) return false;
        String low = url.trim().toLowerCase();
        if (low.isEmpty()) return false;
        if (low.startsWith("alipays:") || low.startsWith("alipayqr:")
                || low.startsWith("alipay:")) return true;
        if (low.startsWith("intent:")) return low.contains("alipays") || low.contains("alipay");
        try {
            String host = android.net.Uri.parse(low).getHost();
            if (host == null) return false;
            host = host.toLowerCase();
            return host.equals("alipay.com") || host.endsWith(".alipay.com")
                    || host.equals("alipayobjects.com") || host.endsWith(".alipayobjects.com")
                    || host.equals("alipay.cn") || host.endsWith(".alipay.cn")
                    || host.equals("alipay.net") || host.endsWith(".alipay.net");
        } catch (Throwable t) {
            return false;
        }
    }

    private void openExternally(String url, String appName) {
        try {
            Intent it;
            if (url != null && url.toLowerCase().startsWith("intent://")) {
                it = Intent.parseUri(url, Intent.URI_INTENT_SCHEME);
                if (it == null) throw new Exception("bad intent uri");
                it.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            } else {
                it = new Intent(Intent.ACTION_VIEW, android.net.Uri.parse(url));
                it.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            }
            startActivity(it);
            android.util.Log.i("CaucWV", "交给系统打开(" + appName + "): " + url);
        } catch (Exception e) {
            android.util.Log.i("CaucWV", appName + " 交给系统失败: " + e);
            try {
                Toast.makeText(this, "没能打开" + appName + "，请确认已装浏览器或客户端",
                        Toast.LENGTH_LONG).show();
            } catch (Throwable ignored) {}
        }
    }

    private boolean claimExternal() {
        long now = System.currentTimeMillis();
        if (now - lastExternalAt < 1500L) return false;
        lastExternalAt = now;
        return true;
    }

    private static final String AUTOSUBMIT_JS =
        "(function(){try{" +
        "  function vis(el){try{var r=el.getBoundingClientRect();return r.width>0&&r.height>0;}catch(e){return false;}}" +
        "  function txt(b){try{return String(b.innerText||b.textContent||b.value||b.getAttribute('aria-label')||b.getAttribute('title')||'').replace(/\\s+/g,'');}catch(e){return '';}}" +
        "  function bySel(list){for(var i=0;i<list.length;i++){var el=document.querySelector(list[i]);if(el&&!el.disabled)return el;}return null;}" +
        "  function byKey(words,onlyText){var ins=document.querySelectorAll('input');" +
        "    for(var i=0;i<ins.length;i++){var e=ins[i];if(e.disabled)continue;" +
        "      if(onlyText&&e.type&&e.type!=='text'&&e.type!=='tel')continue;" +
        "      var s=(String(e.placeholder||'')+' '+String(e.name||'')+' '+String(e.id||'')).toLowerCase();" +
        "      for(var k=0;k<words.length;k++){if(s.indexOf(words[k])>=0)return e;}}return null;}" +
        "  var uEl=bySel(['#form_item_userName','input[name=username]','input[name=userName]','input[name=yhm]','#username','input[name=account]','input[name=loginName]'])" +
        "      ||byKey(['user','account','login','用户名','账号','学号'],true)||document.querySelector('input[type=text]');" +
        "  var pEl=bySel(['#form_item_password','input[name=password]','input[name=upass]','#mm','input[name=mm]','#password','#pwd'])" +
        "      ||byKey(['pass','pwd','密码'],false)||document.querySelector('input[type=password]');" +
        "  var hasU=!!(uEl&&String(uEl.value||'').length>0);" +
        "  var hasP=!!(pEl&&String(pEl.value||'').length>0);" +
        "  if(!hasU) return 'no-user';" +
        "  var btns=[].slice.call(document.querySelectorAll('button,input[type=submit],a[role=button],a,[class*=btn],[class*=Button],[class*=login],[class*=Login]'));" +
        "  function rank(b){var n=(b.tagName||'').toUpperCase();return n==='BUTTON'?0:(n==='INPUT'?1:(n==='A'?2:3));}" +
        "  btns.sort(function(x,y){return rank(x)-rank(y);});" +
        "  var re=/^(登录|登入|提交|确定|立即登录|Login|LogIn|SignIn|Signup|Submit|Next|Continue|下一步|继续)$/i;" +
        "  var re2=/(登录|登入|signin|login|submit|提交|下一步|继续|next|continue)/i;" +
        "  var bad=/(取消|返回|注册|忘记|重置|退出|切换|注销|cancel|back|regist|forget|reset|logout|signup)/i;" +
        "  var known=['#btn_dl','#btnLogin','#loginBtn','#login-btn','#submitBtn','#btn_login','.login-btn','.btn-login','.login_btn','.button.green'];" +
        "  for(var q=0;q<known.length;q++){" +
        "    var kb=null;try{kb=document.querySelector(known[q]);}catch(e){}" +
        "    if(kb&&!kb.disabled&&!kb.__autoClicked&&vis(kb)){" +
        "      kb.__autoClicked=true;" +
        "      try{kb.click();}catch(e){try{kb.dispatchEvent(new MouseEvent('click',{bubbles:true}));}catch(e2){}}" +
        "      return 'clicked-known:'+known[q]+':'+txt(kb);" +
        "    }" +
        "  }" +
        "  for(var pass=0;pass<4;pass++){" +
        "    for(var i=0;i<btns.length;i++){" +
        "      var b=btns[i];" +
        "      if(b.disabled||b.__autoClicked) continue;" +
        "      if(pass===0&&(rank(b)>1||!vis(b))) continue;" +
        "      if(pass===1&&rank(b)>1) continue;" +
        "      if(pass>=2&&!vis(b)) continue;" +
        "      var t=txt(b);" +
        "      if(!t) continue;" +
        "      var want=(pass<3)?re.test(t):(re2.test(t)&&!bad.test(t)&&t.length<=14);" +
        "      if(want){" +
        "        b.__autoClicked=true;" +
        "        try{b.click();}catch(e){try{b.dispatchEvent(new MouseEvent('click',{bubbles:true}));}catch(e2){}}" +
        "        return 'clicked:'+t;" +
        "      }" +
        "    }" +
        "  }" +
        "  if(hasP&&pEl&&!pEl.__enterSent){" +
        "    pEl.__enterSent=true;" +
        "    try{['keydown','keypress','keyup'].forEach(function(t){" +
        "      ['Enter','\\u000d'].forEach(function(key){" +
        "        var ev; try{ev=new KeyboardEvent(t,{key:key,code:'Enter',keyCode:13,which:13,bubbles:true,cancelable:true});}catch(e){ev=document.createEvent('Event');ev.initEvent(t,true,true);ev.keyCode=13;ev.which=13;}" +
        "        pEl.dispatchEvent(ev);});});" +
        "      return 'enter';}catch(e){}" +
        "  }" +
        "  var f=document.querySelector('form');" +
        "  if(f&&!f.__autoSubmitted){f.__autoSubmitted=true;" +
        "    try{if(f.requestSubmit){f.requestSubmit();}else{f.submit();}return 'form';}catch(e){}}" +
        "  var ins=document.querySelectorAll('input');var insD=[];" +
        "  for(var k=0;k<ins.length&&k<6;k++){var e2=ins[k];insD.push((e2.id||e2.name||'?')+':'+e2.type+':'+String(e2.value||'').length);}" +
        "  var bs=[];for(var j=0;j<btns.length&&j<6;j++)bs.push(txt(btns[j])||'<empty>');" +
        "  return 'nobtn|u='+hasU+'|p='+hasP+'|inputs='+insD.join(',')+'|btns='+bs.join(',');" +
        "}catch(e){return 'err:'+e.message;}})()";

    private void autoSubmitForm() {


        if (!autoSubmit || webView == null || closed) return;
        if (looksLoggedIn(webView.getUrl())) return;
        if (autoSubmitTries++ >= AUTO_SUBMIT_MAX) return;
        try {
            webView.evaluateJavascript(AUTOSUBMIT_JS, new ValueCallback<String>() {
                @Override public void onReceiveValue(String v) {
                    android.util.Log.i("CaucLogin", "[autosubmit] " + v);
                    if (v != null && v.contains("no-user") && autoSubmitTries > 0) autoSubmitTries--;
                }
            });
        } catch (Exception ignored) {}
    }

    private void unmaskPasswords() {
        if (webView == null) return;
        try {
            webView.evaluateJavascript(UNMASK_JS, null);
        } catch (Exception ignored) {}
    }

    private static final int BRAND = 0xFF0B3D91;

    private View iconButton(int resId, String desc, int size, View.OnClickListener l) {
        FrameLayout box = new FrameLayout(this);
        box.setLayoutParams(new LinearLayout.LayoutParams(size, size));
        box.setContentDescription(desc);
        box.setOnClickListener(l);

        ImageView iv = new ImageView(this);
        iv.setImageResource(resId);
        iv.setColorFilter(ShellBar.isNight(this) ? ShellBar.INK_DARK : ShellBar.INK);
        iv.setScaleType(ImageView.ScaleType.FIT_CENTER);
        iv.setLayoutParams(new FrameLayout.LayoutParams(dp(24), dp(24), Gravity.CENTER));
        box.addView(iv);
        topIcons.add(iv);
        return box;
    }

    private int dp(int v) {
        return Math.round(getResources().getDisplayMetrics().density * v);
    }

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        final String url = getIntent().getStringExtra(EXTRA_URL);
        String title = getIntent().getStringExtra(EXTRA_TITLE);
        String[] ds = getIntent().getStringArrayExtra(EXTRA_DOMAINS);
        autoSubmit = getIntent().getBooleanExtra(EXTRA_AUTO, false);
        browseMode = getIntent().getBooleanExtra(EXTRA_BROWSE, false);
        mapCampus = getIntent().getBooleanExtra(EXTRA_MAP_CAMPUS, false);
        autoEval = getIntent().getBooleanExtra(EXTRA_AUTO_EVAL, false);
        payMode = getIntent().getBooleanExtra(EXTRA_PAY, false);
        mapCampusExplicit = getIntent().hasExtra(EXTRA_MAP_CAMPUS);
        if (ds != null) domains = ds;

        final boolean dark = ShellBar.isNight(this);
        Immersive.apply(this, dark);

        CookieManager cm = CookieManager.getInstance();
        cm.setAcceptCookie(true);

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(dark ? Immersive.DARK_BG : Color.WHITE);
        pageRoot = root;

        final int BOX = dp(40);

        LinearLayout bar = new LinearLayout(this);
        bar.setOrientation(LinearLayout.HORIZONTAL);
        bar.setGravity(Gravity.CENTER_VERTICAL);
        bar.setBaselineAligned(false);
        bar.setBackgroundColor(dark ? ShellBar.BAR_BG_DARK : ShellBar.BAR_BG);
        topBar = bar;
        try { bar.setElevation(dp(2)); } catch (Throwable ignored) {}
        bar.setMinimumHeight(dp(56));
        bar.setPadding(dp(16), 0, dp(16), 0);

        bar.setPadding(bar.getPaddingLeft(), 0, bar.getPaddingRight(), bar.getPaddingBottom());

        bar.addView(iconButton(R.drawable.ic_close_24, "关闭", BOX, new View.OnClickListener() {
            @Override public void onClick(View v) { finishWith(false); }
        }));

        titleView = new TextView(this);
        titleView.setText(title == null ? "登录" : title);
        titleView.setTextColor(dark ? ShellBar.INK_DARK : ShellBar.INK);
        titleView.setTextSize(17);
        titleView.setTypeface(android.graphics.Typeface.DEFAULT);
        titleView.setSingleLine(true);
        titleView.setEllipsize(android.text.TextUtils.TruncateAt.END);
        titleView.setGravity(Gravity.CENTER_VERTICAL);
        titleView.setIncludeFontPadding(false);
        LinearLayout.LayoutParams tlp = new LinearLayout.LayoutParams(0, BOX, 1f);
        tlp.leftMargin = dp(10);
        tlp.rightMargin = dp(10);
        bar.addView(titleView, tlp);

        bar.addView(iconButton(R.drawable.ic_refresh_24, "刷新", BOX, new View.OnClickListener() {
            @Override public void onClick(View v) {
                if (webView != null) webView.reload();
            }
        }));


        root.addView(bar, new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));

        progressBar = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        progressBar.setMax(100);
        progressBar.setLayoutParams(new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, dp(2)));
        try {
            progressBar.setProgressTintList(
                android.content.res.ColorStateList.valueOf(Color.parseColor("#1B4EA8")));
        } catch (Throwable ignored) {}
        progressBar.setVisibility(View.GONE);
        root.addView(progressBar);

        hintView = new TextView(this);
        hintView.setText("正在自动登录…");
        hintView.setTextSize(12);
        hintView.setPadding(dp(12), dp(9), dp(12), dp(9));
        hintView.setBackgroundColor(Color.parseColor("#EEF4FF"));
        hintView.setTextColor(Color.parseColor("#1B4EA8"));
        if (!browseMode) {
            root.addView(hintView, new LinearLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));
        }

        webView = new WebView(this);
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setUseWideViewPort(true);
        s.setLoadWithOverviewMode(true);
        s.setSupportZoom(true);
        s.setBuiltInZoomControls(true);
        s.setDisplayZoomControls(false);
        s.setJavaScriptCanOpenWindowsAutomatically(true);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            cm.setAcceptThirdPartyCookies(webView, true);
        }

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return handleNav(view, url);
            }
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, android.webkit.WebResourceRequest req) {
                return handleNav(view, String.valueOf(req.getUrl()));
            }
            private boolean handleNav(WebView view, String url) {
                if (payMode && isAlipayTarget(url)) {
                    if (claimExternal()) openExternally(url, "支付宝");
                    return true;
                }
                if (url != null && url.toLowerCase().startsWith("weixin://")) {
                    try {
                        android.content.Intent it = new android.content.Intent(
                                android.content.Intent.ACTION_VIEW, android.net.Uri.parse(url));
                        it.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
                        startActivity(it);
                        android.util.Log.i("CaucWV", "weixin scheme -> 拉起微信: " + url);
                    } catch (Exception e) {
                        android.util.Log.i("CaucWV", "weixin scheme 拉起失败: " + e);
                        try {
                            android.widget.Toast.makeText(LoginWebViewActivity.this,
                                    "未安装微信或无法唤起", android.widget.Toast.LENGTH_SHORT).show();
                        } catch (Throwable ignored) {}
                    }
                    return true;
                }
                boolean changed = false;
                if (url != null) {
                    String fixed = normalizeUrlPath(url);
                    if (!fixed.equals(url)) {
                        android.util.Log.i("CaucWV", "normalize: " + url + " -> " + fixed);
                        url = fixed;
                        changed = true;
                    }
                }
                final boolean remap = mapCampusExplicit ? mapCampus : sMapCampus;
                if (remap && url != null) {
                    String mapped = mapCampusUrl(url);
                    if (mapped != null) {
                        android.util.Log.i("CaucWV", "remap: " + url + " -> " + mapped);
                        view.loadUrl(mapped);
                        return true;
                    }
                }
                if (changed) {
                    view.loadUrl(url);
                    return true;
                }
                return false;
            }


            @Override
            public void onReceivedHttpError(WebView view, android.webkit.WebResourceRequest req,
                                            android.webkit.WebResourceResponse resp) {
                try {
                    if (req == null || !req.isForMainFrame()) return;
                    String u = String.valueOf(req.getUrl());
                    String fixed = normalizeUrlPath(u);
                    if (!fixed.equals(u) && navNormalized.add(fixed)) {
                        android.util.Log.i("CaucWV", "HTTP " + (resp == null ? "?" : resp.getStatusCode())
                                + " 且路径多斜杠 → 用归一化地址重载: " + fixed);
                        view.loadUrl(fixed);
                    }
                } catch (Throwable ignored) {}
            }
            @Override
            public void onPageStarted(WebView v, String url, android.graphics.Bitmap favicon) {
                if (payMode && isAlipayTarget(url) && claimExternal()) {
                    openExternally(url, "支付宝");
                    try { v.stopLoading(); } catch (Throwable ignored) {}
                    return;
                }
                injectFromHub(url);
                super.onPageStarted(v, url, favicon);
            }
            @Override
            public android.webkit.WebResourceResponse shouldInterceptRequest(WebView v, android.webkit.WebResourceRequest req) {
                try { injectFromHub(String.valueOf(req.getUrl())); } catch (Throwable ignored) {}
                return null;
            }
            @Override
            public void onPageFinished(WebView view, String u) {
                harvestToHub(u);
                if (autoEval && u != null && u.contains("result_endingClassList")) {
                    view.evaluateJavascript(EVAL_AUTO_JS, null);
                }
                if (titleView != null && u != null) {
                    String host = u.replaceFirst("^https?://", "").split("/")[0];
                    titleView.setText(host);
                }
                if (!triedBounceClose && u != null) {
                    try {
                        java.net.URI uri = java.net.URI.create(u);
                        String hh = uri.getHost() == null ? "" : uri.getHost().toLowerCase();
                        String pp = uri.getPath() == null ? "" : uri.getPath().toLowerCase();
                        boolean isJwglLoginPage = (hh.indexOf("jwgl") >= 0)
                                && (pp.contains("login_slogin") || pp.contains("/xtgl/login"));
                        if (isJwglLoginPage) {
                            triedBounceClose = true;
                            webvpnLoginBounce = true;
                            android.util.Log.i("CaucWV", "教务登录页（免登失效）→ 自动关闭交回 JS 重取免登链");
                            finishWith(false);
                            return;
                        }
                        if (hh.equals("webvpn.cauc.edu.cn")
                                && (pp.contains("/auth/login") || pp.contains("/por/login")
                                    || pp.contains("login_psw"))) {
                            triedBounceClose = true;
                            webvpnLoginBounce = true;
                            android.util.Log.i("CaucWV", "WebVPN 登录弹跳 → 自动关闭交回 JS 重登");
                            finishWith(false);
                            return;
                        }
                    } catch (Throwable ignored) {}
                }
                try {
                    if (u != null && u.contains("jwgl")) {
                        view.evaluateJavascript(
                            "(function(){"
                          + " var s=document.getElementById('cauc-unify-top');"
                          + " if(!s){s=document.createElement('style');s.id='cauc-unify-top';"
                          + "  (document.head||document.documentElement).appendChild(s);}"
                          + " s.innerHTML='#show-head{display:none!important}'"
                          + "  +'#bodyContainer{padding-top:0!important;margin-top:0!important}'"
                          + "  +'body{padding-top:0!important;margin-top:0!important}'"
                          + "  +'.top2{margin-top:0!important}';"
                          + "})()", null);
                    }
                } catch (Throwable ignored) {}
                if (browseMode && u != null) {
                    String lu = u.toLowerCase();
                    boolean selfLoggedIn =
                            lu.indexOf("/self/dashboard") >= 0
                            || lu.indexOf("getonlinelist") >= 0
                            || lu.indexOf("/self/setting") >= 0
                            || lu.indexOf("/self/index") >= 0;
                    boolean stillOnLogin = lu.indexOf("login") >= 0;
                    if (selfLoggedIn && !stillOnLogin) {
                        try {
                            String host = u.replaceFirst("^https?://", "").split("/")[0];
                            String ck = android.webkit.CookieManager.getInstance()
                                    .getCookie("https://" + host + "/");
                            if (ck != null && ck.length() > 0) {
                                com.hangda.campus.CookieVault.save(
                                        LoginWebViewActivity.this, host, ck);
                            }
                        } catch (Exception ignored) {}
                        android.util.Log.i("CaucWV", "检测到自助服务已登录 → 自动返回 App");
                        finishWith(true);
                        return;
                    }
                }
                if (browseMode && !triedFallback) {
                    try {
                        view.evaluateJavascript(REJECT_JS, new android.webkit.ValueCallback<String>() {
                            @Override public void onReceiveValue(String v) {
                                if (triedFallback) return;
                                boolean hit = v != null && v.indexOf('1') >= 0;
                                if (!hit) return;
                                triedFallback = true;
                                webvpnRejected = true;
                                String fb = getIntent().getStringExtra(EXTRA_FALLBACK_URL);
                                if (fb != null && fb.length() > 0) {
                                    android.util.Log.i("CaucWV", "检测到 WebVPN 拒绝页 → 静默改用校内直连");
                                    view.loadUrl(fb);
                                } else {
                                    android.util.Log.i("CaucWV", "检测到 WebVPN 拒绝页（无备用地址）");
                                }
                            }
                        });
                    } catch (Exception ignored) {}
                }
                unmaskPasswords();
                prefill();
                try {
                    view.evaluateJavascript(WV_CAPTURE_HOOK_JS, null);
                } catch (Exception ignored) {}
                handler.postDelayed(new Runnable() {
                    @Override public void run() { checkLogin(); }
                }, 800);
            }
        });
        webView.setDownloadListener(new android.webkit.DownloadListener() {
            @Override
            public void onDownloadStart(String url, String userAgent,
                                        String contentDisposition, String mimetype, long len) {
                android.util.Log.i("CaucWV", "download: " + url + " mime=" + mimetype + " cd=" + contentDisposition);
                final String f = Downloads.guessName(url, contentDisposition);
                Toast.makeText(LoginWebViewActivity.this,
                        "开始下载：" + f, Toast.LENGTH_SHORT).show();
                new Thread(new Runnable() {
                    @Override public void run() {
                        try {
                            final Downloads.Result r = Downloads.save(LoginWebViewActivity.this, url, f);
                            runOnUiThread(new Runnable() {
                                @Override public void run() {
                                    Toast.makeText(LoginWebViewActivity.this,
                                            "已保存到 " + r.path, Toast.LENGTH_LONG).show();
                                }
                            });
                        } catch (final Exception e) {
                            runOnUiThread(new Runnable() {
                                @Override public void run() {
                                    Toast.makeText(LoginWebViewActivity.this,
                                            "下载失败：" + e.getMessage(), Toast.LENGTH_LONG).show();
                                }
                            });
                        }
                    }
                }).start();
            }
        });
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                if (progressBar == null) return;
                if (newProgress < 100) {
                    progressBar.setVisibility(View.VISIBLE);
                    progressBar.setProgress(newProgress);
                } else {
                    progressBar.setProgress(100);
                    progressBar.setVisibility(View.GONE);
                }
            }

            @Override
            public boolean onJsAlert(WebView view, String url, String message,
                                     android.webkit.JsResult result) {
                android.util.Log.i("CaucJsDlg", "alert: " + message);
                try { result.confirm(); } catch (Throwable ignored) {}
                return true;
            }

            @Override
            public boolean onJsConfirm(WebView view, String url, String message,
                                       android.webkit.JsResult result) {
                android.util.Log.i("CaucJsDlg", "confirm: " + message);
                try { result.confirm(); } catch (Throwable ignored) {}
                return true;
            }

            @Override
            public boolean onJsPrompt(WebView view, String url, String message,
                                      String defaultValue,
                                      android.webkit.JsPromptResult result) {
                android.util.Log.i("CaucJsDlg", "prompt: " + message + " 默认=" + defaultValue);
                String ret = defaultValue;
                if (message != null && message.startsWith("gap_init:")) {
                    ret = message.substring("gap_init:".length());
                }
                try { result.confirm(ret); } catch (Throwable ignored) {}
                return true;
            }
        });

        androidx.core.view.ViewCompat.setOnApplyWindowInsetsListener(webView,
            new androidx.core.view.OnApplyWindowInsetsListener() {
                @Override public androidx.core.view.WindowInsetsCompat onApplyWindowInsets(
                        View v, androidx.core.view.WindowInsetsCompat insets) {
                    int b = insets.getInsets(
                        androidx.core.view.WindowInsetsCompat.Type.systemBars()).bottom;
                    if (v.getPaddingBottom() != b) {
                        v.setPadding(v.getPaddingLeft(), v.getPaddingTop(), v.getPaddingRight(), b);
                    }
                    return insets;
                }
            });

        root.addView(webView, new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f));

        setContentView(root);

        syncHubToWebViewNow();

        String postData = getIntent().getStringExtra(EXTRA_POST_DATA);
        if (url != null) {
            if (postData != null && postData.length() > 0) {
                try {
                    webView.postUrl(url, postData.getBytes("UTF-8"));
                } catch (Throwable t) {
                    webView.loadUrl(url);
                }
            } else {
                webView.loadUrl(url);
            }
        }
        handler.postDelayed(poll, 1500);
    }

    private static final String PREFILL_JS =
        "(function(u,p){" +
        "  function fire(el){['input','change','keyup','blur'].forEach(function(t){" +
        "    try{el.dispatchEvent(new Event(t,{bubbles:true}));}catch(e){}});}" +
        "  function setVal(el,v){" +
        "    try{var d=Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el),'value');" +
        "      if(d&&d.set){d.set.call(el,v);}else{el.value=v;}}" +
        "    catch(e){try{el.value=v;}catch(e2){}}" +
        "    fire(el); }" +
        "  function bySel(list){for(var i=0;i<list.length;i++){var el=document.querySelector(list[i]);" +
        "    if(el&&!el.disabled)return el;}return null;}" +
        "  function byKey(words,onlyText){var ins=document.querySelectorAll('input');" +
        "    for(var i=0;i<ins.length;i++){var e=ins[i];if(e.disabled)continue;" +
        "      if(onlyText&&e.type&&e.type!=='text'&&e.type!=='tel')continue;" +
        "      var s=(String(e.placeholder||'')+' '+String(e.name||'')+' '+String(e.id||'')).toLowerCase();" +
        "      for(var k=0;k<words.length;k++){if(s.indexOf(words[k])>=0)return e;}}return null;}" +
        "  var uEl=bySel(['#form_item_userName','input[name=username]','input[name=userName]','input[name=yhm]','#username','input[name=account]','input[name=loginName]'])" +
        "      ||byKey(['user','account','login','用户名','账号','学号','工号'],true)" +
        "      ||bySel(['input[type=text]','input[type=tel]']);" +
        "  var pEl=bySel(['#form_item_password','input[name=password]','input[name=upass]','#mm','input[name=mm]','#password','#pwd'])" +
        "      ||byKey(['pass','pwd','密码'],false)" +
        "      ||bySel(['input[type=password]']);" +
        "  var okU=false,okP=false;" +
        "  if(uEl&&u&&!uEl.value){setVal(uEl,u);okU=true;}" +
        "  if(pEl&&p&&pEl!==uEl&&!pEl.value){setVal(pEl,p);okP=true;}" +
        "  return (okU||okP)?'filled':((uEl||pEl)?'already':'notfound');" +
        "})(%s,%s)";

    private void prefill() {
        final String u = getIntent().getStringExtra(EXTRA_USER);
        final String pw = getIntent().getStringExtra(EXTRA_PWD);
        if (u == null || u.length() == 0 || webView == null) return;
        final String js = String.format(java.util.Locale.US, PREFILL_JS,
                org.json.JSONObject.quote(u), org.json.JSONObject.quote(pw == null ? "" : pw));
        final int[] tries = { 0 };
        Runnable r = new Runnable() {
            @Override public void run() {
                if (closed || webView == null) return;
                try {
                    webView.evaluateJavascript(js, new ValueCallback<String>() {
                        @Override public void onReceiveValue(String v) {
                            android.util.Log.i("CaucLogin", "[prefill] " + v);
                            boolean onLoginPage = !looksLoggedIn(webView.getUrl());
                            if (v != null && v.contains("notfound") && onLoginPage && hintView != null) {
                                hintView.setText("未自动识别到输入框，请手动输入");
                            }
                        }
                    });
                } catch (Exception ignored) {}
                if (autoSubmit) {
                    handler.postDelayed(new Runnable() {
                        @Override public void run() { autoSubmitForm(); }
                    }, 450);
                }
                tries[0]++;
                if (tries[0] < 15 && !looksLoggedIn(webView.getUrl())) {
                    handler.postDelayed(this, 800);
                }
            }
        };
        handler.postDelayed(r, 300);
    }

    private boolean looksLoggedIn(String u) {
        if (u == null) return false;
        String low = u.toLowerCase();
        if (low.contains("login") || low.contains("logon") || low.contains("/cas")
                || low.contains("authcenter") || low.contains("sso") || low.contains("oauth")
                || low.contains("/auth")) {
            return false;
        }
        if (low.contains("site-nav")) return true;
        for (String d : domains) {
            String suffix = "." + d.toLowerCase();
            if (low.startsWith("http://") || low.startsWith("https://")) {
                String host = low.replaceFirst("^https?://", "").split("/")[0];
                if (host.endsWith(suffix) && host.length() > suffix.length()) return true;
            }
        }
        return false;
    }

    private boolean hasCookie() {
        CookieManager cm = CookieManager.getInstance();
        for (String d : domains) {
            String c = null;
            try { c = cm.getCookie("https://" + d + "/"); } catch (Exception ignored) {}
            if (c == null || c.length() == 0) {
                try { c = cm.getCookie("http://" + d + "/"); } catch (Exception ignored) {}
            }
            if (c != null && c.length() > 0) return true;
        }
        return false;
    }

    private static String normalizeUrlPath(String u) {
        if (u == null) return null;
        try {
            String s = u.trim();
            int i = s.indexOf("://");
            int authStart = (i < 0) ? 0 : i + 3;
            int pathStart = s.indexOf('/', authStart);
            if (pathStart < 0) return s;
            int end = s.length();
            int q = s.indexOf('?', pathStart); if (q >= 0) end = Math.min(end, q);
            int h = s.indexOf('#', pathStart); if (h >= 0) end = Math.min(end, h);
            String head = s.substring(0, pathStart);
            String path = s.substring(pathStart, end).replaceAll("/{2,}", "/");
            return head + path + s.substring(end);
        } catch (Throwable t) {
            return u;
        }
    }

    private static String mapCampusUrl(String url) {
        try {
            java.net.URI uri = java.net.URI.create(url);
            String scheme = uri.getScheme() == null ? "" : uri.getScheme().toLowerCase();
            if (!scheme.equals("http") && !scheme.equals("https")) return null;
            String host = uri.getHost() == null ? "" : uri.getHost().toLowerCase();
            if (host.endsWith(".webvpn.cauc.edu.cn")
                    || host.equals("webvpn.cauc.edu.cn")) return null;
            if (!host.endsWith(".cauc.edu.cn") && !isIntranetHost(host)) return null;
            int port = uri.getPort();
            if (port <= 0) port = scheme.equals("https") ? 443 : 80;
            String mappedHost = scheme + "-" + host.replace("-", "--").replace(".", "-") + "-" + port
                    + ".webvpn.cauc.edu.cn";
            String path = uri.getRawPath() == null ? "/" : uri.getRawPath();
            path = path.replaceAll("/{2,}", "/");
            String query = uri.getRawQuery();
            return "https://" + mappedHost + path + (query == null ? "" : "?" + query);
        } catch (Throwable t) {
            return null;
        }
    }

    private static boolean isIntranetHost(String h) {
        if (h == null || h.isEmpty() || h.indexOf(':') >= 0) return false;
        try {
            String[] p = h.split("\\.");
            if (p.length != 4) return false;
            int[] v = new int[4];
            for (int i = 0; i < 4; i++) {
                v[i] = Integer.parseInt(p[i]);
                if (v[i] < 0 || v[i] > 255) return false;
            }
            if (v[0] == 10) return true;
            if (v[0] == 192 && v[1] == 168) return true;
            if (v[0] == 172 && v[1] >= 16 && v[1] <= 31) return true;
            return false;
        } catch (Throwable t) {
            return false;
        }
    }

    private static void harvestToHub(String url) {
        try {
            if (url == null) return;
            String host = android.net.Uri.parse(url).getHost();
            if (host == null) return;
            String hl = host.toLowerCase();
            if (!hl.equals("cauc.edu.cn") && !hl.endsWith(".cauc.edu.cn")) return;
            String raw = android.webkit.CookieManager.getInstance().getCookie(url);
            if (raw == null || raw.isEmpty()) return;
            for (String pair : raw.split("; ")) {
                int eq = pair.indexOf('=');
                if (eq <= 0) continue;
                CookieHub.Cookie ck = new CookieHub.Cookie();
                ck.name = pair.substring(0, eq).trim();
                ck.value = pair.substring(eq + 1);
                ck.domain = hl;
                ck.path = "/";
                ck.expires = -1;
                CookieHub.put(ck);
            }
        } catch (Throwable ignored) {}
    }

    private static void syncHubToWebViewNow() {
        try {
            org.json.JSONArray arr = CookieHub.dump(null);
            if (arr.length() == 0) return;
            android.webkit.CookieManager cm = android.webkit.CookieManager.getInstance();
            cm.setAcceptCookie(true);
            for (int i = 0; i < arr.length(); i++) {
                try {
                    org.json.JSONObject o = arr.getJSONObject(i);
                    String d = o.optString("domain"), nm = o.optString("name"), v = o.optString("value");
                    String p = o.optString("path", "/");
                    if (d == null || d.isEmpty() || nm == null || nm.isEmpty()) continue;
                    String host = d.startsWith(".") ? d.substring(1) : d;
                    if (host.isEmpty()) continue;
                    String cookie = nm + "=" + v + "; Path=" + (p == null || p.isEmpty() ? "/" : p)
                            + "; Domain=" + d;
                    cm.setCookie("https://" + host + "/", cookie);
                } catch (Exception ignored) {}
            }
            cm.flush();
        } catch (Throwable ignored) {}
    }

    private static void injectFromHub(String url) {
        try {
            if (url == null) return;
            String host = android.net.Uri.parse(url).getHost();
            if (host == null) return;
            String hl = host.toLowerCase();
            if (!hl.equals("cauc.edu.cn") && !hl.endsWith(".cauc.edu.cn")) return;
            String cookie = CookieHub.headerFor(url);
            if (cookie == null || cookie.isEmpty()) return;
            android.webkit.CookieManager cm = android.webkit.CookieManager.getInstance();
            cm.setAcceptCookie(true);
            for (String pair : cookie.split("; ")) {
                int eq = pair.indexOf('=');
                if (eq <= 0) continue;
                String n = pair.substring(0, eq).trim();
                String val = pair.substring(eq + 1);
                if (n.isEmpty()) continue;
                if ("webvpn-token".equals(n)) {
                    cm.setCookie("https://cauc.edu.cn/", n + "=" + val + "; Path=/; Domain=cauc.edu.cn");
                } else {
                    cm.setCookie("https://" + hl + "/", n + "=" + val + "; Path=/; Domain=" + hl);
                }
            }
        } catch (Throwable ignored) {}
    }

    private boolean checkLogin() {
        if (closed) return true;
        if (browseMode) return false;
        String cur = webView == null ? null : webView.getUrl();
        if (looksLoggedIn(cur) && hasCookie()) {
            if (hintView != null) {
                hintView.setText("✓ 已检测到登录状态，正在返回…");
                hintView.setBackgroundColor(Color.parseColor("#E8F7EE"));
                hintView.setTextColor(Color.parseColor("#1B7A3D"));
            }
            handler.postDelayed(new Runnable() {
                @Override public void run() { finishWith(true); }
            }, 1200);
            return true;
        }
        return false;
    }

    private void finishWith(final boolean ok) {
        if (closed) return;
        closed = true;
        try { handler.removeCallbacksAndMessages(null); } catch (Exception ignored) {}


        final android.content.Context appCtx = getApplicationContext();
        final String finalUrl = webView == null ? "" : String.valueOf(webView.getUrl());
        final boolean rejected = webvpnRejected;
        final boolean bounce = webvpnLoginBounce;
        final java.util.List<String> doms = new java.util.ArrayList<String>();
        if (domains != null) for (String d : domains) if (d != null && d.length() > 0) doms.add(d);

        new Thread(new Runnable() {
            @Override public void run() {
                JSONObject cookies = new JSONObject();
                try {
                    CookieManager cm = CookieManager.getInstance();
                    cm.flush();

                    java.util.List<String> all = new java.util.ArrayList<String>(doms);
                    try {
                        if (finalUrl != null && finalUrl.length() > 0) {
                            String h = finalUrl.replaceFirst("^https?://", "").split("/")[0];
                            int colon = h.indexOf(':');
                            if (colon > 0) h = h.substring(0, colon);
                            if (h.length() > 0 && !all.contains(h)) all.add(h);
                        }
                    } catch (Exception ignored) {}

                    for (String d : all) {
                        String c = null;
                        try { c = cm.getCookie("https://" + d + "/"); } catch (Exception ignored) {}
                        if (c == null || c.length() == 0) {
                            try { c = cm.getCookie("http://" + d + "/"); } catch (Exception ignored) {}
                        }
                        cookies.put(d, c == null ? "" : c);
                        if (c != null && c.length() > 0) CookieVault.save(appCtx, d, c);
                    }
                    if (ok) CookieVault.restore(appCtx);
                } catch (Exception ignored) {}

                final String payload = cookies.toString();
                runOnUiThread(new Runnable() {
                    @Override public void run() {
                        deliverResult(ok, payload, finalUrl, rejected, bounce);
                    }
                });
            }
        }, "cookie-harvest").start();
    }

    private void deliverResult(boolean ok, String cookiesJson, String finalUrl,
                               boolean rejected, boolean bounce) {
        try {
            Intent data = new Intent();
            data.putExtra(EXTRA_COOKIES, cookiesJson);
            data.putExtra(EXTRA_FINAL_URL, finalUrl);
            data.putExtra(EXTRA_WV_REJECTED, rejected);
            data.putExtra(EXTRA_WV_LOGIN_BOUNCE, bounce);
            setResult(ok ? Activity.RESULT_OK : Activity.RESULT_CANCELED, data);
        } catch (Throwable ignored) {}
        try { finish(); } catch (Throwable ignored) {}
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            finishWith(false);
        }
    }

    private void applyBarTheme(boolean dark) {
        try { if (topBar != null) topBar.setBackgroundColor(dark ? ShellBar.BAR_BG_DARK : ShellBar.BAR_BG); }
        catch (Throwable ignored) {}
        int ink = dark ? ShellBar.INK_DARK : ShellBar.INK;
        try {
            for (int i = 0; i < topIcons.size(); i++) topIcons.get(i).setColorFilter(ink);
        } catch (Throwable ignored) {}
        try { if (titleView != null) titleView.setTextColor(ink); } catch (Throwable ignored) {}
        try { if (hintView != null) hintView.setTextColor(dark ? 0xFF8C97AE : 0xFF6B7280); } catch (Throwable ignored) {}
        try { if (pageRoot != null) pageRoot.setBackgroundColor(dark ? Immersive.DARK_BG : Color.WHITE); }
        catch (Throwable ignored) {}
    }

    @Override
    public void onConfigurationChanged(android.content.res.Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        boolean dark = (newConfig.uiMode & android.content.res.Configuration.UI_MODE_NIGHT_MASK)
                == android.content.res.Configuration.UI_MODE_NIGHT_YES;
        try { Immersive.apply(this, dark); } catch (Throwable ignored) {}
        applyBarTheme(dark);
    }

    @Override
    protected void onDestroy() {
        closed = true;
        try { handler.removeCallbacksAndMessages(null); } catch (Exception ignored) {}
        if (webView != null) {
            try {
                webView.stopLoading();
                try {
                    android.view.ViewParent p = webView.getParent();
                    if (p instanceof android.view.ViewGroup) ((android.view.ViewGroup) p).removeView(webView);
                } catch (Throwable ignored) {}
                webView.removeAllViews();
                webView.destroy();
            } catch (Exception ignored) {}
        }
        super.onDestroy();
    }
}
