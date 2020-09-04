const THUMBOR_BASE_URL = process.env.THUMBOR_BASE_URL || "https://images.mnemotix.com/unsafe";

/**
 * @param {string} imageUrl
 * @param {string} [size]
 * @param {string} [dimensions]
 */
export function getImageThumbnail({size, dimensions, imageUrl} = {}) {
  if (!imageUrl) {
    return "";
  }

  if (!!imageUrl.match(/docker\.for\.mac\.localhost|localhost|127\.0\.0\.1/)) {
    imageUrl = imageUrl.replace(/docker\.for\.mac\.localhost|localhost|127\.0\.0\.1/, "local-resource-tusd");
  }

  switch (size) {
    case "huge":
      dimensions = "2000x";
      break;
    case "big":
      dimensions = "1024x";
      break;
    case "medium":
      dimensions = "512x";
      break;
    case "small":
      dimensions = "250x";
      break;
    case "tiny":
      dimensions = "50x";
      break;
  }

  return `${THUMBOR_BASE_URL}/${dimensions}/${imageUrl}`;
}

export function getImagesThumbnail(imageUrl) {
  if (Array.isArray(imageUrl)) {
    imageUrl = imageUrl[0];
  }
  return getImageThumbnail({
    imageUrl,
    size: "small"
  });
}
