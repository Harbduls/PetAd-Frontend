import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  afterEach,
  vi,
} from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { server } from "../../../mocks/server";
import { http, HttpResponse } from "msw";
import { useEscrowStatus } from "../useEscrowStatus";

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
}

function createWrapper(queryClient: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useEscrowStatus", () => {
  it("stops polling when status is SETTLED", async () => {
    const queryClient = createTestQueryClient();
    const escrowId = "escrow-settled-" + Math.random().toString(36).substring(2, 5);
    server.use(
      http.get(new RegExp(`/api/escrow/${escrowId}/status$`), () => {
        return HttpResponse.json({ id: escrowId, status: "SETTLED" });
      }),
    );
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    renderHook(() => useEscrowStatus(escrowId, { intervalMs: 50 }), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));

    const callCount = fetchSpy.mock.calls.length;
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
    });
    expect(fetchSpy).toHaveBeenCalledTimes(callCount);
  });

  it("continues polling when status is FUNDED", async () => {
    const queryClient = createTestQueryClient();
    const escrowId = "escrow-funded-" + Math.random().toString(36).substring(2, 5);
    server.use(
      http.get(new RegExp(`/api/escrow/${escrowId}/status$`), () => {
        return HttpResponse.json({ id: escrowId, status: "FUNDED" });
      }),
    );
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    renderHook(() => useEscrowStatus(escrowId, { intervalMs: 50 }), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(2), {
      timeout: 300,
    });
  });
});
