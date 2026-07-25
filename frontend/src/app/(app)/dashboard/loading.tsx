import { ListPageSkeleton } from "@/components/list-page-skeleton";

export default function DashboardLoading() {
  return <ListPageSkeleton statTiles={4} rows={5} />;
}
