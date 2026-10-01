package com.hangda.campus;
import android.app.Activity;
import android.graphics.Color;
import android.os.Build;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
public final class Immersive {
    private Immersive() {}
    private static int dp(Activity act, int v) {
        return Math.round(act.getResources().getDisplayMetrics().density * v);
    }
    private static void forceNoFits(ViewGroup vg) {
        if (vg == null) return;
        vg.setFitsSystemWindows(false);
        for (int i = 0; i < vg.getChildCount(); i++) {
            View c = vg.getChildAt(i);
            c.setFitsSystemWindows(false);
            if (c instanceof ViewGroup) forceNoFits((ViewGroup) c);
        }
    }
    private static boolean keepInset(View v) {
        return v != null && "cauc-keep-inset".equals(v.getTag());
    }
    private static void clearInsetsPadding(ViewGroup vg) {
        if (vg == null) return;
        if (keepInset(vg)) return;              
        vg.setFitsSystemWindows(false);
        if (vg.getPaddingBottom() != 0) vg.setPadding(vg.getPaddingLeft(), vg.getPaddingTop(),
                vg.getPaddingRight(), 0);
        for (int i = 0; i < vg.getChildCount(); i++) {
            View c = vg.getChildAt(i);
            if (keepInset(c)) continue;         
            c.setFitsSystemWindows(false);
            if (c.getPaddingBottom() != 0) {
                c.setPadding(c.getPaddingLeft(), c.getPaddingTop(), c.getPaddingRight(), 0);
            }
            if (c instanceof ViewGroup) clearInsetsPadding((ViewGroup) c);
        }
    }
    private static final int BRAND = Color.parseColor("#0B3D91");
    public static final int DARK_BG = 0xFF111827;
    public static void apply(final Activity act, final boolean dark) {
        if (act == null) return;
        applyNow(act, dark);
        try {
            act.getWindow().getDecorView().post(new Runnable() {
                @Override public void run() { applyNow(act, dark); }
            });
        } catch (Throwable ignored) {}
        try {
            act.getWindow().getDecorView().postDelayed(new Runnable() {
                @Override public void run() { applyNow(act, dark); }
            }, 400);
        } catch (Throwable ignored) {}
    }
    public static void applyEdgeToEdge(final Activity act) {
        if (act == null) return;
        applyEdgeNow(act);
        try {
            act.getWindow().getDecorView().post(new Runnable() {
                @Override public void run() { applyEdgeNow(act); }
            });
        } catch (Throwable ignored) {}
        try {
            act.getWindow().getDecorView().postDelayed(new Runnable() {
                @Override public void run() { applyEdgeNow(act); }
            }, 400);
        } catch (Throwable ignored) {}
    }
    private static void applyEdgeNow(Activity act) {
        final boolean dark = ShellBar.isNight(act);
        try {
            Window w = act.getWindow();
            WindowCompat.enableEdgeToEdge(w);
            try { w.setStatusBarColor(Color.TRANSPARENT); } catch (Throwable ignored) {}
            try {
                WindowCompat.getInsetsController(w, w.getDecorView())
                    .setAppearanceLightStatusBars(!dark);
            } catch (Throwable ignored) {}
            try { w.setNavigationBarColor(dark ? DARK_BG : Color.WHITE); } catch (Throwable ignored) {}
            try {
                WindowCompat.getInsetsController(w, w.getDecorView())
                    .setAppearanceLightNavigationBars(!dark);
            } catch (Throwable ignored) {}
        } catch (Throwable ignored) {}
    }
    public static void addStatusStrip(final Activity act, final int color) {
        if (act == null) return;
        try {
            final android.widget.FrameLayout decor =
                (android.widget.FrameLayout) act.getWindow().getDecorView();
            final View strip = new View(act);
            strip.setBackgroundColor(color);
            int h = dp(act, 24);
            try {
                int resId = act.getResources().getIdentifier("status_bar_height", "dimen", "android");
                if (resId > 0) h = act.getResources().getDimensionPixelSize(resId);
            } catch (Throwable ignored2) {}
            android.widget.FrameLayout.LayoutParams lp =
                new android.widget.FrameLayout.LayoutParams(
                    android.view.ViewGroup.LayoutParams.MATCH_PARENT, h);
            lp.gravity = android.view.Gravity.TOP;
            decor.addView(strip, 0, lp);
            strip.setTag("cauc-status-strip");
        } catch (Throwable ignored) {}
    }
    private static void applyNow(Activity act, boolean dark) {
        final boolean lightIcons = !dark;
        try {
            Window w = act.getWindow();
            try {
                w.clearFlags(android.view.WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
                w.addFlags(android.view.WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
            } catch (Throwable ignored2) {}
            final int barBg = dark ? DARK_BG : Color.WHITE;
            try {
                w.setBackgroundDrawable(new android.graphics.drawable.ColorDrawable(barBg));
            } catch (Throwable ignoredBg) {}
            w.setStatusBarColor(barBg);
            try {
                w.setNavigationBarColor(barBg);
            } catch (Throwable ignoredNav) {}
            WindowCompat.setDecorFitsSystemWindows(w, true);
            if (Build.VERSION.SDK_INT >= 30) {
                w.setDecorFitsSystemWindows(true);
            }
            try {
                w.clearFlags(android.view.WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
                w.addFlags(android.view.WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
            } catch (Throwable ignored2) {}
            View decor = w.getDecorView();
            if (decor instanceof ViewGroup) {
                decor.setFitsSystemWindows(false);
                View content = decor.findViewById(android.R.id.content);
                if (content != null) forceNoFits((ViewGroup) content);
            }
            forceNoFits((ViewGroup) decor);
            clearInsetsPadding((ViewGroup) decor);
            try {
                int wid = act.getResources().getIdentifier("webview", "id", act.getPackageName());
                if (wid > 0) {
                    View wv = act.findViewById(wid);
                    if (wv != null) wv.setBackgroundColor(barBg);
                }
            } catch (Throwable ignored3) {}
            WindowInsetsControllerCompat ic =
                    WindowCompat.getInsetsController(w, w.getDecorView());
            if (ic != null) {
                ic.setAppearanceLightStatusBars(lightIcons);
                try { ic.setAppearanceLightNavigationBars(lightIcons); } catch (Throwable ignoredNb) {}
            }
        } catch (Throwable ignored) {
            try {
                Window w = act.getWindow();
                w.setStatusBarColor(dark ? DARK_BG : Color.WHITE);
                int flags = View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                        | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN;
                if (lightIcons && android.os.Build.VERSION.SDK_INT >= 23) {
                    flags |= View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
                }
                w.getDecorView().setSystemUiVisibility(flags);
            } catch (Throwable ignored2) {  }
        }
    }
}
