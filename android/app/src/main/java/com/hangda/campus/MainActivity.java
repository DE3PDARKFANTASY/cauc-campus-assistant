package com.hangda.campus;
import android.content.res.Configuration;
import android.os.Bundle;
import android.view.View;
import com.getcapacitor.BridgeActivity;
public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(LoginWebViewPlugin.class);
        super.onCreate(savedInstanceState);
        try {
            androidx.core.splashscreen.SplashScreen.installSplashScreen(this);
        } catch (Throwable ignored) {}
        final boolean dark = ShellBar.isNight(this);
        try {
            android.widget.FrameLayout host = findViewById(R.id.cauc_shellbar);
            if (host != null) {
                final ShellBar bar = new ShellBar(this);
                host.addView(bar.root, new android.widget.FrameLayout.LayoutParams(
                        android.view.ViewGroup.LayoutParams.MATCH_PARENT,
                        android.view.ViewGroup.LayoutParams.WRAP_CONTENT));
                bar.applyTheme(dark);       
                ShellBar.current = bar;
                bar.setOnBack(new Runnable() {
                    @Override public void run() {
                        evalJs("window.__caucNativeAct&&window.__caucNativeAct('back')");
                    }
                });
                bar.setOnRight(new Runnable() {
                    @Override public void run() {
                        evalJs("window.__caucNativeAct&&window.__caucNativeAct('go:mine')");
                    }
                });
            }
        } catch (Throwable ignored) {}
        try {
            final android.view.View root = findViewById(R.id.cauc_root);
            if (root != null) {
                root.setTag("cauc-keep-inset");
                androidx.core.view.ViewCompat.setOnApplyWindowInsetsListener(root,
                    new androidx.core.view.OnApplyWindowInsetsListener() {
                        @Override public androidx.core.view.WindowInsetsCompat onApplyWindowInsets(
                                android.view.View v, androidx.core.view.WindowInsetsCompat insets) {
                            int bottom = insets.getInsets(
                                androidx.core.view.WindowInsetsCompat.Type.systemBars()).bottom;
                            if (v.getPaddingBottom() != bottom) {
                                v.setPadding(v.getPaddingLeft(), v.getPaddingTop(),
                                             v.getPaddingRight(), bottom);
                            }
                            return insets;
                        }
                    });
            }
        } catch (Throwable ignored) {}
        Immersive.apply(this, dark);
        try { CookieVault.restore(this); } catch (Exception ignored) {}
    }
    @Override
    public void onResume() {
        super.onResume();
        Immersive.apply(this, ShellBar.isNight(this));
    }
    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        boolean dark = (newConfig.uiMode & Configuration.UI_MODE_NIGHT_MASK)
                == Configuration.UI_MODE_NIGHT_YES;
        try { if (ShellBar.current != null) ShellBar.current.applyTheme(dark); } catch (Throwable ignored) {}
        try { Immersive.apply(this, dark); } catch (Throwable ignored) {}
        try {
            View root = findViewById(R.id.cauc_root);
            if (root != null) {
                root.setBackgroundColor(dark ? Immersive.DARK_BG : android.graphics.Color.WHITE);
            }
        } catch (Throwable ignored) {}
        evalJs("window.dispatchEvent(new Event('cauc:native-theme'))");
    }
    @Override
    public void onDestroy() {
        ShellBar.current = null;
        super.onDestroy();
    }
    private void evalJs(final String js) {
        try {
            if (getBridge() != null && getBridge().getWebView() != null) {
                getBridge().getWebView().evaluateJavascript(js, null);
            }
        } catch (Throwable ignored) {}
    }
}
