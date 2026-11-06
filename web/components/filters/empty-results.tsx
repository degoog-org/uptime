import type { JSX } from "react";
import { Button } from "../ui/button";

interface EmptyResultsProps {
  query: string;
  onReset: () => void;
}

export const EmptyResults = ({
  query,
  onReset,
}: EmptyResultsProps): JSX.Element => (
  <div className="ext-no-match">
    <p>
      {query ? `Nothing matches "${query}".` : "Nothing matches these filters."}
    </p>
    <Button small onClick={onReset}>
      Clear filters
    </Button>
  </div>
);
