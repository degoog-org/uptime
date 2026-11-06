import { useCallback, useState, type JSX } from "react";
import { Button } from "../ui/button";
import { AddInstanceDialog } from "./add-instance-dialog";

interface AddInstanceProps {
  existingIds: ReadonlySet<string>;
}

export const AddInstance = ({ existingIds }: AddInstanceProps): JSX.Element => {
  const [open, setOpen] = useState(false);
  const close = useCallback((): void => setOpen(false), []);

  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        Add your instance
      </Button>
      {open && <AddInstanceDialog existingIds={existingIds} onClose={close} />}
    </>
  );
};
