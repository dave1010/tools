---
title: FFmpeg Transcoder
description: Convert local media into common formats with FFmpeg WASM.
category: Data & File Conversion
---

## Overview

Quickly convert videos or audio files directly in your browser without uploading them anywhere. The FFmpeg WebAssembly build runs locally, so your media never leaves your device.

## Usage

1. Choose a video or audio file from your device.
2. Pick an export preset, adjust the optional resolution cap, and decide whether to remove the audio track.
3. Click **Transcode** and wait for the progress indicator to reach 100%.
4. Preview the result in the built-in player or download the converted file.

## Notes

- The first run needs to download the FFmpeg core (~25&nbsp;MB), so loading may take a little time.
- MP3 exports are audio-only and will hide the preview player after conversion.
- Browser tabs can use substantial memory while transcoding large files; keep other activity minimal for best results.
