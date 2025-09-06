import { css } from "lit";

export const clientIconStyles = css`
  svg {
    height: 100%;
    width: 100%;
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

export const buttons = css`
  .btn {
    padding: 0.6rem 1.2rem;
    border: none;
    border-radius: 5px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition:
      background-color 0.2s ease,
      transform 0.1s ease;
    min-width: 80px;

    &:active {
      transform: scale(0.95);
    }

    &.primary {
      background-color: var(--color-primary-700);
      color: white;

      &:hover {
        background-color: var(--color-primary-800);
      }
    }

    &.secondary {
      background-color: #e0e0e0;
      color: var(--text-dark);

      &:hover {
        background-color: #bdbdbd;
      }
    }

    &.danger {
      background-color: #d32323;
      color: white;

      &:hover {
        background-color: #c94a4a;
      }
    }

    @media (prefers-color-scheme: dark) {
      &.primary {
        background-color: var(--color-primary-700);
        color: white;

        &:hover {
          background-color: var(--color-primary-600);
        }
      }

      &.secondary {
        background-color: #424242;
        color: var(--text-light);

        &:hover {
          background-color: #616161;
        }
      }
    }
  }
`;

export const headerIcon = css`
  svg {
    color: var(--header-icon-color);
    width: 100%;
    height: 100%;
  }

  svg:hover {
    color: var(--color-primary-500);
  }
`;
export const accessibility = css`
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  *,
  *::before,
  *::after {
    @media (prefers-reduced-motion: reduce) {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition: none !important;
    }
  }
`;
