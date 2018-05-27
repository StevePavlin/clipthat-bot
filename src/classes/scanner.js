import { log, addQueueJob, config, reddit } from "../includes";
import { Upload } from "../models/upload";



export class Scanner {

  constructor() {

  }

  /**
   * Scan reddit for new posts
   * @returns {Promise<void>}
   */
  async run() {

    try {
      for (let i = 0; i < config.subreddits.length; i++) {
        const sub = config.subreddits[i];
        log.info(sub.subreddit, `Scanning...`);
        let posts = await reddit.getSubreddit(sub.subreddit).search({
          query: 'clips.twitch.tv',
          sort: 'new',
          time: 'day'
        });

        posts = posts.filter(p => p.selftext_html.includes('clips.twitch.tv'));

        if (posts.length === 0) {
          log.info(sub.subreddit, 'No posts to handle');
          continue;
        }


        const alreadySaved = await Upload.getMany({
          ids: posts.map(p => p.id)
        });

        const newPosts = posts.filter(p =>
          alreadySaved.findIndex(a => a.post.id === p.id) === -1
        );

        log.info(`${newPosts.length} new posts`);

        // for now, take the top 1
        // todo filter by some criteria
        if (newPosts.length > 0) {
          let saving = newPosts.slice(0, 3);
          for (let i = 0; i < saving.length; i++) {
            const post = saving[i];

            const videoUrl = post.selftext_html.match(/<a href="(https:\/\/clips.twitch.tv\/(.*))">/);

            if (!videoUrl || !videoUrl[1]) {
              log.info(`Notice, regex failed for selftext_html ${post.selftext_html}, got`, videoUrl);
              continue;
            }

            const upload = await Upload.create({
              post: post,
              video_url: videoUrl[1]
            });

            await addQueueJob('uploader', {
              id: upload.id
            });
          }

          log.info(sub.subreddit, `Enqueued`, saving.length, `jobs`);
        }
      }
    } catch(err) {
      log.error(`Scan error`, err.stack)
    }
    setTimeout(() => this.run(), 5000);
  }
}