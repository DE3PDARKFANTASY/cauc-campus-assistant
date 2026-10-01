package com.hangda.campus;
import android.app.Activity;
import android.graphics.Color;
import android.graphics.Typeface;
import android.text.TextUtils;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
public final class ShellBar {
    public static final int BRAND = 0xFF0B3D91;
    public static final int BAR_BG = 0xFFFFFFFF;
    public static final int INK = 0xFF111827;
    public static final int LINE = 0xFFE9EDF3;
    public static final int BAR_BG_DARK = 0xFF111827;
    public static final int INK_DARK = 0xFFE8ECF5;
    public static final int BRAND_DARK = 0xFF8CB4FF;
    public static final int LINE_DARK = 0xFF26304A;
    public static boolean isNight(android.content.Context c) {
        if (c == null) return false;
        return (c.getResources().getConfiguration().uiMode
                & android.content.res.Configuration.UI_MODE_NIGHT_MASK)
                == android.content.res.Configuration.UI_MODE_NIGHT_YES;
    }
    private static final int BAR_H_DP = 56;
    private static final int BOX_DP = 40;   
    private static final int ICON_DP = 24;  
    public static ShellBar current;
    private final Activity act;
    public final LinearLayout root;
    private final FrameLayout backBox;
    private final ImageView backIcon;   
    private final TextView titleView;
    private final TextView rightView;
    private Runnable onBack;
    private Runnable onRight;
    public ShellBar(Activity act) {
        this.act = act;
        root = new LinearLayout(act);
        root.setOrientation(LinearLayout.HORIZONTAL);
        root.setGravity(Gravity.CENTER_VERTICAL);
        root.setBaselineAligned(false);
        root.setBackgroundColor(BAR_BG);
        try { root.setElevation(dp(2)); } catch (Throwable ignored) {}
        root.setMinimumHeight(dp(BAR_H_DP));
        root.setPadding(dp(16), 0, dp(16), 0);
        androidx.core.view.ViewCompat.setOnApplyWindowInsetsListener(root,
            new androidx.core.view.OnApplyWindowInsetsListener() {
                @Override public androidx.core.view.WindowInsetsCompat onApplyWindowInsets(
                        View v, androidx.core.view.WindowInsetsCompat insets) {
                    int top = insets.getInsets(
                        androidx.core.view.WindowInsetsCompat.Type.systemBars()).top;
                    if (v.getPaddingTop() != top) {
                        v.setPadding(v.getPaddingLeft(), top, v.getPaddingRight(), v.getPaddingBottom());
                    }
                    return insets;
                }
            });
        backBox = new FrameLayout(act);
        backBox.setLayoutParams(new LinearLayout.LayoutParams(dp(BOX_DP), dp(BOX_DP)));
        backIcon = new ImageView(act);
        backIcon.setImageResource(R.drawable.ic_back_24);
        backIcon.setColorFilter(INK);   
        backIcon.setLayoutParams(new FrameLayout.LayoutParams(dp(ICON_DP), dp(ICON_DP), Gravity.CENTER));
        backBox.addView(backIcon);
        backBox.setVisibility(View.GONE);
        backBox.setContentDescription("返回");
        backBox.setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View v) { if (onBack != null) onBack.run(); }
        });
        root.addView(backBox);
        titleView = new TextView(act);
        titleView.setTextColor(INK);
        titleView.setTextSize(17);
        titleView.setTypeface(Typeface.DEFAULT_BOLD);
        titleView.setTypeface(Typeface.DEFAULT);
        titleView.setSingleLine(true);
        titleView.setEllipsize(TextUtils.TruncateAt.END);
        titleView.setGravity(Gravity.CENTER_VERTICAL);
        titleView.setIncludeFontPadding(false);
        LinearLayout.LayoutParams tlp =
                new LinearLayout.LayoutParams(0, dp(BOX_DP), 1f);
        tlp.leftMargin = dp(10);
        tlp.rightMargin = dp(10);
        root.addView(titleView, tlp);
        rightView = new TextView(act);
        rightView.setTextColor(BRAND);
        rightView.setTextSize(17);
        rightView.setTypeface(Typeface.DEFAULT);
        rightView.setGravity(Gravity.CENTER);
        rightView.setIncludeFontPadding(false);
        rightView.setPadding(dp(8), 0, dp(8), 0);
        rightView.setVisibility(View.GONE);
        rightView.setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View v) { if (onRight != null) onRight.run(); }
        });
        root.addView(rightView,
                new LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, dp(BOX_DP)));
    }
    public void setTitle(String t) {
        titleView.setText(t == null ? "" : t);
    }
    public void setBackVisible(boolean v) {
        backBox.setVisibility(v ? View.VISIBLE : View.GONE);
    }
    public void setRight(String label) {
        boolean show = label != null && label.length() > 0;
        rightView.setText(show ? label : "");
        rightView.setVisibility(show ? View.VISIBLE : View.GONE);
    }
    public void setOnBack(Runnable r) { onBack = r; }
    public void setOnRight(Runnable r) { onRight = r; }
    public void applyTheme(boolean dark) {
        try { root.setBackgroundColor(dark ? BAR_BG_DARK : BAR_BG); } catch (Throwable ignored) {}
        int ink = dark ? INK_DARK : INK;
        try { titleView.setTextColor(ink); } catch (Throwable ignored) {}
        try { rightView.setTextColor(dark ? BRAND_DARK : BRAND); } catch (Throwable ignored) {}
        try { backIcon.setColorFilter(ink); } catch (Throwable ignored) {}
        try { root.setElevation(dark ? 0 : dp(2)); } catch (Throwable ignored) {}
    }
    public void applySystemTheme() {
        applyTheme(isNight(act));
    }
    private int dp(int v) {
        return Math.round(v * act.getResources().getDisplayMetrics().density);
    }
}
