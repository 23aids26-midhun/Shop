import React, { useState } from 'react';
import { getCategoryTheme, getCategoryImage } from '../utils/productVisuals';

/**
 * One category "bubble" - tries a real photo first (deterministic, so it
 * never changes and basically never 404s), but falls back to a colourful
 * illustrated tile if the photo ever fails to load for any reason. This
 * makes a broken-image icon here structurally impossible.
 */
function CategoryBubble({ seed, emoji, from, to, label, active, onClick }) {
  const [failed, setFailed] = useState(false);

  return (
    <button
      className={`category-strip__item ${active ? 'category-strip__item--active' : ''}`}
      onClick={onClick}
    >
      {!failed ? (
        <img
          src={getCategoryImage(seed)}
          alt=""
          className="category-strip__img"
          onError={() => setFailed(true)}
        />
      ) : (
        <span
          className="category-strip__icon"
          style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
        >
          {emoji}
        </span>
      )}
      <span className="category-strip__label">{label}</span>
    </button>
  );
}

export default function CategoryStrip({ categories, active, onPick }) {
  return (
    <div className="category-strip">
      <div className="container-fluid px-3 px-lg-4">
        <div className="category-strip__row">
          <CategoryBubble
            seed="all-products"
            emoji="🛍️"
            from="#131921"
            to="#3A4553"
            label="All"
            active={active === ''}
            onClick={() => onPick('')}
          />
          {categories.map((c) => {
            const theme = getCategoryTheme(c.name);
            return (
              <CategoryBubble
                key={c.id}
                seed={c.slug || c.name}
                emoji={theme.emoji}
                from={theme.from}
                to={theme.to}
                label={c.name}
                active={String(active) === String(c.id)}
                onClick={() => onPick(c.id)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
