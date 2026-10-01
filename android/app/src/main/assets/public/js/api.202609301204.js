(function(global) {
  "use strict";
  var CONFIG = {
    MODE: "real",
    SCHOOL: "中国民航大学",
    CAMPUS: "东丽校区",
    SEMESTER: "2026-2027学年第一学期",
    SEMESTER_START: "2026-08-31",
    TOTAL_WEEKS: 20,
    XNM: "2026",
    XQM: "3",
    TIMEOUT: 8e3,
    PROBE_TIMEOUT: 2600,
    PROBE_SHORT_TIMEOUT: 1800,
    PROBE_RACE_TIMEOUT: 8e3,
    WEBVPN_FIRST_WAIT: 6e3,
    PROBE_TTL: 6e4,
    CHANNEL: "auto",
    WEBVPN: {
      base: "https://webvpn.cauc.edu.cn",
      login: "https://webvpn.cauc.edu.cn/auth/login",
      home: "https://webvpn.cauc.edu.cn/site-nav/home",
      map: function(u) {
        var a = new URL(u, "http://x/");
        var scheme = a.protocol.replace(":", "");
        var port = a.port || (scheme === "https" ? "443" : "80");
        var host = a.hostname.replace(/-/g, "--").replace(/\./g, "-");
        return "https://" + scheme + "-" + host + "-" + port + ".webvpn.cauc.edu.cn" + a.pathname + a.search;
      }
    },
    DIRECT_PROBE: "http://jwgl.cauc.edu.cn/",
    XZX: {
      base: "https://ec.cauc.edu.cn",
      ias: "http://ec.cauc.edu.cn:8088",
      clientAuth: "Basic bW9iaWxlX3NlcnZpY2VfcGxhdGZvcm06bW9iaWxlX3NlcnZpY2VfcGxhdGZvcm1fc2VjcmV0",
      target: "https://ec.cauc.edu.cn/plat?name=loginTransit&source=app"
    },
    ECARD: {
      base: "http://ec.cauc.edu.cn:8088",
      aid: "0030000000000901",
      aidNinghe: "0030000000012101"
    },
    LOGIN_MODE: "auto",
    AUTO_FALLBACK_AFTER: 3,
    LOGIN_URLS: {
      webvpn: "https://webvpn.cauc.edu.cn/auth/login",
      jwgl: "http://jwgl.cauc.edu.cn/xtgl/login_slogin.html",
      ecard: "http://ecard.cauc.edu.cn/Account/LogOn"
    },
    LOGIN_SYSTEMS: {
      webvpn: {
        title: "① 统一身份认证 / WebVPN",
        url: "https://webvpn.cauc.edu.cn/",
        domains: [ "webvpn.cauc.edu.cn" ],
        desc: "校外访问校内系统的第一步，登一次即可（无验证码）"
      },
      jwgl: {
        title: "② 教务系统（正方）",
        url: "https://http-jwgl-cauc-edu-cn-80.webvpn.cauc.edu.cn/xtgl/login_slogin.html",
        domains: [ "webvpn.cauc.edu.cn" ],
        desc: "课表 / 考试 / 成绩。有验证码，密码同统一身份认证"
      },
      network: {
        title: "校园网自助服务",
        url: "https://http-www-cauc-edu-cn-80.webvpn.cauc.edu.cn/Self/",
        domains: [ "webvpn.cauc.edu.cn" ],
        desc: "上网 IP / 在线设备 / 登录历史"
      },
      ecard: {
        title: "一卡通 / 宿舍电费",
        url: "https://ecampus.xzxpay.com.cn/",
        domains: [ "ec.cauc.edu.cn", "ecampus.xzxpay.com.cn" ],
        desc: "校园卡余额 / 消费流水 / 宿舍电费"
      }
    }
  };
  var CampusNet = {
    PORTALS: [ {
      host: "192.168.100.200",
      port: 801
    }, {
      host: "[2001:da8:a012:ff09::3]",
      port: 9002,
      viaGateway: true
    } ],
    GATEWAY: "http://[2001:da8:a012:ff09::3]:9002/",
    TIMEOUT: 6e3,
    _discover: function() {
      return Net.request(CampusNet.GATEWAY, {
        method: "GET",
        timeout: CampusNet.TIMEOUT
      }).then(function(res) {
        var loc = "";
        try {
          loc = res.headers && (res.headers.Location || res.headers.location) || "";
        } catch (e) {}
        var m = String(loc).match(/https?:\/\/([0-9.]+)(?::(\d+))?/);
        if (m) return {
          host: m[1],
          port: parseInt(m[2] || "80", 10) === 80 ? 801 : parseInt(m[2], 10)
        };
        return null;
      }).catch(function() {
        return null;
      });
    },
    _myIp: function(fresh) {
      var cached = localStorage.getItem("cauc_net_ip") || "";
      var at = parseInt(localStorage.getItem("cauc_net_ip_at") || "0", 10);
      var fresh20 = at && Date.now() - at < 10 * 60 * 1e3;
      if (cached && !fresh && fresh20) return Promise.resolve(cached);
      return Net.request("http://192.168.100.200/1.htm?_t=" + Date.now(), {
        method: "GET",
        timeout: CampusNet.TIMEOUT
      }).then(function(res) {
        var t = res.text ? res.text() : "";
        var m = t.match(/v4ip='([0-9.]+)'/) || t.match(/lip='([0-9.]+)'/);
        if (m) {
          localStorage.setItem("cauc_net_ip", m[1]);
          localStorage.setItem("cauc_net_ip_at", String(Date.now()));
          return m[1];
        }
        return "";
      }).catch(function() {
        return cached;
      });
    },
    _myIpv6: function() {
      var cached = localStorage.getItem("cauc_net_ipv6") || "";
      return Net.request(CampusNet.GATEWAY + "iv6?_t=" + Date.now(), {
        method: "GET",
        timeout: CampusNet.TIMEOUT
      }).then(function(res) {
        var t = res.text ? res.text() : "";
        var m = String(t).match(/iv6=([0-9a-fA-F:]{10,})/);
        if (m) {
          localStorage.setItem("cauc_net_ipv6", m[1]);
          localStorage.setItem("cauc_net_ipv6_at", String(Date.now()));
          return m[1];
        }
        return cached;
      }).catch(function() {
        return cached;
      });
    },
    login: function(sid, pwd) {
      if (!sid || !pwd) return Promise.reject(new Error("需要学号与统一身份认证密码"));
      return CampusNet._discover().then(function(p) {
        var portal = p || CampusNet.PORTALS[0];
        var host = portal.host;
        var base = "http://" + host;
        var eportalBase = "http://" + host + ":801";
        var ts = Date.now();
        function tryEportal(reason) {
          return CampusNet._myIp().then(function(ip) {
            var q2 = "/eportal/portal/login?callback=dr1003&login_method=1" + "&user_account=" + encodeURIComponent(",0," + sid) + "&user_password=" + encodeURIComponent(pwd) + "&wlan_user_ip=" + encodeURIComponent(ip) + "&wlan_user_ipv6=&wlan_user_mac=000000000000&wlan_ac_ip=&wlan_ac_name=" + "&jsVersion=4.1.3&terminal_type=1&lang=zh-cn&v=" + ts;
            return Net.request(eportalBase + q2, {
              method: "GET",
              timeout: 12e3
            }).then(function(res) {
              var t = res.text ? res.text() : "";
              var m = t.match(/"result"\s*:\s*(\d+)/);
              var msg = (t.match(/"msg"\s*:\s*"([^"]*)"/) || [])[1] || "";
              if (m && m[1] === "1") return {
                ok: true,
                msg: msg || "登录成功",
                via: "eportal",
                ip: ip
              };
              var err = new Error("Dr.COM 失败(" + reason + ") / eportal: " + (msg || "（无 msg）") + " | IP=" + (ip || "(空)") + " | 响应=" + String(t).slice(0, 200));
              err.diag = {
                via: "eportal",
                ip: ip,
                raw: t,
                drcomReason: reason
              };
              throw err;
            });
          });
        }
        return CampusNet._myIpv6().then(function(v6ip) {
          var q = "/drcom/login?callback=dr1003" + "&DDDDD=" + encodeURIComponent(sid) + "&upass=" + encodeURIComponent(pwd) + "&0MKKey=123456&R1=0&R2=&R3=0&R6=1&para=00" + "&v6ip=" + encodeURIComponent(v6ip || "") + "&terminal_type=2&lang=zh-cn&jsVersion=4.1.3&v=" + ts + "&lang=zh";
          return Net.request(base + q, {
            method: "GET",
            timeout: 12e3
          }).then(function(res) {
            var t = res.text ? res.text() : "";
            var m = t.match(/"result"\s*:\s*(\d+)/);
            var msg = (t.match(/"msg"\s*:\s*"([^"]*)"/) || [])[1] || "";
            if (m && m[1] === "1") {
              return {
                ok: true,
                msg: msg || "登录成功",
                via: "drcom",
                v6ip: v6ip
              };
            }
            var reason = m ? "result=" + m[1] + (msg ? " " + msg : "") : "HTTP " + (res.status || 0) + " 非 JSON";
            return tryEportal(reason);
          }).catch(function(e) {
            if (e && e.diag) throw e;
            return tryEportal("请求异常：" + String(e && e.message || e).slice(0, 60));
          });
        });
      });
    },
    logout: function(sid) {
      return CampusNet._discover().then(function(p) {
        var portal = p || CampusNet.PORTALS[0];
        var port = portal.port && portal.port !== 80 ? ":" + portal.port : "";
        var base = "http://" + portal.host + port;
        var q = "/drcom/logout?callback=dr1002&jsVersion=4.1.3&v=" + Date.now() + "&lang=zh";
        return Net.request(base + q, {
          method: "GET",
          timeout: 1e4
        }).then(function(res) {
          var t = res.text ? res.text() : "";
          var ok = /["']?result["']?\s*:\s*1/.test(t);
          if (ok) return {
            ok: true,
            msg: "已注销",
            via: "drcom"
          };
          var q2 = "/eportal/portal/logout?callback=dr1002&user_account=" + encodeURIComponent(",0," + (sid || "")) + "&wlan_user_ip=&wlan_user_mac=&jsVersion=4.1.3&v=" + Date.now();
          return Net.request("http://" + portal.host + ":801" + q2, {
            method: "GET",
            timeout: 1e4
          }).then(function(r2) {
            var t2 = r2.text ? r2.text() : "";
            return {
              ok: /"result"\s*:\s*1/.test(t2),
              msg: (t2.match(/"msg"\s*:\s*"([^"]*)"/) || [])[1] || "",
              via: "eportal"
            };
          });
        }).catch(function() {
          return {
            ok: false,
            msg: "注销请求失败",
            via: "none"
          };
        });
      });
    },
    TEST_HOSTS: [ {
      name: "中科大 IPv6 测试页",
      url: "http://test6.ustc.edu.cn/",
      v6: true
    }, {
      name: "清华（IPv6）",
      url: "http://www.tsinghua.edu.cn/",
      v6: true
    }, {
      name: "百度（IPv4）",
      url: "http://www.baidu.com/",
      v6: false
    } ],
    test: function() {
      return Promise.all(CampusNet.TEST_HOSTS.map(function(h) {
        var t0 = Date.now();
        return Net.request(h.url, {
          method: "GET",
          timeout: 8e3
        }).then(function(res) {
          return {
            name: h.name,
            ok: res.status > 0 && res.status < 400,
            status: res.status,
            ms: Date.now() - t0,
            v6: h.v6
          };
        }).catch(function(e) {
          return {
            name: h.name,
            ok: false,
            status: 0,
            ms: Date.now() - t0,
            v6: h.v6,
            err: String(e.message || e).slice(0, 40)
          };
        });
      }));
    },
    status: function() {
      var chkP = Net.request("http://" + CampusNet.PORTALS[0].host + "/drcom/chkstatus?callback=dr1002&jsVersion=4.1.3&v=" + Date.now() + "&lang=zh", {
        method: "GET",
        timeout: 5e3
      }).then(function(res) {
        var t = res.text ? res.text() : "";
        var m = t.match(/"result"\s*:\s*"?(\d+)"?/);
        if (!m) return null;
        var ipM = t.match(/"v46ip"\s*:\s*"([^"]*)"/);
        return {
          netIn: true,
          online: m[1] === "1",
          status: 200,
          via: "chkstatus",
          ip: ipM ? ipM[1] : ""
        };
      }).catch(function() {
        return null;
      });
      var directP = RealApi._probeDirect(3e3).catch(function() {
        return false;
      });
      var g204 = function() {
        return Net.request("http://connect.rom.miui.com/generate_204", {
          method: "GET",
          timeout: 5e3,
          redirect: "manual"
        }).then(function(res) {
          return res.status === 204;
        }).catch(function() {
          return false;
        });
      };
      return chkP.then(function(r) {
        if (r && r.online) return r;
        return Promise.all([ directP, g204() ]).then(function(arr) {
          var inCampus = !!arr[0], gOnline = !!arr[1];
          if (r) return {
            netIn: true,
            online: gOnline,
            status: 200,
            via: "chkstatus+g204",
            ip: r.ip || ""
          };
          return {
            netIn: inCampus,
            online: gOnline,
            status: gOnline ? 204 : 0,
            via: "g204"
          };
        });
      });
    }
  };
  var SelfService = {
    _chainT0: 0,
    _chainLog: function(msg) {
      try {
        var dt = this._chainT0 ? "+" + Math.round(performance.now() - this._chainT0) + "ms " : "";
        console.log("[SelfChain] " + dt + msg);
      } catch (e) {}
    },
    BASE: "https://https-www-cauc-edu-cn-443.webvpn.cauc.edu.cn",
    BASE_CAMPUS: "https://www.cauc.edu.cn",
    _checkcode: "",
    _okAt: 0,
    _devCache: null,
    _devCacheAt: 0,
    base: function() {
      return STATE.channel === "direct" ? SelfService.BASE_CAMPUS : SelfService.BASE;
    },
    _get: function(path, timeout) {
      return Net.request(SelfService.base() + path, {
        method: "GET",
        timeout: timeout || 15e3,
        headers: SelfService._hdr()
      });
    },
    _post: function(path, body, timeout) {
      return Net.request(SelfService.base() + path, {
        method: "POST",
        headers: SelfService._hdr({
          "Content-Type": "application/x-www-form-urlencoded"
        }),
        data: body,
        timeout: timeout || 2e4
      });
    },
    _hdr: function(extra) {
      var b = SelfService.base();
      var h = {
        Referer: b + "/Self/login/?302=LI",
        Origin: b
      };
      if (extra) for (var k in extra) h[k] = extra[k];
      return h;
    },
    _isCompatPage: function(html) {
      var t = String(html || "");
      return t.length > 0 && t.length < 12e3 && t.indexOf("浏览器兼容性") >= 0;
    },
    WV_DOWN_MSG: "WebVPN 通道暂时连不上：连续多次请求都只拿到网关的「浏览器兼容性提示」页" + "（这是网关侧的间歇性故障，与账号、请求头无关）。请稍后重试；在校内网则走「校内直连」。",
    _isGatewayPage: function(html) {
      var t = String(html || "");
      if (t.length === 0) return true;
      if (t.length >= 8e3) return false;
      return t.indexOf('id="account"') < 0 && t.indexOf("randomDiv") < 0 && t.indexOf("getOnlineList") < 0 && t.indexOf("OnlineLis10Big") < 0;
    },
    _COMPAT_BACKOFF: [ 1e3, 1500, 2e3, 3e3, 4e3, 5e3 ],
    syncSessionFromWv: function() {
      var base = SelfService.base();
      return RealApi._hubAdoptWv([ base + "/Self/", base + "/Self/dashboard", base ]).catch(function() {
        return 0;
      });
    },
    prepare: function(tries) {
      if (tries && tries > 0) return SelfService._prepareBody(tries);
      return SelfService._locked(function() {
        return SelfService.syncSessionFromWv().then(function() {
          return SelfService._prepareBody(0);
        }).then(function(p) {
          if (p && p.loggedIn) return p;
          return SelfService.reauth().then(function() {
            return SelfService._prepareBody(0);
          }).then(function(p2) {
            if (p2 && p2.loggedIn) return p2;
            return RealApi._ensureWebvpnForce().catch(function() {
              return false;
            }).then(function() {
              return SelfService._prepareBody(0);
            }).then(function(p3) {
              if (p3 && p3.loggedIn) return p3;
              if (p3 && p3.wvDown) return SelfService._prepareBody(1);
              return p3;
            });
          });
        });
      });
    },
    reauth: function() {
      var base = "https://https-www-cauc-edu-cn-443.webvpn.cauc.edu.cn";
      return new Promise(function(res) {
        try {
          var LW = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LoginWebView || null;
          if (LW && LW.resetCookies) {
            SelfService._chainLog("分层重登②：只清自助服务会话（JSESSIONID）");
            LW.resetCookies({
              url: base + "/Self/",
              keys: [ "JSESSIONID" ]
            }).then(function() {
              res(true);
            }, function() {
              res(false);
            });
            return;
          }
          res(false);
        } catch (e) {
          res(false);
        }
      });
    },
    _prepareBody: function(tries) {
      var BACKOFF = SelfService._COMPAT_BACKOFF;
      tries = tries || 0;
      return SelfService._get("/Self/login/?302=LI").then(function(r) {
        var html = (r.text ? r.text() : "") || "";
        SelfService._chainLog("prepare 第" + (tries + 1) + "轮结束（兼容页=" + SelfService._isCompatPage(html) + "）");
        if (SelfService._isCompatPage(html) && tries > 0 && tries < BACKOFF.length) {
          var warm = tries < 2 ? SelfService.restoreCookies() : Promise.resolve(false);
          var ensure = RealApi._ensureWebvpn().catch(function() {
            return false;
          });
          var wait = new Promise(function(res) {
            setTimeout(res, BACKOFF[tries]);
          });
          return ensure.then(function(ok) {
            if (ok) return SelfService._prepareBody(tries + 1);
            return wait.then(function() {
              return SelfService._prepareBody(tries + 1);
            });
          });
        }
        if (SelfService._isCompatPage(html)) {
          SelfService._wvDown = true;
          return {
            ok: false,
            loggedIn: false,
            needCaptcha: false,
            wvDown: true,
            error: SelfService.WV_DOWN_MSG
          };
        }
        SelfService._wvDown = false;
        if (SelfService._isGatewayPage(html) && tries < 4) {
          return new Promise(function(res) {
            setTimeout(res, 800);
          }).then(function() {
            return SelfService._prepareBody(tries + 1);
          });
        }
        var m = html.match(/name="checkcode"\s+value="([^"]*)"/);
        SelfService._checkcode = m ? m[1] : "";
        var rd = html.match(/<div class="([^"]*)"[^>]*id="randomDiv"/);
        var pageSaysNeed = rd ? rd[1].indexOf("hide") < 0 : false;
        SelfService._needCaptcha = pageSaysNeed;
        var isDash = html.indexOf("OnlineLis10Big") >= 0 || html.indexOf("getOnlineList") >= 0;
        if (isDash) {
          SelfService._okAt = Date.now();
          return {
            ok: true,
            loggedIn: true,
            needCaptcha: false
          };
        }
        return SelfService.warmCaptcha().then(function() {
          return {
            ok: true,
            loggedIn: false,
            needCaptcha: SelfService._needCaptcha
          };
        });
      }).catch(function(e) {
        return {
          ok: false,
          loggedIn: false,
          needCaptcha: false,
          error: String(e && e.message || e)
        };
      });
    },
    needCaptchaFlag: function() {
      try {
        localStorage.removeItem("cauc_self_needcap");
      } catch (e) {}
      return false;
    },
    setNeedCaptchaFlag: function() {
      try {
        localStorage.removeItem("cauc_self_needcap");
      } catch (e) {}
    },
    restoreCookies: function() {
      try {
        var LW = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LoginWebView || null;
        if (LW && LW.restore) {
          return LW.restore({}).then(function() {
            return true;
          }).catch(function() {
            return false;
          });
        }
      } catch (e) {}
      return Promise.resolve(false);
    },
    resetSession: function() {
      try {
        var LW = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LoginWebView || null;
        if (LW && LW.resetCookies) {
          return LW.resetCookies({
            url: SelfService.base() + "/Self/",
            keys: [ "JSESSIONID" ]
          }).then(function() {
            SelfService._okAt = 0;
            SelfService._needCaptcha = false;
            return true;
          }).catch(function() {
            return false;
          });
        }
      } catch (e) {}
      return Promise.resolve(false);
    },
    warmCaptcha: function() {
      return SelfService._get("/Self/login/randomCode?t=" + Math.random(), 12e3).then(function() {
        SelfService._captchaWarmed = true;
        return true;
      }).catch(function() {
        SelfService._captchaWarmed = false;
        return false;
      });
    },
    _captchaWarmed: false,
    _captchaUntil: 0,
    captchaCooling: function() {
      return SelfService._captchaUntil > Date.now();
    },
    captchaUrl: function() {
      return SelfService.base() + "/Self/login/randomCode?t=" + Date.now();
    },
    baseUrl: function() {
      return SelfService.base();
    },
    login: function(account, password, code) {
      return SelfService._locked(function() {
        return SelfService._loginBody(account, password, code);
      });
    },
    _loginBody: function(account, password, code) {
      if (!account || !password) return Promise.resolve({
        ok: false,
        code: "cred",
        msg: "需要学号与密码"
      });
      function attempt() {
        var body = "foo=&bar=" + "&checkcode=" + encodeURIComponent(SelfService._checkcode || "") + "&account=" + encodeURIComponent(account) + "&password=" + encodeURIComponent(password) + "&code=" + encodeURIComponent(code || "") + "&submit=" + encodeURIComponent("登 录");
        return SelfService._post("/Self/login/verify", body).then(function(r) {
          var t = (r.text ? r.text() : "") || "";
          var st = r.status || 0;
          if (st >= 300 && st < 400 || st === 200 && (t.indexOf("getOnlineList") >= 0 || t.indexOf("OnlineLis10Big") >= 0)) {
            SelfService._okAt = Date.now();
            SelfService._needCaptcha = false;
            SelfService.setNeedCaptchaFlag(false);
            SelfService._captchaUntil = 0;
            SelfService._devCache = null;
            SelfService._devCacheAt = 0;
            try {
              var LW = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LoginWebView || null;
              if (LW && LW.vaultSave) LW.vaultSave({
                url: SelfService.base() + "/Self/dashboard"
              });
            } catch (e) {}
            return {
              ok: true
            };
          }
          var rd = t.match(/<div class="([^"]*)"[^>]*id="randomDiv"/);
          var needCap = rd ? rd[1].indexOf("hide") < 0 : false;
          SelfService._needCaptcha = needCap;
          var m = t.match(/errorTip[\s\S]{0,600}?\(\s*'([^']{2,40})'\s*\)/);
          var msg = m ? m[1] : "";
          if (needCap || /验证码/.test(msg)) {
            SelfService._needCaptcha = true;
            SelfService.setNeedCaptchaFlag(true);
            return {
              ok: false,
              code: "captcha",
              msg: msg || "本次需要验证码",
              needCaptcha: true
            };
          }
          if (/密码|账号|用户/.test(msg)) return {
            ok: false,
            code: "cred",
            msg: msg,
            needCaptcha: false
          };
          if (SelfService._isCompatPage(t)) {
            return {
              ok: false,
              code: "wvdown",
              msg: SelfService.WV_DOWN_MSG,
              needCaptcha: false
            };
          }
          if (t.indexOf('id="account"') >= 0) {
            return {
              ok: false,
              code: "cred",
              msg: "学校系统未接受这次登录（请检查账号密码，或稍后重试）",
              needCaptcha: false
            };
          }
          return {
            ok: false,
            code: "other",
            msg: msg || "登录失败（HTTP " + st + "）",
            needCaptcha: false
          };
        }).catch(function(e) {
          return {
            ok: false,
            code: "other",
            msg: String(e && e.message || e),
            needCaptcha: false
          };
        });
      }
      function tryOnce(n) {
        return SelfService._prepareBody(0).then(function() {
          return attempt();
        }).then(function(r) {
          if (!r || r.ok) return r;
          if (r.code === "other" && n < 2) {
            return new Promise(function(res) {
              setTimeout(res, 900);
            }).then(function() {
              return tryOnce(n + 1);
            });
          }
          if (r.code === "captcha") {
            SelfService._captchaUntil = Date.now() + 10 * 60 * 1e3;
            return r;
          }
          return r;
        });
      }
      return tryOnce(0);
    },
    _WV_RSA_N: "beba9d5db9fab5fda469b1cb46813d20048ee5f662c4a2b922c15c04c274875b5fd1651bdc733281c0b7f8d79c49c7ad312a0f9923ab0cb480eac056c061052d379f44ce6f3ff7857645d70746291637e06a7a412afe193afcc25991a11ce5250024475626b3b196da3c7bcb621b076775d349b4bc888543620ad0087833b3650b58451abb7e3cf474c0720ec0d95d997c30f3a9a1e3e41539be8a5b7e68ec71739b3f40ddcb8216e0c73f7dc26826cd5eecce21660ea24c86fc3939e5b2c3a291c91e9cef6657e19dc5d3921bd2b69544c24beab115743fbe077b2568b47933981b676e128036bb64f76ff1b923f87c127fad386e80c74af3b69fd8b45d10cd",
    _WV_RSA_E: "010001",
    _WV_EXT_ID: "31zgXGbg",
    _wvRsaEncrypt: function(text) {
      var utf8 = unescape(encodeURIComponent(text));
      var n = BigInt("0x" + this._WV_RSA_N), e = BigInt("0x" + this._WV_RSA_E);
      var m = new Uint8Array(256);
      m[0] = 0;
      m[1] = 2;
      var i = 2, padLen = 256 - utf8.length - 3;
      for (var k = 0; k < padLen; k++) {
        var r = 0;
        while (r === 0) r = Math.floor(Math.random() * 256);
        m[i++] = r;
      }
      m[i++] = 0;
      for (var j = 0; j < utf8.length; j++) m[i++] = utf8.charCodeAt(j);
      var bi = 0n;
      for (var q = 0; q < 256; q++) bi = bi << 8n | BigInt(m[q]);
      var result = 1n, base = bi % n, ex = e;
      while (ex > 0n) {
        if (ex & 1n) result = result * base % n;
        base = base * base % n;
        ex >>= 1n;
      }
      var hex = result.toString(16).padStart(512, "0");
      var raw = "";
      for (var q2 = 0; q2 < 512; q2 += 2) raw += String.fromCharCode(parseInt(hex.substr(q2, 2), 16));
      return btoa(raw);
    },
    _wvHttpRunning: null,
    _wvHttpLogin: function() {
      if (SelfService._wvHttpRunning) return SelfService._wvHttpRunning;
      var sid = Cred.sid(), pwd = Cred.pwd();
      if (!sid || !pwd) return Promise.resolve({
        ok: false,
        reason: "no-cred"
      });
      SelfService._chainLog("自助账密登录（纯 HTTP）开始");
      var B = "https://webvpn.cauc.edu.cn";
      var self = this;
      var ext0 = self._WV_EXT_ID;
      var got = ext0 ? Promise.resolve({
        __cached: true
      }) : Net.request(B + "/api/access/authentication/list?type=0", {
        method: "GET",
        timeout: 8e3
      });
      var run = got.then(function(r) {
        var ext = self._WV_EXT_ID;
        if (r && r.text) {
          try {
            var j = JSON.parse(r.text ? r.text() : "{}");
            var list = j.data && j.data.list || [];
            for (var i = 0; i < list.length; i++) if (list[i].externalId) {
              ext = list[i].externalId;
              break;
            }
          } catch (e) {}
        }
        if (ext) self._WV_EXT_ID = ext;
        var data = JSON.stringify({
          deviceId: function() {
            try {
              var d = localStorage.getItem("cauc_wv_did");
              if (!d || !/^[0-9a-f]{32}$/.test(d)) {
                d = "";
                for (var i = 0; i < 32; i++) d += "0123456789abcdef".charAt(Math.floor(Math.random() * 16));
                localStorage.setItem("cauc_wv_did", d);
              }
              return d;
            } catch (e) {
              var d2 = "";
              for (var j = 0; j < 32; j++) d2 += "0123456789abcdef".charAt(Math.floor(Math.random() * 16));
              return d2;
            }
          }(),
          userName: sid,
          password: self._wvRsaEncrypt(pwd)
        });
        return Net.request(B + "/api/access/auth/finish", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Origin: B,
            Referer: B + "/auth/login"
          },
          data: JSON.stringify({
            externalId: ext,
            data: data
          }),
          timeout: 15e3
        });
      }).then(function(r) {
        var j = {};
        try {
          j = JSON.parse(r.text ? r.text() : "{}");
        } catch (e) {}
        var token = j.data && j.data.token || "";
        if (j.code !== 0 || !token) return {
          ok: false,
          reason: "api",
          body: String(j.message || (r.text ? r.text() : "")).slice(0, 80)
        };
        var LWc = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LoginWebView || null;
        var preC = LWc && LWc.clearWebvpnCookies ? LWc.clearWebvpnCookies().catch(function() {
          return null;
        }) : Promise.resolve(null);
        var put = preC.then(function() {
          return LWc && LWc.setCookie ? LWc.setCookie({
            url: "https://webvpn.cauc.edu.cn/",
            cookie: "webvpn-token=" + token + "; Path=/; Domain=cauc.edu.cn"
          }).then(function() {
            return true;
          }, function() {
            return true;
          }) : Promise.resolve(true);
        });
        return put.then(function() {
          return {
            ok: true,
            token: token
          };
        });
      });
      SelfService._wvHttpRunning = run.then(function(r) {
        SelfService._wvHttpRunning = null;
        SelfService._chainLog("自助账密登录结束（ok=" + (r && r.ok) + "）");
        return r;
      }, function(e) {
        SelfService._wvHttpRunning = null;
        throw e;
      });
      return SelfService._wvHttpRunning;
    },
    _lock: null,
    _locked: function(fn) {
      if (!SelfService._lock) SelfService._lock = Promise.resolve();
      var next = SelfService._lock.then(function() {
        return fn();
      }, function() {
        return fn();
      });
      SelfService._lock = next.then(function() {}, function() {});
      return next;
    },
    alive: function(fresh) {
      return SelfService._locked(function() {
        return SelfService._aliveBody(fresh);
      });
    },
    _aliveBody: function(fresh) {
      if (!fresh && SelfService._okAt && Date.now() - SelfService._okAt < 3 * 60 * 1e3) {
        SelfService._chainLog("alive：3 分钟内缓存命中，跳过");
        return Promise.resolve(true);
      }
      SelfService._chainLog("alive 检测开始（GET /Self/dashboard）");
      return SelfService._get("/Self/dashboard", 12e3).then(function(r) {
        var t = (r.text ? r.text() : "") || "";
        var ok = r.status === 200 && (t.indexOf("getOnlineList") >= 0 || t.indexOf("OnlineLis10Big") >= 0);
        if (ok) {
          SelfService._okAt = Date.now();
          try {
            var LW = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LoginWebView || null;
            if (LW && LW.vaultSave) {
              LW.vaultSave({
                url: SelfService.base() + "/Self/dashboard"
              });
            }
          } catch (e) {}
        }
        return ok;
      }).catch(function() {
        return false;
      });
    },
    online: function() {
      return SelfService._locked(function() {
        return SelfService._onlineBody();
      });
    },
    _onlineBody: function() {
      SelfService._chainLog("在线设备查询开始（GET getOnlineList）");
      return SelfService._get("/Self/dashboard/getOnlineList").then(function(r) {
        var t = (r.text ? r.text() : "") || "";
        var j = JSON.parse(t);
        if (!(j instanceof Array)) throw new Error("设备列表响应格式异常");
        SelfService._devCache = j;
        SelfService._devCacheAt = Date.now();
        return j.map(function(x) {
          return {
            ip: x.ip || "",
            mac: x.mac || "",
            hostName: x.hostName || "",
            terminalType: String(x.terminalType || "").replace(/^#/, ""),
            loginTime: x.loginTime || "",
            useTime: parseInt(x.useTime || "0", 10) || 0,
            upFlow: parseInt(x.upFlow || "0", 10) || 0,
            downFlow: parseInt(x.downFlow || "0", 10) || 0,
            sessionId: x.sessionId || x.sessionid || x.session_id || "",
            online: true
          };
        });
      });
    },
    history: function() {
      return SelfService._get("/Self/dashboard/getLoginHistory").then(function(r) {
        var t = (r.text ? r.text() : "") || "";
        var j = [];
        try {
          j = JSON.parse(t);
        } catch (e) {
          j = [];
        }
        return (j || []).map(function(a) {
          return {
            loginAt: a[0] || 0,
            logoutAt: a[1] || 0,
            ip: a[2] || "",
            mac: a[3] || "",
            useTime: (a[4] || 0) * 60,
            flowGB: a[5] || 0,
            hostName: a[8] || "",
            terminalType: a[10] || String(a[9] || "").replace(/^#/, ""),
            online: !a[1]
          };
        });
      });
    },
    kick: function(sessionId) {
      return SelfService._locked(function() {
        return SelfService._get("/Self/dashboard/tooffline?sessionid=" + encodeURIComponent(sessionId), 1e4).then(function(r) {
          var t = (r.text ? r.text() : "") || "";
          var j = null;
          try {
            j = JSON.parse(t);
          } catch (e) {}
          if (j && j.success === true) {
            SelfService._devCache = null;
            SelfService._devCacheAt = 0;
            return {
              ok: true
            };
          }
          throw new Error(j && (j.message || j.msg) || "学校系统未确认下线（可能已掉线）");
        });
      });
    },
    logout: function() {
      SelfService._okAt = 0;
      SelfService._devCache = null;
      SelfService._devCacheAt = 0;
      return SelfService._get("/Self/login/logout", 8e3).catch(function() {
        return null;
      });
    }
  };
  var Cred = {
    b64: function(s) {
      try {
        return btoa(unescape(encodeURIComponent(s)));
      } catch (e) {
        return "";
      }
    },
    unb64: function(s) {
      try {
        return decodeURIComponent(escape(atob(s)));
      } catch (e) {
        return "";
      }
    },
    sid: function() {
      return localStorage.getItem("cauc_sid") || "";
    },
    pwd: function() {
      var v = sessionStorage.getItem("cauc_pwd");
      if (v) return v;
      var b = localStorage.getItem("cauc_pwd_b64");
      return b ? Cred.unb64(b) : "";
    },
    save: function(sid, pwd) {
      if (sid) localStorage.setItem("cauc_sid", sid);
      if (pwd) {
        try {
          sessionStorage.setItem("cauc_pwd", pwd);
        } catch (e) {}
        localStorage.setItem("cauc_pwd_b64", Cred.b64(pwd));
      }
    },
    has: function() {
      return !!(Cred.sid() && Cred.pwd());
    },
    clear: function() {
      localStorage.removeItem("cauc_pwd_b64");
      try {
        sessionStorage.removeItem("cauc_pwd");
      } catch (e) {}
      [ "cauc_wv_ok_at", "cauc_wv_ask_at", "cauc_wv_fail_at" ].forEach(function(k) {
        localStorage.removeItem(k);
      });
    }
  };
  function cacheTtlSec(key, defSec) {
    try {
      var c = JSON.parse(localStorage.getItem("cauc_cache_ttl") || "{}");
      var v = Number(c[key]);
      return c[key] == null || isNaN(v) ? defSec : Math.max(0, v);
    } catch (e) {
      return defSec;
    }
  }
  function cacheTtlMin(key, defMin) {
    return cacheTtlSec(key, (defMin || 0) * 60) / 60;
  }
  var STATE = {
    channel: "unknown"
  };
  var _lastXsxx = null;
  var _ecardAccount = localStorage.getItem("cauc_ecard_account") || "";
  var REAL_ENDPOINTS = {
    weekCourses: "http://jwgl.cauc.edu.cn/kbcx/xskbcxMobile_cxXsgrkb.html?gnmkdm=Y253511",
    exams: "http://jwgl.cauc.edu.cn/pkmdgl/ksmdglMobile_cxKsxxList.html?doType=app",
    network: "http://www.cauc.edu.cn/Self/dashboard/getOnlineList?order=asc",
    networkHistory: "http://www.cauc.edu.cn/Self/dashboard/getLoginHistory?order=asc",
    networkAccount: "http://www.cauc.edu.cn/Self/dashboard/refreshaccount",
    networkMauth: "http://www.cauc.edu.cn/Self/dashboard/refreshMauthType",
    cardTurnover: "https://ec.cauc.edu.cn/berserker-search/search/personal/turnover",
    cardTypes: "https://ec.cauc.edu.cn/berserker-search/search/turnoverType",
    cardStats: "https://ec.cauc.edu.cn/berserker-search/statistics/turnover/count",
    allCourses: "",
    electricity: "",
    card: "",
    student: "",
    calendar: "",
    emptyRooms: "",
    gpa: ""
  };
  var PALETTE = [ "bg-blue", "bg-green", "bg-orange", "bg-purple", "bg-cyan", "bg-red", "bg-pink", "bg-indigo" ];
  var HX = [ "#1e6fd9", "#12a150", "#e08600", "#6a45d6", "#0f96b4", "#e0342c", "#d63d84", "#3b53c9" ];
  function weeks(a, b) {
    var r = [];
    for (var i = a; i <= b; i++) r.push(i);
    return r;
  }
  function oddWeeks(a, b) {
    var r = [];
    for (var i = a; i <= b; i++) if (i % 2 === 1) r.push(i);
    return r;
  }
  var MOCK = {
    user: {
      name: "张航",
      sid: "23010086",
      college: "电子信息与自动化学院",
      major: "电气工程及其自动化",
      className: "电气2301班",
      campus: "东丽校区",
      dorm: "南苑6公寓 512",
      grade: "2023级"
    },
    courses: [ {
      id: "c1",
      name: "电机学",
      teacher: "王立新",
      room: "北教22-226",
      day: 1,
      start: 1,
      end: 2,
      weeks: weeks(1, 16),
      credits: 4,
      type: "必修",
      color: 0
    }, {
      id: "c2",
      name: "电力电子技术",
      teacher: "陈艳",
      room: "北教22-226",
      day: 1,
      start: 3,
      end: 4,
      weeks: weeks(1, 16),
      credits: 3,
      type: "必修",
      color: 3
    }, {
      id: "c3",
      name: "自动控制原理",
      teacher: "周峰",
      room: "北教15-301",
      day: 2,
      start: 1,
      end: 2,
      weeks: weeks(1, 16),
      credits: 4,
      type: "必修",
      color: 1
    }, {
      id: "c4",
      name: "电气工程基础",
      teacher: "刘敏",
      room: "南教4-108",
      day: 2,
      start: 3,
      end: 4,
      weeks: weeks(1, 16),
      credits: 3,
      type: "必修",
      color: 4
    }, {
      id: "c5",
      name: "形势与政策",
      teacher: "王芳",
      room: "南教5-105",
      day: 2,
      start: 7,
      end: 8,
      weeks: oddWeeks(1, 16),
      credits: .5,
      type: "必修",
      color: 5
    }, {
      id: "c6",
      name: "大学英语(3)",
      teacher: "孙洁",
      room: "外语楼B203",
      day: 3,
      start: 1,
      end: 2,
      weeks: weeks(1, 16),
      credits: 2,
      type: "必修",
      color: 2
    }, {
      id: "c7",
      name: "习近平新时代中国特色社会主义思想概论",
      teacher: "张伟",
      room: "南教5-201",
      day: 3,
      start: 5,
      end: 6,
      weeks: weeks(1, 16),
      credits: 3,
      type: "必修",
      color: 6
    }, {
      id: "c8",
      name: "机械工程基础",
      teacher: "赵磊",
      room: "北教18-105",
      day: 4,
      start: 1,
      end: 2,
      weeks: weeks(1, 16),
      credits: 3,
      type: "必修",
      color: 7
    }, {
      id: "c9",
      name: "电力系统分析",
      teacher: "李强",
      room: "北教22-312",
      day: 4,
      start: 3,
      end: 4,
      weeks: weeks(1, 16),
      credits: 3,
      type: "必修",
      color: 0
    }, {
      id: "c10",
      name: "电工电子实验",
      teacher: "陈艳, 周峰",
      room: "实验楼A-305",
      day: 4,
      start: 5,
      end: 8,
      weeks: weeks(1, 8),
      credits: 1,
      type: "实践",
      color: 3
    }, {
      id: "c11",
      name: "信号与系统",
      teacher: "吴迪",
      room: "北教20-408",
      day: 5,
      start: 1,
      end: 2,
      weeks: weeks(1, 16),
      credits: 3,
      type: "必修",
      color: 1
    }, {
      id: "c12",
      name: "体育(3)",
      teacher: "郑鹏",
      room: "南区田径场",
      day: 5,
      start: 3,
      end: 4,
      weeks: weeks(1, 16),
      credits: 1,
      type: "必修",
      color: 4
    } ],
    exams: [ {
      id: "e1",
      course: "电机学",
      date: "2026-11-16",
      time: "09:00-11:00",
      room: "北教22-226",
      seat: "12",
      type: "闭卷",
      status: "未开始"
    }, {
      id: "e2",
      course: "电力电子技术",
      date: "2026-11-18",
      time: "14:00-16:00",
      room: "北教22-310",
      seat: "08",
      type: "闭卷",
      status: "未开始"
    }, {
      id: "e3",
      course: "自动控制原理",
      date: "2026-11-20",
      time: "09:00-11:00",
      room: "北教15-301",
      seat: "25",
      type: "闭卷",
      status: "未开始"
    }, {
      id: "e4",
      course: "大学英语(3)",
      date: "2026-11-24",
      time: "14:00-16:00",
      room: "外语楼B203",
      seat: "17",
      type: "闭卷",
      status: "未开始"
    } ],
    electricity: {
      building: "南苑6公寓",
      room: "512",
      campus: "东丽校区",
      light: {
        remain: 45.2,
        daily: 1.2,
        unit: "度"
      },
      ac: {
        remain: 88.6,
        daily: 3.5,
        unit: "度"
      },
      history: function() {
        var arr = [], base = 4.2;
        for (var i = 29; i >= 0; i--) {
          var d = new Date(2026, 8, 21);
          d.setDate(d.getDate() - i);
          var v = +(base + Math.sin(i / 3) * 1.1 + (i % 4 === 0 ? .7 : 0)).toFixed(1);
          arr.push({
            date: d.getMonth() + 1 + "/" + d.getDate(),
            value: Math.max(1.2, v)
          });
        }
        return arr;
      }()
    },
    network: {
      account: "23010086",
      online: true,
      ip: "10.24.99.66",
      gateway: "10.24.0.1",
      mac: "00:11:22:33:44:55",
      type: "无线校园网 CAUC-WLAN",
      upload: "1.24 GB",
      download: "18.63 GB",
      session: "2 小时 41 分",
      plan: "学生免费套餐"
    },
    card: {
      balance: 128.5,
      cardNo: "6000230100860",
      status: "正常",
      type: "学生卡",
      transactions: [ {
        id: "t1",
        title: "第三食堂",
        date: "今天 12:07",
        amount: -13.5,
        inflow: false
      }, {
        id: "t2",
        title: "校园卡充值",
        date: "昨天 20:31",
        amount: 100,
        inflow: true
      }, {
        id: "t3",
        title: "浴室刷卡",
        date: "昨天 21:12",
        amount: -4.2,
        inflow: false
      }, {
        id: "t4",
        title: "第一食堂",
        date: "09-19 11:48",
        amount: -11,
        inflow: false
      }, {
        id: "t5",
        title: "图书馆自助打印",
        date: "09-18 15:22",
        amount: -1.6,
        inflow: false
      } ]
    },
    calendar: [ {
      date: "09-07",
      title: "第一周 开学",
      sub: "2026-2027学年第一学期开始",
      done: true
    }, {
      date: "09-25",
      title: "中秋节",
      sub: "放假 3 天（含调休）",
      done: false
    }, {
      date: "10-01",
      title: "国庆节",
      sub: "放假 7 天",
      done: false
    }, {
      date: "11-16",
      title: "期中考试周",
      sub: "第 11 周",
      done: false
    }, {
      date: "01-04",
      title: "期末考试周",
      sub: "第 19 周起",
      done: false
    }, {
      date: "01-18",
      title: "寒假开始",
      sub: "2027 寒假",
      done: false
    } ],
    gpa: {
      total: 3.62,
      rank: "12 / 96",
      credits: 78.5,
      required: 165
    }
  };
  function delay(ms) {
    return new Promise(function(r) {
      setTimeout(r, ms);
    });
  }
  function clone(o) {
    return JSON.parse(JSON.stringify(o));
  }
  var SECTIONS = [ {
    n: 1,
    t: "08:00",
    e: "08:45"
  }, {
    n: 2,
    t: "08:50",
    e: "09:35"
  }, {
    n: 3,
    t: "10:05",
    e: "10:50"
  }, {
    n: 4,
    t: "10:55",
    e: "11:40"
  }, {
    n: 5,
    t: "13:30",
    e: "14:15"
  }, {
    n: 6,
    t: "14:20",
    e: "15:05"
  }, {
    n: 7,
    t: "15:35",
    e: "16:20"
  }, {
    n: 8,
    t: "16:25",
    e: "17:10"
  }, {
    n: 9,
    t: "18:30",
    e: "19:15"
  }, {
    n: 10,
    t: "19:20",
    e: "20:05"
  }, {
    n: 11,
    t: "20:10",
    e: "20:55"
  } ];
  function sectionTime(n) {
    var s = SECTIONS[n - 1] || {};
    if (!s.t) return "";
    return s.e ? s.t + "-" + s.e : s.t;
  }
  function semStart() {
    return new Date(CONFIG.SEMESTER_START + "T00:00:00");
  }
  function currentWeek() {
    var now = new Date;
    now.setHours(0, 0, 0, 0);
    var diff = Math.floor((now - semStart()) / 864e5);
    var w = Math.floor(diff / 7) + 1;
    return Math.min(Math.max(w, 1), CONFIG.TOTAL_WEEKS);
  }
  function weekStartDate(week) {
    var d = new Date(semStart());
    d.setDate(d.getDate() + (week - 1) * 7);
    return d;
  }
  function dayOfWeek(d) {
    var w = d.getDay();
    return w === 0 ? 7 : w;
  }
  var MockApi = {
    login: function(sid, pwd) {
      return delay(700).then(function() {
        if (!sid || !pwd) throw new Error("请输入学号与密码");
        if (!/^\d{6,16}$/.test(sid)) throw new Error("学号格式不正确（应为 6-16 位数字）");
        if (pwd.length < 6) throw new Error("密码至少 6 位");
        return {
          token: "mock." + btoa(sid + ":" + Date.now()).replace(/=/g, ""),
          user: clone(MOCK.user)
        };
      });
    },
    logout: function() {
      return delay(120).then(function() {
        return true;
      });
    },
    getStudent: function() {
      return delay(200).then(function() {
        return clone(MOCK.user);
      });
    },
    getWeekCourses: function(week) {
      return delay(260).then(function() {
        return clone(MOCK.courses).filter(function(c) {
          return c.weeks.indexOf(week) >= 0;
        }).map(function(c) {
          c.hex = HX[c.color % HX.length];
          return c;
        });
      });
    },
    getAllCourses: function() {
      return delay(260).then(function() {
        return clone(MOCK.courses).map(function(c) {
          c.hex = HX[c.color % HX.length];
          return c;
        });
      });
    },
    getExams: function() {
      return delay(240).then(function() {
        return clone(MOCK.exams);
      });
    },
    getElectricity: function() {
      return delay(300).then(function() {
        return clone(MOCK.electricity);
      });
    },
    getNetwork: function() {
      return delay(260).then(function() {
        return clone(MOCK.network);
      });
    },
    getNetOverview: function() {
      return delay(200).then(function() {
        var demo = {
          ok: true,
          devices: [ {
            ip: "10.24.99.66",
            mac: "AABBCCDDEEFF",
            hostName: "演示手机",
            terminalType: "移动终端",
            loginTime: "2026-09-23 08:12:00",
            useTime: 3600,
            upFlow: 0,
            downFlow: 1181,
            online: true
          } ]
        };
        return {
          online: true,
          httpStatus: 200,
          netType: "wifi",
          netTypeLabel: "WiFi",
          iface: "wlan0",
          ip: "10.24.99.66",
          prefix: 20,
          gateway: "10.24.0.1",
          dns: [ "10.10.0.1" ],
          ips: [ {
            iface: "wlan0",
            ip: "10.24.99.66",
            prefix: 20
          } ],
          model: "演示设备",
          campusIp: "10.24.99.66",
          channel: "direct",
          channelLabel: "校内直连",
          whenOnline: Promise.resolve(true),
          whenCampusIp: Promise.resolve("10.24.31.77"),
          whenDevices: Promise.resolve(demo)
        };
      });
    },
    selfDevices: function() {
      return delay(150).then(function() {
        return {
          ok: true,
          devices: [ {
            ip: "10.24.99.66",
            mac: "AABBCCDDEEFF",
            hostName: "演示设备",
            terminalType: "移动终端",
            loginTime: "2026-09-23 08:12:00",
            useTime: 3600,
            upFlow: 0,
            downFlow: 1181,
            online: true
          } ]
        };
      });
    },
    getCard: function() {
      return delay(260).then(function() {
        return clone(MOCK.card);
      });
    },
    cardLost: function() {
      return delay(200).then(function() {
        return {
          ok: true,
          msg: "（演示）挂失成功"
        };
      });
    },
    cardUnlost: function() {
      return delay(200).then(function() {
        return {
          ok: true,
          msg: "（演示）解挂成功"
        };
      });
    },
    cardFoundUrl: function() {
      return Promise.resolve("https://localhost/");
    },
    cardOpsUrl: function() {
      return Promise.resolve("https://localhost/");
    },
    getCalendar: function() {
      return delay(200).then(function() {
        return clone(MOCK.calendar);
      });
    },
    getGPA: function() {
      return delay(200).then(function() {
        return clone(MOCK.gpa);
      });
    },
    getEmptyRooms: function(q) {
      q = q || {};
      var weeks = q.weeks || [], days = q.days || [], sections = q.sections || [];
      if (!weeks.length || !days.length || !sections.length) {
        return Promise.reject(new Error("周次、星期、节次为必选（学校系统要求）"));
      }
      return delay(360).then(function() {
        var pool = q.ninghe ? [ "图书馆A201", "图书馆A305", "文教1-101", "文教1-204", "文教2-308", "实训楼B102" ] : [ "北教15-201", "北教18-305", "北教20-108", "南教4-206", "南教5-309", "实验楼A-210" ];
        return {
          total: pool.length,
          rooms: pool.map(function(r, i) {
            return {
              room: r,
              name: r,
              seats: 40 + i * 8,
              free: true,
              until: [ "11:40", "15:40", "17:40" ][i % 3]
            };
          })
        };
      });
    }
  };
  var RealApi = {
    _iasCheck: function(sid, pwd) {
      var X = CONFIG.XZX;
      if (!X) return Promise.resolve({
        ok: false,
        badPwd: false,
        netErr: true
      });
      var cas = X.base + "/berserker-auth/cas/login/wuhan?targetUrl=" + encodeURIComponent(X.target);
      return Net.request(X.ias + "/ias/loginCas", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        data: "continueurl=" + encodeURIComponent(cas) + "&sysid=HXYX&username=" + encodeURIComponent(sid) + "&password=" + encodeURIComponent(pwd),
        timeout: 12e3
      }).then(function(res) {
        var html = res && res.text ? res.text() : String(res && res._raw || "");
        var badPwd = /用户名或密码|密码错误|账号或密码|用户名不存在|账号不存在|认证失败/.test(html);
        var ok = /ssoticketid/.test(html) && !badPwd;
        return {
          ok: ok,
          badPwd: badPwd,
          netErr: false
        };
      }).catch(function() {
        return {
          ok: false,
          badPwd: false,
          netErr: true
        };
      });
    },
    login: function(sid, pwd) {
      if (!sid || !pwd) return Promise.reject(new Error("需要学号与统一身份认证密码"));
      var notes = [];
      return RealApi._iasCheck(sid, pwd).then(function(r) {
        if (r.badPwd) throw new Error("学号或密码不正确，请确认统一身份认证密码");
        if (!r.ok && !r.netErr) throw new Error("统一身份认证暂时无法登录，请稍后重试");
        if (r.netErr) notes.push("网络受限，已先保存账密（联网后自动校验）");
        try {
          Cred.save(sid, pwd);
        } catch (e) {}
        localStorage.setItem("cauc_sid", sid);
        localStorage.setItem("cauc_token", "real-" + Date.now());
        return RealApi._probeAndApply(true);
      }).then(function(ch) {
        if (ch === "webvpn") notes.push("已自动连接 WebVPN（校外通道）"); else if (ch === "direct") notes.push("校内直连可用");
        if (ch === "direct") {
          try {
            CampusNet.login(sid, pwd).catch(function() {});
          } catch (e) {}
        }
        return {
          token: "real-" + Date.now(),
          user: null,
          notes: notes
        };
      });
    },
    _resolve: function(url) {
      if (STATE.channel === "webvpn" && typeof CONFIG.WEBVPN.map === "function") {
        return CONFIG.WEBVPN.map(url);
      }
      return url;
    },
    _token: function() {
      return localStorage.getItem("cauc_token") || "";
    },
    _probeJwgl: function(force) {
      var now = Date.now();
      if (!force && RealApi._probeAt && RealApi._probeRes && now - RealApi._probeAt < CONFIG.PROBE_TTL) {
        return Promise.resolve(RealApi._probeRes);
      }
      if (RealApi._probing) return RealApi._probing;
      var direct = CONFIG.DIRECT_PROBE;
      RealApi._probing = RealApi._probeDirect(CONFIG.PROBE_TIMEOUT).then(function(ok) {
        if (ok) return "direct";
        try {
          return global.Net.request(CONFIG.WEBVPN.map(direct), {
            method: "GET",
            timeout: CONFIG.PROBE_TIMEOUT
          }).then(function(res) {
            var t = "";
            try {
              t = res.text ? res.text() : "";
            } catch (e) {
              t = "";
            }
            var isWvShell = /browser-compatibility|returnUrl=/i.test(t) && !/课表|xskbcx|正方/i.test(t);
            if (res && res.status >= 200 && res.status < 400) {
              if (isWvShell) localStorage.removeItem("cauc_wv_ok_at"); else localStorage.setItem("cauc_wv_ok_at", String(Date.now()));
              return "webvpn";
            }
            return global.Net.probe("https://webvpn.cauc.edu.cn/", CONFIG.PROBE_TIMEOUT).then(function(r3) {
              return r3 && r3.ok ? "webvpn" : "unreachable";
            });
          }).catch(function() {
            return global.Net.probe("https://webvpn.cauc.edu.cn/", CONFIG.PROBE_TIMEOUT).then(function(r3) {
              return r3 && r3.ok ? "webvpn" : "unreachable";
            });
          });
        } catch (e) {
          return "webvpn";
        }
      }).catch(function() {
        return "unreachable";
      }).then(function(res) {
        RealApi._probing = null;
        RealApi._probeAt = Date.now();
        RealApi._probeRes = res;
        return res;
      });
      return RealApi._probing;
    },
    _tryWebvpnLogin: function() {
      if (localStorage.getItem("cauc_wv_off") === "1") return Promise.resolve(false);
      if (RealApi._wvBlocked()) {
        RealApi._log("WebVPN：本网络已判校内（30 分钟窗口）→ 跳过登录尝试");
        return Promise.resolve(false);
      }
      if (RealApi._wvDirectHi()) {
        RealApi._log("WebVPN：本网络直连优先（5 分钟窗口）→ 跳过登录尝试");
        return Promise.resolve(false);
      }
      return RealApi._webvpnQuickAlive().then(function(alive) {
        if (alive) return true;
        return RealApi._webvpnLoginOnce();
      });
    },
    _webvpnLoginOnce: function(force) {
      var failAt = parseInt(localStorage.getItem("cauc_wv_fail_at") || "0", 10);
      if (!force && failAt && Date.now() - failAt < 30 * 1e3) return Promise.resolve(false);
      if (RealApi._wvLoginOkAt && Date.now() - RealApi._wvLoginOkAt < 15e3) {
        return Promise.resolve(true);
      }
      if (RealApi._silentLoginRunning) return RealApi._silentLoginRunning;
      var LW = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LoginWebView || null;
      var lastAt = parseInt(localStorage.getItem("cauc_wv_ask_at") || "0", 10);
      if (lastAt && Date.now() - lastAt < 8 * 1e3) return Promise.resolve(false);
      localStorage.setItem("cauc_wv_ask_at", String(Date.now()));
      RealApi._log("WebVPN: 实测确认会话失效 → 开始登录");
      var finishOk = function(via) {
        localStorage.setItem("cauc_wv_ok_at", String(Date.now()));
        localStorage.removeItem("cauc_wv_ask_at");
        localStorage.removeItem("cauc_wv_fail_at");
        RealApi._wvLoginOkAt = Date.now();
        RealApi._log("WebVPN: 登录成功（" + via + "）");
        try {
          window.dispatchEvent(new Event("cauc:webvpn-ok"));
        } catch (e) {}
        try {
          if (LW && LW.vaultSave) LW.vaultSave({
            url: "https://webvpn.cauc.edu.cn/"
          }).catch(function() {});
        } catch (e) {}
        RealApi._jwglSession().catch(function() {});
        return true;
      };
      var finishFail = function(reason, markBlocked) {
        if (markBlocked) {
          RealApi._markWvBlocked();
          return false;
        }
        if (/http-4|net-error|no-user|reject/i.test(reason)) {
          localStorage.setItem("cauc_wv_fail_at", String(Date.now()));
        }
        RealApi._log("WebVPN: 登录未成功（" + reason + "）");
        return false;
      };
      var webViewLogin = function() {
        var doSilent = function(preClear) {
          var head = preClear && LW && LW.clearWebvpnCookies ? LW.clearWebvpnCookies().catch(function() {
            return null;
          }) : Promise.resolve(null);
          return head.then(function() {
            return LW && LW.silentLogin ? LW.silentLogin({
              url: "https://webvpn.cauc.edu.cn/",
              user: Cred.sid(),
              pwd: Cred.pwd(),
              timeout: 15e3
            }) : Promise.resolve({
              ok: false,
              reason: "no-webview"
            });
          });
        };
        return doSilent(true).then(function(r0) {
          if (r0 && r0.ok) return r0;
          var why0 = String(r0 && r0.reason || "");
          if (/not-allowed/i.test(why0)) return r0;
          RealApi._log("登录未成功（" + why0 + "）→ 再清一次旧 webvpn-token 后重试");
          return doSilent(true);
        }).then(function(r) {
          RealApi._silentLoginRunning = null;
          if (r && r.ok) return finishOk("WebView");
          var reason = String(r && r.reason || "");
          if (/not-allowed/i.test(reason)) return finishFail(reason, true);
          return finishFail(reason, false);
        }).catch(function() {
          RealApi._silentLoginRunning = null;
          return false;
        });
      };
      RealApi._silentLoginRunning = SelfService._wvHttpLogin().then(function(hr) {
        RealApi._silentLoginRunning = null;
        if (hr && hr.ok) {
          var put = LW && LW.setCookie ? LW.setCookie({
            url: "https://webvpn.cauc.edu.cn/",
            cookie: "webvpn-token=" + hr.token + "; Path=/; Domain=cauc.edu.cn"
          }).then(function() {
            var H = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LoginWebView;
            if (H && H.hubIngest) H.hubIngest({
              url: "https://webvpn.cauc.edu.cn/",
              setCookie: [ "webvpn-token=" + hr.token + "; Path=/; Domain=cauc.edu.cn" ]
            }).catch(function() {});
            return true;
          }, function() {
            return true;
          }) : Promise.resolve(true);
          return put.then(function() {
            return finishOk("纯HTTP");
          });
        }
        RealApi._log("WebVPN: 纯 HTTP 未成（" + (hr && hr.reason || "?") + "）→ 回退 WebView");
        return webViewLogin();
      }).catch(function() {
        RealApi._silentLoginRunning = null;
        RealApi._log("WebVPN: 纯 HTTP 异常 → 回退 WebView");
        return webViewLogin();
      });
      return RealApi._silentLoginRunning;
    },
    _verifyWebvpnSession: function() {
      var sid = localStorage.getItem("cauc_sid") || "";
      if (!sid) return Promise.resolve(false);
      var LW = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LoginWebView || null;
      if (!LW || !LW.followChain) return Promise.resolve(false);
      var base = "https://http-jwgl-cauc-edu-cn-80.webvpn.cauc.edu.cn";
      var target = "kbcx/xskbcxMobile_cxTimeTableIndex.html?gnmkdm=Y253511";
      var url = base + "/mhsso/ltappiotlogin?loginName=" + encodeURIComponent(sid) + "&url=" + encodeURIComponent(target);
      return RealApi._race(LW.followChain({
        url: url,
        maxHops: 12,
        timeout: 6e3
      }), 7e3, {
        ok: false,
        reason: "js-timeout"
      }).then(function(r) {
        var fu = String(r && r.finalUrl || "").toLowerCase();
        var okUrl = fu.indexOf("http-jwgl-cauc-edu-cn-80.webvpn.cauc.edu.cn") >= 0 && fu.indexOf("/kbcx/") >= 0;
        var ok = !!(r && r.ok && r.status === 200 && okUrl);
        if (r && r.reason === "not-allowed") RealApi._markWvBlocked();
        RealApi._log("WebVPN 实战验证：" + (ok ? "通过" : "未通过") + "（" + (okUrl ? "落到教务页" : "无有效信号") + "，跳数 " + (r && r.hops || 0) + "）");
        return ok;
      }).catch(function() {
        return false;
      });
    },
    _wvsInflight: null,
    _wvsInvalid: false,
    _wvsLastOk: 0,
    _wvsLw: function() {
      return window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LoginWebView || null;
    },
    _hubAdoptWv: function(urls) {
      var LW = RealApi._wvsLw();
      if (!LW || !LW.cookies || !LW.hubIngest) return Promise.resolve(0);
      var seen = {};
      var list = [];
      (urls || []).forEach(function(u) {
        if (!u || seen[u]) return;
        seen[u] = 1;
        list.push(u);
      });
      if (!list.length) return Promise.resolve(0);
      return Promise.resolve(LW.cookies({
        urls: list
      })).then(function(r) {
        var jobs = [], n = 0;
        Object.keys(r || {}).forEach(function(u) {
          var arr = String(r[u] || "").split(";").map(function(x) {
            return x.trim();
          }).filter(function(x) {
            return x && x.indexOf("=") > 0;
          });
          if (!arr.length) return;
          n += arr.length;
          jobs.push(Promise.resolve(LW.hubIngest({
            url: u,
            setCookie: arr
          })).catch(function() {}));
        });
        return Promise.all(jobs).then(function() {
          if (n) RealApi._log("统一罐：已从 WebView 罐采纳 " + n + " 条 cookie（教务会话同步）");
          return n;
        });
      }).catch(function() {
        return 0;
      });
    },
    _healDupWvToken: function() {
      var LW = RealApi._wvsLw();
      if (!LW || !LW.cookies) return Promise.resolve(false);
      var url = "https://webvpn.cauc.edu.cn/";
      return LW.cookies({
        urls: [ url ]
      }).then(function(r) {
        var c = r && r[url] || "";
        var n = (c.match(/webvpn-token=/g) || []).length;
        if (n <= 1) return false;
        RealApi._log("★检测到 " + n + " 份 webvpn-token（网关会取过期那份）→ 清理为单份");
        return (LW.clearWebvpnCookies ? LW.clearWebvpnCookies() : Promise.resolve(null)).then(function() {
          return true;
        });
      }).catch(function() {
        return false;
      });
    },
    _wvsCheck: function(url) {
      if (!/webvpn\.cauc\.edu\.cn/.test(String(url || ""))) {
        return Promise.resolve(true);
      }
      var LW = RealApi._wvsLw();
      if (!LW || !LW.cookies) return Promise.resolve(false);
      return LW.cookies({
        urls: [ url ]
      }).then(function(r) {
        var c = r && r[url] || "";
        return /webvpn-token=/.test(c);
      }).catch(function() {
        return false;
      });
    },
    _wvsLogin: function() {
      if (typeof STATE !== "undefined" && STATE.channel === "direct" && localStorage.getItem("cauc_wv_off") === "1") {
        return Promise.resolve({
          ok: true,
          via: "direct-skip"
        });
      }
      var LW = RealApi._wvsLw();
      var sid = Cred.sid(), pwd = Cred.pwd();
      if (!LW || !LW.silentLogin) return Promise.resolve({
        ok: false,
        reason: "no-plugin"
      });
      if (!sid || !pwd) return Promise.resolve({
        ok: false,
        reason: "no-cred"
      });
      RealApi._log("会话层：开始静默登录（离屏 WebView）");
      var doLogin = function(preClear) {
        var head = preClear && LW.clearWebvpnCookies ? LW.clearWebvpnCookies().catch(function() {
          return null;
        }) : Promise.resolve(null);
        return head.then(function() {
          return LW.silentLogin({
            url: "https://webvpn.cauc.edu.cn/",
            user: sid,
            pwd: pwd,
            timeout: 2e4
          });
        });
      };
      return doLogin(true).then(function(r0) {
        if (r0 && r0.ok) return r0;
        var why0 = String(r0 && r0.reason || "");
        if (/not-allowed/i.test(why0)) return r0;
        RealApi._log("会话层：首次登录未成功（" + why0 + "）→ 再清一次旧 webvpn-token 重试");
        return doLogin(true);
      }).then(function(r) {
        if (r && r.ok) {
          RealApi._wvsInvalid = false;
          RealApi._wvsLastOk = Date.now();
          try {
            localStorage.setItem("cauc_wv_ok_at", String(Date.now()));
          } catch (e) {}
          try {
            if (LW.vaultSave) LW.vaultSave({
              url: "https://webvpn.cauc.edu.cn/"
            });
          } catch (e) {}
          RealApi._log("会话层：静默登录成功");
          return {
            ok: true,
            via: "silent-login"
          };
        }
        var why = String(r && r.reason || "fail");
        RealApi._log("会话层：静默登录失败 " + why);
        return {
          ok: false,
          reason: why
        };
      }).catch(function(e) {
        RealApi._log("会话层：静默登录异常 " + String(e));
        return {
          ok: false,
          reason: "exception"
        };
      });
    },
    wvSessionEnsure: function(url, force) {
      var target = url || "https://webvpn.cauc.edu.cn/";
      if (RealApi._wvsInflight) return RealApi._wvsInflight;
      var now = Date.now();
      if (!force && RealApi._wvsFailAt && now - RealApi._wvsFailAt < 2e4) {
        return Promise.resolve({
          ok: false,
          reason: "cooldown"
        });
      }
      if (!force && !RealApi._wvsInvalid && RealApi._wvsLastOk && now - RealApi._wvsLastOk < 6e4) {
        return Promise.resolve({
          ok: true,
          cached: true
        });
      }
      RealApi._wvsInflight = RealApi._wvsCheck(target).then(function(has) {
        if (has && !force && !RealApi._wvsInvalid) {
          RealApi._wvsLastOk = Date.now();
          return {
            ok: true,
            via: "webview-cookie"
          };
        }
        return RealApi._wvsLogin().then(function(r) {
          if (r && r.ok) RealApi._wvsFailAt = 0; else RealApi._wvsFailAt = Date.now();
          return r;
        });
      }).then(function(r) {
        RealApi._wvsInflight = null;
        return r;
      }).catch(function() {
        RealApi._wvsInflight = null;
        return {
          ok: false,
          reason: "exception"
        };
      });
      return RealApi._wvsInflight;
    },
    wvSessionInvalidate: function(why) {
      RealApi._wvsInvalid = true;
      RealApi._wvsLastOk = 0;
      try {
        localStorage.removeItem("cauc_wv_ok_at");
      } catch (e) {}
      RealApi._log("会话层：标记失效（" + String(why || "") + "）");
    },
    disconnectWebvpn: function() {
      localStorage.setItem("cauc_wv_off", "1");
      localStorage.removeItem("cauc_wv_ok_at");
      localStorage.removeItem("cauc_wv_ask_at");
      RealApi._jwglAt = 0;
      RealApi._kbInvalidate();
      RealApi._probeAt = 0;
      RealApi._probeRes = null;
      RealApi._probing2 = null;
      var p = [];
      try {
        var LW = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LoginWebView || null;
        if (LW && LW.clearWebvpnCookies) {
          p.push(LW.clearWebvpnCookies().catch(function() {
            return null;
          }));
        }
      } catch (e) {}
      return Promise.all(p).catch(function() {}).then(function() {
        STATE.channel = "direct";
        CONFIG.CHANNEL = "auto";
        RealApi._probeRes = "direct";
        RealApi._probeAt = Date.now();
        RealApi._log("WebVPN: 已断开，通道复原为校内直连");
        return "direct";
      });
    },
    connectWebvpn: function() {
      localStorage.removeItem("cauc_wv_off");
      localStorage.removeItem("cauc_wv_ask_at");
      localStorage.removeItem("cauc_wv_ok_at");
      localStorage.removeItem("cauc_wv_fail_at");
      localStorage.removeItem("cauc_wv_blocked_at");
      RealApi._probeAt = 0;
      RealApi._probeRes = null;
      RealApi._probing2 = null;
      CONFIG.CHANNEL = "auto";
      RealApi._log("WebVPN: 用户主动连接，开始后台静默登录");
      return RealApi._probeAndApply(true);
    },
    DIRECT_MARK: /正方|jwgl|xtgl|xkbcx|统一身份认证|教务|zhengfang/i,
    _probeDirectCache: null,
    _probeDirectCacheAt: 0,
    _probeDirect: function(timeout, noCache) {
      var now = Date.now();
      if (!noCache && RealApi._probeDirectCache !== null && now - RealApi._probeDirectCacheAt < 4e3) {
        return Promise.resolve(RealApi._probeDirectCache);
      }
      var u = CONFIG.DIRECT_PROBE + "?_t=" + Date.now();
      return global.Net.request(u, {
        method: "GET",
        timeout: timeout || CONFIG.PROBE_SHORT_TIMEOUT,
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache"
        }
      }).then(function(r) {
        var st = r.status || 0;
        var t = "";
        try {
          t = (r.text ? r.text() : "") || "";
        } catch (e) {}
        var looksSchool = RealApi.DIRECT_MARK.test(t) || t.indexOf("jwgl.cauc.edu.cn") >= 0;
        var ok = st > 0 && st < 500 && looksSchool;
        RealApi._log("直连探测：status=" + st + " len=" + t.length + " → " + (ok ? "可达" : "不可达"));
        RealApi._probeDirectCache = ok;
        RealApi._probeDirectCacheAt = Date.now();
        return ok;
      }).catch(function() {
        RealApi._log("直连探测：连接失败 → 不可达");
        RealApi._probeDirectCache = false;
        RealApi._probeDirectCacheAt = Date.now();
        return false;
      });
    },
    _netFp: null,
    _netFpAt: 0,
    _netFpInflight: null,
    _NETFP_TTL: 2e4,
    _probeNetFp: function(force) {
      if (!force && RealApi._netFp && Date.now() - RealApi._netFpAt < RealApi._NETFP_TTL) {
        return Promise.resolve(RealApi._netFp);
      }
      if (RealApi._netFpInflight) return RealApi._netFpInflight;
      var directP = RealApi._probeDirect(2e3).catch(function() {
        return false;
      });
      var wvP = global.Net.probe("https://webvpn.cauc.edu.cn/?_fp=" + Date.now(), 3e3).then(function(r) {
        return !!(r && r.ok);
      }).catch(function() {
        return false;
      });
      RealApi._netFpInflight = Promise.all([ directP, wvP ]).then(function(arr) {
        RealApi._netFpInflight = null;
        var fp = (arr[0] ? "in" : "no") + "+" + (arr[1] ? "out" : "no");
        RealApi._netFp = fp;
        RealApi._netFpAt = Date.now();
        RealApi._log("网络指纹：校内" + (arr[0] ? "可达" : "不可达") + " / 校外" + (arr[1] ? "可达" : "不可达") + " → " + fp);
        return fp;
      }).catch(function() {
        RealApi._netFpInflight = null;
        return RealApi._netFp || "unknown";
      });
      return RealApi._netFpInflight;
    },
    _applyNetFp: function(fp) {
      if (!fp) return false;
      var changed = RealApi._netFp !== null && RealApi._netFp !== fp;
      if (RealApi._netFp === null) {
        RealApi._netFp = fp;
        RealApi._netFpAt = Date.now();
        return false;
      }
      if (!changed) {
        RealApi._netFpAt = Date.now();
        return false;
      }
      RealApi._netFp = fp;
      RealApi._netFpAt = Date.now();
      RealApi._log("★网络环境已变化（" + fp + "）→ 清空通道粘性状态并重判");
      try {
        localStorage.removeItem("cauc_wv_off");
        localStorage.removeItem("cauc_wv_blocked_at");
        localStorage.removeItem("cauc_wv_directhi_at");
        localStorage.removeItem("cauc_wv_ok_at");
        localStorage.removeItem("cauc_wv_fail_at");
        localStorage.removeItem("cauc_net_on");
        localStorage.removeItem("cauc_net_on_at");
        localStorage.removeItem("cauc_net_ip");
        localStorage.removeItem("cauc_net_ip_at");
      } catch (e) {}
      CONFIG.CHANNEL = "auto";
      RealApi._probeAt = 0;
      RealApi._probeRes = null;
      RealApi._probing2 = null;
      RealApi._probeDirectCache = null;
      RealApi._probeDirectCacheAt = 0;
      RealApi._jwglAt = 0;
      RealApi._wvsInvalid = true;
      return true;
    },
    _probeAndApply: function(force) {
      return RealApi._probeNetFp().then(function(fp) {
        RealApi._applyNetFp(fp);
        return RealApi._probeAndApplyInner(force);
      }).catch(function(e) {
        RealApi._log("指纹阶段异常，直接回退原判定：" + String(e && e.message || e));
        return RealApi._probeAndApplyInner(force);
      }).then(function(ch) {
        RealApi._syncMapCampus();
        return ch;
      });
    },
    _mapCampusSent: null,
    _syncMapCampus: function() {
      var on = false;
      try {
        on = RealApi._jwglBase().indexOf("webvpn") >= 0;
      } catch (e) {}
      if (RealApi._mapCampusSent === on) return on;
      RealApi._mapCampusSent = on;
      var LW = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LoginWebView || null;
      if (LW && LW.setMapCampus) LW.setMapCampus({
        on: on
      }).catch(function() {});
      RealApi._log("映射开关 → " + (on ? "WebVPN改写" : "直连不改写"));
      return on;
    },
    _probeAndApplyInner: function(force) {
      if (localStorage.getItem("cauc_wv_off") === "1") {
        if (!force) {
          STATE.channel = "direct";
          RealApi._probeRes = "direct";
          RealApi._probeAt = Date.now();
          return Promise.resolve("direct");
        }
        try {
          localStorage.removeItem("cauc_wv_off");
        } catch (e) {}
        RealApi._log("探测：“已手动断开 WebVPN”标记被清除 → 重新判定通道");
      }
      if (CONFIG.CHANNEL !== "auto") {
        STATE.channel = CONFIG.CHANNEL;
        return Promise.resolve(STATE.channel);
      }
      if (!force && RealApi._probeAt && RealApi._probeRes && Date.now() - RealApi._probeAt < CONFIG.PROBE_TTL) {
        STATE.channel = RealApi._probeRes === "direct" ? "direct" : "webvpn";
        return Promise.resolve(STATE.channel);
      }
      if (RealApi._probing2) return RealApi._probing2;
      RealApi._probing2 = new Promise(function(resolve) {
        var settled = false;
        var finish = function(ch) {
          if (settled) return;
          settled = true;
          RealApi._probing2 = null;
          RealApi._probeAt = Date.now();
          RealApi._probeRes = ch === "direct" ? "direct" : "webvpn";
          STATE.channel = ch;
          if (ch === "webvpn") RealApi._jwglAt = 0;
          RealApi._log("通道判定：" + ch);
          try {
            window.dispatchEvent(new CustomEvent("cauc:channel-ready", {
              detail: {
                channel: ch
              }
            }));
          } catch (e) {}
          resolve(ch);
        };
        var directDone = false, directOk = false;
        var campusNet = RealApi._wvBlocked() || RealApi._wvDirectHi() || localStorage.getItem("cauc_wv_off") === "1";
        RealApi._probeDirect(CONFIG.PROBE_SHORT_TIMEOUT).then(function(ok) {
          directDone = true;
          if (ok) {
            directOk = true;
            if (campusNet) {
              finish("direct");
              return;
            }
            Promise.resolve(RealApi._race(wvPromise, 1200, {
              ok: false
            })).then(function(r) {
              if (settled) return;
              if (r && r.ok) {
                finish("webvpn");
                return;
              }
              RealApi._markDirectHi();
              finish("direct");
            }, function() {
              if (!settled) finish("direct");
            });
          }
        }).catch(function() {
          directDone = true;
        });
        var wvPromise = campusNet ? Promise.resolve(false) : RealApi._tryWebvpnLogin();
        var goDirect = function() {
          if (!directDone) {
            setTimeout(goDirect, 150);
            return;
          }
          finish(directOk ? "direct" : "webvpn");
        };
        var usablePromise = null;
        var webvpnUsable = function() {
          if (usablePromise) return usablePromise;
          if (campusNet) {
            usablePromise = Promise.resolve(false);
            return usablePromise;
          }
          usablePromise = wvPromise.then(function(ok) {
            if (ok) return true;
            RealApi._log("WebVPN 登录未确认 → 用映射域实战验证");
            return RealApi._verifyWebvpnSession();
          }).catch(function() {
            return RealApi._verifyWebvpnSession();
          });
          return usablePromise;
        };
        var markWebvpnUsable = function() {
          localStorage.setItem("cauc_wv_ok_at", String(Date.now()));
          localStorage.removeItem("cauc_wv_fail_at");
        };
        webvpnUsable().then(function(ok) {
          if (settled) return;
          if (ok) {
            markWebvpnUsable();
            finish("webvpn");
            return;
          }
          RealApi._log(ok ? "WebVPN 可达但本网络已被判拒绝 → 校内直连" : "WebVPN 不可用 → 回退校内直连");
          goDirect();
        });
        setTimeout(function() {
          if (settled) return;
          if (directDone && directOk) {
            finish("direct");
            webvpnUsable().then(function(ok) {
              if (!ok) return;
              markWebvpnUsable();
              if (STATE.channel !== "webvpn") {
                RealApi._switchTo("webvpn");
                RealApi._probeRes = "webvpn";
                RealApi._probeAt = Date.now();
                RealApi._log("WebVPN 实战验证通过 → 通道升级为 webvpn");
                try {
                  window.dispatchEvent(new Event("cauc:channel-changed"));
                } catch (e) {}
              }
            });
          }
        }, CONFIG.WEBVPN_FIRST_WAIT);
        setTimeout(function() {
          finish("webvpn");
        }, CONFIG.PROBE_RACE_TIMEOUT);
      });
      return RealApi._probing2;
    },
    _switchTo: function(ch) {
      STATE.channel = ch;
      RealApi._jwglAt = 0;
    },
    _wvBlocked: function() {
      var t = parseInt(localStorage.getItem("cauc_wv_blocked_at") || "0", 10);
      return !!(t && Date.now() - t < 30 * 60 * 1e3);
    },
    _markWvBlocked: function() {
      localStorage.setItem("cauc_wv_blocked_at", String(Date.now()));
      localStorage.removeItem("cauc_wv_ok_at");
      localStorage.removeItem("cauc_wv_ask_at");
      RealApi._log("WebVPN 在本网络被拒（校内）→ 30 分钟内静默走校内直连");
    },
    _wvDirectHi: function() {
      var t = parseInt(localStorage.getItem("cauc_wv_directhi_at") || "0", 10);
      return !!(t && Date.now() - t < 5 * 60 * 1e3);
    },
    _markDirectHi: function() {
      try {
        localStorage.setItem("cauc_wv_directhi_at", String(Date.now()));
      } catch (e) {}
      RealApi._log("直连实测可达 + WebVPN 未成功 → 5 分钟内直连优先（不再尝试 WebVPN 登录）");
    },
    _log: function(msg) {
      try {
        console.log("[CaucApi] " + msg);
      } catch (e) {}
    },
    _race: function(p, ms, fallback) {
      return Promise.race([ Promise.resolve(p), new Promise(function(res) {
        setTimeout(function() {
          res(fallback);
        }, ms);
      }) ]);
    },
    _silentLoad: function(opts, ms) {
      var LW = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LoginWebView || null;
      if (!LW || !LW.silent) return Promise.resolve(null);
      return RealApi._race(LW.silent(opts), ms || 15e3, {
        ok: false,
        reason: "js-timeout"
      });
    },
    _wvsGuard: function(p) {
      return p.then(function(ok) {
        if (!ok) return false;
        return RealApi._wvsCheck("https://webvpn.cauc.edu.cn/").then(function(has) {
          if (!has) {
            RealApi._log("探活：native 判定可用；WebView 罐暂无 token（纯 HTTP 登录的已知现象，不再据此重登）");
          }
          return true;
        });
      });
    },
    _webvpnQuickAlive: function() {
      var okAt = parseInt(localStorage.getItem("cauc_wv_ok_at") || "0", 10);
      if (okAt && Date.now() - okAt < 20 * 1e3) {
        return RealApi._wvsCheck("https://webvpn.cauc.edu.cn/").then(function(has) {
          if (has) return true;
          try {
            localStorage.removeItem("cauc_wv_ok_at");
          } catch (e) {}
          return false;
        });
      }
      if (RealApi._wvAliveProbing) return RealApi._wvAliveProbing;
      RealApi._wvAliveProbing = RealApi._wvsGuard(RealApi._wvProbeOnce()).then(function(ok) {
        RealApi._wvAliveProbing = null;
        if (ok) {
          localStorage.setItem("cauc_wv_ok_at", String(Date.now()));
          localStorage.removeItem("cauc_wv_fail_at");
        } else {
          try {
            localStorage.removeItem("cauc_wv_ok_at");
          } catch (e) {}
        }
        return ok;
      }, function() {
        RealApi._wvAliveProbing = null;
        try {
          localStorage.removeItem("cauc_wv_ok_at");
        } catch (e) {}
        return false;
      });
      return RealApi._wvAliveProbing;
    },
    _wvAliveProbing: null,
    _wvProbeOnce: function() {
      if (RealApi._wvProbeCache === true && RealApi._wvProbeCacheAt && Date.now() - RealApi._wvProbeCacheAt < 3e3) {
        return Promise.resolve(true);
      }
      var B = "https://https-www-cauc-edu-cn-443.webvpn.cauc.edu.cn";
      var JB = "https://http-jwgl-cauc-edu-cn-80.webvpn.cauc.edu.cn";
      var u = JB + "/pkmdgl/ksmdglMobile_cxKsxxList.html?doType=app&xnm=" + CONFIG.XNM + "&xqm=" + CONFIG.XQM;
      if (RealApi._wvBlocked() || RealApi._wvDirectHi()) {
        RealApi._log("登录态实测：本网络直连优先/已判校内 → 跳过 WebVPN 映射域探测（无需 WebVPN 会话）");
        RealApi._wvVerifyFailedAt = 0;
        return Promise.resolve(false);
      }
      var done = function(ok, why) {
        if (ok) {
          RealApi._wvVerifiedAt = Date.now();
          RealApi._wvVerifyFailedAt = 0;
          RealApi._wvGatewayDownAt = 0;
          RealApi._wvProbeCache = true;
          RealApi._wvProbeCacheAt = Date.now();
          try {
            localStorage.setItem("cauc_wv_ok_at", String(Date.now()));
          } catch (e) {}
        } else if (why === "网关兼容页" || why === "请求超时/异常" || why === "异常") {
          RealApi._wvGatewayDownAt = Date.now();
          RealApi._log("登录态实测：网关兼容页（网关侧间歇拦截 → 保持会话标记不变、不重登）");
        } else {
          RealApi._wvProbeCache = false;
          RealApi._wvProbeCacheAt = 0;
          RealApi._wvVerifyFailedAt = Date.now();
          RealApi._wvVerifiedAt = 0;
          try {
            localStorage.removeItem("cauc_wv_ok_at");
          } catch (e) {}
          RealApi._wvLoginOkAt = 0;
          if (why) RealApi._log("登录态实测：无效（" + why + "）");
        }
        return ok;
      };
      return global.Net.request(u, {
        method: "GET",
        timeout: 2500,
        headers: {
          Referer: JB + "/",
          "Cache-Control": "no-cache"
        }
      }).then(function(r) {
        var t = (r.text ? r.text() : "") || "";
        if (t.indexOf("浏览器兼容") >= 0 || t.indexOf("访问权限提示") >= 0) return done(false, "网关兼容页");
        if (t.indexOf("login_slogin") >= 0 || t.indexOf("教学管理信息服务平台") >= 0 && t.indexOf("统一身份认证") >= 0) {
          RealApi._wvVerifiedAt = Date.now();
          RealApi._wvVerifyFailedAt = 0;
          RealApi._wvGatewayDownAt = 0;
          RealApi._wvJwglNeedSessionAt = Date.now();
          RealApi._log("登录态实测：WebVPN 正常，但教务会话缺失 → 后台重跑免登链");
          Promise.resolve().then(function() {
            return RealApi._jwglSession(true);
          }).then(function() {
            RealApi._wvJwglNeedSessionAt = 0;
            RealApi._log("教务免登链重建完成");
            try {
              window.dispatchEvent(new Event("cauc:channel-ready"));
            } catch (e) {}
          }, function() {
            RealApi._wvJwglNeedSessionAt = 0;
            RealApi._log("教务免登链重建未成功（已交回各模块按需重试）");
          });
          return done(true, "");
        }
        if (t.indexOf('id="account"') >= 0 || t.indexOf("randomDiv") >= 0) {
          RealApi._healDupWvToken();
          return done(false, "落在登录页");
        }
        var isJson = false;
        try {
          JSON.parse(t);
          isJson = true;
        } catch (e) {}
        if (isJson || t.length >= 1e3) return done(true, "");
        return done(false, "网关兼容页");
      }, function() {
        return done(false, "请求超时/异常");
      }).catch(function() {
        return done(false, "异常");
      });
    },
    _wvVerifyRunning: null,
    wvVerifyNow: function() {
      if (RealApi._wvVerifyRunning) return RealApi._wvVerifyRunning;
      RealApi._wvVerifyRunning = RealApi._wvProbeOnce().then(function(alive) {
        if (alive) {
          try {
            window.dispatchEvent(new Event("cauc:channel-ready"));
          } catch (e) {}
          return true;
        }
        if (RealApi._wvGatewayDownAt) {
          RealApi._log("冷启动：网关兼容页 → 不自动重登（等网关恢复）");
          try {
            window.dispatchEvent(new Event("cauc:channel-ready"));
          } catch (e) {}
          return false;
        }
        if (RealApi._wvBlocked() || RealApi._wvDirectHi()) {
          RealApi._log("冷启动：本网络直连优先/已判校内 → 无需 WebVPN，不自动重登");
          try {
            window.dispatchEvent(new Event("cauc:channel-ready"));
          } catch (e) {}
          return false;
        }
        RealApi._log("冷启动：实测会话无效 → 自动重登");
        try {
          if (localStorage.getItem("cauc_wv_off") === "1") {
            RealApi._log("…但用户已主动断开 WebVPN → 保持直连，不自动重登");
            try {
              window.dispatchEvent(new Event("cauc:channel-ready"));
            } catch (e) {}
            return false;
          }
        } catch (e) {}
        return RealApi.reloginWebvpn().then(function(r) {
          return !!(r && r.verified);
        }, function() {
          return false;
        });
      }, function() {
        return false;
      }).then(function(v) {
        RealApi._wvVerifyRunning = null;
        return v;
      });
      return RealApi._wvVerifyRunning;
    },
    _webvpnAlive: function() {
      return RealApi._webvpnQuickAlive();
    },
    _ensureWebvpn: function() {
      return RealApi._tryWebvpnLogin();
    },
    _ensureWebvpnForce: function() {
      if (RealApi._wvBlocked() || RealApi._wvDirectHi()) {
        RealApi._log("WebVPN：本网络直连优先/已判校内 → 跳过强制登录（校内登必然失败）");
        return Promise.resolve(false);
      }
      try {
        localStorage.removeItem("cauc_wv_fail_at");
      } catch (e) {}
      return RealApi._webvpnLoginOnce(true).catch(function() {
        return false;
      });
    },
    _reloginAt: 0,
    _reloginRunning: null,
    reloginWebvpn: function() {
      RealApi._probeAt = 0;
      RealApi._probeRes = null;
      RealApi._probing2 = null;
      return RealApi._probeDirect(CONFIG.PROBE_SHORT_TIMEOUT).then(function(directOk) {
        if (directOk) {
          try {
            localStorage.removeItem("cauc_wv_fail_at");
          } catch (e) {}
          STATE.channel = "direct";
          RealApi._probeRes = "direct";
          RealApi._probeAt = Date.now();
          if (!RealApi._wvBlocked()) RealApi._markWvBlocked();
          RealApi._log("探测：直连实测可达 → 判定校内直连，**不登录 WebVPN**");
          try {
            window.dispatchEvent(new Event("cauc:channel-ready"));
          } catch (e) {}
          try {
            window.dispatchEvent(new Event("cauc:channel-changed"));
          } catch (e) {}
          RealApi._fetchKbList().catch(function() {});
          return {
            ok: true,
            verified: true,
            reason: "校内直连（本网络不需要 WebVPN）"
          };
        }
        RealApi._log("探测：直连实测不可达 → 校外，继续强制重登 WebVPN");
        try {
          localStorage.removeItem("cauc_wv_blocked_at");
        } catch (e) {}
        try {
          localStorage.removeItem("cauc_wv_directhi_at");
        } catch (e) {}
        return RealApi._reloginWebvpnReal();
      });
    },
    _reloginWebvpnReal: function() {
      if (RealApi._reloginRunning) {
        RealApi._log("重登：已有一次在进行 → 复用");
        return RealApi._reloginRunning;
      }
      var now = Date.now();
      if (RealApi._reloginAt && now - RealApi._reloginAt < 6e4) {
        RealApi._log("重登节流：60 秒内已登过 → 跳过（防网关风控）");
        return Promise.resolve({
          ok: true,
          verified: false,
          reason: "刚刚已重登过，请等一分钟再试"
        });
      }
      RealApi._reloginAt = now;
      try {
        localStorage.removeItem("cauc_wv_off");
      } catch (e) {}
      try {
        localStorage.removeItem("cauc_wv_fail_at");
      } catch (e) {}
      try {
        localStorage.removeItem("cauc_wv_ask_at");
      } catch (e) {}
      RealApi._log("一键重登：强制发起 WebVPN 登录");
      var p = RealApi._ensureWebvpnForce().then(function(ok) {
        if (!ok) return {
          ok: false,
          reason: "登录未成功（网关拒绝或超时）"
        };
        return new Promise(function(res) {
          setTimeout(res, 1200);
        }).then(function() {
          return RealApi._wvProbeOnce();
        }).then(function(alive) {
          try {
            window.dispatchEvent(new Event("cauc:channel-ready"));
          } catch (e) {}
          return alive ? {
            ok: true,
            verified: true
          } : {
            ok: true,
            verified: false,
            reason: "登录已发起，但学校网关仍在拦（可能触发风控，建议等几分钟）"
          };
        });
      }, function() {
        return {
          ok: false,
          reason: "登录异常"
        };
      });
      RealApi._reloginRunning = p.then(function(r) {
        RealApi._reloginRunning = null;
        return r;
      }, function(e) {
        RealApi._reloginRunning = null;
        throw e;
      });
      return RealApi._reloginRunning;
    },
    _ensureWebvpnLegacy: function() {
      return RealApi._webvpnQuickAlive().then(function(alive) {
        if (alive) return true;
        if (localStorage.getItem("cauc_wv_off") === "1") return false;
        var LW = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LoginWebView || null;
        if (!LW || !LW.silentLogin) return false;
        if (!RealApi._silentLoginRunning) {
          var lastAsk = parseInt(localStorage.getItem("cauc_wv_ask_at") || "0", 10);
          if (lastAsk && Date.now() - lastAsk < 8 * 1e3) return false;
          localStorage.setItem("cauc_wv_ask_at", String(Date.now()));
          RealApi._silentLoginRunning = LW.silentLogin({
            url: "https://webvpn.cauc.edu.cn/",
            user: Cred.sid(),
            pwd: Cred.pwd(),
            timeout: 9e3
          });
        }
        return RealApi._race(RealApi._silentLoginRunning, 9e3, {
          ok: false
        }).then(function(r) {
          RealApi._silentLoginRunning = null;
          if (r && r.ok) {
            localStorage.setItem("cauc_wv_ok_at", String(Date.now()));
            localStorage.removeItem("cauc_wv_ask_at");
            try {
              window.dispatchEvent(new Event("cauc:webvpn-ok"));
            } catch (e) {}
            RealApi._jwglSession().catch(function() {});
            return true;
          }
          if (r && r.reason === "not-allowed") RealApi._markWvBlocked();
          return false;
        });
      });
    },
    _withFallback: function(fn) {
      var NET = /timeout|Timeout|Unable to resolve|failed to connect|unexpected end|HTTP 30[123]|HTTP 901|非 JSON|network|WEBVPN/i;
      var SESSION = /会话未就绪|未登录|免登失效|登录已失效/i;
      return fn().catch(function(err) {
        var msg = String(err && err.message || err);
        if (SESSION.test(msg)) throw err;
        if (!NET.test(msg)) throw err;
        var hardFail = /failed to connect|Unable to resolve|timeout|timed out|network|ECONN|拒绝连接/i.test(msg);
        if (hardFail) {
          RealApi._log("连接类失败 → 清除通道判定缓存并重新判定：" + msg.slice(0, 60));
          RealApi._probeAt = 0;
          RealApi._probeRes = null;
          RealApi._jwglAt = 0;
          try {
            RealApi._clearJwglCookies();
          } catch (e) {}
          return RealApi._probeAndApply(true).then(function() {
            return fn();
          });
        }
        if (RealApi._probeRes === "direct" || STATE.channel === "direct") {
          RealApi._jwglAt = 0;
          try {
            RealApi._clearJwglCookies();
          } catch (e) {}
          return fn();
        }
        var needSwitch = STATE.channel !== "webvpn";
        if (needSwitch) RealApi._switchTo("webvpn");
        return RealApi._ensureWebvpn().then(function(ok) {
          if (!ok) {
            return new Promise(function(res) {
              setTimeout(res, 1500);
            }).then(function() {
              return RealApi._ensureWebvpn();
            }).then(function(ok2) {
              if (!ok2) {
                throw new Error("正在后台登录 WebVPN，稍后自动重试（无需手动操作）");
              }
              return fn();
            });
          }
          return fn();
        });
      });
    },
    _clearJwglCookies: function() {
      RealApi._log("教务残留 cookie：跳过清除（零破坏策略 · 不再误伤 WebVPN/自助服务会话）");
      return Promise.resolve();
    },
    _jwglBase: function() {
      return STATE.channel === "webvpn" ? "https://http-jwgl-cauc-edu-cn-80.webvpn.cauc.edu.cn" : "http://jwgl.cauc.edu.cn";
    },
    _jwglSession: function(force) {
      var sid = localStorage.getItem("cauc_sid") || "";
      if (!sid) return Promise.reject(new Error("缺少学号：请退出后用统一身份认证重新登录"));
      var now = Date.now();
      if (!force && RealApi._jwglAt && now - RealApi._jwglAt < 8 * 60 * 1e3) {
        return Promise.resolve(RealApi._jwglBase());
      }
      var ensureCh = RealApi._probeRes ? Promise.resolve(RealApi._probeRes) : RealApi._probeAndApply().catch(function() {
        return null;
      });
      return Promise.resolve(ensureCh).then(function() {
        var base = RealApi._jwglBase();
        var target = "kbcx/xskbcxMobile_cxTimeTableIndex.html?gnmkdm=Y253511";
        var url = base + "/mhsso/ltappiotlogin?loginName=" + encodeURIComponent(sid) + "&url=" + encodeURIComponent(target);
        var LW = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LoginWebView || null;
        if (LW && LW.followChain) {
          return Promise.resolve(LW.followChain({
            url: url,
            maxHops: 12,
            timeout: 2e4
          })).then(function(fc) {
            if (!fc || !fc.ok) throw new Error("followChain 异常：" + (fc && fc.error || "?"));
            var fu = String(fc.finalUrl || "").toLowerCase();
            if (fc.status === 200 && /仅限校外|请通过webvpn|outside/i.test(fc.bodySample || "")) {
              RealApi._markWvBlocked();
              RealApi._jwglAt = 0;
              throw new Error("WEBVPN/校内网络：WebVPN 不可用，已自动改用校内直连");
            }
            if (fu.indexOf("webvpn.cauc.edu.cn") >= 0 && (fu.indexOf("login") >= 0 || fu.indexOf("auth") >= 0 || fu.indexOf("site-nav") >= 0 || fu.indexOf("returnurl") >= 0)) {
              localStorage.removeItem("cauc_wv_ok_at");
              return RealApi._ensureWebvpn().then(function(ok) {
                if (!ok) throw new Error("WebVPN 后台登录未完成，稍后自动重试（无需手动操作）");
                return RealApi._jwglSession(true);
              });
            }
            var _bs = String(fc.bodySample || "").toLowerCase();
            if (_bs.indexOf("login_slogin") >= 0) {
              RealApi._jwglAt = 0;
              throw new Error("WEBVPN/会话未就绪：教务免登落到了登录页（将自动重登教务）");
            }
            RealApi._jwglAt = Date.now();
            return RealApi._hubAdoptWv([ base, base + "/", "https://webvpn.cauc.edu.cn/" ]).then(function() {
              if (STATE.channel === "webvpn") {
                localStorage.setItem("cauc_wv_ok_at", String(Date.now()));
              }
              return base;
            });
          }, function() {
            var run2 = LW && LW.silent ? RealApi._silentLoad({
              url: url,
              timeout: 2e4
            }, 24e3) : Net.request(url, {
              method: "GET",
              timeout: CONFIG.TIMEOUT
            });
            return Promise.resolve(run2).then(function(r) {
              if (r && r.reason === "not-allowed") {
                RealApi._markWvBlocked();
                RealApi._jwglAt = 0;
                throw new Error("WEBVPN/校内网络：WebVPN 不可用，已自动改用校内直连");
              }
              var fu = String(r && r.finalUrl || "").toLowerCase();
              if (STATE.channel === "webvpn" && fu && fu.indexOf("webvpn.cauc.edu.cn") >= 0 && (fu.indexOf("login") >= 0 || fu.indexOf("auth") >= 0 || fu.indexOf("site-nav") >= 0 || fu.indexOf("returnurl") >= 0)) {
                localStorage.removeItem("cauc_wv_ok_at");
                return RealApi._ensureWebvpn().then(function(ok) {
                  if (!ok) throw new Error("WebVPN 后台登录未完成，稍后自动重试（无需手动操作）");
                  return RealApi._jwglSession(true);
                });
              }
              RealApi._jwglAt = Date.now();
              return RealApi._hubAdoptWv([ base, base + "/", "https://webvpn.cauc.edu.cn/" ]).then(function() {
                if (STATE.channel === "webvpn") localStorage.setItem("cauc_wv_ok_at", String(Date.now()));
                return base;
              });
            }, function(e) {
              RealApi._jwglAt = 0;
              throw new Error("教务免登会话建立失败：" + (e.message || e));
            });
          });
        }
        var run = LW && LW.silent ? RealApi._silentLoad({
          url: url,
          timeout: 2e4
        }, 24e3) : Net.request(url, {
          method: "GET",
          timeout: CONFIG.TIMEOUT
        });
        return Promise.resolve(run).then(function(r) {
          if (r && r.reason === "not-allowed") {
            RealApi._markWvBlocked();
            RealApi._jwglAt = 0;
            throw new Error("WEBVPN/校内网络：WebVPN 不可用，已自动改用校内直连");
          }
          var fu = String(r && r.finalUrl || "").toLowerCase();
          if (STATE.channel === "webvpn" && fu && fu.indexOf("webvpn.cauc.edu.cn") >= 0 && (fu.indexOf("login") >= 0 || fu.indexOf("auth") >= 0 || fu.indexOf("site-nav") >= 0 || fu.indexOf("returnurl") >= 0)) {
            localStorage.removeItem("cauc_wv_ok_at");
            return RealApi._ensureWebvpn().then(function(ok) {
              if (!ok) throw new Error("WebVPN 后台登录未完成，稍后自动重试（无需手动操作）");
              return RealApi._jwglSession(true);
            });
          }
          RealApi._jwglAt = Date.now();
          if (STATE.channel === "webvpn") localStorage.setItem("cauc_wv_ok_at", String(Date.now()));
          return base;
        }, function(e) {
          RealApi._jwglAt = 0;
          throw new Error("教务免登会话建立失败：" + (e.message || e));
        });
      });
    },
    _mapKbItem: function(it, idx) {
      it = it || {};
      var weeks = RealApi._zcdToWeeks(it.zcd || "");
      try {
        console.log("[CaucKb] " + (it.kcmc || "?") + " | xqj=" + it.xqj + " | jcs=" + (it.jcs || "") + ' | zcd="' + (it.zcd || "") + '" -> [' + weeks.join(",") + "]");
      } catch (e) {}
      var jc = String(it.jcs || it.jcor || it.jc || "").replace(/[^0-9-]/g, "");
      var seg = jc.split("-");
      var start = parseInt(seg[0], 10) || 1;
      var end = parseInt(seg[1] || seg[0], 10) || start;
      var day = parseInt(it.xqj, 10) || 1;
      var label = String(it.kcxz || "") + String(it.kclb || "") + String(it.kcmc || "");
      var type = String(it.kcxz || "").indexOf("选") >= 0 || String(it.kcbj || "").indexOf("选") >= 0 ? "选修" : /实验|实践|实习|课程设计|上机/.test(label) ? "实践" : "必修";
      var color = (idx || 0) % HX.length;
      return {
        id: String(it.jxb_id || String(it.kch || "k") + "-" + day + "-" + start),
        name: it.kcmc || "",
        teacher: it.xm || "",
        room: it.cdmc || "",
        day: day,
        start: start,
        end: end,
        weeks: weeks,
        credits: Number(it.xf) || 0,
        type: type,
        color: color,
        hex: HX[color]
      };
    },
    _zcdToWeeks: function(zcd) {
      var out = [];
      var s = String(zcd || "");
      var re = /(\d+)\s*(?:[-–~]\s*(\d+))?\s*周?/g;
      var m;
      while ((m = re.exec(s)) !== null) {
        var a = parseInt(m[1], 10);
        var b = m[2] ? parseInt(m[2], 10) : a;
        var tail = s.slice(re.lastIndex, re.lastIndex + 4);
        var mode = /^\s*[（(]?\s*单/.test(tail) ? "单" : /^\s*[（(]?\s*双/.test(tail) ? "双" : "";
        for (var i = a; i <= b && i <= 30; i++) {
          if (mode === "单" && i % 2 === 0) continue;
          if (mode === "双" && i % 2 === 1) continue;
          out.push(i);
        }
      }
      return out.filter(function(v, i, arr) {
        return arr.indexOf(v) === i;
      }).sort(function(a, b) {
        return a - b;
      });
    },
    KB_STORE_KEY: "cauc_kb_cache_v1",
    KB_TTL: 30 * 60 * 1e3,
    kbTtlMs: function() {
      return cacheTtlMin("kb", 30) * 60 * 1e3;
    },
    _kbLoadPersisted: function() {
      try {
        var raw = localStorage.getItem(RealApi.KB_STORE_KEY);
        if (!raw) return null;
        var o = JSON.parse(raw);
        if (o && o.list && o.list.length) return o;
      } catch (e) {}
      return null;
    },
    _kbPersist: function(list) {
      try {
        localStorage.setItem(RealApi.KB_STORE_KEY, JSON.stringify({
          at: Date.now(),
          list: list
        }));
      } catch (e) {}
    },
    _fetchKbList: function() {
      var now = Date.now();
      if (RealApi._kbCache && now - RealApi._kbCacheAt < RealApi.kbTtlMs()) {
        return Promise.resolve(RealApi._kbCache);
      }
      if (RealApi._kbLoading) return RealApi._kbLoading;
      var RETRIABLE = /会话|未登录|WebVPN|timeout|超时|网络|network|login|auth|免登|failed to connect|Unable to resolve/i;
      var KB_BACKOFF = [ 1500, 2500, 4e3, 6e3, 8e3 ];
      var tryOnce = function(n) {
        return RealApi._fetchKbListOnce(false).catch(function(e) {
          var msg = String(e && e.message || e);
          if (n < KB_BACKOFF.length && RETRIABLE.test(msg)) {
            return new Promise(function(res) {
              setTimeout(res, KB_BACKOFF[n]);
            }).then(function() {
              return tryOnce(n + 1);
            });
          }
          var old = RealApi._kbLoadPersisted();
          if (old) {
            RealApi._kbCache = old.list;
            RealApi._kbCacheAt = 0;
            return old.list;
          }
          throw e;
        });
      };
      RealApi._kbLoading = tryOnce(0).then(function(list) {
        RealApi._kbLoading = null;
        if (list && list.length) {
          RealApi._kbCache = list;
          RealApi._kbCacheAt = Date.now();
          RealApi._kbPersist(list);
          try {
            window.dispatchEvent(new Event("cauc:kb-updated"));
          } catch (e) {}
        }
        return list;
      }, function(e) {
        RealApi._kbLoading = null;
        throw e;
      });
      return RealApi._kbLoading;
    },
    _kbInvalidate: function() {
      RealApi._kbCache = null;
      RealApi._kbCacheAt = 0;
      try {
        localStorage.removeItem(RealApi.KB_STORE_KEY);
      } catch (e) {}
    },
    _fetchKbListOnce: function(attempt) {
      return RealApi._withJwglKickRetry(function() {
        return RealApi._withFallback(function() {
          return RealApi._fetchKbListBody(attempt);
        });
      });
    },
    _withJwglKickRetry: function(fn) {
      var KICK = /会话未就绪|未登录|免登失效|登录已失效/i;
      return fn().catch(function(e) {
        var msg = String(e && e.message || e);
        if (!KICK.test(msg)) throw e;
        var now = Date.now();
        if (RealApi._kickAt && now - RealApi._kickAt < 2e4) return fn();
        RealApi._kickAt = now;
        RealApi._jwglAt = 0;
        return RealApi._jwglSession(true).then(function() {
          return fn();
        });
      });
    },
    _fetchKbListBody: function(attempt) {
      return RealApi._jwglSession(attempt === true).then(function(base) {
        var url = base + "/kbcx/xskbcx_cxXsgrkb.html?gnmkdm=Y253511";
        var form = "xnm=" + CONFIG.XNM + "&xqm=" + CONFIG.XQM + "&kblx=1&doType=app";
        return Net.request(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Requested-With": "XMLHttpRequest"
          },
          data: form,
          timeout: CONFIG.TIMEOUT
        }).then(function(res) {
          var t = res.text ? res.text() : "";
          var bad = res.status !== 200;
          if (!bad) {
            try {
              JSON.parse(t);
            } catch (e) {
              bad = true;
            }
          }
          if (bad) {
            if (String(t).indexOf("浏览器兼容") >= 0) {
              RealApi._wvGatewayDownAt = Date.now();
              throw new Error("学校网关暂时不可用（兼容性提示页），稍后自动恢复");
            }
            RealApi._jwglAt = 0;
            RealApi._clearJwglCookies();
            var _ts = String(t);
            if (_ts.length < 1500 && /仅限.{0,10}校外使用|访问权限提示|不允许登录|请通过.{0,10}学校主页/.test(_ts)) {
              RealApi._markWvBlocked();
            }
            throw new Error("WEBVPN/会话未就绪：教务返回非 JSON（HTTP " + res.status + "，" + String(t).replace(/\s+/g, " ").slice(0, 40) + "）");
          }
          var d = JSON.parse(t);
          if (!d || !d.kbList) throw new Error("课表返回异常（可能未登录或会话过期）");
          _lastXsxx = d.xsxx || null;
          try {
            if (_lastXsxx) localStorage.setItem("cauc_xsxx", JSON.stringify(_lastXsxx));
          } catch (e) {}
          return d.kbList.map(RealApi._mapKbItem);
        });
      });
    },
    getWeekCourses: function(week) {
      return RealApi.getAllCourses().then(function(all) {
        return all.filter(function(c) {
          return !c.weeks.length || c.weeks.indexOf(week) >= 0;
        });
      });
    },
    getAllCourses: function() {
      var now = Date.now();
      if (RealApi._kbCache && now - RealApi._kbCacheAt < RealApi.kbTtlMs()) {
        return Promise.resolve(RealApi._kbCache);
      }
      var p = RealApi._kbLoadPersisted();
      if (p) {
        if (!RealApi._kbCache) {
          RealApi._kbCache = p.list;
          RealApi._kbCacheAt = 0;
        }
        if (!RealApi._kbLoading) RealApi._fetchKbList().catch(function() {});
        return Promise.resolve(p.list);
      }
      return RealApi._fetchKbList();
    },
    getExams: function() {
      var raw = REAL_ENDPOINTS.exams;
      if (!raw) return Promise.resolve([]);
      var exTtl = cacheTtlMin("exams", 5) * 6e4;
      if (RealApi._examsCache && exTtl > 0 && Date.now() - RealApi._examsCacheAt < exTtl) {
        return Promise.resolve(RealApi._examsCache);
      }
      return RealApi._withJwglKickRetry(function() {
        return RealApi._withFallback(function() {
          return Promise.resolve(RealApi._jwglSession()).then(function(base) {
            var path = raw.replace(/^https?:\/\/[^/]+/, "");
            var url = base + path + "&xnm=" + CONFIG.XNM + "&xqm=" + CONFIG.XQM;
            return Net.request(url, {
              method: "GET",
              timeout: CONFIG.TIMEOUT
            });
          }).then(function(res) {
            var t = res.text ? res.text() : "";
            var arr;
            try {
              arr = JSON.parse(t);
            } catch (e) {
              if (String(t).indexOf("浏览器兼容") >= 0) {
                RealApi._wvGatewayDownAt = Date.now();
                throw new Error("学校网关暂时不可用（兼容性提示页），稍后自动恢复");
              }
              RealApi._jwglAt = 0;
              throw new Error("WEBVPN/会话未就绪：考试接口返回非 JSON");
            }
            if (!Array.isArray(arr)) return [];
            var mapped = arr.map(function(e) {
              var s0 = String(e.kssj || "");
              var dm = s0.match(/(\d{4}-\d{2}-\d{2})/);
              var tm = s0.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
              return {
                id: e.kch || String(e.kcmc) + s0,
                course: e.kcmc || "",
                date: dm ? dm[1] : s0,
                time: tm ? tm[1] + "-" + tm[2] : "",
                room: e.cdmc || e.jsmc || "",
                seat: e.zwxh || "",
                type: e.khfsmc || e.ksfsmc || "",
                status: "未开始"
              };
            });
            RealApi._examsCache = mapped;
            RealApi._examsCacheAt = Date.now();
            return mapped;
          });
        });
      });
    },
    getElectricity: function(force) {
      var saved = null;
      try {
        saved = JSON.parse(localStorage.getItem("cauc_elec_room") || "null");
      } catch (e) {}
      if (!saved || !saved.room) {
        return Promise.reject(new Error("尚未设置宿舍房间 —— 请在「宿舍电费」里选择校区/楼栋/楼层/房间"));
      }
      var elTtl = cacheTtlMin("elec", 5) * 6e4;
      if (!force && RealApi._elecCache && elTtl > 0 && Date.now() - RealApi._elecCacheAt < elTtl) {
        return Promise.resolve(RealApi._elecCache);
      }
      var isNinghe = /宁河/.test(saved.area && (saved.area.areaname || saved.area.area) || "");
      var savedRoomObj = saved.room && typeof saved.room === "object" ? saved.room : null;
      var savedRoomStr = typeof saved.room === "string" ? saved.room : String(saved.room && (saved.room.roomid || saved.room.room) || "");
      var base = savedRoomStr.replace(/(空调|照明)$/, "");
      var mk = function(suffix) {
        var rp = isNinghe ? savedRoomObj || {
          roomid: base,
          room: base
        } : {
          roomid: base + suffix,
          room: base + suffix
        };
        return RealApi.getElecRoomInfo(saved.area, saved.building, saved.floor, rp);
      };
      if (isNinghe) {
        return mk("").then(function(ri) {
          var out = {
            building: saved.building && saved.building.building || "",
            room: ri.room != null && ri.room !== "" ? ri.room : base,
            campus: saved.area && (saved.area.areaname || saved.area.area) || CONFIG.CAMPUS,
            light: {
              remain: ri.remain,
              free: ri.free,
              daily: 0,
              unit: ri.unit || "元",
              total: ri.total
            },
            ac: {
              remain: ri.remain,
              free: ri.free,
              daily: 0,
              unit: ri.unit || "元",
              total: ri.total
            },
            history: [],
            ninghe: true
          };
          RealApi._elecCache = out;
          RealApi._elecCacheAt = Date.now();
          return out;
        });
      }
      return mk("照明").then(function(light) {
        return mk("空调").then(function(ac) {
          var out = {
            building: saved.building && saved.building.building || "",
            room: base,
            campus: saved.area && saved.area.area || CONFIG.CAMPUS,
            light: {
              remain: light.remain,
              free: light.free,
              daily: 0,
              unit: "度",
              total: light.total
            },
            ac: {
              remain: ac.remain,
              free: ac.free,
              daily: 0,
              unit: "度",
              total: ac.total
            },
            history: []
          };
          RealApi._elecCache = out;
          RealApi._elecCacheAt = Date.now();
          return out;
        });
      });
    },
    getDeviceNet: function() {
      var LW = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LoginWebView || null;
      if (!LW || !LW.netInfo) return Promise.resolve(null);
      return LW.netInfo().then(function(r) {
        return r || null;
      }).catch(function() {
        return null;
      });
    },
    _netTypeLabel: function(t) {
      var m = {
        wifi: "WiFi",
        cellular: "移动数据",
        vpn: "VPN",
        ethernet: "有线",
        none: "无网络"
      };
      return m[t] || (t || "未知");
    },
    getNetOverview: function(fresh) {
      var atOn = parseInt(localStorage.getItem("cauc_net_on_at") || "0", 10) || 0;
      var atIp = parseInt(localStorage.getItem("cauc_net_ip_at") || "0", 10) || 0;
      var onRaw = localStorage.getItem("cauc_net_on");
      var cachedOnline = atOn && Date.now() - atOn < 6e4 && onRaw === "1" ? true : atOn && Date.now() - atOn < 6e4 && onRaw === "0" ? false : null;
      var cachedCampus = Date.now() - atIp < 10 * 6e4 ? localStorage.getItem("cauc_net_ip") || "" : "";
      var whenCampusIp = CampusNet._myIp(!!fresh).catch(function() {
        return cachedCampus;
      });
      var whenOnline = CampusNet.status().then(function(s) {
        try {
          localStorage.setItem("cauc_net_on", s.online ? "1" : "0");
          localStorage.setItem("cauc_net_on_at", String(Date.now()));
          if (s.ip) localStorage.setItem("cauc_net_ip", s.ip);
          localStorage.setItem("cauc_net_ip_at", String(Date.now()));
        } catch (e) {}
        return s;
      }).catch(function() {
        return {
          netIn: null,
          online: cachedOnline === true,
          via: "cache"
        };
      });
      var whenDevices = (RealApi.selfDevices ? RealApi.selfDevices(!!fresh) : Promise.resolve({
        ok: false,
        devices: []
      })).catch(function() {
        return {
          ok: false,
          devices: []
        };
      });
      return RealApi.getDeviceNet().catch(function() {
        return null;
      }).then(function(d) {
        d = d || {};
        var ip = d.ip || "";
        var ips = d.ips && d.ips.length ? d.ips : ip ? [ {
          iface: d.iface || "",
          ip: ip,
          prefix: d.prefix || 0
        } ] : [];
        return {
          online: cachedOnline,
          netType: d.type || "none",
          netTypeLabel: RealApi._netTypeLabel(d.type),
          iface: d.iface || "",
          ip: ip,
          prefix: d.prefix || 0,
          gateway: d.gateway || "",
          dns: d.dns || [],
          ips: ips,
          model: d.model || "",
          campusIp: cachedCampus,
          channel: STATE.channel,
          channelLabel: STATE.channel === "webvpn" ? "WebVPN（校外）" : STATE.channel === "direct" ? "校内直连" : "未就绪",
          whenOnline: whenOnline,
          whenCampusIp: whenCampusIp,
          whenDevices: whenDevices
        };
      });
    },
    selfDevices: function(fast) {
      if (!fast) {
        var c0 = SelfService._devCache, at0 = SelfService._devCacheAt;
        if (c0 && Date.now() - at0 < cacheTtlMin("devices", 3) * 6e4) {
          return Promise.resolve({
            ok: true,
            devices: c0,
            fromCache: true
          });
        }
      }
      function online() {
        return SelfService.online().then(function(d) {
          return {
            ok: true,
            devices: d
          };
        });
      }
      function fallback(needCap) {
        return {
          ok: false,
          devices: [],
          needCaptcha: !!needCap
        };
      }
      if (SelfService._devLoading) {
        SelfService._chainLog("已有链在跑 → 直接复用（fast=" + !!fast + "）");
        return SelfService._devLoading;
      }
      SelfService._chainT0 = performance.now();
      SelfService._chainLog("设备链开始（force=" + !!fast + "）");
      var run = function() {
        return SelfService.alive(false).then(function(ok) {
          if (ok) return online();
          var sid = Cred.sid(), pwd = Cred.pwd();
          if (!sid || !pwd) return fallback(false);
          if (SelfService.captchaCooling()) return fallback(true);
          return SelfService.prepare().then(function(p) {
            if (p && p.loggedIn) return online();
            if (p && p.ok === false) return fallback(false);
            return SelfService.login(sid, pwd, "").then(function(r) {
              if (r && r.ok) return online();
              return fallback(r && (r.code === "captcha" || r.needCaptcha));
            });
          });
        }).catch(function() {
          return fallback(false);
        });
      };
      SelfService._devLoading = run();
      var devClear = function() {
        SelfService._devLoading = null;
      };
      SelfService._devLoading.then(devClear, devClear);
      return SelfService._devLoading;
    },
    getNetwork: function() {
      return RealApi.getNetOverview(false);
    },
    getCard: function() {
      var sno = localStorage.getItem("cauc_sid") || "";
      return Promise.all([ RealApi._ecardQuery("query_card", {
        idtype: "sno",
        id: sno
      }).then(function(d) {
        var c = d.query_card && d.query_card.card && d.query_card.card[0] || {};
        _ecardAccount = c.account || _ecardAccount;
        if (_ecardAccount) {
          localStorage.setItem("cauc_ecard_account", _ecardAccount);
          localStorage.setItem("cauc_ecard_account_sid", localStorage.getItem("cauc_sid") || "");
        }
        return c;
      }).catch(function() {
        return null;
      }), RealApi.getCardTurnover(20, 1).catch(function() {
        return [];
      }), RealApi.getCardStats().catch(function() {
        return null;
      }) ]).then(function(r) {
        var c = r[0], tx = r[1], st = r[2];
        return {
          balance: c ? Number(c.db_balance || 0) / 100 : null,
          cardNo: c && c.sno || sno,
          type: "学生卡",
          status: !c ? "余额需校内网/需登录一卡通" : c.lostflag === "1" ? "已挂失" : "正常",
          expire: c && c.expdate || "",
          transactions: tx,
          stats: st
        };
      });
    },
    getCalendar: function() {
      return Promise.reject(new Error("校历尚未接入真实接口（可在「教务系统」入口中查看学校页面）"));
    },
    getGPA: function() {
      var base = RealApi._jwglBase();
      var url = base + "/xsxy/xsxyqk_cxXsxyqkIndex.html?echarts=1&gnmkdm=N105515&layout=default";
      return RealApi._withFallback(function() {
        return Promise.resolve(RealApi._jwglSession()).then(function() {
          var LW = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LoginWebView || null;
          if (LW && LW.followChain) {
            return LW.followChain({
              url: url,
              maxHops: 12,
              timeout: 3e4,
              full: true
            }).then(function(r) {
              return {
                via: "http",
                r: r
              };
            }, function() {
              return null;
            });
          }
          return Promise.resolve({
            via: "net",
            r: null
          });
        });
      }).then(function(pack) {
        var r = pack && pack.r;
        var t = "";
        if (pack && pack.via === "http") {
          t = r && (r.body || r.bodySample) ? String(r.body || r.bodySample) : "";
        }
        var probe0 = function(txt) {
          var num = function(re) {
            var m = txt.match(re);
            return m ? parseFloat(m[1]) : null;
          };
          return {
            total: num(/GPA[）：:：\s]*([0-9]+\.?[0-9]*)/),
            plan: num(/计划总课程\s*([0-9]+)/)
          };
        }(t);
        if (!t || probe0.total == null && probe0.plan == null) {
          var LW2 = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LoginWebView || null;
          return (LW2 && LW2.silent ? RealApi._silentLoad({
            url: url,
            timeout: 3e4,
            extract: "text"
          }, 34e3) : Promise.resolve(null)).then(function(r2) {
            return r2 && (r2.text || r2.data) ? String(r2.text || r2.data) : "";
          });
        }
        return t;
      }).then(function(t) {
        if (!t) throw new Error("未取到学业情况页面（可先手动打开一次「教务系统 → 学业情况」）");
        var num = function(re) {
          var m = t.match(re);
          return m ? parseFloat(m[1]) : null;
        };
        var total = num(/GPA[）：:：\s]*([0-9]+\.?[0-9]*)/);
        if (total == null) total = num(/平均学分绩点[^0-9]{0,6}([0-9]+\.?[0-9]*)/);
        var planCnt = num(/计划总课程\s*([0-9]+)/);
        var passCnt = num(/通过\s*([0-9]+)\s*门/);
        var failCnt = num(/未通过\s*([0-9]+)\s*门/);
        var notYet = num(/未修\s*([0-9]+)\s*门/);
        var doing = num(/在读\s*([0-9]+)\s*门/);
        var req = 0, got = 0, m2;
        var r2 = /要求学分[:：]\s*([0-9.]+)/g, r3 = /获得学分[:：]\s*([0-9.]+)/g;
        var seen1 = {}, seen2 = {};
        while (m2 = r2.exec(t)) {
          if (!seen1[m2.index]) {
            seen1[m2.index] = 1;
            req += parseFloat(m2[1]);
          }
        }
        while (m2 = r3.exec(t)) {
          if (!seen2[m2.index]) {
            seen2[m2.index] = 1;
            got += parseFloat(m2[1]);
          }
        }
        return {
          total: total == null ? 0 : total,
          credits: Math.round(got * 10) / 10,
          required: Math.round(req * 10) / 10,
          rank: planCnt != null ? "计划" + planCnt + "门 · 通过" + (passCnt || 0) + " · 未过" + (failCnt || 0) + " · 未修" + (notYet || 0) + " · 在读" + (doing || 0) : "—"
        };
      });
    },
    ROOM_XQH: {
      dongli: "1",
      ninghe: "DC1013A4886D7BE4E0538D01030A5566"
    },
    ROOM_BUILDS: [ {
      v: "",
      t: "全部楼号"
    }, {
      v: "09",
      t: "北教15"
    }, {
      v: "24",
      t: "北教20"
    }, {
      v: "06",
      t: "南教4"
    }, {
      v: "29",
      t: "南教5"
    }, {
      v: "13",
      t: "北教1"
    }, {
      v: "15",
      t: "北教12"
    }, {
      v: "01",
      t: "北教14"
    }, {
      v: "18",
      t: "北教16"
    }, {
      v: "12",
      t: "北教17"
    }, {
      v: "20",
      t: "北教19"
    }, {
      v: "22",
      t: "北教2"
    }, {
      v: "19",
      t: "北教21"
    }, {
      v: "17",
      t: "北教22"
    }, {
      v: "07",
      t: "北教23"
    }, {
      v: "14",
      t: "北教24"
    }, {
      v: "08",
      t: "北教25"
    }, {
      v: "11",
      t: "北教3"
    }, {
      v: "02",
      t: "北教4"
    }, {
      v: "16",
      t: "北教6"
    }, {
      v: "10",
      t: "北教8"
    }, {
      v: "25",
      t: "北教9"
    }, {
      v: "23",
      t: "北实"
    }, {
      v: "33",
      t: "航安楼"
    }, {
      v: "32",
      t: "活动中心"
    }, {
      v: "26",
      t: "空管楼A座"
    }, {
      v: "27",
      t: "空管楼B座"
    }, {
      v: "28",
      t: "空管楼C座"
    }, {
      v: "21",
      t: "南化实"
    }, {
      v: "03",
      t: "南教1"
    }, {
      v: "36",
      t: "南教10"
    }, {
      v: "04",
      t: "南教2"
    }, {
      v: "05",
      t: "南教3"
    }, {
      v: "38",
      t: "南院金工化学楼"
    }, {
      v: "39",
      t: "南院旧图书馆"
    }, {
      v: "37",
      t: "实习基地"
    }, {
      v: "31",
      t: "无楼号"
    } ],
    ROOM_TYPES: [ {
      v: "",
      t: "全部类别"
    }, {
      v: "003",
      t: "普通教室"
    }, {
      v: "005",
      t: "多媒体教室"
    }, {
      v: "006",
      t: "智慧教室"
    }, {
      v: "008",
      t: "专业教室"
    }, {
      v: "007",
      t: "公共机房"
    }, {
      v: "004",
      t: "工程中心实习室"
    }, {
      v: "012",
      t: "实验室"
    }, {
      v: "002",
      t: "科研教室"
    }, {
      v: "010",
      t: "形体教室"
    }, {
      v: "011",
      t: "语音教室"
    }, {
      v: "009",
      t: "体育场地"
    } ],
    getEmptyRooms: function(q) {
      q = q || {};
      var weeks = q.weeks || [], days = q.days || [], sections = q.sections || [];
      if (!weeks.length || !days.length || !sections.length) {
        return Promise.reject(new Error("周次、星期、节次为必选（学校系统要求）"));
      }
      var zcd = 0;
      weeks.forEach(function(w) {
        zcd += Math.pow(2, parseInt(w, 10) - 1);
      });
      var jcd = 0;
      sections.forEach(function(s) {
        jcd += Math.pow(2, parseInt(s, 10) - 1);
      });
      var e = encodeURIComponent;
      var form = "xqh_id=" + e(q.ninghe ? RealApi.ROOM_XQH.ninghe : RealApi.ROOM_XQH.dongli) + "&xnm=" + CONFIG.XNM + "&xqm=" + CONFIG.XQM + "&cdlb_id=" + e(q.cdlb || "") + "&cdejlb_id=" + "&qszws=" + e(q.qszws || "") + "&jszws=" + e(q.jszws || "") + "&cdmc=" + e(q.cdmc || "") + "&cd_id=&lh=" + e(q.lh || "") + "&jyfs=0&cdjylx=&sfbhkc=" + "&zcd=" + zcd + "&xqj=" + e(days.join(",")) + "&jcd=" + jcd + "&queryModel.showCount=500&queryModel.currentPage=1" + "&queryModel.sortName=cdbh&queryModel.sortOrder=asc";
      return RealApi._withFallback(function() {
        return Promise.resolve(RealApi._jwglSession()).then(function(base) {
          return Net.request(base + "/cdjy/cdjy_cxKxcdlb.html?doType=query&gnmkdm=N2155", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
              "X-Requested-With": "XMLHttpRequest"
            },
            data: form,
            timeout: CONFIG.TIMEOUT
          });
        }).then(function(res) {
          var t = res.text ? res.text() : "";
          if (t.length < 500 && /login|登录/.test(t)) {
            RealApi._jwglAt = 0;
            throw new Error("WEBVPN/会话未就绪");
          }
          var d;
          try {
            d = JSON.parse(t);
          } catch (err) {
            throw new Error("空教室返回非 JSON：" + t.slice(0, 60));
          }
          var items = d && (d.items || d.rows) || [];
          if (q.ninghe) {
            var seen = {}, names = [];
            items.forEach(function(x) {
              var n = x.jxlmc || "";
              if (n && !seen[n]) {
                seen[n] = 1;
                names.push(n);
              }
            });
            if (names.length) {
              var old = [];
              try {
                old = JSON.parse(localStorage.getItem("cauc_room_builds_nh") || "[]");
              } catch (e) {}
              names.forEach(function(n) {
                if (old.indexOf(n) < 0) old.push(n);
              });
              try {
                localStorage.setItem("cauc_room_builds_nh", JSON.stringify(old));
              } catch (e) {}
            }
          }
          if (q.ninghe && q.bldg) {
            items = items.filter(function(x) {
              return (x.jxlmc || "") === q.bldg;
            });
          }
          return {
            total: d && d.totalResult != null ? d.totalResult : items.length,
            rooms: items.map(function(x) {
              return {
                no: x.cdbh || "",
                name: x.cdmc || "",
                seats: x.zws || "",
                floor: x.lch || "",
                building: x.jxlmc || "",
                type: x.cdlbmc || "",
                campus: x.xqmc || "",
                borrowable: x.sfkjy || "",
                note: x.bz || ""
              };
            })
          };
        });
      });
    },
    _bsk: function(url) {
      return RealApi._xzxLogin().then(function(tok) {
        return Net.request(url, {
          method: "GET",
          headers: tok ? {
            "synjones-auth": "bearer " + tok,
            synAccessSource: "app"
          } : {},
          timeout: CONFIG.TIMEOUT
        });
      }).then(function(res) {
        if (res.status !== 200) throw new Error("HTTP " + res.status);
        var d = res.json();
        if (d && d.code && d.code !== 200) throw new Error(d.msg || "接口返回错误");
        return d;
      });
    },
    _bskPost: function(url, obj, timeout) {
      return RealApi._xzxLogin().then(function(tok) {
        return Net.request(url, {
          method: "POST",
          headers: Object.assign({
            "Content-Type": "application/json; charset=UTF-8",
            synAccessSource: "app"
          }, tok ? {
            "synjones-auth": "bearer " + tok
          } : {}),
          data: JSON.stringify(obj),
          timeout: timeout || CONFIG.TIMEOUT
        });
      }).then(function(res) {
        if (res.status !== 200) throw new Error("HTTP " + res.status);
        var d = res.json();
        if (d && d.code && d.code !== 200) throw new Error(d.msg || "接口返回错误");
        return d;
      });
    },
    cardLost: function() {
      var acc = _ecardAccount || "";
      if (!acc) return Promise.reject(new Error("未获取到一卡通账号，请先在校园卡页刷新一次余额"));
      return RealApi._bskPost("http://ec.cauc.edu.cn/berserker-app/ykt/tsm/lostCard", {
        account: acc,
        synAccessSource: "app"
      }, 25e3).then(function(d) {
        var data = d && d.data || {};
        if (String(data.retcode) !== "0") throw new Error(data.errmsg || "挂失失败");
        return {
          ok: true,
          msg: data.errmsg || "挂失成功"
        };
      });
    },
    cardUnlost: function(password) {
      var acc = _ecardAccount || "";
      if (!acc) return Promise.reject(new Error("未获取到一卡通账号，请先在校园卡页刷新一次余额"));
      if (!password) return Promise.reject(new Error("请输入一卡通查询密码"));
      var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0;
        return (c === "x" ? r : r & 3 | 8).toString(16);
      });
      return RealApi._bskPost("http://ec.cauc.edu.cn/berserker-app/ykt/tsm/unlostCard", {
        account: acc,
        pwd: "1$1$" + password + "$1$" + uuid,
        pwdType: 1,
        synAccessSource: "app"
      }, 25e3).then(function(d) {
        var data = d && d.data || {};
        if (String(data.retcode) !== "0") throw new Error(data.errmsg || "解挂失败");
        return {
          ok: true,
          msg: data.errmsg || "解挂成功"
        };
      });
    },
    cardFoundUrl: function() {
      var LW = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LoginWebView || null;
      var u = "https://ec.cauc.edu.cn/berserker-base/redirect?appId=460&type=app&nodeId=-460&synAccessSource=app";
      return RealApi._xzxLogin().then(function(tok) {
        var full = tok ? u + "&synjones-auth=" + encodeURIComponent(tok) : u;
        if (LW && LW.followChain) {
          return LW.followChain({
            url: full,
            maxHops: 8,
            timeout: 15e3
          }).then(function(fc) {
            if (fc && fc.ok && fc.finalUrl) return fc.finalUrl;
            return full;
          }).catch(function() {
            return full;
          });
        }
        return full;
      });
    },
    cardOpsUrl: function() {
      var LW = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LoginWebView || null;
      var u = "https://ec.cauc.edu.cn/berserker-base/redirect?appId=30&type=app&nodeId=-30&synAccessSource=app";
      return RealApi._xzxLogin().then(function(tok) {
        var full = tok ? u + "&synjones-auth=" + encodeURIComponent(tok) : u;
        if (LW && LW.followChain) {
          return LW.followChain({
            url: full,
            maxHops: 8,
            timeout: 15e3
          }).then(function(fc) {
            if (fc && fc.ok && fc.finalUrl) return fc.finalUrl;
            return full;
          }).catch(function() {
            return full;
          });
        }
        return full;
      });
    },
    _ecardSsoAt: 0,
    _ecardIpCache: "",
    _ecardIpAt: 0,
    _ecardIp: function() {
      if (RealApi._ecardIpCache && Date.now() - RealApi._ecardIpAt < cacheTtlMin("ip", 10) * 6e4) {
        return Promise.resolve(RealApi._ecardIpCache);
      }
      return new Promise(function(resolve) {
        var settled = false;
        var finish = function(v) {
          if (settled) return;
          settled = true;
          resolve(v);
        };
        var to = setTimeout(function() {
          finish("");
        }, 3e3);
        try {
          fetch("https://icanhazip.com/").then(function(r) {
            return r.text();
          }).then(function(t) {
            var m = /([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})/.exec(t) || /([0-9a-fA-F]{2,}:[0-9a-fA-F:]{2,})/.exec(t);
            var v = m ? m[1].trim() : "";
            if (v) {
              RealApi._ecardIpCache = v;
              RealApi._ecardIpAt = Date.now();
            }
            clearTimeout(to);
            finish(v);
          }).catch(function() {
            clearTimeout(to);
            finish("");
          });
        } catch (e) {
          clearTimeout(to);
          finish("");
        }
      });
    },
    ecardPrewarm: function() {
      if (RealApi._ecardSsoAt && Date.now() - RealApi._ecardSsoAt < 10 * 60 * 1e3) return;
      RealApi._ecardSso().catch(function() {});
    },
    _ecardSso: function(force) {
      if (!force && RealApi._ecardSsoAt && Date.now() - RealApi._ecardSsoAt < 10 * 60 * 1e3) {
        return Promise.resolve(true);
      }
      return RealApi._xzxLogin().then(function(tok) {
        return Net.request("https://ec.cauc.edu.cn/berserker-base/redirect?appId=155&type=app&nodeId=-155&synjones-auth=" + encodeURIComponent(tok), {
          method: "GET",
          timeout: 15e3,
          disableRedirects: true
        });
      }).then(function(r) {
        var loc = r.headers && (r.headers.Location || r.headers.location) || "";
        if (!loc) throw new Error("SSO 未返回跳转地址");
        return Net.request(loc, {
          method: "GET",
          timeout: 2e4
        });
      }).then(function() {
        var LW = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LoginWebView || null;
        if (!LW || !LW.cookies) return true;
        return LW.cookies({
          urls: [ "http://ec.cauc.edu.cn:8088/web/common/checkEle.html" ]
        }).then(function(cks) {
          var m = /JSESSIONID=([^;"]+)/.exec(JSON.stringify(cks));
          if (!m) return true;
          return LW.setCookie({
            url: "http://ec.cauc.edu.cn:8088/",
            cookie: "JSESSIONID=" + m[1] + "; Path=/"
          });
        }).then(function() {
          return true;
        }, function() {
          return true;
        });
      }).then(function() {
        RealApi._ecardSsoAt = Date.now();
        return true;
      });
    },
    _ecardQuery: function(queryKey, params) {
      var B = CONFIG.ECARD.base;
      var plain = {};
      plain[queryKey] = params;
      var fn = "synjones.onecard.query." + queryKey.replace(/^query_/, "").replace(/_/g, ".");
      var H = {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest",
        Origin: B,
        Referer: B + "/web/common/checkEle.html"
      };
      return RealApi._ecardSso().then(function() {
        return Net.request(B + "/web/Des/des.html", {
          method: "POST",
          headers: H,
          data: "data=" + encodeURIComponent(JSON.stringify(plain))
        }).then(function(res) {
          if (res.status !== 200) throw new Error("加密接口 HTTP " + res.status);
          var cipher = res.text().trim();
          if (!cipher || cipher.length < 8) throw new Error("加密失败 —— 电费系统会话可能已过期");
          return Net.request(B + "/web/Common/Tsm.html", {
            method: "POST",
            headers: H,
            data: "jsondata=" + encodeURIComponent(cipher) + "&funname=" + fn + "&json=true"
          });
        }).then(function(res) {
          var t = res.text ? res.text() : "";
          return res;
        }).then(function(res) {
          var t = res.text ? res.text() : "";
          if (/系统异常|error/i.test(t) && t.length < 200) {
            throw new Error("学校一卡通系统繁忙，请稍后重试");
          }
          var d;
          try {
            d = JSON.parse(t);
          } catch (e) {
            throw new Error("返回非 JSON：" + t.slice(0, 60));
          }
          var inner = d[queryKey];
          if (inner && inner.retcode && inner.retcode !== "0") throw new Error(inner.errmsg || "查询失败");
          return d;
        });
      });
    },
    _elec: function(queryKey, extra, areaHint) {
      return RealApi._ensureAccount().then(function(acc) {
        var aid = CONFIG.ECARD.aid;
        var an = areaHint && (areaHint.areaname || areaHint.area) || "";
        if (/宁河/.test(an)) aid = CONFIG.ECARD.aidNinghe || aid;
        var p = {
          aid: aid,
          account: acc
        };
        if (extra) for (var k in extra) p[k] = extra[k];
        return RealApi._ecardQuery(queryKey, p).then(function(d) {
          return d[queryKey];
        });
      });
    },
    _ensureAccount: function() {
      if (_ecardAccount) return Promise.resolve(_ecardAccount);
      var cachedAcc = localStorage.getItem("cauc_ecard_account") || "";
      var cachedFor = localStorage.getItem("cauc_ecard_account_sid") || "";
      var nowSid = localStorage.getItem("cauc_sid") || "";
      if (cachedAcc && cachedFor && cachedFor === nowSid) {
        _ecardAccount = cachedAcc;
        return Promise.resolve(cachedAcc);
      }
      var sno = localStorage.getItem("cauc_sid") || "";
      if (!sno) return Promise.reject(new Error("缺少学号，请重新登录"));
      return RealApi._ecardQuery("query_card", {
        idtype: "sno",
        id: sno
      }).then(function(d) {
        var c = d.query_card && d.query_card.card && d.query_card.card[0] || {};
        _ecardAccount = c.account || "";
        if (_ecardAccount) localStorage.setItem("cauc_ecard_account", _ecardAccount);
        if (!_ecardAccount) throw new Error("未找到一卡通账号");
        return _ecardAccount;
      });
    },
    _xzxLogin: function() {
      var X = CONFIG.XZX;
      var tok = localStorage.getItem("cauc_xzx_token") || "";
      var expAt = parseInt(localStorage.getItem("cauc_xzx_exp") || "0", 10);
      if (tok && expAt && expAt - Date.now() > 24 * 3600 * 1e3) {
        return Promise.resolve(tok);
      }
      if (RealApi._xzxLogining) return RealApi._xzxLogining;
      var sid = Cred.sid(), pwd = Cred.pwd();
      if (!sid || !pwd) {
        return Promise.reject(new Error("请先登录统一身份认证（我的 → 登录）"));
      }
      var cas = X.base + "/berserker-auth/cas/login/wuhan?targetUrl=" + encodeURIComponent(X.target);
      RealApi._xzxLogining = Net.request(X.ias + "/ias/loginCas", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        data: "continueurl=" + encodeURIComponent(cas) + "&sysid=HXYX&username=" + encodeURIComponent(sid) + "&password=" + encodeURIComponent(pwd),
        timeout: 15e3
      }).then(function(res) {
        var html = res && res.text ? res.text() : String(res && res._raw || "");
        var m = /id="ssoticketid"\s+value="([^"]+)"/.exec(html) || /name="ssoticketid"[\s\S]{0,80}?value="([^"]+)"/.exec(html) || /value="([0-9a-f]{32})"/.exec(html);
        if (!m) throw new Error("统一身份认证未返回票据（账号或密码可能有误）");
        return m[1];
      }).then(function(sso) {
        return Net.request(cas, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          data: "errorcode=1&continueurl=" + encodeURIComponent(cas) + "&ssoticketid=" + encodeURIComponent(sso),
          timeout: 15e3,
          disableRedirects: true
        }).then(function(res) {
          var h = res && res.headers || {};
          var loc = h.Location || h.location || h.LOCATION || "";
          var m = /ticket=([^&]+)/.exec(String(loc));
          if (!m) throw new Error("CAS 未下发 ticket（网络或会话异常）");
          return decodeURIComponent(m[1]);
        });
      }).then(function(ticket) {
        return Net.request(X.base + "/berserker-auth/oauth/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: X.clientAuth,
            synAccessSource: "app"
          },
          data: "username=" + encodeURIComponent(ticket) + "&password=" + encodeURIComponent(ticket) + "&grant_type=password&scope=all&loginFrom=app&logintype=sso" + "&device_token=&synAccessSource=app",
          timeout: 15e3
        });
      }).then(function(res) {
        var d = res && res.json ? res.json() : JSON.parse(res.text());
        if (!d || !d.access_token) {
          throw new Error(d && (d.message || d.error_description) || "未取到令牌");
        }
        localStorage.setItem("cauc_xzx_token", d.access_token);
        localStorage.setItem("cauc_xzx_exp", String(Date.now() + (d.expires_in || 6048e3) * 1e3));
        return d.access_token;
      });
      var clear = function() {
        RealApi._xzxLogining = null;
      };
      RealApi._xzxLogining.then(clear, clear);
      return RealApi._xzxLogining;
    },
    _xzxGet: function(path, retried) {
      return RealApi._xzxLogin().then(function(tok) {
        return Net.request(CONFIG.XZX.base + path, {
          method: "GET",
          headers: {
            "synjones-auth": "bearer " + tok,
            synAccessSource: "app"
          },
          timeout: 15e3
        });
      }).then(function(res) {
        var d = res && res.json ? res.json() : JSON.parse(res.text());
        if (d && d.code && d.code !== 200) {
          var msg = d.message || d.msg || "接口返回 " + d.code;
          if (!retried && (d.code === 401 || /其他设备|登录失效/.test(msg))) {
            localStorage.removeItem("cauc_xzx_token");
            localStorage.removeItem("cauc_xzx_exp");
            RealApi._xzxLogining = null;
            return RealApi._xzxGet(path, true);
          }
          throw new Error(msg);
        }
        return d.data;
      });
    },
    getEcardBalance: function() {
      return RealApi._xzxGet("/berserker-app/ykt/tsm/queryCard?synAccessSource=app").then(function(d) {
        var card = d && d.card && d.card[0] || {};
        var acc = card.accinfo && card.accinfo[0] || {};
        return {
          balance: (acc.balance || 0) / 100,
          account: card.account || "",
          name: card.name || "",
          cardType: card.card_type || card.cardtype || "",
          status: card.lostflag === "1" ? "已挂失" : "正常",
          voucher: card.voucher || ""
        };
      });
    },
    getElecBalance: function() {
      return RealApi._xzxGet("/berserker-app/ykt/tsm/queryCard?synAccessSource=app").then(function(d) {
        var card = d && d.card && d.card[0] || {};
        return {
          balance: (card.elec_accamt || 0) / 100,
          account: card.account || ""
        };
      });
    },
    getCardStats: function() {
      var raw = REAL_ENDPOINTS.cardStats;
      if (!raw) return Promise.reject(new Error("接口未配置：cardStats"));
      var d = new Date, y = d.getFullYear(), m = d.getMonth();
      var pad = function(n) {
        return (n < 10 ? "0" : "") + n;
      };
      var last = new Date(y, m + 1, 0).getDate();
      var from = y + "-" + pad(m + 1) + "-01";
      var to = y + "-" + pad(m + 1) + "-" + pad(last);
      return RealApi._bsk(raw + "?timeFrom=" + from + "&timeTo=" + to).then(function(x) {
        var s = x.data || {};
        return {
          income: Number(s.income || 0) / 100,
          expenses: Number(s.expenses || 0) / 100
        };
      });
    },
    getCardTurnover: function(size, current) {
      var raw = REAL_ENDPOINTS.cardTurnover;
      if (!raw) return Promise.reject(new Error("接口未配置：cardTurnover"));
      var url = raw + "?size=" + (size || 20) + "&current=" + (current || 1);
      return RealApi._bsk(url).then(function(d) {
        var rec = d.data && d.data.records || [];
        return rec.map(function(r, i) {
          var t = String(r.turnoverType || "");
          var isIn = /充值|补助|退款/.test(t);
          var amt = Number(r.tranamt || 0) / 100;
          return {
            id: r.orderId || "t" + i,
            title: String(r.resume || r.payName || t).replace(/-/g, " "),
            date: r.effectdateStr || r.jndatetimeStr || "",
            amount: isIn ? amt : -amt,
            inflow: isIn
          };
        });
      });
    },
    getElecArea: function() {
      return RealApi._elec("query_elec_area").then(function(r) {
        return r.areatab || [];
      });
    },
    getElecBuilding: function(area) {
      return RealApi._elec("query_elec_building", {
        area: area
      }, area).then(function(r) {
        return r.buildingtab || [];
      });
    },
    getElecFloor: function(area, building) {
      return RealApi._elec("query_elec_floor", {
        area: area,
        building: building
      }, area).then(function(r) {
        return r.floortab || [];
      });
    },
    getElecRoom: function(area, building, floor) {
      return RealApi._elec("query_elec_room", {
        area: area,
        building: building,
        floor: floor
      }, area).then(function(r) {
        return r.roomtab || [];
      });
    },
    getElecRoomInfo: function(area, building, floor, room) {
      return RealApi._elec("query_elec_roominfo", {
        area: area,
        building: building,
        floor: floor,
        room: room
      }, area).then(function(r) {
        var bal = String(r.bal || "");
        var pick = function(label) {
          var m = bal.match(new RegExp(label + "[:：]\\s*([0-9.]+)"));
          return m ? parseFloat(m[1]) : 0;
        };
        var mm = /剩余金额\s*([0-9.]+)\s*元/.exec(bal);
        if (mm) {
          return {
            room: room.room,
            free: null,
            remain: parseFloat(mm[1]),
            total: null,
            unit: "元",
            raw: bal,
            ninghe: true
          };
        }
        return {
          room: room.room,
          free: pick("免费电量"),
          remain: pick("收费电量"),
          total: pick("累计电量"),
          unit: "度",
          raw: bal
        };
      });
    },
    NET_AID: "0030000000000301",
    netInfo: function() {
      var sid = localStorage.getItem("cauc_sid") || "";
      return RealApi._ensureAccount().then(function(acc) {
        return RealApi._ecardQuery("query_net_info", {
          aid: RealApi.NET_AID,
          account: acc,
          payacc: sid
        }).then(function(d) {
          var r = d && d.query_net_info || {};
          var txt = String(r.errmsg || "");
          var m = /账户余额为\s*([0-9.]+)\s*元/.exec(txt);
          return {
            ok: String(r.retcode) === "0",
            status: txt,
            balance: m ? parseFloat(m[1]) : null,
            netacc: sid
          };
        });
      });
    },
    netRecharge: function(amount, paytype) {
      paytype = String(paytype || "1");
      var sid = localStorage.getItem("cauc_sid") || "";
      var fen = String(Math.round(Number(amount) * 100));
      var H = {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest",
        Origin: CONFIG.ECARD.base,
        Referer: CONFIG.ECARD.base + "/web/common/check.html"
      };
      var qs = function(obj) {
        var q = [];
        for (var k in obj) q.push(encodeURIComponent(k) + "=" + encodeURIComponent(obj[k]));
        return q.join("&");
      };
      if (paytype === "1" || paytype === "3") {
        return RealApi._ensureAccount().then(function(acc) {
          var body = {
            paytype: paytype,
            payment_acc: "",
            aid: RealApi.NET_AID,
            account: acc,
            tran: fen,
            remark: "",
            netacc: sid,
            pkgflag: "",
            pkg: "",
            acctype: "###",
            INFO1: sid,
            wfmsg: ""
          };
          return Net.request(CONFIG.ECARD.base + "/web/NetWork/NetGdc.html", {
            method: "POST",
            headers: H,
            data: qs(body),
            timeout: 2e4
          }).then(function(res) {
            var t = res.text ? res.text() : "";
            var d;
            try {
              d = JSON.parse(t);
            } catch (e) {
              throw new Error("网费充值返回异常：" + t.slice(0, 80));
            }
            var g = d && d.pay_net_gdc;
            if (!g) throw new Error("网费充值响应异常：" + t.slice(0, 80));
            if (g.retcode !== 0 && g.retcode !== "0") throw new Error(g.errmsg || "充值失败");
            return {
              ok: true,
              msg: g.errmsg || "充值成功"
            };
          });
        });
      }
      return RealApi._ecardIp().then(function(ip) {
        return RealApi._ensureAccount().then(function(acc) {
          var PRD = {
            5: "A37",
            8: "A32"
          }[paytype] || "A37";
          var body = {
            client_type: "wap",
            pay_type: "A86",
            account: acc,
            acctype: "###",
            sub_pay_prd_code: PRD,
            order_no: "",
            order_amount: fen,
            order_time: "",
            order_note: "网费充值",
            aic_note: "",
            return_url: "",
            notify_url: "",
            openid: "",
            aid: RealApi.NET_AID,
            meterflag: "",
            price: "",
            spbill_creat_ip: ip || "",
            netacc: sid,
            pkgflag: "",
            pkg: ""
          };
          return Net.request(CONFIG.ECARD.base + "/web/NetWork/PayGw.html", {
            method: "POST",
            headers: H,
            data: qs(body),
            timeout: 2e4
          }).then(function(res) {
            var t = res.text ? res.text() : "";
            var d;
            try {
              d = JSON.parse(t);
            } catch (e) {
              throw new Error("下单返回异常：" + t.slice(0, 80));
            }
            var g = d && d.pay_net_paygw_apply;
            if (!g) throw new Error("下单响应异常：" + t.slice(0, 200));
            if (g.retcode !== 0 && g.retcode !== "0") {
              throw new Error((g.errmsg || "下单失败") + "｜响应：" + t.slice(0, 200));
            }
            if (!g.post_url) throw new Error("该渠道未返回支付页面（微信需官方 App）｜响应：" + t.slice(0, 200));
            var fields = {};
            String(g.post_data || "").split("&").forEach(function(kv) {
              var i = kv.indexOf("=");
              if (i > 0) fields[kv.slice(0, i)] = decodeURIComponent(kv.slice(i + 1));
            });
            return {
              ok: true,
              cashier: {
                url: String(g.post_url).trim(),
                fields: fields
              }
            };
          });
        });
      });
    },
    elecRecharge: function(area, building, floor, room, meter, amount, paytype) {
      paytype = String(paytype || "1");
      var isNingheRe = /宁河/.test(area && (area.areaname || area.area) || "");
      var roomObj = room && typeof room === "object" ? room : null;
      var roomStr = roomObj ? String(roomObj.roomid || roomObj.room || "") : String(room || "");
      var roomidStr = isNingheRe ? roomStr : roomStr.replace(/(空调|照明)$/, "") + meter;
      var roomNameStr = isNingheRe ? String(roomObj && roomObj.room || roomStr) : roomStr.replace(/(空调|照明)$/, "") + meter;
      if (paytype !== "1" && paytype !== "3") {
        var PAY_TYPE = "A86";
        var PRD_CODE = {
          5: "A37",
          8: "A32"
        }[paytype] || "A37";
        return RealApi._ecardIp().then(function(ip) {
          return RealApi._ensureAccount().then(function(acc) {
            var body = {
              client_type: "wap",
              pay_type: PAY_TYPE,
              account: acc,
              acctype: "###",
              order_no: "",
              order_amount: String(Math.round(Number(amount) * 100)),
              sub_pay_prd_code: PRD_CODE,
              order_time: "",
              order_note: "交电费",
              aic_note: "",
              return_url: "",
              notify_url: "",
              openid: "",
              aid: isNingheRe ? CONFIG.ECARD.aidNinghe || CONFIG.ECARD.aid : area && area.aid || CONFIG.ECARD.aid,
              spbill_creat_ip: ip,
              roomid: roomidStr,
              room: roomNameStr,
              floorid: floor && floor.floorid || "",
              floor: floor && floor.floor || "",
              buildingid: building && building.buildingid || "",
              building: building && building.building || "",
              areaid: area && area.areaid || area && area.area || "",
              areaname: area && area.areaname || area && area.area || ""
            };
            var H = {
              "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
              "X-Requested-With": "XMLHttpRequest",
              Origin: CONFIG.ECARD.base,
              Referer: CONFIG.ECARD.base + "/web/common/checkEle.html"
            };
            var q = [];
            for (var k in body) q.push(encodeURIComponent(k) + "=" + encodeURIComponent(body[k]));
            var orderOnce = function() {
              return Net.request(CONFIG.ECARD.base + "/web/Elec/PayElecPayGw.html", {
                method: "POST",
                headers: H,
                data: q.join("&"),
                timeout: 2e4
              }).then(function(res) {
                var t = res.text ? res.text() : "";
                var d;
                try {
                  d = JSON.parse(t);
                } catch (e) {
                  throw new Error("下单返回异常：" + t.slice(0, 80));
                }
                var g = d && d.pay_elec_paygw_apply;
                if (!g) throw new Error("下单响应异常：" + t.slice(0, 80));
                if (g.retcode !== 0 && g.retcode !== "0") throw new Error(g.errmsg || "下单失败");
                if (!g.post_url && String(g.post_data || "").indexOf("WXPay") >= 0) {
                  throw new Error("微信支付已停用，请选择其他支付方式");
                }
                var fields = {};
                String(g.post_data || "").split("&").forEach(function(kv) {
                  var i = kv.indexOf("=");
                  if (i > 0) fields[kv.slice(0, i)] = decodeURIComponent(kv.slice(i + 1));
                });
                return {
                  ok: true,
                  cashier: {
                    url: String(g.post_url || "").trim(),
                    fields: fields
                  }
                };
              });
            };
            return orderOnce();
          });
        });
      }
      return RealApi._ensureAccount().then(function(acc) {
        var body = {
          acctype: "###",
          paytype: "1",
          payment_acc: "",
          aid: isNingheRe ? CONFIG.ECARD.aidNinghe || CONFIG.ECARD.aid : CONFIG.ECARD.aid,
          account: acc,
          tran: String(Math.round(Number(amount) * 100)),
          roomid: roomidStr,
          room: roomNameStr,
          floorid: floor && floor.floorid || "",
          floor: floor && floor.floor || "",
          buildingid: building && building.buildingid || "",
          building: building && building.building || "",
          areaid: area && area.areaid || area && area.area || "",
          areaname: area && area.areaname || area && area.area || "",
          sign: "公寓电费",
          json: "true"
        };
        var H = {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "X-Requested-With": "XMLHttpRequest",
          Origin: CONFIG.ECARD.base,
          Referer: CONFIG.ECARD.base + "/web/common/checkEle.html"
        };
        var q = [];
        for (var k in body) q.push(encodeURIComponent(k) + "=" + encodeURIComponent(body[k]));
        return Net.request(CONFIG.ECARD.base + "/web/Elec/PayElecGdc.html", {
          method: "POST",
          headers: H,
          data: q.join("&"),
          timeout: 2e4
        }).then(function(res) {
          var t = res.text ? res.text() : "";
          var d;
          try {
            d = JSON.parse(t);
          } catch (e) {
            throw new Error("充值返回非 JSON：" + t.slice(0, 80));
          }
          var g = d && d.pay_elec_gdc;
          if (!g) throw new Error("充值响应异常：" + t.slice(0, 80));
          if (g.retcode !== 0 && g.retcode !== "0") throw new Error(g.errmsg || "充值失败");
          return {
            ok: true,
            msg: g.errmsg || "充值成功"
          };
        });
      });
    },
    getStudent: function() {
      var build = function() {
        if (!_lastXsxx) {
          try {
            _lastXsxx = JSON.parse(localStorage.getItem("cauc_xsxx") || "null");
          } catch (e) {}
        }
        var x = _lastXsxx || {};
        return {
          name: x.XM || "",
          sid: x.XH || "",
          college: x.YXMC || x.JGMC || x.BMMC || "",
          major: x.ZYMC || "",
          className: x.BJMC || "",
          campus: CONFIG.CAMPUS,
          dorm: "",
          grade: (x.NJDM_ID || "") + "级"
        };
      };
      var mark = function(st) {
        RealApi._stuCache = st;
        RealApi._stuCacheAt = Date.now();
        try {
          localStorage.setItem("cauc_xsxx_at", String(Date.now()));
        } catch (e) {}
        return st;
      };
      var ttlMs = cacheTtlMin("profile", 43200) * 6e4;
      var now = Date.now();
      var curSid = localStorage.getItem("cauc_sid") || "";
      var staleUser = function(st) {
        return st && st.sid && curSid && st.sid !== curSid;
      };
      if (RealApi._stuCache && !staleUser(RealApi._stuCache) && ttlMs > 0 && now - RealApi._stuCacheAt < ttlMs) {
        return Promise.resolve(RealApi._stuCache);
      }
      if (ttlMs > 0) {
        var disk = null, at = parseInt(localStorage.getItem("cauc_xsxx_at") || "0", 10) || 0;
        try {
          disk = JSON.parse(localStorage.getItem("cauc_xsxx") || "null");
        } catch (e) {}
        if (disk && at && now - at < ttlMs) {
          _lastXsxx = disk;
          var st0 = build();
          if (st0.name && !staleUser(st0)) {
            RealApi._stuCache = st0;
            RealApi._stuCacheAt = now;
            return Promise.resolve(st0);
          }
        }
      }
      return RealApi._fetchKbList().then(function() {
        var st = build();
        if (st.name) return mark(st);
        return new Promise(function(res) {
          setTimeout(res, 1500);
        }).then(function() {
          return RealApi._fetchKbList();
        }).then(function() {
          return mark(build());
        });
      });
    },
    logout: function() {
      localStorage.removeItem("cauc_token");
      return Promise.resolve(true);
    },
    setElecRoom: function(area, building, floor, room) {
      localStorage.setItem("cauc_elec_room", JSON.stringify({
        area: area,
        building: building,
        floor: floor,
        room: room
      }));
      return Promise.resolve(true);
    }
  };
  var Impl = CONFIG.MODE === "real" ? RealApi : MockApi;
  global.CampusAPI = {
    CONFIG: CONFIG,
    SECTIONS: SECTIONS,
    sectionTime: function(n) {
      return sectionTime(n);
    },
    REAL_ENDPOINTS: REAL_ENDPOINTS,
    isMock: function() {
      return CONFIG.MODE !== "real";
    },
    setMode: function(m) {
      CONFIG.MODE = m;
      Impl = m === "real" ? RealApi : MockApi;
    },
    getCacheTtlMin: function(key, defMin) {
      return cacheTtlMin(key, defMin);
    },
    currentWeek: currentWeek,
    weekStartDate: weekStartDate,
    dayOfWeek: dayOfWeek,
    hexOf: function(i) {
      return HX[i % HX.length];
    },
    paletteOf: function(i) {
      return PALETTE[i % PALETTE.length];
    },
    login: function(s, p) {
      return Impl.login(s, p);
    },
    logout: function() {
      return Impl.logout();
    },
    getStudent: function() {
      return Impl.getStudent();
    },
    getWeekCourses: function(w) {
      return Impl.getWeekCourses(w);
    },
    getAllCourses: function() {
      return Impl.getAllCourses();
    },
    getExams: function() {
      return Impl.getExams();
    },
    getElectricity: function(force) {
      return Impl.getElectricity(force);
    },
    getNetwork: function() {
      return Impl.getNetwork();
    },
    getNetOverview: function(fresh) {
      return Impl.getNetOverview ? Impl.getNetOverview(fresh) : Impl.getNetwork();
    },
    netMyIp: function(fresh) {
      return CampusNet._myIp(!!fresh);
    },
    getCard: function() {
      return Impl.getCard();
    },
    cardLost: function() {
      return Impl.cardLost();
    },
    cardUnlost: function(password) {
      return Impl.cardUnlost(password);
    },
    cardFoundUrl: function() {
      return Impl.cardFoundUrl();
    },
    cardOpsUrl: function() {
      return Impl.cardOpsUrl();
    },
    getCalendar: function() {
      return Impl.getCalendar();
    },
    getGPA: function() {
      return Impl.getGPA();
    },
    getEmptyRooms: function(q) {
      return Impl.getEmptyRooms(q);
    },
    ROOM_BUILDS: RealApi.ROOM_BUILDS,
    ROOM_TYPES: RealApi.ROOM_TYPES,
    roomBuildsNinghe: function() {
      var l = [];
      try {
        l = JSON.parse(localStorage.getItem("cauc_room_builds_nh") || "[]");
      } catch (e) {}
      return l;
    },
    getEcardBalance: function() {
      return Impl.getEcardBalance ? Impl.getEcardBalance() : Promise.reject(new Error("仅真实数据模式可用"));
    },
    getElecBalance: function() {
      return Impl.getElecBalance ? Impl.getElecBalance() : Promise.reject(new Error("仅真实数据模式可用"));
    },
    saveCreds: function(sid, pwd) {
      Cred.save(sid, pwd);
    },
    getCreds: function() {
      return {
        sid: Cred.sid(),
        pwd: Cred.pwd()
      };
    },
    hasCreds: function() {
      return Cred.has();
    },
    clearCreds: function() {
      Cred.clear();
    },
    channelName: function() {
      return STATE.channel;
    },
    ensureWebvpn: function() {
      return RealApi._ensureWebvpn();
    },
    wvVerifyNow: function() {
      return RealApi.wvVerifyNow();
    },
    reloginWebvpn: function() {
      return RealApi.reloginWebvpn();
    },
    netLogin: function(sid, pwd) {
      return CampusNet.login(sid || localStorage.getItem("cauc_sid"), pwd || Cred.pwd());
    },
    netLogout: function() {
      return CampusNet.logout(localStorage.getItem("cauc_sid") || "");
    },
    netStatus: function() {
      return CampusNet.status();
    },
    netTest: function() {
      return CampusNet.test();
    },
    selfPrepare: function() {
      return SelfService.prepare();
    },
    selfCaptchaUrl: function() {
      return SelfService.captchaUrl();
    },
    selfBase: function() {
      return SelfService.baseUrl();
    },
    selfSyncSession: function() {
      return SelfService.syncSessionFromWv();
    },
    selfLogin: function(a, p, c) {
      return SelfService.login(a, p, c);
    },
    selfAlive: function(fresh) {
      return SelfService.alive(fresh);
    },
    selfNeedCaptcha: function() {
      return SelfService.needCaptchaFlag();
    },
    selfOnline: function() {
      return SelfService.online();
    },
    selfKick: function(sessionId) {
      return SelfService.kick(sessionId);
    },
    selfLogout: function() {
      return SelfService.logout();
    },
    selfDevicesCached: function() {
      var c = SelfService._devCache, at = SelfService._devCacheAt;
      if (c && Date.now() - at < cacheTtlMin("devices", 3) * 6e4) return {
        ok: true,
        devices: c,
        fromCache: true
      };
      return null;
    },
    selfDevices: function(fast) {
      return RealApi.selfDevices(fast);
    },
    selfDevicesForce: function() {
      return RealApi.selfDevices(true);
    },
    selfOnlineLog: function(from, to, limit, offset) {
      var q = "?limit=" + (limit || 20) + "&offset=" + (offset || 0) + "&startTime=" + encodeURIComponent(from || "") + "&endTime=" + encodeURIComponent(to || "") + "&search=&sort=&order=";
      return SelfService._get("/Self/bill/getUserOnlineLog" + q).then(function(r) {
        var t = (r.text ? r.text() : "") || "";
        var j = {};
        try {
          j = JSON.parse(t);
        } catch (e) {
          j = {};
        }
        if (!j || !j.rows) {
          return {
            total: 0,
            rows: [],
            raw: /<!doctype|<html/i.test(t) ? "自助服务会话未就绪，请稍后再点一次「查询」" : "接口未返回数据"
          };
        }
        var rows = (j.rows || []).map(function(x) {
          return {
            loginAt: Number(x.loginTime) || 0,
            logoutAt: Number(x.logoutTime) || 0,
            minutes: Number(x.time) || 0,
            flow: Number(x.flow) || 0,
            ip: x.userIp || "",
            mac: x.macAddress || "",
            userName: x.userName || ""
          };
        });
        return {
          total: j.total || 0,
          rows: rows,
          raw: ""
        };
      });
    },
    elecRecharge: function(area, building, floor, room, meter, amount, paytype) {
      return RealApi.elecRecharge(area, building, floor, room, meter, amount, paytype);
    },
    ecardPrewarm: function() {
      return RealApi.ecardPrewarm();
    },
    ecardIp: function() {
      return RealApi._ecardIp();
    },
    netInfo: function() {
      return RealApi.netInfo();
    },
    netRecharge: function(amount, paytype) {
      return RealApi.netRecharge(amount, paytype);
    },
    selfCaptchaCooling: function() {
      return SelfService.captchaCooling();
    },
    wvHttpLogin: function() {
      return SelfService._wvHttpLogin();
    },
    wvSessionEnsure: function(url, force) {
      return RealApi.wvSessionEnsure(url, force);
    },
    jwglRefreshSession: function() {
      return RealApi._jwglSession(true);
    },
    hubAdoptWv: function(urls) {
      return RealApi._hubAdoptWv(urls);
    },
    wvSessionInvalidate: function(why) {
      return RealApi.wvSessionInvalidate(why);
    },
    selfResetCaptcha: function() {
      SelfService._captchaUntil = 0;
      SelfService._needCaptcha = false;
      SelfService._devCache = null;
      SelfService._devCacheAt = 0;
      return true;
    },
    invalidateSelfDevices: function() {
      try {
        SelfService._devCache = null;
        SelfService._devCacheAt = 0;
      } catch (e) {}
      return true;
    },
    selfHistory: function() {
      return SelfService.history();
    },
    hasSessionPwd: function() {
      try {
        return !!Cred.pwd();
      } catch (e) {
        return false;
      }
    },
    elecArea: function() {
      return Impl.getElecArea ? Impl.getElecArea() : Promise.reject(new Error("仅真实模式支持"));
    },
    elecBuilding: function(a) {
      return Impl.getElecBuilding ? Impl.getElecBuilding(a) : Promise.reject(new Error("仅真实模式支持"));
    },
    elecFloor: function(a, b) {
      return Impl.getElecFloor ? Impl.getElecFloor(a, b) : Promise.reject(new Error("仅真实模式支持"));
    },
    elecRoom: function(a, b, f) {
      return Impl.getElecRoom ? Impl.getElecRoom(a, b, f) : Promise.reject(new Error("仅真实模式支持"));
    },
    elecRoomInfo: function(a, b, f, r) {
      return Impl.getElecRoomInfo ? Impl.getElecRoomInfo(a, b, f, r) : Promise.reject(new Error("仅真实模式支持"));
    },
    setElecRoom: function(a, b, f, r) {
      if (Impl.setElecRoom) return Impl.setElecRoom(a, b, f, r);
      localStorage.setItem("cauc_elec_room", JSON.stringify({
        area: a,
        building: b,
        floor: f,
        room: r
      }));
      return Promise.resolve(true);
    },
    savedElecRoom: function() {
      try {
        return JSON.parse(localStorage.getItem("cauc_elec_room") || "null");
      } catch (e) {
        return null;
      }
    },
    getLoginMode: function() {
      return localStorage.getItem("cauc_login_mode") || CONFIG.LOGIN_MODE;
    },
    setLoginMode: function(m) {
      localStorage.setItem("cauc_login_mode", m);
    },
    getLoginFails: function() {
      return parseInt(localStorage.getItem("cauc_login_fails") || "0", 10) || 0;
    },
    noteLoginFail: function() {
      var n = CampusAPI.getLoginFails() + 1;
      localStorage.setItem("cauc_login_fails", String(n));
      return n;
    },
    clearLoginFails: function() {
      localStorage.removeItem("cauc_login_fails");
    },
    isFallback: function() {
      return CampusAPI.getLoginFails() >= CONFIG.AUTO_FALLBACK_AFTER;
    },
    effectiveLoginMode: function() {
      var m = CampusAPI.getLoginMode();
      if (m === "auto" && CampusAPI.isFallback()) return "webview";
      return m;
    },
    _solver: null,
    registerSolver: function(fn) {
      CampusAPI._solver = fn;
    },
    hasSolver: function() {
      return typeof CampusAPI._solver === "function";
    },
    solveCaptcha: function(pngDataUrl) {
      if (!CampusAPI.hasSolver()) return Promise.reject(new Error("未内置验证码识别引擎"));
      return Promise.resolve(CampusAPI._solver(pngDataUrl));
    },
    hasNativeLogin: function() {
      var C = global.Capacitor;
      return !!(C && C.Plugins && C.Plugins.LoginWebView);
    },
    openNativeLogin: function(systemKey) {
      var C = global.Capacitor;
      if (!C || !C.Plugins || !C.Plugins.LoginWebView) {
        return Promise.reject(new Error("当前环境没有原生登录页（需打包成 APK）"));
      }
      var su = CONFIG.LOGIN_SYSTEMS[systemKey];
      if (!su) return Promise.reject(new Error("未知系统：" + systemKey));
      return C.Plugins.LoginWebView.open({
        url: su.url,
        title: su.title,
        domains: su.domains
      }).then(function(r) {
        r = r || {};
        if (r.ok) localStorage.setItem("cauc_logged_" + systemKey, String(Date.now()));
        return r;
      });
    },
    nativeCookies: function(urls) {
      var C = global.Capacitor;
      if (!C || !C.Plugins || !C.Plugins.LoginWebView) return Promise.resolve({});
      return C.Plugins.LoginWebView.cookies({
        urls: urls
      });
    },
    nativeClearCookies: function() {
      var C = global.Capacitor;
      if (!C || !C.Plugins || !C.Plugins.LoginWebView) return Promise.resolve(false);
      return C.Plugins.LoginWebView.clear().then(function() {
        CampusAPI.clearLogged();
        return true;
      });
    },
    nativeRestoreCookies: function() {
      var C = global.Capacitor;
      if (!C || !C.Plugins || !C.Plugins.LoginWebView) return Promise.resolve(0);
      return C.Plugins.LoginWebView.restore().then(function(r) {
        return r && r.count || 0;
      });
    },
    isLogged: function(systemKey) {
      return !!localStorage.getItem("cauc_logged_" + systemKey);
    },
    clearLogged: function() {
      [ "webvpn", "jwgl", "network", "ecard" ].forEach(function(k) {
        localStorage.removeItem("cauc_logged_" + k);
      });
    },
    mapZcd: function(z) {
      return RealApi._zcdToWeeks(z);
    },
    mapKbItem: function(i, k) {
      return RealApi._mapKbItem(i, k);
    },
    channel: function() {
      return STATE.channel;
    },
    channelLabel: function() {
      if (CONFIG.MODE !== "real") return "演示数据";
      var base = "";
      try {
        base = RealApi._jwglBase() || "";
      } catch (e) {}
      var isWv = base.indexOf("webvpn") >= 0;
      if (isWv) return "WebVPN（校外通道）";
      if (localStorage.getItem("cauc_wv_off") === "1") return "校内直连（已手动断开 WebVPN）";
      return "校内直连（WebVPN 回退）";
    },
    canBypassCors: function() {
      return !!(global.Net && global.Net.canBypassCors());
    },
    syncMapCampus: function() {
      return RealApi._syncMapCampus();
    },
    setChannel: function(mode) {
      CONFIG.CHANNEL = mode;
      RealApi._probeAt = 0;
      RealApi._probeRes = null;
      RealApi._probing2 = null;
      RealApi._jwglAt = 0;
      if (mode === "auto" || mode === "webvpn") {
        localStorage.removeItem("cauc_wv_off");
        localStorage.removeItem("cauc_wv_fail_at");
        localStorage.removeItem("cauc_wv_blocked_at");
      }
      if (mode === "direct") localStorage.setItem("cauc_wv_off", "1");
      STATE.channel = mode === "auto" ? STATE.channel : mode;
      if (mode !== "auto") RealApi._syncMapCampus();
      return CampusAPI.detect();
    },
    warmup: function() {
      if (CONFIG.MODE !== "real") return Promise.resolve(null);
      if (!(Cred.sid() && Cred.pwd())) return Promise.resolve(null);
      var probe = RealApi._probeAndApply().catch(function() {
        return null;
      });
      var kb = RealApi._fetchKbList().catch(function() {
        return null;
      });
      var self = RealApi.selfDevices(false).catch(function() {
        return null;
      });
      var ver = RealApi.wvVerifyNow();
      return Promise.all([ probe, kb, self, ver ]).then(function(r) {
        return r[0];
      });
    },
    selfPrewarm: function() {
      if (CONFIG.MODE !== "real") return Promise.resolve(null);
      if (!(Cred.sid() && Cred.pwd())) return Promise.resolve(null);
      return RealApi.selfDevices().catch(function() {
        return null;
      });
    },
    _prewarmAt: 0,
    prewarmAll: function(force) {
      if (CONFIG.MODE !== "real") return Promise.resolve(null);
      if (!(Cred.sid() && Cred.pwd())) return Promise.resolve(null);
      var now = Date.now();
      if (!force && RealApi._prewarmAt && now - RealApi._prewarmAt < 90 * 1e3) {
        return Promise.resolve("throttled");
      }
      RealApi._prewarmAt = now;
      var kb = RealApi._fetchKbList().catch(function() {
        return null;
      });
      var self = RealApi.selfDevices().catch(function() {
        return null;
      });
      var card = (Impl.getEcardBalance ? Impl.getEcardBalance() : Impl.getCard()).catch(function() {
        return null;
      });
      return Promise.all([ kb, self, card ]).then(function() {
        try {
          window.dispatchEvent(new Event("cauc:prewarm-done"));
        } catch (e) {}
        return true;
      });
    },
    invalidateCourses: function() {
      RealApi._kbInvalidate();
    },
    disconnectWebvpn: function() {
      return RealApi.disconnectWebvpn();
    },
    connectWebvpn: function() {
      return RealApi.connectWebvpn();
    },
    webvpnOff: function() {
      return localStorage.getItem("cauc_wv_off") === "1";
    },
    markWebvpnBlocked: function() {
      RealApi._markWvBlocked();
    },
    webvpnBlocked: function() {
      return RealApi._wvBlocked();
    },
    tryWebvpnLogin: function() {
      return RealApi._tryWebvpnLogin();
    },
    jwglBase: function() {
      return RealApi._jwglBase();
    },
    jwglEntryUrl: function(pageUrl) {
      var sid = localStorage.getItem("cauc_sid") || "";
      var base = RealApi._jwglBase();
      var sso = "mhsso/ltappiotlogin?loginName=" + encodeURIComponent(sid) + "&url=" + encodeURIComponent(pageUrl);
      var fresh = !!RealApi._jwglAt && Date.now() - RealApi._jwglAt < 2 * 60 * 1e3;
      return base + (fresh && sid ? "/" + pageUrl : "/" + sso);
    },
    getKbPdfInfo: function() {
      return RealApi._jwglSession().then(function() {
        if (!_lastXsxx) {
          try {
            _lastXsxx = JSON.parse(localStorage.getItem("cauc_xsxx") || "null");
          } catch (e) {}
        }
        var x = _lastXsxx || {};
        var f = {
          xnm: CONFIG.XNM,
          xqm: CONFIG.XQM,
          xnmc: x.XNMC || CONFIG.XNM + "-" + (Number(CONFIG.XNM) + 1),
          xqmmc: x.XQMMC || "1",
          jgmc: x.YXMC || x.JGMC || "",
          xm: x.XM || "",
          xxdm: "10059"
        };
        [ "sj", "cd", "js", "jszc", "jxb", "jxbzc", "xkrs", "xkbz", "kcxszc", "zhxs", "zxs", "khfs", "ksfs", "xf", "skfsmc", "kch", "zfj", "cxbj", "kcxz", "kcbj", "kczxs", "bklxdjmc", "zyhxkcbj", "cdlbmc", "ktmc", "qqqh", "skpthyh", "jtskwz", "jgh", "kclbmc" ].forEach(function(k) {
          f["xszd." + k] = "false";
        });
        f["modelList[0].xnm"] = CONFIG.XNM;
        f["modelList[0].xqm"] = CONFIG.XQM;
        f["modelList[0].xnmc"] = f.xnmc;
        f["modelList[0].xqmmc"] = f.xqmmc;
        f["modelList[0].xh_id"] = x.XH_ID || x.XH || "";
        f["modelList[0].xh"] = x.XH || "";
        f["modelList[0].xm"] = x.XM || "";
        f["modelList[0].bjmc"] = x.BJMC || "";
        f["modelList[0].xsdm"] = "";
        f.xsdm = "";
        f["modelList[0].kclbdm"] = "";
        f["modelList[0].kclxdm"] = "";
        f.kclbdm = "";
        f.kclxdm = "";
        return {
          url: RealApi._jwglBase() + "/kbcx/xskbcx_cxXsShcPdf.html?doType=table",
          fields: f,
          filename: "个人课表_" + f.xnmc.replace("-", "") + ".pdf"
        };
      });
    },
    probeJwgl: function(force) {
      return RealApi._probeJwgl(force);
    },
    probeAndApply: function(force) {
      return RealApi._probeAndApply(force);
    },
    reprobeForeground: function(awayMs) {
      var away = parseInt(awayMs || 0, 10);
      if (away > 0 && away < 3 * 60 * 1e3) {
        var okAtShort = parseInt(localStorage.getItem("cauc_wv_ok_at") || "0", 10);
        if (okAtShort && Date.now() - okAtShort < 5 * 60 * 1e3 && localStorage.getItem("cauc_wv_off") !== "1" && !RealApi._wvBlocked()) {
          STATE.channel = "webvpn";
          RealApi._probeRes = "webvpn";
          RealApi._probeAt = Date.now();
          RealApi._log("回前台（离开 " + Math.round(away / 1e3) + "s，会话新鲜）→ 0 探测复用");
          RealApi._fetchKbList().catch(function() {});
          return Promise.resolve("webvpn");
        }
      }
      try {
        localStorage.removeItem("cauc_wv_fail_at");
      } catch (e) {}
      RealApi._probeAt = 0;
      RealApi._probeRes = null;
      RealApi._jwglAt = 0;
      return RealApi._wvProbeOnce().then(function(alive) {
        if (alive) {
          localStorage.setItem("cauc_wv_ok_at", String(Date.now()));
          STATE.channel = "webvpn";
          RealApi._probeRes = "webvpn";
          RealApi._probeAt = Date.now();
          RealApi._log("回前台：实测会话有效 → 复用并后台刷新课表");
          RealApi._fetchKbList().catch(function() {});
          return "webvpn";
        }
        RealApi._log("回前台：实测会话已失效 → 重判通道 + 静默重登");
        return RealApi._probeAndApply(true).then(function(ch) {
          if (localStorage.getItem("cauc_wv_off") === "1") return ch;
          if (RealApi._wvBlocked()) {
            RealApi._log("回前台：本网络已判校内 → 不重登 WebVPN，直接刷新课表");
            RealApi._fetchKbList().catch(function() {});
            return ch;
          }
          return RealApi._ensureWebvpn().then(function(ok) {
            if (ok) RealApi._fetchKbList().catch(function() {});
            return ch;
          }, function() {
            return ch;
          });
        });
      });
    },
    probeLabel: function() {
      var r = RealApi._probeRes;
      if (r === "direct") {
        if (localStorage.getItem("cauc_wv_off") === "1") return "教务系统可达（校内直连 · 已手动断开 WebVPN）";
        return "教务系统可达（校内直连）";
      }
      if (r === "webvpn") {
        var vAt = RealApi._wvVerifiedAt || 0;
        var downAt = RealApi._wvGatewayDownAt || 0;
        if (downAt && downAt > vAt) return "教务系统：学校网关暂时不可用（会自动恢复，无需操作）";
        if (RealApi._wvJwglNeedSessionAt) return "教务系统：WebVPN 已登录（教务会话重建中…）";
        if (vAt && Date.now() - vAt < 20 * 60 * 1e3) return "教务系统：WebVPN 已登录，通道就绪";
        if (RealApi._wvVerifyFailedAt) return "教务系统：WebVPN 会话已失效（进校园网/教务会自动重登）";
        return "教务系统：WebVPN 通道（验证中…）";
      }
      if (r === "unreachable") return "教务系统暂不可达（校内不通 / WebVPN 不可用）";
      if (RealApi._wvVerifyFailedAt) return "教务系统：WebVPN 会话已失效（进校园网/教务会自动重登）";
      if (RealApi._wvVerifiedAt) return "教务系统：WebVPN 已登录，通道就绪";
      return "教务系统：WebVPN 通道（验证中…）";
    },
    detect: function() {
      if (CONFIG.MODE !== "real") {
        STATE.channel = "unknown";
        return Promise.resolve(STATE.channel);
      }
      if (CONFIG.CHANNEL === "direct") {
        STATE.channel = "direct";
        return Promise.resolve("direct");
      }
      if (CONFIG.CHANNEL === "webvpn") {
        STATE.channel = "webvpn";
        return Promise.resolve("webvpn");
      }
      RealApi._probeAt = 0;
      return RealApi._probeAndApply(true).then(function() {
        return STATE.channel;
      });
    }
  };
})(window);