package com.hapirobo.connect;

import androidx.appcompat.app.AppCompatActivity;

import android.app.ProgressDialog;
import android.content.Intent;
import android.media.MediaPlayer;
import android.os.Bundle;
import android.widget.VideoView;

public class VideoActivity extends AppCompatActivity {
    private static final String TAG = "VIDEO";

    public static ProgressDialog pd;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_video);

        VideoView videoView = (VideoView)findViewById(R.id.videoView);

        // display video buffering message
        // https://developer.android.com/reference/android/app/ProgressDialog
        pd = new ProgressDialog(VideoActivity.this);
        pd.setMessage("Buffering video please wait...");
        pd.show();

        // get the intent that started this activity and extract the video URL
        Intent intent = getIntent();
        String url = intent.getStringExtra(MainActivity.VIDEO_URL);

        // videoView settings
        videoView.setVideoPath(url);
        videoView.setOnPreparedListener(new MediaPlayer.OnPreparedListener() {
            @Override
            public void onPrepared(MediaPlayer mp) {
                // close the progress dialog when buffering is done
                pd.dismiss();
            }
        });

        // play the video
        videoView.start();
    }
}
