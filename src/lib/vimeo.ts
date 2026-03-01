// eslint-disable-next-line @typescript-eslint/no-require-imports
const Vimeo = require('@vimeo/vimeo');

const vimeoClient = new Vimeo.Vimeo(
  process.env.VIMEO_CLIENT_ID,
  process.env.VIMEO_CLIENT_SECRET,
  process.env.VIMEO_ACCESS_TOKEN,
);

/**
 * Uploads a local video file to Vimeo.
 * Returns the full Vimeo URI string, e.g. "/videos/123456789".
 * Extract the ID with: uri.split('/videos/')[1]
 */
export function uploadToVimeo(
  filePath: string,
  name: string,
  description: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    vimeoClient.upload(
      filePath,
      { name, description },
      (uri: string) => resolve(uri),
      (_bytesUploaded: number, _bytesTotal: number) => {
        // Progress — can be streamed via SSE in a future iteration
      },
      (error: string) => reject(new Error(error)),
    );
  });
}

export { vimeoClient };
