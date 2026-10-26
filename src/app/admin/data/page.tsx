import { StaffOnly } from "@/components/staff";
import DataView from "./data-view";

export default function DataPage() {
  return (
    <StaffOnly>
      <DataView />
    </StaffOnly>
  );
}
