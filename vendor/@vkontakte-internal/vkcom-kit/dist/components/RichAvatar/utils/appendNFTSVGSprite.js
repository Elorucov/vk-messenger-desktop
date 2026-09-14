const SPRITE_ID = 'rich_avatar_nft_svg_sprite';
export const appendNFTSVGSprite = () => {
    if (document.getElementById(SPRITE_ID) !== null) {
        return;
    }
    const sprite = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    sprite.setAttribute('style', 'position: absolute; width: 0; height: 0');
    sprite.id = SPRITE_ID;
    sprite.innerHTML = `
<defs>
  <clipPath id="AvatarHeptagonSvgClip" clipPathUnits="objectBoundingBox">
    <path d="M 0.316 0.0391 A 0.1164 0.1164 90 0 1 0.4285 0.0089 l 0.3784 0.1014 a 0.1164 0.1164 90 0 1 0.0823 0.0823 l 0.1014 0.3784 a 0.1164 0.1164 90 0 1 -0.0302 0.1125 L 0.6836 0.9605 a 0.1164 0.1164 90 0 1 -0.1125 0.0302 l -0.3784 -0.1014 a 0.1164 0.1164 90 0 1 -0.0823 -0.0823 L 0.0089 0.4285 a 0.1164 0.1164 90 0 1 0.0302 -0.1125 L 0.316 0.0391 Z"></path>
  </clipPath>
  <clipPath id="AvatarDecorationNftClip">
    <path d="M 13.789 2.942 C 14.965 1.805 16.65 1.334 18.218 1.766 L 33.031 5.723 C 34.599 6.155 35.853 7.37 36.246 8.977 L 40.242 23.792 C 40.673 25.358 40.203 27.043 39.066 28.181 L 28.211 39.035 C 27.035 40.211 25.389 40.643 23.784 40.25 L 8.969 36.254 C 7.402 35.861 6.147 34.607 5.755 33.039 L 1.758 18.187 C 1.326 16.619 1.797 14.934 2.934 13.797 L 13.789 2.942 Z"></path>
  </clipPath>
  <mask id="AvatarDecorationNftMask">
    <rect fill="white" x="0" y="0" width="42" height="42" />
    <path d="M 14.291 4.2 C 15.385 3.141 16.952 2.703 18.411 3.105 L 32.193 6.786 C 33.653 7.188 34.819 8.319 35.185 9.814 L 38.903 23.599 C 39.304 25.056 38.867 26.622 37.809 27.681 L 27.71 37.78 C 26.614 38.875 25.084 39.277 23.591 38.911 L 9.806 35.193 C 8.348 34.827 7.18 33.661 6.816 32.201 L 3.097 18.384 C 2.695 16.925 3.133 15.357 4.192 14.299 L 14.291 4.2 Z"></path>
  </mask>
  <linearGradient id="avatar_hept_underlay_fill" x1="0" y1="0" x2="50" y2="50" gradientUnits="userSpaceOnUse">
    <stop stop-color="#2EE6A8" />
    <stop offset="0.34375" stop-color="#3399FF" />
    <stop offset="0.692708" stop-color="#9933FF" />
    <stop offset="1" stop-color="#FF3399" />
  </linearGradient>
</defs>
`;
    document.body.appendChild(sprite);
};
//# sourceMappingURL=appendNFTSVGSprite.js.map