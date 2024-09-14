import React from 'react';

function PlaceholderCard({ cardWidth, cardHeight }) {
  return (
    <div
      style={{
        width: cardWidth,
        height: cardHeight,
        visibility: 'hidden', // Make the placeholder invisible
      }}
    />
  );
}

export default PlaceholderCard;

