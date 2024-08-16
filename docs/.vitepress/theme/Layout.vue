<script setup>
import DefaultTheme from "vitepress/theme";
import { onMounted, ref } from 'vue';

const videoContainer = ref(null);

onMounted(() => {
  const resizeVideo = () => {
    if (videoContainer.value) {
      const containerWidth = videoContainer.value.offsetWidth;
      const aspectRatio = 16 / 9; // YouTube视频的标准宽高比
      const height = containerWidth / aspectRatio;
      videoContainer.value.style.height = `${height}px`;
    }
  };

  resizeVideo();
  window.addEventListener('resize', resizeVideo);
});
</script>

<template>
  <DefaultTheme.Layout>
    <template #home-hero-image>
      <div ref="videoContainer" class="video-container">
        <iframe 
          src="https://www.youtube.com/embed/l9A1vSN956s?si=dSaWJwJvqJMyhuFt&autoplay=1&mute=1&loop=1&playlist=l9A1vSN956s" 
          title="YouTube video player" 
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          referrerpolicy="strict-origin-when-cross-origin" 
          allowfullscreen
          class="video"
        ></iframe>
      </div>
    </template>
  </DefaultTheme.Layout>
</template>

<style>
.image-container {
  display: flex;
  align-items: center;
}
</style>
<style scoped>
.video-container {
  position: relative;
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
  overflow: hidden;
}

.video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

@media (max-width: 639px) {
  .video-container {
    max-width: 90%;
  }
}
</style>