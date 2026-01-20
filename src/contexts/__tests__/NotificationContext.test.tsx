import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { NotificationProvider, useNotification } from "../NotificationContext";

const useSessionMock = vi.fn();
const toastSuccessMock = vi.fn();

vi.mock("next-auth/react", () => ({
	useSession: () => useSessionMock(),
}));

vi.mock("sonner", () => ({
	toast: {
		success: (...args: unknown[]) => toastSuccessMock(...args),
	},
}));

function Consumer() {
	const { notifications, unreadCount, markAsRead, markAllAsRead } =
		useNotification();
	return (
		<div>
			<div data-testid="unread">{unreadCount}</div>
			<div data-testid="count">{notifications.length}</div>
			<div data-testid="first-read">
				{notifications[0]?.read ? "true" : "false"}
			</div>
			<button onClick={() => markAsRead("n1")}>mark1</button>
			<button onClick={() => markAllAsRead()}>markAll</button>
		</div>
	);
}

describe("NotificationContext", () => {
	const updateMock = vi.fn();
	const fetchMock = vi.fn();

	beforeEach(() => {
		cleanup();
		toastSuccessMock.mockReset();
		updateMock.mockReset();
		fetchMock.mockReset();
		vi.stubGlobal("fetch", fetchMock);
	});

	afterEach(() => {
		cleanup();
		vi.unstubAllGlobals();
		vi.clearAllTimers();
		vi.useRealTimers();
	});

	it("faz fetch inicial quando autenticado e permite markAsRead", async () => {
		vi.useFakeTimers({ shouldAdvanceTime: true });

		useSessionMock.mockReturnValue({
			data: { user: { approved: false } },
			status: "authenticated",
			update: updateMock,
		});

		fetchMock.mockImplementation((input: RequestInfo) => {
			if (String(input) === "/api/notifications") {
				return Promise.resolve({
					ok: true,
					json: async () => ({
						notifications: [
							{
								id: "n1",
								title: "T1",
								message: "M1",
								read: false,
								link: null,
								createdAt: "2025-12-26T00:00:00Z",
							},
						],
						unreadCount: 1,
						userApproved: true,
					}),
				} as Response);
			}

			// patch markAsRead
			return Promise.resolve({ ok: true } as Response);
		});

		const user = userEvent.setup({
			advanceTimers: (ms) => vi.advanceTimersByTime(ms),
		});

		await act(async () => {
			render(
				<NotificationProvider>
					<Consumer />
				</NotificationProvider>,
			);
		});

		// Avança os timers para disparar o setTimeout inicial
		await act(async () => {
			await vi.advanceTimersByTimeAsync(100);
		});

		await waitFor(() => {
			expect(screen.getByTestId("count")).toHaveTextContent("1");
		});
		expect(screen.getByTestId("unread")).toHaveTextContent("1");

		// userApproved true e session.user.approved false -> update + toast
		expect(updateMock).toHaveBeenCalledTimes(1);
		expect(toastSuccessMock).toHaveBeenCalledTimes(1);

		await user.click(screen.getByText("mark1"));
		expect(fetchMock).toHaveBeenCalledWith("/api/notifications/n1/read", {
			method: "PATCH",
		});
	});

	it("markAllAsRead faz chamada API para marcar todas como lidas", async () => {
		vi.useFakeTimers({ shouldAdvanceTime: true });

		useSessionMock.mockReturnValue({
			data: { user: { approved: true } },
			status: "authenticated",
			update: updateMock,
		});

		// fetch inicial
		fetchMock.mockImplementation((input: RequestInfo) => {
			if (String(input) === "/api/notifications") {
				return Promise.resolve({
					ok: true,
					json: async () => ({
						notifications: [
							{
								id: "n1",
								title: "T1",
								message: "M1",
								read: false,
								link: null,
								createdAt: "2025-12-26T00:00:00Z",
							},
						],
						unreadCount: 1,
						userApproved: true,
					}),
				} as Response);
			}
			// patch markAsRead
			return Promise.resolve({ ok: true } as Response);
		});

		const user = userEvent.setup({
			advanceTimers: (ms) => vi.advanceTimersByTime(ms),
		});

		await act(async () => {
			render(
				<NotificationProvider>
					<Consumer />
				</NotificationProvider>,
			);
		});

		await act(async () => {
			await vi.advanceTimersByTimeAsync(100);
		});

		await waitFor(() => {
			expect(screen.getByTestId("unread")).toHaveTextContent("1");
		});

		await user.click(screen.getByText("markAll"));

		// Verifica que foi feita a chamada para marcar como lida
		await waitFor(() => {
			expect(fetchMock).toHaveBeenCalledWith("/api/notifications/n1/read", {
				method: "PATCH",
			});
		});
	});

	it("limpa notificações quando não autenticado", async () => {
		vi.useFakeTimers({ shouldAdvanceTime: true });

		useSessionMock.mockReturnValue({
			data: null,
			status: "unauthenticated",
			update: updateMock,
		});

		await act(async () => {
			render(
				<NotificationProvider>
					<Consumer />
				</NotificationProvider>,
			);
		});

		await act(async () => {
			await vi.advanceTimersByTimeAsync(100);
		});

		// Deve estar zerado
		expect(screen.getByTestId("unread")).toHaveTextContent("0");
		expect(screen.getByTestId("count")).toHaveTextContent("0");
	});

	it("lida com erro em markAsRead", async () => {
		vi.useFakeTimers({ shouldAdvanceTime: true });

		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		useSessionMock.mockReturnValue({
			data: { user: { approved: true } },
			status: "authenticated",
			update: updateMock,
		});

		// fetch inicial ok
		fetchMock.mockImplementationOnce(() =>
			Promise.resolve({
				ok: true,
				json: async () => ({
					notifications: [
						{
							id: "n1",
							title: "T1",
							message: "M1",
							read: false,
							link: null,
							createdAt: "2025-12-26T00:00:00Z",
						},
					],
					unreadCount: 1,
					userApproved: true,
				}),
			} as Response),
		);

		// markAsRead falha
		fetchMock.mockImplementationOnce(() => Promise.reject(new Error("network error")));

		const user = userEvent.setup({
			advanceTimers: (ms) => vi.advanceTimersByTime(ms),
		});

		await act(async () => {
			render(
				<NotificationProvider>
					<Consumer />
				</NotificationProvider>,
			);
		});

		await act(async () => {
			await vi.advanceTimersByTimeAsync(100);
		});

		await waitFor(() => {
			expect(screen.getByTestId("count")).toHaveTextContent("1");
		});

		await user.click(screen.getByText("mark1"));

		// Deve ter logado o erro
		await waitFor(() => {
			expect(errorSpy).toHaveBeenCalledWith(
				"Failed to mark notification as read",
				expect.any(Error),
			);
		});

		errorSpy.mockRestore();
	});

	it("reverte markAllAsRead em caso de erro", async () => {
		vi.useFakeTimers({ shouldAdvanceTime: true });

		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		useSessionMock.mockReturnValue({
			data: { user: { approved: true } },
			status: "authenticated",
			update: updateMock,
		});

		// fetch inicial
		fetchMock.mockImplementationOnce(() =>
			Promise.resolve({
				ok: true,
				json: async () => ({
					notifications: [
						{
							id: "n1",
							title: "T1",
							message: "M1",
							read: false,
							link: null,
							createdAt: "2025-12-26T00:00:00Z",
						},
					],
					unreadCount: 1,
					userApproved: true,
				}),
			} as Response),
		);

		// markAllAsRead falha
		fetchMock.mockImplementationOnce(() => Promise.reject(new Error("fail")));

		// refetch após erro
		fetchMock.mockImplementationOnce(() =>
			Promise.resolve({
				ok: true,
				json: async () => ({
					notifications: [
						{
							id: "n1",
							title: "T1",
							message: "M1",
							read: false,
							link: null,
							createdAt: "2025-12-26T00:00:00Z",
						},
					],
					unreadCount: 1,
					userApproved: true,
				}),
			} as Response),
		);

		const user = userEvent.setup({
			advanceTimers: (ms) => vi.advanceTimersByTime(ms),
		});

		await act(async () => {
			render(
				<NotificationProvider>
					<Consumer />
				</NotificationProvider>,
			);
		});

		await act(async () => {
			await vi.advanceTimersByTimeAsync(100);
		});

		await waitFor(() => {
			expect(screen.getByTestId("unread")).toHaveTextContent("1");
		});

		await user.click(screen.getByText("markAll"));

		// Deve ter logado o erro e feito refetch
		await waitFor(() => {
			expect(errorSpy).toHaveBeenCalledWith(
				"Failed to mark all as read",
				expect.any(Error),
			);
		});

		errorSpy.mockRestore();
	});

	it("não faz nada quando markAllAsRead é chamado sem notificações não lidas", async () => {
		vi.useFakeTimers({ shouldAdvanceTime: true });

		useSessionMock.mockReturnValue({
			data: { user: { approved: true } },
			status: "authenticated",
			update: updateMock,
		});

		// fetch inicial com todas lidas
		fetchMock.mockImplementation(() =>
			Promise.resolve({
				ok: true,
				json: async () => ({
					notifications: [
						{
							id: "n1",
							title: "T1",
							message: "M1",
							read: true,
							link: null,
							createdAt: "2025-12-26T00:00:00Z",
						},
					],
					unreadCount: 0,
					userApproved: true,
				}),
			} as Response),
		);

		const user = userEvent.setup({
			advanceTimers: (ms) => vi.advanceTimersByTime(ms),
		});

		await act(async () => {
			render(
				<NotificationProvider>
					<Consumer />
				</NotificationProvider>,
			);
		});

		await act(async () => {
			await vi.advanceTimersByTimeAsync(100);
		});

		await waitFor(() => {
			expect(screen.getByTestId("unread")).toHaveTextContent("0");
		});

		const callCountBefore = fetchMock.mock.calls.length;
		await user.click(screen.getByText("markAll"));

		// Não deve ter feito novas chamadas (além do fetch inicial)
		expect(fetchMock.mock.calls.length).toBe(callCountBefore);
	});

	it("lida com erro em fetchNotifications", async () => {
		vi.useFakeTimers({ shouldAdvanceTime: true });

		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		useSessionMock.mockReturnValue({
			data: { user: { approved: true } },
			status: "authenticated",
			update: updateMock,
		});

		// fetch falha
		fetchMock.mockRejectedValue(new Error("network error"));

		await act(async () => {
			render(
				<NotificationProvider>
					<Consumer />
				</NotificationProvider>,
			);
		});

		await act(async () => {
			await vi.advanceTimersByTimeAsync(100);
		});

		// Deve ter logado o erro
		await waitFor(() => {
			expect(errorSpy).toHaveBeenCalledWith(
				"Failed to fetch notifications",
				expect.any(Error),
			);
		});

		errorSpy.mockRestore();
	});

	it("useNotification lança erro fora do provider", () => {
		const spy = vi.spyOn(console, "error").mockImplementation(() => {});

		function Broken() {
			useNotification();
			return null;
		}

		expect(() => render(<Broken />)).toThrow(
			/useNotification must be used within a NotificationProvider/,
		);
		spy.mockRestore();
	});
});
