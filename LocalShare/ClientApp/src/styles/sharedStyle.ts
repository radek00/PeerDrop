import { css } from "lit";

export const clientIconStyles = css`
  svg {
    height: 100%;
    width: 100%;
    /* border-radius: 50%; */
    /* background-color: var(--color-primary-700); */
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
