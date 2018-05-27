import {createQueue, log, config, reddit} from "../includes";
import {Upload} from "../models";
import request from 'request-promise';
import {addQueueJob} from "../includes/services";
import download from 'download';
import fileExists from 'file-exists';
import Promise from 'bluebird';
import { google } from 'googleapis';
import fs from 'fs';

const OAuth2 = google.auth.OAuth2;
const client = new OAuth2(
  config.youtube.client_id,
  config.youtube.client_secret
);


export class Uploader {

  constructor() {
    this.namespace = 'uploader';
    this.queue = createQueue(this.namespace);


  }

  listen() {
    log.info(`Listening for upload jobs...`);
    this.queue.process(this.process.bind(this));
  }



  async process(job) {
    try {
      const upload = await Upload.getOne({id: job.data.id});

      // add the config specific mappings
      upload.config = config.subreddits.find(s =>
        s.subreddit === upload.post.subreddit
      );

      log.info(upload.id, upload.status);
      switch (upload.status) {
        case 'pending':
          await this.getMedia(upload);
          break;
        case 'downloading':
          await this.download(upload);
          break;
        case 'uploading':
          await this.upload(upload);
          break;

        case 'commenting':
          await this.comment(upload);
          break;

        case 'complete':
          return Promise.resolve();
      }


      setTimeout(async () => await addQueueJob(this.namespace, job.data));

    } catch(err) {
      log.error(`Error in uploader`, err.stack);
      throw err;
    }
  }

  async getMedia(upload) {
    // get request to clips.twitch.tv, find the numerical id
    const response = await request.get(upload.video_url);
    const match = response.match(/\bid: "(.*)"/);

    if (match[1]) {
      const clipId = match[1];
      log.info(`Clip id: ${clipId}`);
      const url = `https://clips-media-assets.twitch.tv/${clipId}.mp4`;

      await Upload.updateVideoMedia(upload.id, url);
      await Upload.updateStatus(upload.id, 'downloading');
    }
  }

  async download(upload) {
    log.info(`Downloading`, upload.video_media_url);
    await download(upload.video_media_url, 'videos', {
      filename: `${upload.id}.mp4`
    });

    log.info(`Downloaded successfully`);


    await Upload.updateStatus(upload.id, 'uploading');

  }



  async upload(upload) {
    const path = `videos/${upload.id}.mp4`;

    log.info(`Uploading from ${path}`);

    const exists = await fileExists(path);
    if (!exists) {
      log.error(`File not found... Trying to download again`);
      return await Upload.updateStatus(upload.id, 'downloading');
    }

    client.setCredentials({
      refresh_token: config.youtube.refresh_token
    });

    const response = await client.refreshAccessTokenAsync();
    client.setCredentials(response.credentials);


    const youtube = Promise.promisifyAll(google.youtube({version: 'v3', auth: client}).videos);

    log.info(`Uploading to youtube`);


    const video = await youtube.insertAsync(
      {
        part: 'status,snippet',
        resource: {
          snippet: {
            title: upload.post.title,
            description: `Video Source: ${upload.post.url}`,
            tags: upload.config.metadata.tags,
            categoryId: 20
          },
          status: {
            privacyStatus: 'public'
          }
        },
        media: {
          body: fs.createReadStream(path)
        }
      });

    log.info(`Upload complete`);

    await Upload.updateYouTubeURL(upload.id, `https://youtube.com/watch?v=${video.data.id}`);
    await Upload.updateStatus(upload.id, 'commenting');
  }

  async comment(upload) {

    const randomComment =
      `[YouTube Mirror](${upload.youtube_video_url}) - ` + upload.config.comments[Math.floor(Math.random() * upload.config.comments.length)];

    log.info(`Commenting`, randomComment);

    await reddit.getSubmission(upload.post.id).reply(randomComment);
    await Upload.updateStatus(upload.id, 'complete');
  }
}