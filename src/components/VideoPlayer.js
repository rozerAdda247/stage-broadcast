import React from "react";

function VideoPlayer() {
  React.useEffect(() => {
    const DEFAULT_STREAM =
      "https://fcf5420e5ea1.us-east-1.playback.live-video.net/api/video/v1/us-east-1.748804974185.channel.mEWjYDpYNAOR.m3u8?token=eyJhbGciOiJFUzM4NCIsInR5cCI6IkpXVCJ9.eyJhd3M6Y2hhbm5lbC1hcm4iOiJhcm46YXdzOml2czp1cy1lYXN0LTE6NzQ4ODA0OTc0MTg1OmNoYW5uZWwvbUVXallEcFlOQU9SIiwiYXdzOmFjY2Vzcy1jb250cm9sLWFsbG93LW9yaWdpbiI6IioiLCJpYXQiOjE2ODU1MTc4NjksImV4cCI6MTY4NTY5MDY2OX0.7dXL4L6sT0ncvEHNYmMkAMIGKvqz88AVGX0mS396w0z28Qr1zr-dOnKiGVW_z8EMhlSs_fzhcoIYN-cqGkDdZuQ9yV6Rp34tipdxXz9Pfbjpue5bVFbobJ2B6HuvlHau";

    // Initialize player
    (function () {
      // Set up IVS playback tech and quality plugin
      window.registerIVSTech(window.videojs);
      window.registerIVSQualityPlugin(window.videojs);

      // Initialize video.js player
      const videoJSPlayer = window.videojs("amazon-ivs-videojs", {
        techOrder: ["AmazonIVS"],
        controlBar: {
          playToggle: {
            replay: false,
          }, // Hides the replay button for VOD
          pictureInPictureToggle: false, // Hides the PiP button
        },
      });
      window.videoJSPlayer = videoJSPlayer;
      // Use the player API once the player instance's ready callback is fired
      const readyCallback = function () {
        // This executes after video.js is initialized and ready
        window.videoJSPlayer = videoJSPlayer;

        // Get reference to Amazon IVS player
        const ivsPlayer = videoJSPlayer.getIVSPlayer();

        // Show the "big play" button when the stream is paused
        const videoContainerEl = document.querySelector("#amazon-ivs-videojs");
        videoContainerEl.addEventListener("click", () => {
          if (videoJSPlayer.paused()) {
            videoContainerEl.classList.remove("vjs-has-started");
          } else {
            videoContainerEl.classList.add("vjs-has-started");
          }
        });

        // Logs low latency setting and latency value 5s after playback starts
        const PlayerState = videoJSPlayer.getIVSEvents().PlayerState;
        ivsPlayer.addEventListener(PlayerState.PLAYING, () => {
          console.log("Player State - PLAYING");
          setTimeout(() => {
            console.log(
              `This stream is ${
                ivsPlayer.isLiveLowLatency() ? "" : "not "
              }playing in ultra low latency mode`
            );
            console.log(`Stream Latency: ${ivsPlayer.getLiveLatency()}s`);
          }, 5000);
        });

        // Log errors
        const PlayerEventType = videoJSPlayer.getIVSEvents().PlayerEventType;
        ivsPlayer.addEventListener(PlayerEventType.ERROR, (type, source) => {
          console.warn("Player Event - ERROR: ", type, source);
        });

        // Log and display timed metadata
        ivsPlayer.addEventListener(PlayerEventType.TEXT_METADATA_CUE, (cue) => {
          const metadataText = cue.text;
          const position = ivsPlayer.getPosition().toFixed(2);
          console.log(
            `Player Event - TEXT_METADATA_CUE: "${metadataText}". Observed ${position}s after playback started.`
          );
        });

        // Enables manual quality selection plugin
        videoJSPlayer.enableIVSQualityPlugin();

        // Set volume and play default stream
        videoJSPlayer.volume(0.5);
        videoJSPlayer.src(DEFAULT_STREAM);
      };

      // Register ready callback
      videoJSPlayer.ready(readyCallback);
    })();

    // Sets up input box for Amazon IVS manifest
    (function () {
      const containerEl = document.querySelector(".video-container");
      const directSrcFormEl = containerEl.querySelector(
        ".src-container-direct"
      );
      const directSrcInputEl = containerEl.querySelector(".src-input");
      directSrcFormEl.addEventListener("submit", (e) => {
        e.preventDefault();
        window.videoJSPlayer.src(directSrcInputEl.value);
      });
    })();
  }, []);
  return (
    <div class="video-container">
      <form class="src-container-direct">
        <input class="src-input" placeholder="Enter .m3u8" />
        <button class="src-submit" type="submit">
          Load
        </button>
      </form>
      <video
        id="amazon-ivs-videojs"
        class="video-js vjs-4-3 vjs-big-play-centered"
        controls
        autoplay
        playsinline
      ></video>
    </div>
  );
}

export default VideoPlayer;
