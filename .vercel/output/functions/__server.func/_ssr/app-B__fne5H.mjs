import { o as __toESM } from "../_runtime.mjs";
import { n as errorMessage } from "./errors-qjtEjvj0.mjs";
import { l as isStaff } from "./authz-BLpDbWRQ.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { h as Outlet, m as useMatches, x as useNavigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { a as REPORT_REASON_LABELS } from "./middleware-CR0SyJR2.mjs";
import { S as startConversation, m as listMyReports, w as updateMyProfile, y as searchUsers } from "./api-CGkd5JiH.mjs";
import { i as useQueryClient, n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as useChatSync, n as meKey, o as useInbox, s as useMe, t as inboxKey } from "./use-chat-D5fwB2uA.mjs";
import { i as signOut } from "./client-B40BzJxt.mjs";
import { n as NexaWordmark, r as useCurrentUserState } from "./mark-BTRJyPI5.mjs";
import { t as Button } from "./button-V6kLBZpT.mjs";
import { n as RestrictedScreen, t as RedirectToSignIn } from "./restricted-DCMzjklC.mjs";
import { a as Settings, s as Search, t as X } from "../_libs/lucide-react.mjs";
import { r as formatMessageTime } from "./format-BWj4dxhY.mjs";
import { t as Badge } from "./badge-Bd1frMLp.mjs";
import { t as Input } from "./input-CSblYDui.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as DialogOverlay, n as DialogClose, o as DialogPortal, r as DialogContent, s as DialogTitle, t as Dialog } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { n as PresenceDot, r as UserAvatar, t as OfflineBanner } from "./offline-banner-DrohvRfu.mjs";
import { t as Label } from "./label-Bpw8mAUq.mjs";
import { i as Viewport, n as Scrollbar, r as Thumb, t as Root } from "../_libs/radix-ui__react-scroll-area.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app-B__fne5H.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ScrollArea({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Root, {
		className: cn("relative overflow-hidden", className),
		...props,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Viewport, {
			className: "h-full w-full rounded-[inherit]",
			children
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scrollbar, {
			orientation: "vertical",
			className: "flex w-2 touch-none select-none p-0.5",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Thumb, { className: "relative flex-1 rounded-full bg-border" })
		})]
	});
}
function Skeleton({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("animate-pulse rounded-md bg-secondary", className),
		...props
	});
}
function Inbox({ activeId, onOpenSettings }) {
	const inbox = useInbox();
	const [q, setQ] = (0, import_react.useState)("");
	const [hits, setHits] = (0, import_react.useState)(null);
	const [searching, setSearching] = (0, import_react.useState)(false);
	const navigate = useNavigate();
	const client = useQueryClient();
	async function onSearch(value) {
		setQ(value);
		if (value.trim().length < 2) {
			setHits(null);
			return;
		}
		setSearching(true);
		try {
			const rows = await searchUsers({ data: { query: value } });
			setHits(rows);
		} catch (err) {
			toast.error(errorMessage(err));
		} finally {
			setSearching(false);
		}
	}
	async function openUser(user) {
		try {
			const conv = await startConversation({ data: { otherUserId: user.userId } });
			client.setQueryData(inboxKey, (prev) => {
				if ((prev ?? []).some((c) => c.id === conv.id)) return prev;
				return [{
					id: conv.id,
					other: conv.other,
					lastMessage: null,
					lastMessageAt: (/* @__PURE__ */ new Date()).toISOString(),
					unreadCount: 0,
					typing: false
				}, ...prev ?? []];
			});
			setQ("");
			setHits(null);
			await navigate({
				to: "/app/$conversationId",
				params: { conversationId: conv.id }
			});
		} catch (err) {
			toast.error(errorMessage(err));
		}
	}
	const empty = !inbox.isLoading && (inbox.data?.length ?? 0) === 0 && !q;
	const items = (0, import_react.useMemo)(() => inbox.data ?? [], [inbox.data]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full flex-col bg-sidebar",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center justify-between gap-3 px-4 pt-4 pb-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NexaWordmark, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon",
					onClick: onOpenSettings,
					"aria-label": "Settings",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, {})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-4 pb-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: q,
						onChange: (e) => void onSearch(e.target.value),
						placeholder: "Search people",
						className: "pl-9",
						autoCapitalize: "none",
						autoCorrect: "off"
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
				className: "flex-1",
				children: hits ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-2 pb-4",
					children: [
						searching && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "px-3 py-2 text-sm text-muted-foreground",
							children: "Searching…"
						}),
						!searching && hits.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "px-3 py-6 text-sm text-muted-foreground",
							children: "No people match that search."
						}),
						hits.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => void openUser(u),
							className: "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-accent",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "relative",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserAvatar, {
									name: u.displayName,
									hue: u.avatarHue
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PresenceDot, { online: u.online })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block truncate font-medium",
									children: u.displayName
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "block truncate text-sm text-muted-foreground",
									children: ["@", u.handle]
								})]
							})]
						}, u.userId))
					]
				}) : inbox.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-2 px-4",
					children: Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3 py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "size-10 rounded-full" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1 space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-1/2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-3/4" })]
						})]
					}, i))
				}) : inbox.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-6 py-10 text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Could not load conversations."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						className: "mt-3",
						onClick: () => void inbox.refetch(),
						children: "Try again"
					})]
				}) : empty ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-6 py-16 text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-lg",
						children: "No conversations yet"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: "Search for someone by name or handle to start a private chat."
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "px-2 pb-6",
					children: items.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/app/$conversationId",
						params: { conversationId: c.id },
						className: cn("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-accent", activeId === c.id && "bg-accent"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "relative",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserAvatar, {
								name: c.other.displayName,
								hue: c.other.avatarHue
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PresenceDot, { online: c.other.online })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-baseline justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "truncate font-medium",
									children: c.other.displayName
								}), c.lastMessage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "shrink-0 text-[11px] text-muted-foreground tabular-nums",
									children: formatMessageTime(c.lastMessage.createdAt)
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "truncate text-sm text-muted-foreground",
									children: c.typing ? "Typing…" : c.lastMessage?.body || "No messages yet"
								}), c.unreadCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "grid min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[10px] font-medium text-primary-foreground tabular-nums",
									children: c.unreadCount > 9 ? "9+" : c.unreadCount
								})]
							})]
						})]
					}, c.id))
				})
			})
		]
	});
}
var Sheet = Dialog;
function SheetContent({ className, children, side = "right", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, { className: "fixed inset-0 z-50 bg-background/70" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
		className: cn("fixed z-50 flex flex-col bg-card shadow-[var(--shadow-lift)]", side === "right" && "inset-y-0 right-0 h-full w-[min(100%,24rem)] border-l border-border", side === "left" && "inset-y-0 left-0 h-full w-[min(100%,24rem)] border-r border-border", side === "bottom" && "inset-x-0 bottom-0 max-h-[88dvh] rounded-t-2xl border-t border-border", className),
		...props,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
			className: "absolute top-3 right-3 rounded-md p-2 text-muted-foreground hover:bg-accent",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sr-only",
				children: "Close"
			})]
		})]
	})] });
}
function SheetHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("border-b border-border px-5 py-4 pr-12", className),
		...props
	});
}
function SheetTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
		className: cn("font-display text-lg font-medium tracking-tight", className),
		...props
	});
}
function SettingsSheet({ open, onOpenChange }) {
	const me = useMe();
	const client = useQueryClient();
	const profile = me.data;
	const [name, setName] = (0, import_react.useState)("");
	const [handle, setHandle] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const reports = useQuery({
		queryKey: ["my-reports"],
		queryFn: () => listMyReports(),
		enabled: open
	});
	(0, import_react.useEffect)(() => {
		if (profile) {
			setName(profile.displayName);
			setHandle(profile.handle);
		}
	}, [profile]);
	async function save() {
		setBusy(true);
		try {
			const next = await updateMyProfile({ data: {
				displayName: name,
				handle
			} });
			client.setQueryData(meKey, next);
			toast.success("Profile updated");
		} catch (err) {
			toast.error(errorMessage(err));
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
			side: "bottom",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, { children: "Account" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex-1 space-y-6 overflow-y-auto px-5 py-5",
				children: profile && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "display-name",
									children: "Display name"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "display-name",
									value: name,
									onChange: (e) => setName(e.target.value)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "handle",
									children: "Handle"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "handle",
									value: handle,
									onChange: (e) => setHandle(e.target.value),
									autoCapitalize: "none"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								onClick: () => void save(),
								disabled: busy,
								children: busy ? "Saving…" : "Save"
							})
						]
					}),
					profile.status === "warned" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "rounded-xl bg-warn/10 px-3 py-2 text-sm text-warn",
						children: profile.statusReason || "A moderator has warned this account."
					}),
					isStaff(profile.role) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "secondary",
						className: "w-full",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/admin",
							children: "Open admin panel"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-2 text-sm font-medium",
						children: "Your reports"
					}), reports.data?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-2",
						children: reports.data.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center justify-between rounded-xl border border-border px-3 py-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [REPORT_REASON_LABELS[r.reason], r.targetHandle ? ` · @${r.targetHandle}` : ""] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: r.status })]
						}, r.id))
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "You have not submitted any reports."
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						className: "w-full",
						onClick: () => void signOut("/login"),
						children: "Sign out"
					})
				] })
			})]
		})
	});
}
function AppShell() {
	const { user, isPending } = useCurrentUserState();
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-dvh place-items-center bg-background",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-10 w-40 animate-pulse rounded-full bg-secondary" })
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppAuthed, {});
}
function AppAuthed() {
	const me = useMe();
	const conversationId = (useMatches().find((m) => m.routeId.includes("$conversationId"))?.params)?.conversationId ?? null;
	useChatSync(conversationId);
	const [settings, setSettings] = (0, import_react.useState)(false);
	if (me.isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-dvh place-items-center bg-background",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-10 w-40 animate-pulse rounded-full bg-secondary" })
	});
	if (me.isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-dvh place-items-center px-6 text-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-xl",
				children: "Could not load your account"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "text-sm underline",
				onClick: () => void me.refetch(),
				children: "Try again"
			})]
		})
	});
	if (me.data && (me.data.status === "suspended" || me.data.status === "banned")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RestrictedScreen, {
		status: me.data.status,
		reason: me.data.statusReason
	});
	const threadOpen = Boolean(conversationId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-dvh flex-col bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OfflineBanner, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-h-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
					className: cn("w-full border-r border-border md:w-80 md:shrink-0 lg:w-96", threadOpen && "hidden md:flex md:flex-col", !threadOpen && "flex flex-col"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inbox, {
						activeId: conversationId ?? void 0,
						onOpenSettings: () => setSettings(true)
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					className: cn("min-w-0 flex-1", threadOpen ? "flex flex-col" : "hidden md:flex md:flex-col"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsSheet, {
				open: settings,
				onOpenChange: setSettings
			})
		]
	});
}
//#endregion
export { AppShell as component };
