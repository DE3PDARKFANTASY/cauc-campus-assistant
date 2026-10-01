package com.hangda.campus;
import android.content.Context;
import android.content.SharedPreferences;
import android.net.Uri;
import org.json.JSONArray;
import org.json.JSONObject;
import java.text.SimpleDateFormat;
import java.util.Locale;
import java.util.Map;
import java.util.TimeZone;
import java.util.concurrent.ConcurrentHashMap;
public final class CookieHub {
    public static class Cookie {
        public String name, value, domain, path = "/";
        public long expires = -1;      
        public boolean httpOnly = false, secure = false;
        public String raw = "";        
    }
    private static final String PREF = "cookie_hub_v1";
    private static Context ctx;
    private static final Map<String, Map<String, Cookie>> JAR = new ConcurrentHashMap<>();
    private static boolean allowedDomain(String d) {
        if (d == null) return false;
        String s = d.startsWith(".") ? d.substring(1) : d;
        s = s.toLowerCase();
        return s.equals("cauc.edu.cn") || s.endsWith(".cauc.edu.cn")
                || s.equals("192.168.100.200")
                || s.equals("2001:da8:a012:ff09::3");
    }
    private CookieHub() {}
    public static synchronized void init(Context c) {
        if (c == null) return;
        ctx = c.getApplicationContext();
        JAR.clear();
        SharedPreferences sp = ctx.getSharedPreferences(PREF, Context.MODE_PRIVATE);
        boolean dirty = false;
        for (Map.Entry<String, ?> e : sp.getAll().entrySet()) {
            try {
                String[] parts = e.getKey().split("\\|", 2);
                if (parts.length < 2) continue;
                if (!allowedDomain(parts[0])) { dirty = true; continue; }
                JSONObject o = new JSONObject(String.valueOf(e.getValue()));
                Cookie ck = new Cookie();
                ck.name = parts[1];
                ck.domain = parts[0];
                ck.value = o.optString("v");
                ck.path = o.optString("p", "/");
                ck.expires = o.optLong("e", -1);
                ck.httpOnly = o.optBoolean("h", false);
                ck.secure = o.optBoolean("s", false);
                ck.raw = o.optString("r", "");
                if (ck.expires >= 0 && ck.expires < System.currentTimeMillis()) {
                    dirty = true;    
                    continue;
                }
                putInternal(ck);
            } catch (Exception ignored) {}
        }
        if (dirty) persist();
    }
    public static long jwtJti(String value) {
        try {
            if (value == null) return -1;
            String[] p = value.split("\\.");
            if (p.length < 2) return -1;
            byte[] raw = android.util.Base64.decode(p[1],
                    android.util.Base64.URL_SAFE | android.util.Base64.NO_PADDING
                            | android.util.Base64.NO_WRAP);
            JSONObject o = new JSONObject(new String(raw, "UTF-8"));
            String j = o.optString("jti", "");
            if (j.isEmpty()) return -1;
            return Long.parseLong(j);
        } catch (Exception e) {
            return -1;
        }
    }
    private static void putInternal(Cookie ck) {
        if (ck.domain == null || ck.name == null) return;
        String d = ck.domain.startsWith(".") ? ck.domain.substring(1) : ck.domain;
        if (d.isEmpty()) return;
        String key = d.toLowerCase();
        if ("webvpn-token".equals(ck.name)) {
            boolean blank = ck.value == null || ck.value.isEmpty();
            if (!blank) {
                long mine = jwtJti(ck.value);
                for (Map.Entry<String, Map<String, Cookie>> e : JAR.entrySet()) {
                    if (e.getKey().equals(key)) continue;
                    Cookie old = e.getValue().get("webvpn-token");
                    if (old == null || old.value == null || old.value.isEmpty()) continue;
                    long theirs = jwtJti(old.value);
                    if (theirs >= 0 && mine >= 0 && theirs > mine) {
                        return;
                    }
                    e.getValue().remove("webvpn-token");
                }
            }
        }
        JAR.computeIfAbsent(key, k -> new ConcurrentHashMap<>()).put(ck.name, ck);
    }
    public static synchronized void put(Cookie ck) {
        putInternal(ck);
        persist();
    }
    public static synchronized void ingest(String requestUrl, java.util.List<String> setCookieHeaders) {
        if (requestUrl == null || setCookieHeaders == null || setCookieHeaders.isEmpty()) return;
        String host = "";
        try { host = Uri.parse(requestUrl).getHost(); } catch (Exception ignored) {}
        if (host == null || host.isEmpty()) return;
        boolean changed = false;
        for (String raw : setCookieHeaders) {
            if (raw == null || raw.isEmpty()) continue;
            for (String one : raw.split(",(?=\\s*[A-Za-z0-9_\\-]+=)")) {
                Cookie ck = new Cookie();
                ck.raw = one.trim();
                String[] segs = ck.raw.split(";");
                if (segs.length == 0) continue;
                int eq = segs[0].indexOf('=');
                if (eq <= 0) continue;
                ck.name = segs[0].substring(0, eq).trim();
                ck.value = segs[0].substring(eq + 1).trim();
                ck.domain = host;
                for (int i = 1; i < segs.length; i++) {
                    String s = segs[i].trim();
                    String sl = s.toLowerCase();
                    if (sl.startsWith("domain=")) {
                        ck.domain = s.substring(7).trim();
                    } else if (sl.startsWith("path=")) {
                        ck.path = s.substring(5).trim();
                    } else if (sl.startsWith("max-age=")) {
                        try {
                            long ma = Long.parseLong(s.substring(8).trim());
                            ck.expires = ma <= 0 ? 0 : System.currentTimeMillis() + ma * 1000L;
                        } catch (Exception ignored) {}
                    } else if (sl.startsWith("expires=")) {
                        long t = parseHttpDate(s.substring(8).trim());
                        if (t >= 0) ck.expires = t;
                    } else if ("httponly".equals(sl)) {
                        ck.httpOnly = true;
                    } else if ("secure".equals(sl)) {
                        ck.secure = true;
                    }
                }
                if (!allowedDomain(ck.domain)) continue;
                boolean expired = ck.expires >= 0 && ck.expires < System.currentTimeMillis();
                if ("deleted".equalsIgnoreCase(ck.value) && ck.expires < 0) expired = true;
                if (expired) {
                    removeInternal(ck.domain, ck.name);
                } else {
                    putInternal(ck);
                }
                changed = true;
            }
        }
        if (changed) persist();
    }
    public static synchronized void remove(String domain, String name) {
        removeInternal(domain, name);
        persist();
    }
    private static void removeInternal(String domain, String name) {
        if (domain == null || name == null) return;
        String d = (domain.startsWith(".") ? domain.substring(1) : domain).toLowerCase();
        Map<String, Cookie> m = JAR.get(d);
        if (m != null) m.remove(name);
    }
    public static synchronized String headerFor(String url) {
        String host = "", path = "/";
        try {
            Uri u = Uri.parse(url);
            host = u.getHost();
            path = u.getPath();
        } catch (Exception ignored) {}
        if (host == null) return "";
        host = host.toLowerCase();
        if (path == null || path.isEmpty()) path = "/";
        java.util.LinkedHashMap<String, Cookie> picked = new java.util.LinkedHashMap<>();
        for (Map.Entry<String, Map<String, Cookie>> e : JAR.entrySet()) {
            String d = e.getKey();
            if (!(host.equals(d) || host.endsWith("." + d))) continue;
            for (Cookie ck : e.getValue().values()) {
                if (ck.expires >= 0 && ck.expires < System.currentTimeMillis()) continue;
                if (!path.startsWith(ck.path == null || ck.path.isEmpty() ? "/" : ck.path)) continue;
                if (ck.value == null || ck.value.isEmpty()) continue;
                Cookie prev = picked.get(ck.name);
                if (prev == null) {
                    picked.put(ck.name, ck);
                    continue;
                }
                long a = jwtJti(prev.value), b = jwtJti(ck.value);
                if (a >= 0 && b >= 0 && b > a) picked.put(ck.name, ck);
            }
        }
        StringBuilder sb = new StringBuilder();
        for (Cookie ck : picked.values()) {
            if (sb.length() > 0) sb.append("; ");
            sb.append(ck.name).append('=').append(ck.value);
        }
        return sb.toString();
    }
    public static synchronized JSONArray dump(String domainFilter) {
        JSONArray arr = new JSONArray();
        for (Map.Entry<String, Map<String, Cookie>> e : JAR.entrySet()) {
            if (domainFilter != null && !e.getKey().contains(domainFilter.toLowerCase())) continue;
            for (Cookie ck : e.getValue().values()) {
                try {
                    JSONObject o = new JSONObject();
                    o.put("name", ck.name);
                    o.put("value", ck.value);
                    o.put("domain", ck.domain);
                    o.put("path", ck.path);
                    o.put("expires", ck.expires);
                    o.put("httpOnly", ck.httpOnly);
                    o.put("secure", ck.secure);
                    o.put("raw", ck.raw);
                    arr.put(o);
                } catch (Exception ignored) {}
            }
        }
        return arr;
    }
    public static synchronized void clearAll() {
        JAR.clear();
        persist();
    }
    private static synchronized void persist() {
        if (ctx == null) return;
        try {
            SharedPreferences sp = ctx.getSharedPreferences(PREF, Context.MODE_PRIVATE);
            SharedPreferences.Editor ed = sp.edit();
            ed.clear();
            for (Map.Entry<String, Map<String, Cookie>> e : JAR.entrySet()) {
                for (Cookie ck : e.getValue().values()) {
                    try {
                        JSONObject o = new JSONObject();
                        o.put("v", ck.value);
                        o.put("p", ck.path);
                        o.put("e", ck.expires);
                        o.put("h", ck.httpOnly);
                        o.put("s", ck.secure);
                        o.put("r", ck.raw);
                        ed.putString(e.getKey() + "|" + ck.name, o.toString());
                    } catch (Exception ignored) {}
                }
            }
            ed.apply();
        } catch (Exception ignored) {}
    }
    private static long parseHttpDate(String v) {
        if (v == null || v.isEmpty()) return -1;
        String[] fmts = {
                "EEE, dd MMM yyyy HH:mm:ss zzz",
                "EEE, dd-MMM-yyyy HH:mm:ss zzz",
                "EEE MMM d HH:mm:ss yyyy"
        };
        for (String f : fmts) {
            try {
                SimpleDateFormat sdf = new SimpleDateFormat(f, Locale.US);
                sdf.setTimeZone(TimeZone.getTimeZone("GMT"));
                sdf.setLenient(true);
                return sdf.parse(v).getTime();
            } catch (Exception ignored) {}
        }
        return -1;
    }
}
