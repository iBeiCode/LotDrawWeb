const base = import.meta.env.BASE_URL;

const EMOJI_ASSETS = {
  winner: {
    src: `${base}images/emoji_winner@2x.png`,
    srcSet: `${base}images/emoji_winner@2x.png 2x, ${base}images/emoji_winner@3x.png 3x`,
  },
  loser: {
    src: `${base}images/emoji_loser@2x.png`,
    srcSet: `${base}images/emoji_loser@2x.png 2x, ${base}images/emoji_loser@3x.png 3x`,
  },
};

export default function DrawCardEmojiImage({ isWinner, size = 44, className = '' }) {
  const asset = isWinner ? EMOJI_ASSETS.winner : EMOJI_ASSETS.loser;

  return (
    <img
      src={asset.src}
      srcSet={asset.srcSet}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      className={`draw-card-emoji ${className}`.trim()}
      draggable="false"
    />
  );
}
