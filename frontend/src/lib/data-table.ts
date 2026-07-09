export type SortDir = "asc" | "desc";

export type DataTableSearchParams = {
  page?: string;
  search?: string;
  sort_by?: string;
  sort_dir?: string;
};

export type DataTableParams = {
  page: number;
  search?: string;
  sortBy?: string;
  sortDir?: SortDir;
};

export function parseDataTableParams(raw: DataTableSearchParams): DataTableParams {
  const page = Math.max(1, Number(raw.page) || 1);
  const search = raw.search?.trim() || undefined;
  const sortBy = raw.sort_by || undefined;
  const sortDir: SortDir | undefined = raw.sort_dir === "asc" ? "asc" : raw.sort_dir === "desc" ? "desc" : undefined;
  return { page, search, sortBy, sortDir };
}

export function buildPageQuery(query: {
  page?: number;
  page_size?: number;
  search?: string;
  sort_by?: string;
  sort_dir?: string;
}): string {
  const params = new URLSearchParams();
  if (query.page && query.page > 1) params.set("page", String(query.page));
  if (query.page_size) params.set("page_size", String(query.page_size));
  if (query.search) params.set("search", query.search);
  if (query.sort_by) params.set("sort_by", query.sort_by);
  if (query.sort_dir) params.set("sort_dir", query.sort_dir);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}
