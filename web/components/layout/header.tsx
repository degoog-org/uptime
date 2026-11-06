import type { JSX } from "react";
import { AddInstance } from "../submit/add-instance";
import { ResultsLogo } from "./results-logo";

interface HeaderProps {
  existingIds: ReadonlySet<string>;
}

export const Header = ({ existingIds }: HeaderProps): JSX.Element => (
  <header className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-4 pt-4">
    <div className="flex items-center">
      <ResultsLogo />
      <span className="degoog-text degoog-text--md degoog-text--secondary">
        status
      </span>
    </div>
    <AddInstance existingIds={existingIds} />
  </header>
);
