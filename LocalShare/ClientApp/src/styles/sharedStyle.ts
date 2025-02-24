import { css } from "lit";

export const clientIconStyles = css`
  svg {
    padding: 12px;
    height: 64px;
    width: 64px;
    border-radius: 50%;
    background-color: var(--color-primary-900);
  }
`;

export const clickableIcon = css`
  svg {
    transition: background-color 0.3s ease;
    cursor: pointer;
  }
  svg:hover {
    background-color: var(--color-primary-600);
  }
`;
