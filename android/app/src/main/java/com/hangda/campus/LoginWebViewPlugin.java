package com.hangda.campus;
import android.app.Activity;
import android.content.Intent;
import android.webkit.CookieManager;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.ArrayList;
import java.util.List;
@CapacitorPlugin(name = "LoginWebView")
public class LoginWebViewPlugin extends Plugin {
    @PluginMethod
    public void openPost(PluginCall call) {
        String url = call.getString("url");
        if (url == null || url.length() == 0) { call.reject("url is required"); return; }
        JSObject fields = call.getObject("fields");
        StringBuilder sb = new StringBuilder();
        if (fields != null) {
            java.util.Iterator<String> it = fields.keys();
            while (it.hasNext()) {
                String k = it.next();
                String v = "";
                try { v = String.valueOf(fields.get(k)); } catch (Exception ignored) {}
                try {
                    if (sb.length() > 0) sb.append('&');
                    sb.append(java.net.URLEncoder.encode(k, "UTF-8"))
                      .append('=')
                      .append(java.net.URLEncoder.encode(v, "UTF-8"));
                } catch (Exception ignored) {}
            }
        }
        android.app.Activity act0 = getActivity();
        if (act0 == null) { call.reject("activity-gone"); return; }
        Intent intent = new Intent(act0, LoginWebViewActivity.class);
        intent.putExtra(LoginWebViewActivity.EXTRA_URL, url);
        intent.putExtra(LoginWebViewActivity.EXTRA_POST_DATA, sb.toString());
        intent.putExtra(LoginWebViewActivity.EXTRA_TITLE, call.getString("title", "支付"));
        intent.putExtra(LoginWebViewActivity.EXTRA_BROWSE, true);   
        startActivityForResult(call, intent, "handleLoginResult");
    }
    @PluginMethod
    public void downloadToDownloads(PluginCall call) {
        String url = call.getString("url");
        if (url == null || url.length() == 0) { call.reject("url is required"); return; }
        String filename = call.getString("filename");
        JSObject fields = call.getObject("fields");
        String postBody = null;
        if (fields != null && fields.keys().hasNext()) {
            StringBuilder sb = new StringBuilder();
            java.util.Iterator<String> it = fields.keys();
            while (it.hasNext()) {
                String k = it.next();
                String v = "";
                try { v = String.valueOf(fields.get(k)); } catch (Exception ignored) {}
                try {
                    if (sb.length() > 0) sb.append('&');
                    sb.append(java.net.URLEncoder.encode(k, "UTF-8"))
                      .append('=')
                      .append(java.net.URLEncoder.encode(v, "UTF-8"));
                } catch (Exception ignored) {}
            }
            postBody = sb.toString();
        }
        try {
            Downloads.Result r = Downloads.save(getContext(), url, filename, postBody);
            JSObject ret = new JSObject();
            ret.put("ok", true);
            ret.put("path", r.path);
            ret.put("bytes", r.bytes);
            ret.put("mime", r.mime == null ? "" : r.mime);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("download-failed", e.getMessage());
        }
    }
    @PluginMethod
    public void open(PluginCall call) {
        String url = call.getString("url");
        if (url == null || url.length() == 0) {
            call.reject("url is required");
            return;
        }
        android.app.Activity actO = getActivity();
        if (actO == null) { call.reject("activity-gone"); return; }
        Intent intent = new Intent(actO, LoginWebViewActivity.class);
        intent.putExtra(LoginWebViewActivity.EXTRA_URL, url);
        intent.putExtra(LoginWebViewActivity.EXTRA_TITLE, call.getString("title", "登录"));
        JSArray arr = call.getArray("domains");
        List<String> ds = new ArrayList<String>();
        if (arr != null) {
            for (int i = 0; i < arr.length(); i++) {
                try {
                    String v = arr.getString(i);
                    if (v != null && v.length() > 0) ds.add(v);
                } catch (Exception ignored) {}
            }
        }
        intent.putExtra(LoginWebViewActivity.EXTRA_DOMAINS, ds.toArray(new String[0]));
        intent.putExtra(LoginWebViewActivity.EXTRA_USER, call.getString("user", ""));
        intent.putExtra(LoginWebViewActivity.EXTRA_PWD, call.getString("pwd", ""));
        intent.putExtra(LoginWebViewActivity.EXTRA_AUTO, call.getBoolean("auto", false));
        intent.putExtra(LoginWebViewActivity.EXTRA_BROWSE, call.getBoolean("browse", false));
        intent.putExtra(LoginWebViewActivity.EXTRA_MAP_CAMPUS, call.getBoolean("mapCampus", false));
        intent.putExtra(LoginWebViewActivity.EXTRA_FALLBACK_URL, call.getString("fallbackUrl", ""));
        startActivityForResult(call, intent, "handleLoginResult");
    }
    @ActivityCallback
    private void handleLoginResult(PluginCall call, ActivityResult result) {
        if (call == null) return;
        JSObject ret = new JSObject();
        boolean ok = result.getResultCode() == Activity.RESULT_OK;
        ret.put("ok", ok);
        Intent data = result.getData();
        if (data != null) {
            ret.put("cookies", data.getStringExtra(LoginWebViewActivity.EXTRA_COOKIES));
            ret.put("url", data.getStringExtra(LoginWebViewActivity.EXTRA_FINAL_URL));
            ret.put("webvpnRejected",
                data.getBooleanExtra(LoginWebViewActivity.EXTRA_WV_REJECTED, false));
            ret.put("webvpnLoginBounce",
                data.getBooleanExtra(LoginWebViewActivity.EXTRA_WV_LOGIN_BOUNCE, false));
        }
        call.resolve(ret);
    }
    private static final String SILENT_PREFILL_JS =
        "(function(u,p){" +
        "  function fire(el){['input','change','keyup','blur'].forEach(function(t){try{el.dispatchEvent(new Event(t,{bubbles:true}));}catch(e){}});}" +
        "  function setVal(el,v){try{var d=Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el),'value');if(d&&d.set){d.set.call(el,v);}else{el.value=v;}}catch(e){try{el.value=v;}catch(e2){}}fire(el);}" +
        "  function bySel(list){for(var i=0;i<list.length;i++){var el=document.querySelector(list[i]);if(el&&!el.disabled)return el;}return null;}" +
        "  function byKey(words,onlyText){var ins=document.querySelectorAll('input');" +
        "    for(var i=0;i<ins.length;i++){var e=ins[i];if(e.disabled)continue;" +
        "      if(onlyText&&e.type&&e.type!=='text'&&e.type!=='tel')continue;" +
        "      var s=(String(e.placeholder||'')+' '+String(e.name||'')+' '+String(e.id||'')).toLowerCase();" +
        "      for(var k=0;k<words.length;k++){if(s.indexOf(words[k])>=0)return e;}}return null;}" +
        "  var uEl=bySel(['#form_item_userName','input[name=username]','input[name=userName]','input[name=yhm]','#username'])" +
        "      ||byKey(['user','account','login','用户名','账号','学号'],true)||document.querySelector('input[type=text]');" +
        "  var pEl=bySel(['#form_item_password','input[name=password]','input[name=upass]','#password','#pwd'])" +
        "      ||byKey(['pass','pwd','密码'],false)||document.querySelector('input[type=password]');" +
        "  if(uEl&&u&&!uEl.value){setVal(uEl,u);}" +
        "  if(pEl&&p&&pEl!==uEl&&!pEl.value){setVal(pEl,p);}" +
        "  return (uEl?('u'+(String(uEl.value||'').length)):'-')+'/'+(pEl?('p'+(String(pEl.value||'').length)):'-');" +
        "})(%s,%s)";
    private static final String SILENT_SUBMIT_JS =
        "(function(){try{" +
        "  function vis(el){try{var r=el.getBoundingClientRect();return r.width>0&&r.height>0;}catch(e){return false;}}" +
        "  function txt(b){try{return String(b.innerText||b.textContent||b.value||b.getAttribute('aria-label')||'').replace(/\\s+/g,'');}catch(e){return '';}}" +
        "  function bySel(list){for(var i=0;i<list.length;i++){var el=document.querySelector(list[i]);if(el&&!el.disabled)return el;}return null;}" +
        "  var uEl=bySel(['#form_item_userName','input[name=username]','input[type=text]']);" +
        "  var pEl=bySel(['#form_item_password','input[name=password]','input[type=password]']);" +
        "  if(!uEl||!String(uEl.value||'').length) return 'no-user';" +
        "  var btns=document.querySelectorAll('button,input[type=submit],a[role=button],[class*=btn],[class*=Button],[class*=login],[class*=Login]');" +
        "  var re=/^(登录|登入|提交|确定|立即登录|Login|LogIn|SignIn|Submit|Next|Continue|下一步|继续)$/i;" +
        "  for(var pass=0;pass<2;pass++){" +
        "    for(var i=0;i<btns.length;i++){var b=btns[i];" +
        "      if(b.disabled||b.__autoClicked) continue;" +
        "      if(pass===0&&!vis(b)) continue;" +
        "      var t=txt(b);" +
        "      if(re.test(t)){b.__autoClicked=true;try{b.click();}catch(e){try{b.dispatchEvent(new MouseEvent('click',{bubbles:true}));}catch(e2){}}return 'clicked:'+t;}}}" +
        "  var f=document.querySelector('form');" +
        "  if(f&&!f.__autoSubmitted){f.__autoSubmitted=true;try{if(f.requestSubmit){f.requestSubmit();}else{f.submit();}return 'form';}catch(e){}}" +
        "  return 'nobtn';" +
        "}catch(e){return 'err';}})()";
    private static final String REJECT_JS =
        "(function(){try{var t=document.body?String(document.body.innerText||''):'';" +
        "if(t.length>4000)t=t.slice(0,4000);" +
        "var hasForm=document.querySelectorAll('input').length>0;" +
        "var hit=/仅限[^。]{0,10}校外使用|访问权限提示|不允许登录|无权访问该系统|请通过.{0,10}学校主页/.test(t);" +
        "return (hit&&!hasForm)?'1':'0';" +
        "}catch(e){return '0';}})()";
    @PluginMethod
    public void setCookie(final PluginCall call) {
        String url = call.getString("url", "https://webvpn.cauc.edu.cn/");
        String cookie = call.getString("cookie", "");
        android.webkit.CookieManager cm = android.webkit.CookieManager.getInstance();
        cm.setAcceptCookie(true);
        boolean ok = true;
        try { cm.setCookie(url, cookie); cm.flush(); } catch (Exception e) { ok = false; }
        JSObject ret = new JSObject();
        ret.put("ok", ok);
        call.resolve(ret);
    }
    @Override
    public void load() {
        super.load();
        try { CookieHub.init(getContext()); } catch (Exception ignored) {}
    }
    @PluginMethod
    public void hubHeader(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("cookie", CookieHub.headerFor(call.getString("url", "")));
        call.resolve(ret);
    }
    @PluginMethod
    public void hubIngest(PluginCall call) {
        String url = call.getString("url", "");
        JSArray arr = call.getArray("setCookie");
        List<String> list = new ArrayList<String>();
        if (arr != null) {
            for (int i = 0; i < arr.length(); i++) {
                try {
                    String v = arr.getString(i);
                    if (v != null && v.length() > 0) list.add(v);
                } catch (Exception ignored) {}
            }
        }
        CookieHub.ingest(url, list);
        call.resolve();
    }
    @PluginMethod
    public void hubDump(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("cookies", CookieHub.dump(call.getString("domain", null)));
        call.resolve(ret);
    }
    @PluginMethod
    public void hubClear(PluginCall call) {
        CookieHub.clearAll();
        call.resolve();
    }
    @PluginMethod
    public void setMapCampus(PluginCall call) {
        LoginWebViewActivity.setMapCampusGlobal(call.getBoolean("on", false));
        JSObject ret = new JSObject();
        ret.put("ok", true);
        ret.put("on", call.getBoolean("on", false));
        call.resolve(ret);
    }
    @PluginMethod
    public void hubSyncToWebView(PluginCall call) {
        android.webkit.CookieManager cm = android.webkit.CookieManager.getInstance();
        cm.setAcceptCookie(true);
        int n = 0;
        try {
            org.json.JSONArray arr = CookieHub.dump(null);
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
                    n++;
                } catch (Exception ignored) {}
            }
            cm.flush();
        } catch (Exception ignored) {}
        JSObject ret = new JSObject();
        ret.put("ok", true);
        ret.put("count", n);
        call.resolve(ret);
    }
    @PluginMethod
    public void clearWebvpnCookies(final PluginCall call) {
        android.webkit.CookieManager cm = android.webkit.CookieManager.getInstance();
        int cleared = 0;
        String[] domains = new String[] {
            "https://webvpn.cauc.edu.cn",
            "https://https-www-cauc-edu-cn-443.webvpn.cauc.edu.cn",
            "http://http-www-cauc-edu-cn-80.webvpn.cauc.edu.cn",
            "https://http-jwgl-cauc-edu-cn-80.webvpn.cauc.edu.cn",
            "http://jwgl.cauc.edu.cn",
            "https://www.cauc.edu.cn"
        };
        String[] names = new String[] { "webvpn-token", "route" };
        String[] parentNames = new String[] { "webvpn-token" };
        try {
            cm.setAcceptCookie(true);
            for (String d : domains) {
                String host = null;
                try { host = android.net.Uri.parse(d).getHost(); } catch (Exception ignored) {}
                for (String n : names) {
                    try {
                        String base = d.endsWith("/") ? d : d + "/";
                        String probe = null;
                        if (cm.getCookie(base) != null && cm.getCookie(base).indexOf(n) >= 0) probe = base;
                        else if (cm.getCookie(d) != null && cm.getCookie(d).indexOf(n) >= 0) probe = d;
                        if (probe == null) continue;
                        String exp = "Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT";
                        cm.setCookie(probe, n + "=; Path=/; " + exp);
                        if (host != null) cm.setCookie(probe, n + "=; Path=/; Domain=" + host + "; " + exp);
                        if (java.util.Arrays.asList(parentNames).contains(n)) {
                            cm.setCookie("https://cauc.edu.cn/", n + "=; Path=/; Domain=cauc.edu.cn; " + exp);
                            cm.setCookie("https://cauc.edu.cn/", n + "=; Path=/; Domain=.cauc.edu.cn; " + exp);
                        }
                        cleared++;
                    } catch (Exception ignored) {}
                }
            }
            cm.flush();
            try { com.hangda.campus.CookieVault.dropName(getContext(), "webvpn-token"); } catch (Throwable ignored) {}
            boolean still = false;
            for (String d : domains) {
                try {
                    String base = d.endsWith("/") ? d : d + "/";
                    String c = cm.getCookie(base);
                    if (c != null) {
                        for (String n : names) if (c.indexOf(n) >= 0) { still = true; break; }
                    }
                } catch (Exception ignored) {}
                if (still) break;
            }
            if (still) {
                android.util.Log.w("CaucWv", "clearWebvpnCookies: 仍有残留，按零破坏策略跳过全清");
            }
        } catch (Exception ignored) {}
        JSObject ret = new JSObject();
        ret.put("ok", true);
        ret.put("cleared", cleared);
        call.resolve(ret);
    }
    @PluginMethod
    public void silentLogin(final PluginCall call) {
        final String url = call.getString("url", "https://webvpn.cauc.edu.cn/");
        final String user = call.getString("user", "");
        final String pwd = call.getString("pwd", "");
        final int timeoutMs = call.getInt("timeout", 35000);
        final PluginCall c = call;
        final android.app.Activity actSL = getActivity();
        if (actSL == null) { call.reject("activity-gone"); return; }
        actSL.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                try {
                    android.webkit.CookieManager.getInstance().setAcceptCookie(true);
                    final android.webkit.WebView wv = new android.webkit.WebView(getActivity());
                    wv.getSettings().setJavaScriptEnabled(true);
                    wv.getSettings().setDomStorageEnabled(true);
                    wv.getSettings().setUserAgentString(
                        wv.getSettings().getUserAgentString() + "lantuMobilecampus lantuMC");
                    try { android.webkit.CookieManager.getInstance().setAcceptThirdPartyCookies(wv, true); } catch (Exception ignored) {}
                    final boolean[] done = { false };
                    final boolean[] submitted = { false };
                    final int[] submitCount = { 0 };
                    final long[] lastSubmitAt = { 0L };
                    final boolean[] loggedHint = { false };
                    final android.os.Handler h = new android.os.Handler(android.os.Looper.getMainLooper());
                    final Runnable finishOk = new Runnable() {
                        @Override public void run() {
                            if (done[0]) return;
                            done[0] = true;
                            JSObject ret = new JSObject();
                            ret.put("ok", true);
                            ret.put("finalUrl", String.valueOf(wv.getUrl()));
                            String ck = android.webkit.CookieManager.getInstance().getCookie("https://webvpn.cauc.edu.cn/");
                            ret.put("cookies", ck == null ? "" : ck);
                            try { wv.destroy(); } catch (Exception ignored) {}
                            c.resolve(ret);
                        }
                    };
                    final Runnable poll = new Runnable() {
                        @Override public void run() {
                            if (done[0]) return;
                            String cur = String.valueOf(wv.getUrl()).toLowerCase();
                            try {
                                wv.evaluateJavascript(REJECT_JS, new android.webkit.ValueCallback<String>() {
                                    @Override public void onReceiveValue(String rv) {
                                        if (done[0] || rv == null || rv.indexOf('1') < 0) return;
                                        done[0] = true;
                                        android.util.Log.i("CaucSilent", "[reject] WebVPN 拒绝页（校内网络）");
                                        JSObject ret = new JSObject();
                                        ret.put("ok", false);
                                        ret.put("reason", "not-allowed");
                                        ret.put("finalUrl", String.valueOf(wv.getUrl()));
                                        try { wv.destroy(); } catch (Exception ignored) {}
                                        c.resolve(ret);
                                    }
                                });
                            } catch (Exception ignored) {}
                            boolean onPortal = cur.contains("/site-nav");
                            boolean onMapped = cur.contains(".webvpn.cauc.edu.cn/");
                            boolean stillLogin = cur.contains("/auth") || cur.contains("login") || cur.contains("returnurl");
                            if (onPortal || (onMapped && !stillLogin)) {
                                android.util.Log.i("CaucSilent", "[ok] 已登录（" + cur + "）");
                                finishOk.run();
                                return;
                            }
                            if (!loggedHint[0] && (cur.contains("/auth") || cur.contains("login"))) {
                                loggedHint[0] = true;
                                try {
                                    wv.evaluateJavascript(
                                        "(function(){try{var t=document.body?String(document.body.innerText||''):'';return t.replace(/\\s+/g,' ').slice(0,150);}catch(e){return '';}})()",
                                        new android.webkit.ValueCallback<String>() {
                                            @Override public void onReceiveValue(String v) {
                                                android.util.Log.i("CaucSilent", "[pageText] " + v);
                                            }
                                        });
                                } catch (Exception ignored) {}
                            }
                            try {
                                String js = String.format(java.util.Locale.US, SILENT_PREFILL_JS,
                                        org.json.JSONObject.quote(user), org.json.JSONObject.quote(pwd));
                                wv.evaluateJavascript(js, new android.webkit.ValueCallback<String>() {
                                    @Override public void onReceiveValue(String v) {
                                        android.util.Log.i("CaucSilent", "[prefill] " + v);
                                    }
                                });
                                long nowMs = System.currentTimeMillis();
                                boolean canSubmit = submitCount[0] < 3 &&
                                        (submitCount[0] == 0 || (nowMs - lastSubmitAt[0]) > 8000);
                                if (canSubmit) {
                                    final int n = ++submitCount[0];
                                    lastSubmitAt[0] = nowMs;
                                    wv.evaluateJavascript(SILENT_SUBMIT_JS, new android.webkit.ValueCallback<String>() {
                                        @Override public void onReceiveValue(String v) {
                                            android.util.Log.i("CaucSilent", "[submit#" + n + "] " + v);
                                            if (v != null && v.contains("clicked")) submitted[0] = true;
                                        }
                                    });
                                }
                            } catch (Exception ignored) {}
                            h.postDelayed(this, 600);
                        }
                    };
                    wv.setWebViewClient(new android.webkit.WebViewClient() {
                        @Override public void onPageFinished(android.webkit.WebView view, String u) {
                            android.util.Log.i("CaucSilent", "[onPageFinished] " + u);
                            h.postDelayed(poll, 500);
                        }
                        @Override public void onReceivedHttpError(android.webkit.WebView view,
                                android.webkit.WebResourceRequest req, android.webkit.WebResourceResponse err) {
                            try {
                                if (done[0] || req == null || !req.isForMainFrame() || err == null) return;
                                int code = err.getStatusCode();
                                android.util.Log.i("CaucSilent", "[httpError] " + code);
                                if (code >= 400) {
                                    done[0] = true;
                                    JSObject ret = new JSObject();
                                    ret.put("ok", false);
                                    ret.put("reason", "http-" + code);
                                    ret.put("finalUrl", String.valueOf(view.getUrl()));
                                    try { view.destroy(); } catch (Exception ignored) {}
                                    c.resolve(ret);
                                }
                            } catch (Exception ignored) {}
                        }
                        @Override public void onReceivedError(android.webkit.WebView view,
                                android.webkit.WebResourceRequest req, android.webkit.WebResourceError e2) {
                            try {
                                if (done[0] || req == null || !req.isForMainFrame()) return;
                                android.util.Log.i("CaucSilent", "[recvError] " + (e2 == null ? "" : e2.getErrorCode()));
                                done[0] = true;
                                JSObject ret = new JSObject();
                                ret.put("ok", false);
                                ret.put("reason", "net-error");
                                ret.put("finalUrl", String.valueOf(view.getUrl()));
                                try { view.destroy(); } catch (Exception ignored) {}
                                c.resolve(ret);
                            } catch (Exception ignored) {}
                        }
                    });
                    wv.loadUrl(url);
                    h.postDelayed(poll, 500);
                    h.postDelayed(new Runnable() {
                        @Override public void run() {
                            if (done[0]) return;
                            done[0] = true;
                            JSObject ret = new JSObject();
                            ret.put("ok", false);
                            ret.put("reason", "silent-login-timeout");
                            ret.put("finalUrl", String.valueOf(wv.getUrl()));
                            try { wv.destroy(); } catch (Exception ignored) {}
                            c.resolve(ret);
                        }
                    }, timeoutMs);
                } catch (Exception e) {
                    call.reject("silentLogin failed: " + e.getMessage());
                }
            }
        });
    }
    @PluginMethod
    public void silent(final PluginCall call) {
        final String url = call.getString("url");
        if (url == null || url.length() == 0) {
            call.reject("url is required");
            return;
        }
        final int timeoutMs = call.getInt("timeout", 20000);
        final PluginCall c = call;
        final android.app.Activity actS = getActivity();
        if (actS == null) { call.reject("activity-gone"); return; }
        actS.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                try {
                    CookieManager.getInstance().setAcceptCookie(true);
                    final android.webkit.WebView wv = new android.webkit.WebView(getActivity());
                    wv.getSettings().setJavaScriptEnabled(true);
                    wv.getSettings().setDomStorageEnabled(true);
                    wv.getSettings().setUserAgentString(
                        wv.getSettings().getUserAgentString() + "lantuMobilecampus lantuMC");
                    final boolean[] done = { false };
                    wv.setWebViewClient(new android.webkit.WebViewClient() {
                        @Override
                        public void onPageFinished(final android.webkit.WebView view, final String u) {
                            if (done[0]) return;
                            try {
                                view.evaluateJavascript(REJECT_JS, new android.webkit.ValueCallback<String>() {
                                    @Override public void onReceiveValue(String rv) {
                                        if (done[0] || rv == null || rv.indexOf('1') < 0) return;
                                        done[0] = true;
                                        android.util.Log.i("CaucSilent", "[reject] 命中 WebVPN 拒绝页（校内网络）");
                                        JSObject ret = new JSObject();
                                        ret.put("ok", false);
                                        ret.put("reason", "not-allowed");
                                        ret.put("finalUrl", u == null ? "" : u);
                                        try { view.destroy(); } catch (Exception ignored) {}
                                        c.resolve(ret);
                                    }
                                });
                            } catch (Exception ignored) {}
                            new android.os.Handler(android.os.Looper.getMainLooper()).postDelayed(new Runnable() {
                                @Override public void run() {
                                    if (done[0]) return;
                                    done[0] = true;
                                    final JSObject ret = new JSObject();
                                    ret.put("ok", true);
                                    ret.put("finalUrl", u == null ? "" : u);
                                    String ck = CookieManager.getInstance().getCookie(url);
                                    ret.put("cookies", ck == null ? "" : ck);
                                    try {
                                        String host = android.net.Uri.parse(url).getHost();
                                        CookieVault.save(getContext(), host,
                                            CookieManager.getInstance().getCookie(url));
                                    } catch (Exception ignored) {}
                                    if ("text".equals(c.getString("extract", ""))) {
                                        try {
                                            view.evaluateJavascript(
                                                "(document.body&&document.body.innerText)||''",
                                                new android.webkit.ValueCallback<String>() {
                                                    @Override public void onReceiveValue(String v) {
                                                        ret.put("text", v == null ? "" : v);
                                                        try { view.destroy(); } catch (Exception ignored) {}
                                                        c.resolve(ret);
                                                    }
                                                });
                                            return;
                                        } catch (Exception ignored) {}
                                    }
                                    try { view.destroy(); } catch (Exception ignored) {}
                                    c.resolve(ret);
                                }
                            }, 2500);
                        }
                    });
                    wv.loadUrl(url);
                    new android.os.Handler(android.os.Looper.getMainLooper()).postDelayed(new Runnable() {
                        @Override
                        public void run() {
                            if (done[0]) return;
                            done[0] = true;
                            JSObject ret = new JSObject();
                            ret.put("ok", false);
                            ret.put("reason", "timeout");
                            String ck = CookieManager.getInstance().getCookie(url);
                            ret.put("cookies", ck == null ? "" : ck);
                            try {
                                String host = android.net.Uri.parse(url).getHost();
                                CookieVault.save(getContext(), host,
                                    CookieManager.getInstance().getCookie(url));
                            } catch (Exception ignored) {}
                            try { wv.destroy(); } catch (Exception ignored) {}
                            c.resolve(ret);
                        }
                    }, timeoutMs);
                } catch (Exception e) {
                    call.reject("silent load failed: " + e.getMessage());
                }
            }
        });
    }
    @PluginMethod
    public void cookies(PluginCall call) {
        JSObject ret = new JSObject();
        JSArray urls = call.getArray("urls");
        if (urls != null) {
            for (int i = 0; i < urls.length(); i++) {
                try {
                    String u = urls.getString(i);
                    String c = CookieManager.getInstance().getCookie(u);
                    ret.put(u, c == null ? "" : c);
                } catch (Exception ignored) {}
            }
        }
        call.resolve(ret);
    }
    @PluginMethod
    public void clear(PluginCall call) {
        try {
            CookieManager.getInstance().removeAllCookies(null);
            CookieManager.getInstance().flush();
            CookieVault.clear(getContext());
        } catch (Exception ignored) {}
        JSObject ret = new JSObject();
        ret.put("ok", true);
        call.resolve(ret);
    }
    @PluginMethod
    public void resetCookies(PluginCall call) {
        JSObject ret = new JSObject();
        int removed = 0;
        try {
            String url = call.getString("url", "");
            JSArray keys = call.getArray("keys");
            java.util.List<String> want = new java.util.ArrayList<>();
            if (keys != null) {
                for (int i = 0; i < keys.length(); i++) {
                    try { want.add(keys.getString(i)); } catch (Exception ignored) {}
                }
            }
            if (url != null && url.length() > 0) {
                String host = android.net.Uri.parse(url).getHost();
                String raw = CookieManager.getInstance().getCookie(url);
                if (raw != null) {
                    for (String pair : raw.split(";")) {
                        int eq = pair.indexOf('=');
                        String k = (eq > 0 ? pair.substring(0, eq) : pair).trim();
                        if (k.length() == 0) continue;
                        if (!want.isEmpty() && !want.contains(k)) continue;
                        CookieManager.getInstance().setCookie(url, k + "=; Max-Age=0; path=/");
                        if (host != null) {
                            CookieManager.getInstance().setCookie(url,
                                    k + "=; Max-Age=0; path=/; domain=" + host);
                        }
                        removed++;
                    }
                    CookieManager.getInstance().flush();
                }
            }
            ret.put("ok", true);
            ret.put("removed", removed);
        } catch (Throwable e) {
            ret.put("ok", false);
            ret.put("error", String.valueOf(e.getMessage()));
        }
        call.resolve(ret);
    }
    @PluginMethod
    public void followChain(final PluginCall call) {
        new Thread(new Runnable() {
            @Override public void run() {
        JSObject ret = new JSObject();
        java.net.HttpURLConnection conn = null;
        try {
            String url = call.getString("url", "");
            int maxHops = call.getInt("maxHops", 12);
            int timeoutMs = call.getInt("timeout", 20000);
            if (url == null || url.length() == 0) {
                ret.put("ok", false); ret.put("error", "no-url");
                call.resolve(ret); return;
            }
            long deadline = System.currentTimeMillis() + timeoutMs;
            boolean full = Boolean.TRUE.equals(call.getBoolean("full"));
            int hops = 0, status = 0;
            String finalUrl = url, body = "";
            while (System.currentTimeMillis() < deadline && hops < maxHops) {
                java.net.URL u = new java.net.URL(finalUrl);
                conn = (java.net.HttpURLConnection) u.openConnection();
                conn.setInstanceFollowRedirects(false);   
                conn.setConnectTimeout(8000);
                conn.setReadTimeout(8000);
                conn.setRequestProperty("User-Agent",
                        "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Mobile Safari/537.36");
                conn.setRequestProperty("Referer", finalUrl);
                String cookie = CookieManager.getInstance().getCookie(finalUrl);
                if (cookie != null && cookie.length() > 0) {
                    conn.setRequestProperty("Cookie", cookie);
                }
                status = conn.getResponseCode();
                java.io.InputStream is = (status >= 300 && status < 400)
                        ? conn.getErrorStream() : conn.getInputStream();
                if (is != null) {
                    if (full) {
                        java.io.ByteArrayOutputStream bos = new java.io.ByteArrayOutputStream();
                        byte[] buf = new byte[8192];
                        int n;
                        while ((n = is.read(buf)) > 0 && bos.size() < 512 * 1024) bos.write(buf, 0, n);
                        body = bos.toString("UTF-8");
                    } else {
                        byte[] buf = new byte[8192];
                        int n = is.read(buf);
                        if (n > 0) body = new String(buf, 0, n, "UTF-8");
                    }
                }
                try { if (is != null) is.close(); } catch (Exception ignored) {}
                hops++;
                String loc = conn.getHeaderField("Location");
                if (conn != null) { try { conn.disconnect(); } catch (Exception ignored) {} conn = null; }
                if (status >= 300 && status < 400 && loc != null && loc.length() > 0) {
                    finalUrl = new java.net.URL(new java.net.URL(finalUrl), loc).toString();
                    continue;
                }
                break;   
            }
            ret.put("ok", true);
            ret.put("status", status);
            ret.put("hops", hops);
            ret.put("finalUrl", finalUrl);
            ret.put("bodySample", body.substring(0, Math.min(500, body.length())));
            if (full) ret.put("body", body);   
            ret.put("arrived", body.contains("课表") || body.contains("xskbcx")
                    || finalUrl.contains("xskbcx") || finalUrl.contains("TimeTable"));
        } catch (Throwable e) {
            ret.put("ok", false);
            ret.put("error", String.valueOf(e.getMessage()));
        }
        if (conn != null) { try { conn.disconnect(); } catch (Exception ignored) {} }
        call.resolve(ret);
        }   
    }).start();   
    }
    @PluginMethod
    public void setShellBar(PluginCall call) {
        final String title = call.getString("title", "");
        final Boolean sb = call.getBoolean("showBack", Boolean.FALSE);
        final String right = call.getString("right", "");
        final android.app.Activity act = getActivity();
        if (act != null) {
            act.runOnUiThread(new Runnable() {
                @Override public void run() {
                    ShellBar bar = ShellBar.current;
                    if (bar == null) return;
                    bar.setTitle(title);
                    bar.setBackVisible(sb != null && sb.booleanValue());
                    bar.setRight(right);
                }
            });
        }
        JSObject ret = new JSObject();
        ret.put("ok", true);
        call.resolve(ret);
    }
    @PluginMethod
    public void restore(PluginCall call) {
        int n = 0;
        try { n = CookieVault.restore(getContext()); } catch (Exception ignored) {}
        JSObject ret = new JSObject();
        ret.put("ok", true);
        ret.put("count", n);
        call.resolve(ret);
    }
    @PluginMethod
    public void vaultSave(PluginCall call) {
        String url = call.getString("url", "");
        JSObject ret = new JSObject();
        ret.put("ok", false);
        try {
            java.net.URI u = java.net.URI.create(url);
            String host = u.getHost();
            String c = CookieManager.getInstance().getCookie(url);
            if (host != null && c != null && c.length() > 0) {
                CookieVault.save(getContext(), host, c);
                ret.put("ok", true);
                ret.put("host", host);
            }
        } catch (Throwable e) {
            ret.put("error", String.valueOf(e.getMessage()));
        }
        call.resolve(ret);
    }
    @PluginMethod
    public void isSystemDark(PluginCall call) {
        int mask = getContext().getResources().getConfiguration().uiMode
                & android.content.res.Configuration.UI_MODE_NIGHT_MASK;
        JSObject ret = new JSObject();
        ret.put("dark", mask == android.content.res.Configuration.UI_MODE_NIGHT_YES);
        call.resolve(ret);
    }
    @PluginMethod
    public void setDarkMode(PluginCall call) {
        Boolean b = call.getBoolean("dark", false);
        final boolean dark = (b != null && b);
        try {
            final Activity act = getActivity();
            if (act == null) { call.resolve(); return; }
            act.runOnUiThread(new Runnable() {
                @Override public void run() {
                    try { if (ShellBar.current != null) ShellBar.current.applyTheme(dark); }
                    catch (Throwable ignored) {}
                    try { Immersive.apply(act, dark); } catch (Throwable ignored) {}
                    try {
                        android.view.View root = act.findViewById(R.id.cauc_root);
                        if (root != null) {
                            root.setBackgroundColor(dark ? Immersive.DARK_BG
                                                         : android.graphics.Color.WHITE);
                        }
                    } catch (Throwable ignored) {}
                }
            });
            call.resolve();
        } catch (Throwable e) {
            call.reject(String.valueOf(e));
        }
    }
    @PluginMethod
    public void netInfo(PluginCall call) {
        JSObject ret = new JSObject();
        try {
            android.net.ConnectivityManager cm = (android.net.ConnectivityManager)
                    getContext().getSystemService(android.content.Context.CONNECTIVITY_SERVICE);
            android.net.Network active = (cm == null) ? null : cm.getActiveNetwork();
            android.net.NetworkCapabilities nc =
                    (active == null || cm == null) ? null : cm.getNetworkCapabilities(active);
            android.net.LinkProperties lp =
                    (active == null || cm == null) ? null : cm.getLinkProperties(active);
            String type = "none", iface = "", gateway = "";
            if (nc != null) {
                if (nc.hasTransport(android.net.NetworkCapabilities.TRANSPORT_VPN)) type = "vpn";
                else if (nc.hasTransport(android.net.NetworkCapabilities.TRANSPORT_WIFI)) type = "wifi";
                else if (nc.hasTransport(android.net.NetworkCapabilities.TRANSPORT_CELLULAR)) type = "cellular";
                else if (nc.hasTransport(android.net.NetworkCapabilities.TRANSPORT_ETHERNET)) type = "ethernet";
            }
            if (lp != null) {
                if (lp.getInterfaceName() != null) iface = lp.getInterfaceName();
                String gw4 = "", gw6 = "";
                for (android.net.RouteInfo r : lp.getRoutes()) {
                    if (!r.isDefaultRoute() || r.getGateway() == null) continue;
                    java.net.InetAddress g = r.getGateway();
                    if (g instanceof java.net.Inet4Address) { gw4 = g.getHostAddress(); break; }
                    if (gw6.length() == 0) gw6 = g.getHostAddress();
                }
                gateway = (gw4.length() > 0) ? gw4 : gw6;
                JSArray dns = new JSArray(), dns6 = new JSArray();
                for (java.net.InetAddress d : lp.getDnsServers()) {
                    if (d == null) continue;
                    if (d instanceof java.net.Inet4Address) dns.put(d.getHostAddress());
                    else dns6.put(d.getHostAddress());
                }
                for (int i = 0; i < dns6.length(); i++) dns.put(dns6.getString(i));
                ret.put("dns", dns);
                for (android.net.LinkAddress la : lp.getLinkAddresses()) {
                    java.net.InetAddress a = la.getAddress();
                    if (a instanceof java.net.Inet4Address) {
                        ret.put("ip", a.getHostAddress());
                        ret.put("prefix", la.getPrefixLength());
                        break;
                    }
                }
            }
            JSArray ips = new JSArray();
            java.util.Enumeration<java.net.NetworkInterface> ifs =
                    java.net.NetworkInterface.getNetworkInterfaces();
            while (ifs != null && ifs.hasMoreElements()) {
                java.net.NetworkInterface ni = ifs.nextElement();
                if (!ni.isUp() || ni.isLoopback()) continue;
                for (java.net.InterfaceAddress ia : ni.getInterfaceAddresses()) {
                    java.net.InetAddress a = ia.getAddress();
                    if (a instanceof java.net.Inet4Address && !a.isLoopbackAddress()) {
                        JSObject o = new JSObject();
                        o.put("iface", ni.getName());
                        o.put("ip", a.getHostAddress());
                        o.put("prefix", (int) ia.getNetworkPrefixLength());
                        ips.put(o);
                    }
                }
            }
            ret.put("ips", ips);
            ret.put("type", type);
            ret.put("iface", iface);
            ret.put("gateway", gateway);
            ret.put("model", android.os.Build.MANUFACTURER + " " + android.os.Build.MODEL);
            ret.put("sdk", android.os.Build.VERSION.SDK_INT);
            ret.put("ok", true);
        } catch (Throwable e) {
            ret.put("ok", false);
            ret.put("error", String.valueOf(e.getMessage()));
        }
        call.resolve(ret);
    }
}
