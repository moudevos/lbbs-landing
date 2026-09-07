import "server-only";

import { cache } from "react";

export type {
  PublicServiceBranch,
  PublicServiceMenuItem,
} from "./service-menu.shared";

import type {
  PublicServiceBranch,
  PublicServiceMenuItem,
} from "./service-menu.shared";

type ServiceMenuApiPayload = {
  data?: {
    branches?: unknown;
    branch?: unknown;
    services?: unknown;
  };
};

export type PublicServiceBranchesResult =
  | { status: "available"; branches: PublicServiceBranch[] }
  | { status: "error" };

export type PublicServiceMenuResult =
  | {
      status: "available";
      branch: PublicServiceBranch;
      services: PublicServiceMenuItem[];
    }
  | { status: "not_found" }
  | { status: "inactive" }
  | { status: "error" };

function getDashboardPublicApiUrl() {
  const value = process.env.DASHBOARD_PUBLIC_API_URL?.trim();
  if (!value) return null;

  try {
    const url = new URL(value);
    if (url.pathname !== "/" && url.pathname !== "") {
      console.error("[public/services-menu] DASHBOARD_PUBLIC_API_URL must contain only the dashboard origin");
      return null;
    }
    return url.origin;
  } catch {
    console.error("[public/services-menu] DASHBOARD_PUBLIC_API_URL is not a valid origin");
    return null;
  }
}

async function getServiceMenuResponse(path: string) {
  const baseUrl = getDashboardPublicApiUrl();
  if (!baseUrl) {
    console.error("[public/services-menu] DASHBOARD_PUBLIC_API_URL is not configured");
    return null;
  }

  try {
    return await fetch(`${baseUrl}${path}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 }
    });
  } catch {
    console.error("[public/services-menu] Could not reach dashboard public API");
    return null;
  }
}

function toPublicBranch(value: unknown): PublicServiceBranch | null {
  if (!value || typeof value !== "object") return null;
  const branch = value as Partial<PublicServiceBranch>;
  if (typeof branch.slug !== "string" || typeof branch.name !== "string") return null;
  const slug = branch.slug.trim();
  const name = branch.name.trim();
  return slug && name ? { slug, name } : null;
}

function toPublicService(value: unknown): PublicServiceMenuItem | null {
  if (!value || typeof value !== "object") return null;
  const service = value as Partial<PublicServiceMenuItem> & { is_variable_price?: unknown };
  const isVariablePrice = service.is_variable_price === true;
  const price = service.price === null ? null : Number(service.price);
  if (typeof service.name !== "string" || !service.name.trim() || (!isVariablePrice && (!Number.isFinite(price) || price === null || price < 0))) return null;
  if (isVariablePrice && price !== null) return null;
  return { name: service.name.trim(), price, isVariablePrice, category: toPublicBranch(service.category) };
}

export const getPublicServiceBranches = cache(async (): Promise<PublicServiceBranchesResult> => {
  const response = await getServiceMenuResponse("/api/public/service-menu");
  if (!response?.ok) return { status: "error" };

  const payload = await response.json().catch(() => null) as ServiceMenuApiPayload | null;
  const branches = Array.isArray(payload?.data?.branches)
    ? payload.data.branches.map(toPublicBranch).filter((branch): branch is PublicServiceBranch => Boolean(branch))
    : null;

  return branches ? { status: "available", branches } : { status: "error" };
});

export const getPublicServiceMenuBySlug = cache(async (slug: string): Promise<PublicServiceMenuResult> => {
  const safeSlug = slug.trim().toLocaleLowerCase("es");
  if (!safeSlug) return { status: "not_found" };

  const response = await getServiceMenuResponse(`/api/public/service-menu?branchSlug=${encodeURIComponent(safeSlug)}`);
  if (response?.status === 404) return { status: "not_found" };
  if (response?.status === 410) return { status: "inactive" };
  if (!response?.ok) return { status: "error" };

  const payload = await response.json().catch(() => null) as ServiceMenuApiPayload | null;
  const branch = toPublicBranch(payload?.data?.branch);
  const services = Array.isArray(payload?.data?.services)
    ? payload.data.services.map(toPublicService).filter((service): service is PublicServiceMenuItem => Boolean(service))
    : null;

  return branch && services ? { status: "available", branch, services } : { status: "error" };
});
