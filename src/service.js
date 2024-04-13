const express = require("express");
const ytdl = require("ytdl-core");
// const fs = require("fs");

const port = 3000;

const app = express();
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/info", async (req, res) => {
  try {
    const videoUrl = req.query.url;
    const info = await ytdl.getInfo(videoUrl);

    const filteredFormats = info.formats.filter((format) =>
      [18, 137, 136, 135, 134].includes(format.itag)
    );

    const videoDetails = {
      title: info.videoDetails.title,
      thumbnails: info.videoDetails.thumbnails[0],
      formats: filteredFormats.map((format) => ({
        quality: format.qualityLabel,
        itag: format.itag,
      })),
    };

    res.json(videoDetails);
  } catch (error) {
    console.error("Error fetching video information:", error);
    res.status(500).json({ error: "Error fetching video information" });
  }
});

app.get("/download", async (req, res) => {
  try {
    const videoUrl = req.query.url;
    const quality = req.query.quality;
    // INFO OF VIDEO
    const info = await ytdl.getInfo(videoUrl);
    // QUALITY OF VIDEO (18 => 360p)
    const videoFormat = ytdl.chooseFormat(info.formats, { quality: quality });
    // DOWNLOAD VIDEO
    res.header(
      "Content-Disposition",
      `attachment; filename="${info.videoDetails.title}.mp4"`
    );
    ytdl(videoUrl, { format: videoFormat }).pipe(res);
  } catch (error) {
    console.error("Error downloading the video:", error);
    res.status(500).send("Error downloading the video");
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
