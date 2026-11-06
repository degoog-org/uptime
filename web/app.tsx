import { useMemo, type JSX } from "react";
import { EmptyResults } from "./components/filters/empty-results";
import { InstanceFilters } from "./components/filters/instance-filters";
import { InstanceList } from "./components/instance/instance-list";
import { Footer } from "./components/layout/footer";
import { Header } from "./components/layout/header";
import { ThirdPartyNotice } from "./components/notice/third-party-notice";
import { ErrorState } from "./components/status/error-state";
import { LoadingState } from "./components/status/loading-state";
import { useFilters } from "./hooks/use-filters";
import { useNow } from "./hooks/use-now";
import { useStatus } from "./hooks/use-status";
import { filterInstances } from "./lib/filter-instances";

export const App = (): JSX.Element => {
  const state = useStatus();
  const now = useNow();
  const filtersApi = useFilters();

  const instances = useMemo(
    () => (state.phase === "ready" ? state.data.instances : []),
    [state],
  );
  const existingIds = useMemo(
    () => new Set(instances.map((instance) => instance.id)),
    [instances],
  );
  const visible = useMemo(
    () => filterInstances(instances, filtersApi.filters),
    [instances, filtersApi.filters],
  );

  return (
    <div id="app">
      <Header existingIds={existingIds} />
      <main className="@container/settings-main mx-auto flex w-full max-w-3xl flex-1 flex-col gap-3 px-4 py-6">
        <ThirdPartyNotice />
        {state.phase === "loading" && <LoadingState />}
        {state.phase === "error" && <ErrorState message={state.message} />}
        {state.phase === "ready" && (
          <div>
            <InstanceFilters
              api={filtersApi}
              instances={instances}
              shown={visible.length}
            />
            {visible.length > 0 ? (
              <InstanceList instances={visible} now={now} />
            ) : (
              <EmptyResults
                query={filtersApi.filters.query.trim()}
                onReset={filtersApi.reset}
              />
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};
