import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DeleteRecordButton({
  id,
  action,
  label = "Delete",
}: {
  id: string;
  action: (formData: FormData) => Promise<void>;
  label?: string;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <Button type="submit" size="sm" variant="danger">
        <Trash2 className="size-4" />
        {label}
      </Button>
    </form>
  );
}
