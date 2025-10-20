// Predefined tooltip models for easy reuse

export const info = {
  backgroundColor: '#2196F3', // Blue
  color: '#FFFFFF',
};

export const success = {
  backgroundColor: '#4CAF50', // Green
  color: '#FFFFFF',
};

export const warning = {
  backgroundColor: '#FFC107', // Yellow
  color: '#000000',
};

export const error = {
  backgroundColor: '#F44336', // Red
  color: '#FFFFFF',
};

/**
 * A special model to allow full customization.
 * @param {React.CSSProperties} styles The custom styles to apply.
 * @returns {React.CSSProperties}
 */
export const custom = (styles) => ({
    ...styles
});

// Teacher model with static image (placed in static/img)
export const teacher = {
  backgroundColor: '#0d491fff',
  /* fallback shorthand */
  background: '#ffffff',
  color: '#000000',
  border: '2px solid #20190aff',
  borderRadius: '8px',
  paddingTop: '30px',
  paddingLeft: '10px',
  // image displayed inside the tooltip (rendered as an inline img to avoid overlap)
  image: '/img/toottipsteacherdocuxlab.webp',
  // decorative by default; set a string to provide accessible alt text
  imageAlt: '',
  imageSize: '70px',
  imageRight: '10px',
  imageBottom: '6px',
  minWidth: '50px',
};


// Teacher model with static image (placed in static/img)
export const suricate = {
  backgroundColor: '#0d491fff',
  /* fallback shorthand */
  background: '#ffffff',
  color: '#000000',
  border: '2px solid #20190aff',
  borderRadius: '8px',
  paddingTop: '30px',
  paddingLeft: '10px',
  // image displayed inside the tooltip (rendered as an inline img to avoid overlap)
  image: '/img/test.webp',
  // decorative by default; set a string to provide accessible alt text
  imageAlt: '',
  imageSize: '70px',
  imageRight: '10px',
  imageBottom: '6px',
  minWidth: '50px',
};
