import { css } from "lit";

export const clientIconStyles = css`
  svg {
    height: 100%;
    width: 100%;
    border-radius: 50%;
  }
`;

export const scaleUpAnimation = css`
  @keyframes scaleUp {
    from {
      transform: scale(0.5);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
`;
