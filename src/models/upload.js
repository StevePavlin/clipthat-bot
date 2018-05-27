import { db } from "../includes/index";

class UploadModel {


  /**
   * Gets all records containing some urls, used to diff newest hot posts to see what we have
   * @param limit
   * @returns {Promise<*>}
   */
  async getMany({ ids }) {
    return await db.query(`
      SELECT * FROM uploads WHERE (post->>'id')::VARCHAR IN ($1:csv)
    `, [ids]
    );
  }

  /**
   * @param id
   * @param video_media_url
   * @returns {Promise<*>}
   */
  async updateVideoMedia(id, video_media_url) {
    return await db.query(`
      UPDATE uploads SET video_media_url = $1 WHERE id = $2
    `, [video_media_url, id]
    );
  }


  /**
   * @param id
   * @param url
   * @returns {Promise<*>}
   */
  async updateYouTubeURL(id, url) {
    return await db.query(`
      UPDATE uploads SET youtube_video_url = $1 WHERE id = $2
    `, [url, id]
    );
  }


  /**
   * @param id
   * @param status
   * @returns {Promise<*>}
   */
  async updateStatus(id, status) {
    return await db.query(`
      UPDATE uploads SET status = $1 WHERE id = $2
    `, [status, id]
    );
  }

  /**
   * Get one upload based on: id
   * @param id
   * @returns {Promise<*>}
   */
  async getOne({ id }) {
    return await db.one(`
      SELECT * FROM uploads WHERE id = $1
    `, [id]
    );
  }

  /**
   * Create a new upload
   * @param subreddit
   * @param post
   * @param video_url
   * @returns {Promise<void>}
   */
  async create({ post, video_url }) {
    return await db.one(`
      INSERT INTO uploads(post, video_url, status)
        VALUES($1, $2, $3) RETURNING id
    `, [post, video_url, 'pending']
    );
  }

}

export const Upload = new UploadModel();