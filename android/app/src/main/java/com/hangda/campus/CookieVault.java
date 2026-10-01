package com.hangda.campus;
import android.content.Context;
import android.content.SharedPreferences;
import android.webkit.CookieManager;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.Map;
import java.util.TimeZone;
public final class CookieVault {
    private static final String PREF = "cauc_cookie_vault";
    private static final long KEEP_MS = 12L * 3600 * 1000; 
    private CookieVault() {}
    private static String httpDate(long ms) {
        SimpleDateFormat f = new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss 'GMT'", Locale.US);
        f.setTimeZone(TimeZone.getTimeZone("GMT"));
        return f.format(new Date(ms));
    }
    private static boolean isAttr(String name) {
        return name.equalsIgnoreCase("path") || name.equalsIgnoreCase("domain")
                || name.equalsIgnoreCase("expires") || name.equalsIgnoreCase("max-age")
                || name.equalsIgnoreCase("httponly") || name.equalsIgnoreCase("secure")
                || name.equalsIgnoreCase("samesite") || name.equalsIgnoreCase("version");
    }
    public static void save(Context ctx, String domain, String cookieString) {
        if (ctx == null || domain == null) return;
        if (cookieString == null || cookieString.length() == 0) return;
        ctx.getSharedPreferences(PREF, Context.MODE_PRIVATE)
                .edit().putString(domain, cookieString).apply();
    }
    public static int dropName(Context ctx, String name) {
        if (ctx == null || name == null || name.length() == 0) return 0;
        SharedPreferences sp = ctx.getSharedPreferences(PREF, Context.MODE_PRIVATE);
        Map<String, ?> all = sp.getAll();
        SharedPreferences.Editor ed = sp.edit();
        int hit = 0;
        boolean changed = false;
        for (Map.Entry<String, ?> e : all.entrySet()) {
            Object v = e.getValue();
            if (!(v instanceof String)) continue;
            String[] parts = ((String) v).split(";");
            StringBuilder keep = new StringBuilder();
            for (String part : parts) {
                String kv = part.trim();
                if (kv.length() == 0) continue;
                int eq = kv.indexOf('=');
                if (eq <= 0) continue;
                String cn = kv.substring(0, eq).trim();
                if (cn.equalsIgnoreCase(name)) { hit++; changed = true; continue; }
                if (keep.length() > 0) keep.append("; ");
                keep.append(kv);
            }
            String nv = keep.toString();
            if (nv.length() == 0) ed.remove(e.getKey());
            else ed.putString(e.getKey(), nv);
        }
        if (changed) ed.apply();
        return hit;
    }
    public static int restore(Context ctx) {
        if (ctx == null) return 0;
        SharedPreferences sp = ctx.getSharedPreferences(PREF, Context.MODE_PRIVATE);
        CookieManager cm = CookieManager.getInstance();
        try { cm.setAcceptCookie(true); } catch (Exception ignored) {}
        String expStr = httpDate(System.currentTimeMillis() + KEEP_MS);
        int n = 0;
        for (Map.Entry<String, ?> e : sp.getAll().entrySet()) {
            String domain = e.getKey();
            Object v = e.getValue();
            if (!(v instanceof String)) continue;
            String raw = (String) v;
            String base = "https://" + domain + "/";
            for (String part : raw.split(";")) {
                String kv = part.trim();
                if (kv.length() == 0) continue;
                int eq = kv.indexOf('=');
                if (eq <= 0) continue;
                String name = kv.substring(0, eq).trim();
                if (name.length() == 0 || isAttr(name)) continue;
                try {
                    cm.setCookie(base, name + "=" + kv.substring(eq + 1)
                            + "; path=/; expires=" + expStr);
                    n++;
                } catch (Exception ignored) {}
            }
        }
        try { cm.flush(); } catch (Exception ignored) {}
        return n;
    }
    public static void clear(Context ctx) {
        if (ctx == null) return;
        ctx.getSharedPreferences(PREF, Context.MODE_PRIVATE).edit().clear().apply();
    }
}
