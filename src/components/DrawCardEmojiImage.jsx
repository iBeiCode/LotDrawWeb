import winner2x from '../assets/emoji_winner_2x.png';
import winner3x from '../assets/emoji_winner_3x.png';
import loser2x from '../assets/emoji_loser_2x.png';
import loser3x from '../assets/emoji_loser_3x.png';

const EMOJI_ASSETS = {
  winner: {
    src: winner2x,
    srcSet: `${winner2x} 2x, ${winner3x} 3x`,
  },
  loser: {
    src: loser2x,
    srcSet: `${loser2x} 2x, ${loser3x} 3x`,
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
