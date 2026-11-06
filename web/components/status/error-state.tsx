import type { JSX } from "react";

interface ErrorStateProps {
  message: string;
}

export const ErrorState = ({ message }: ErrorStateProps): JSX.Element => (
  <section className="degoog-panel degoog-panel--ext-card">
    <h1 className="settings-section-heading">Couldn't load the status data</h1>
    <p className="settings-desc">
      Loading status.json failed because {message}. The page tries again every 5
      minutes.
    </p>
  </section>
);
