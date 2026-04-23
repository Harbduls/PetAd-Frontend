import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ApprovalStatusWidget } from "../ApprovalStatusWidget";

describe("ApprovalStatusWidget", () => {
  it("Verify the progress bar width correctly reflects the percentage (e.g., 2 of 4 is 50%)", () => {
    render(<ApprovalStatusWidget received={2} required={4} />);

    const progressBar = screen.getByTestId("progress-bar");
    expect(progressBar.style.width).toBe("50%");
  });

  it("Ensure the success message ONLY appears when quorum is met", () => {
    const { rerender } = render(<ApprovalStatusWidget received={1} required={3} />);

    // Quorum not met
    expect(screen.queryByText(/All approvals received/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Waiting for 2 more approvals/i)).toBeInTheDocument();

    // Quorum met
    rerender(<ApprovalStatusWidget received={3} required={3} />);
    expect(screen.getByText(/All approvals received/i)).toBeInTheDocument();
    expect(screen.queryByText(/Waiting for/i)).not.toBeInTheDocument();
  });

  it("Ensure the Stellar link renders correctly and contains the escrowAccountId when provided", () => {
    const testAccountId = "GBX2X...MOCK";
    render(<ApprovalStatusWidget received={3} required={3} escrowAccountId={testAccountId} />);

    const link = screen.getByTestId("stellar-tx-link");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", expect.stringContaining(testAccountId));
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("Verify the progress bar caps at 100% even if received > required", () => {
    render(<ApprovalStatusWidget received={5} required={4} />);

    const progressBar = screen.getByTestId("progress-bar");
    expect(progressBar.style.width).toBe("100%");
  });

  // Task 2.1 — Progress text "N of M approvals" (Req 6.1)
  it("renders progress text as 'N of M approvals'", () => {
    render(<ApprovalStatusWidget received={2} required={4} />);
    expect(screen.getByText("2 of 4 approvals")).toBeInTheDocument();
  });

  // Task 2.2 — Progress bar width 0% when received=0 (Req 6.6, 2.3)
  it("renders progress bar at 0% when received is 0", () => {
    render(<ApprovalStatusWidget received={0} required={4} />);
    const progressBar = screen.getByTestId("progress-bar");
    expect(progressBar.style.width).toBe("0%");
  });

  // Task 2.3 — Progress bar width 100% when received equals required (Req 6.7, 2.4)
  it("renders progress bar at 100% when received equals required", () => {
    render(<ApprovalStatusWidget received={4} required={4} />);
    const progressBar = screen.getByTestId("progress-bar");
    expect(progressBar.style.width).toBe("100%");
  });

  // Task 2.4 — Quorum-met success message appears when received >= required (Req 6.3, 3.1)
  it("shows quorum-met success message when received equals required", () => {
    render(<ApprovalStatusWidget received={3} required={3} />);
    expect(
      screen.getByText("All approvals received — escrow will be created")
    ).toBeInTheDocument();
  });

  // Task 2.5 — Quorum-met success message absent when received < required (Req 6.4, 3.2)
  it("does not show quorum-met success message when received is less than required", () => {
    render(<ApprovalStatusWidget received={1} required={3} />);
    expect(
      screen.queryByText("All approvals received — escrow will be created")
    ).not.toBeInTheDocument();
  });

  // Task 2.6 — Escrow link renders only when escrowAccountId is provided (Req 6.5, 4.2, 4.5)
  it("does not render stellar-tx-link when escrowAccountId is not provided", () => {
    render(<ApprovalStatusWidget received={2} required={4} />);
    expect(screen.queryByTestId("stellar-tx-link")).not.toBeInTheDocument();
  });

  it("renders stellar-tx-link when escrowAccountId is provided", () => {
    render(<ApprovalStatusWidget received={2} required={4} escrowAccountId="GTEST123" />);
    expect(screen.getByTestId("stellar-tx-link")).toBeInTheDocument();
  });

  // Task 4.2 — Escrow link href, target, and rel attributes (Req 4.3, 4.4)
  it("stellar-tx-link has correct href, target, and rel attributes", () => {
    const accountId = "GSTELLAR123TESTACCOUNT";
    render(<ApprovalStatusWidget received={2} required={4} escrowAccountId={accountId} />);
    const link = screen.getByTestId("stellar-tx-link");
    expect(link).toHaveAttribute("href", expect.stringContaining(accountId));
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
