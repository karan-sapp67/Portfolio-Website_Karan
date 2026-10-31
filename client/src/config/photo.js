// Portrait framing. Tweak these if your forehead or chin ever gets cropped.
export const PHOTO = {
  // object-position for the rectangular crop (x y). Lower y = more headroom kept at the top.
  objectPosition: '50% 18%',
  // object-position for the round dialogue avatar crop
  avatarPosition: '50% 22%',
  alt: 'Karan Sapalia portrait',
};
// Colour treatment lives in CSS: set --photo-mode to natural (default) or duotone in tokens.css.
