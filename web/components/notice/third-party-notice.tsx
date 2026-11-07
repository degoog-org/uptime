import type { JSX } from "react";
import { DEGOOG_URL } from "../../config";
import { Icon } from "../ui/icon";

export const ThirdPartyNotice = (): JSX.Element => (
  <section
    className="settings-section ext-card degoog-panel degoog-panel--ext-card settings-server-alert"
    role="note"
  >
    <div className="setting-section-heading-wrapper">
      <h2 className="settings-section-heading">
        None of these instances are official
      </h2>
      <div className="floating-section-icon">
        <Icon name="fa-solid fa-triangle-exclamation" />
      </div>
    </div>
    <p className="settings-desc">
      Third parties run every instance here, degoog.org included. We don't own,
      run or vet any of them, so we can't say what they log or how they're set
      up. Pick one you trust, or{" "}
      <a href={DEGOOG_URL} className="degoog-link">
        host your own
      </a>
      .
    </p>
  </section>
);
