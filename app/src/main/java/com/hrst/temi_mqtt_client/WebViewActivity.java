package com.hrst.temi_mqtt_client;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;

public class WebViewActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_webview);

        // https://developer.android.com/guide/webapps/webview
        WebView webView = (WebView)findViewById(R.id.webview);
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);

        // get the intent that started this activity and extract the webview URL
        Intent intent = getIntent();
        String url = intent.getStringExtra(MainActivity.WEBVIEW_URL);

        webView.loadUrl(url);
    }
}
