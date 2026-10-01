package com.hangda.campus;
import android.content.ContentValues;
import android.content.Context;
import android.net.Uri;
import android.os.Build;
import android.provider.MediaStore;
import android.webkit.CookieManager;
import java.io.BufferedInputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLDecoder;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
public final class Downloads {
  private Downloads() {}
  public static final class Result {
    public final String path;
    public final long bytes;
    public final String mime;
    Result(String path, long bytes, String mime) {
      this.path = path;
      this.bytes = bytes;
      this.mime = mime;
    }
  }
  public static String guessName(String url, String contentDisposition) {
    String name = null;
    if (contentDisposition != null) {
      Matcher m = Pattern.compile("filename\\*?=(?:UTF-8'')?\"?([^\";]+)\"?", Pattern.CASE_INSENSITIVE)
          .matcher(contentDisposition);
      if (m.find()) name = m.group(1).trim();
    }
    if (name == null || name.length() == 0) {
      String p = url.split("\\?")[0];
      int s = p.lastIndexOf('/');
      name = (s >= 0 ? p.substring(s + 1) : p);
      try { name = URLDecoder.decode(name, "UTF-8"); } catch (Exception ignored) {}
    }
    if (name == null || name.length() == 0) name = "download_" + System.currentTimeMillis();
    return name;
  }
  public static Result save(Context ctx, String url, String filename) throws Exception {
    return save(ctx, url, filename, null);
  }
  public static Result save(Context ctx, String url, String filename, String postBody) throws Exception {
    CookieManager cm = CookieManager.getInstance();
    String current = url;
    HttpURLConnection conn = null;
    int hops = 0;
    while (true) {
      conn = open(current, cm.getCookie(current), postBody != null);
      if (postBody != null) {
        conn.setDoOutput(true);
        byte[] ob = postBody.getBytes("UTF-8");
        java.io.OutputStream ops = conn.getOutputStream();
        ops.write(ob);
        ops.flush();
        ops.close();
      }
      int code = conn.getResponseCode();
      if (code >= 300 && code < 400) {
        String loc = conn.getHeaderField("Location");
        conn.disconnect();
        if (loc == null || loc.length() == 0) throw new Exception("HTTP " + code + " 无跳转地址");
        current = new URL(new URL(current), loc).toString();
        if (++hops > 6) throw new Exception("重定向次数过多");
        continue;
      }
      if (code < 200 || code >= 300) {
        conn.disconnect();
        throw new Exception("HTTP " + code);
      }
      break;
    }
    String mime = conn.getContentType();
    String disp = conn.getHeaderField("Content-Disposition");
    if (filename == null || filename.length() == 0) filename = guessName(current, disp);
    filename = filename.replaceAll("[\\\\/:*?\"<>|\r\n]", "_");
    if (Build.VERSION.SDK_INT < 29) {
      try { conn.disconnect(); } catch (Exception ignored) {}
      throw new Exception("Android 10 以下暂不支持应用内下载");
    }
    InputStream in = null;
    OutputStream os = null;
    Uri uri = null;
    long total = 0;
    try {
      ContentValues cv = new ContentValues();
      cv.put(MediaStore.Downloads.DISPLAY_NAME, filename);
      if (mime != null && mime.length() > 0) {
        cv.put(MediaStore.Downloads.MIME_TYPE, mime.split(";")[0].trim());
      }
      uri = ctx.getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, cv);
      if (uri == null) throw new Exception("MediaStore 建文件失败");
      in = new BufferedInputStream(conn.getInputStream());
      os = ctx.getContentResolver().openOutputStream(uri);
      if (os == null) throw new Exception("打开输出流失败");
      byte[] buf = new byte[16384];
      int n;
      while ((n = in.read(buf)) > 0) {
        os.write(buf, 0, n);
        total += n;
      }
      os.flush();
      return new Result("Download/" + filename, total, mime);
    } catch (Exception e) {
      if (uri != null) {
        try { ctx.getContentResolver().delete(uri, null, null); } catch (Exception ignored) {}
      }
      throw e;
    } finally {
      try { if (os != null) os.close(); } catch (Exception ignored) {}
      try { if (in != null) in.close(); } catch (Exception ignored) {}
      try { conn.disconnect(); } catch (Exception ignored) {}
    }
  }
  private static HttpURLConnection open(String url, String cookie) throws Exception {
    return open(url, cookie, false);
  }
  private static HttpURLConnection open(String url, String cookie, boolean isPost) throws Exception {
    HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
    c.setConnectTimeout(15000);
    c.setReadTimeout(60000);
    c.setInstanceFollowRedirects(false);   
    c.setRequestMethod(isPost ? "POST" : "GET");
    c.setRequestProperty("User-Agent",
        System.getProperty("http.agent", "Mozilla/5.0 (Linux; Android) AppleWebKit/537.36"));
    if (cookie != null && cookie.length() > 0) c.setRequestProperty("Cookie", cookie);
    return c;
  }
}
