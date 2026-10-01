(function(global) {
  "use strict";
  function nativeHttp() {
    var C = global.Capacitor;
    if (!C || !C.Plugins) return null;
    return C.Plugins.CapacitorHttp || C.Plugins.Http || null;
  }
  function TextRes(status, headers, raw) {
    this.status = status;
    this.headers = headers || {};
    this._raw = raw;
  }
  TextRes.prototype.text = function() {
    return typeof this._raw === "string" ? this._raw : JSON.stringify(this._raw);
  };
  TextRes.prototype.json = function() {
    return typeof this._raw === "string" ? JSON.parse(this._raw) : this._raw;
  };
  var Net = {
    canBypassCors: function() {
      return !!nativeHttp();
    },
    request: function(url, opts) {
      opts = opts || {};
      if (opts.noHub === true) return Net._rawRequest(url, opts);
      var Hub = global.Capacitor && global.Capacitor.Plugins && global.Capacitor.Plugins.LoginWebView;
      if (!Hub || !Hub.hubHeader) return Net._rawRequest(url, opts);
      return Hub.hubHeader({
        url: url
      }).then(function(r) {
        var ck = r && r.cookie || "";
        if (!ck) return Net._rawRequest(url, opts);
        var o2 = {};
        for (var k in opts) o2[k] = opts[k];
        var h = {};
        for (var k2 in opts.headers || {}) h[k2] = opts.headers[k2];
        h["Cookie"] = h["Cookie"] ? h["Cookie"] + "; " + ck : ck;
        o2.headers = h;
        return Net._rawRequest(url, o2);
      }).catch(function() {
        return Net._rawRequest(url, opts);
      }).then(function(res) {
        try {
          Net._hubIngest(url, res && res.headers);
        } catch (e) {}
        return res;
      });
    },
    _hubIngest: function(url, headers) {
      if (!headers || !url) return;
      var Hub = global.Capacitor && global.Capacitor.Plugins && global.Capacitor.Plugins.LoginWebView;
      if (!Hub || !Hub.hubIngest) return;
      var sc = headers["Set-Cookie"] || headers["set-cookie"] || headers["SET-COOKIE"];
      if (!sc) return;
      var arr = Array.isArray(sc) ? sc : [ sc ];
      Hub.hubIngest({
        url: url,
        setCookie: arr
      }).catch(function() {});
    },
    _rawRequest: function(url, opts) {
      opts = opts || {};
      var Http = nativeHttp();
      var timeout = opts.timeout || 15e3;
      if (Http) {
        var cfg = {
          url: url,
          method: (opts.method || "GET").toUpperCase(),
          headers: opts.headers || {},
          data: opts.data,
          connectTimeout: timeout,
          readTimeout: timeout
        };
        if (opts.disableRedirects) cfg.disableRedirects = true;
        return new Promise(function(resolve, reject) {
          var done = false;
          var tp = setTimeout(function() {
            if (done) return;
            done = true;
            reject(new Error("请求超时（" + timeout + "ms）—— 目标地址不可达或响应过慢"));
          }, timeout);
          Http.request(cfg).then(function(res) {
            if (done) return;
            done = true;
            clearTimeout(tp);
            var r = new TextRes(res.status, res.headers, res.data);
            try {
              Net._hubIngest(url, res.headers);
            } catch (e) {}
            resolve(r);
          }, function(e) {
            if (done) return;
            done = true;
            clearTimeout(tp);
            reject(e);
          });
        });
      }
      if (typeof fetch !== "function") {
        return Promise.reject(new Error("当前环境没有可用的网络通道（真实数据需在 APK 中通过原生 HTTP）"));
      }
      var ctl = typeof AbortController !== "undefined" ? new AbortController : null;
      var timer = ctl ? setTimeout(function() {
        ctl.abort();
      }, timeout) : null;
      var body = opts.data;
      var headers = Object.assign({}, opts.headers || {});
      if (body && typeof body === "object" && !(body instanceof FormData)) {
        headers["Content-Type"] = headers["Content-Type"] || "application/json";
        body = JSON.stringify(body);
      }
      return fetch(url, {
        method: opts.method || "GET",
        headers: headers,
        body: body,
        credentials: "include",
        signal: ctl ? ctl.signal : undefined
      }).then(function(r) {
        if (timer) clearTimeout(timer);
        return r.text().then(function(t) {
          return new TextRes(r.status, {}, t);
        });
      });
    },
    probe: function(url, timeout) {
      return Net.request(url, {
        method: "GET",
        timeout: timeout || 4e3
      }).then(function(r) {
        return {
          ok: true,
          status: r.status
        };
      }).catch(function(e) {
        return {
          ok: false,
          error: String(e && e.message || e)
        };
      });
    }
  };
  global.Net = Net;
})(window);