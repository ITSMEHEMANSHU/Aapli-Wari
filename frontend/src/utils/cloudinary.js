/**
 * Cloudinary Utility
 * ──────────────────
 * WHY CLOUDINARY?
 *  - You upload images once; Cloudinary stores them and serves via a global CDN.
 *  - You can resize, crop, compress, convert to WebP — all through URL parameters.
 *  - No need to manage your own image storage or worry about file sizes.
 *  - Free tier: 25GB storage + 25GB bandwidth/month — plenty for getting started.
 *
 * HOW IT WORKS:
 *  Every Cloudinary image URL looks like:
 *  https://res.cloudinary.com/<cloud_name>/image/upload/<transformations>/<public_id>
 *
 *  The helper below builds that URL for you.
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dqrqcnlpx';

/**
 * Build a Cloudinary image URL with optional transformations.
 *
 * @param {string} publicId   - The image identifier you see in Cloudinary Media Library
 *                              e.g. "aapliwari/hero-temple"
 * @param {object} options    - Transformation options
 * @param {number} [options.width]   - Resize width in px
 * @param {number} [options.height]  - Resize height in px
 * @param {string} [options.crop]    - Crop mode: 'fill' | 'fit' | 'thumb' | 'scale'
 * @param {string} [options.quality] - Quality: 'auto' | '80' | 'best' | 'eco'
 * @param {string} [options.format]  - Output format: 'auto' | 'webp' | 'jpg'
 * @returns {string} Full Cloudinary URL
 *
 * EXAMPLE USAGE:
 *   import { cloudinaryUrl } from '../utils/cloudinary';
 *   <img src={cloudinaryUrl('aapliwari/hero-temple', { width: 1200, crop: 'fill', quality: 'auto' })} />
 */
export function cloudinaryUrl(publicId, options = {}) {
  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto',
    format = 'auto',
  } = options;

  const transforms = [
    `f_${format}`,
    `q_${quality}`,
    width && `w_${width}`,
    height && `h_${height}`,
    (width || height) && `c_${crop}`,
  ]
    .filter(Boolean)
    .join(',');

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms}/${publicId}`;
}

/**
 * Pre-built image references for the site.
 *
 * ─── HOW TO ADD YOUR IMAGES ──────────────────────────────────────────────────
 *  1. Go to your Cloudinary dashboard → Media Library
 *  2. Upload your image (drag & drop or Upload button)
 *  3. Click the image → copy the "Public ID" (shown below the preview)
 *  4. Replace the placeholder string below with your actual Public ID
 *
 *  TIP: Create a folder called "aapliwari" in Cloudinary to keep things organised.
 *       Then your public IDs will be like "aapliwari/hero-temple".
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const IMAGES = {
  // ── Hero Section ──────────────────────────────────────────────────────────
  hero: 'Backgroundp',

  // ── Logo / Brand ──────────────────────────────────────────────────────────
  logo: 'logo1',

  // ── Wari Experience Cards ─────────────────────────────────────────────────
  // Replace each with photos of the corresponding subject
  palkhis:      'Background',
  abhangs:      'Background',
  manuscripts:  'Background',
  holyPlaces:   'Background',
  seva:         'Background',

  // ── Newsletter Section background ─────────────────────────────────────────
  newsletterBg: 'aapliwari/newsletter-bg',
};

/**
 * Convenience: get a card-sized image (fits the experience grid cards).
 * Returns a 600×400 fill-cropped auto-quality URL.
 */
export function cardImage(publicId) {
  return cloudinaryUrl(publicId, { width: 600, height: 400, crop: 'fill', quality: 'auto' });
}

/**
 * Convenience: get a hero-sized image (full-width banner).
 * Uses 'fit' so the full image is visible without cropping.
 */
export function heroImage(publicId) {
  return cloudinaryUrl(publicId, { width: 1600, crop: 'fit', quality: 'auto' });
}

export function videoUrl(publicId, options = {}) {
  const { quality = 'auto', format = 'mp4' } = options;
  const transforms = [`q_${quality}`, `f_${format}`].filter(Boolean).join(',');
  return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/${transforms}/${publicId}.${format}`;
}

export function videoPosterUrl(publicId, options = {}) {
  const {
    width = 900,
    height = 1600,
    crop = 'fill',
    quality = 'auto',
    format = 'jpg',
  } = options;

  const transforms = [
    `f_${format}`,
    `q_${quality}`,
    width && `w_${width}`,
    height && `h_${height}`,
    (width || height) && `c_${crop}`,
  ].filter(Boolean).join(',');

  return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/${transforms}/${publicId}.${format}`;
}
