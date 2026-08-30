import { o as __toESM } from "../_runtime.mjs";
import { n as errorMessage } from "./errors-qjtEjvj0.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { a as REPORT_REASON_LABELS, i as REPORT_REASONS } from "./middleware-CR0SyJR2.mjs";
import { b as sendMessage, h as markRead, l as createReport, u as getConversation, x as setTyping } from "./api-CGkd5JiH.mjs";
import { i as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { c as useMessages, i as messagesKey, o as useInbox, r as mergeInbox, s as useMe, t as inboxKey } from "./use-chat-D5fwB2uA.mjs";
import { t as Button } from "./button-V6kLBZpT.mjs";
import { f as ChevronLeft, l as Flag, m as CheckCheck, o as Send, p as Check, t as X, u as Ellipsis } from "../_libs/lucide-react.mjs";
import { n as formatLastSeen, r as formatMessageTime, t as formatExactTime } from "./format-BWj4dxhY.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as DialogOverlay, i as DialogDescription$1, n as DialogClose, o as DialogPortal, r as DialogContent$1, s as DialogTitle$1, t as Dialog$1 } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { a as Separator2, i as Root2, n as Item2, o as Trigger, r as Portal2, t as Content2 } from "../_libs/@radix-ui/react-dropdown-menu+[...].mjs";
import { i as Route$3 } from "./router-D88Ada1J.mjs";
import { t as Textarea } from "./textarea-Dp2VYBgH.mjs";
import { i as useOnline, n as PresenceDot, r as UserAvatar } from "./offline-banner-DrohvRfu.mjs";
import { t as Label } from "./label-Bpw8mAUq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app._conversationId-CUiBJci6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Dialog = Dialog$1;
function DialogContent({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, { className: "fixed inset-0 z-50 bg-background/70 data-[state=open]:animate-in data-[state=closed]:animate-out" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
		className: cn("fixed top-1/2 left-1/2 z-50 w-[min(100%-1.5rem,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-lift)]", "focus:outline-none", className),
		...props,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
			className: "absolute top-3 right-3 rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sr-only",
				children: "Close"
			})]
		})]
	})] });
}
function DialogHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("mb-4 space-y-1 pr-8", className),
		...props
	});
}
function DialogTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
		className: cn("font-display text-xl font-medium tracking-tight", className),
		...props
	});
}
function DialogDescription({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
		className: cn("text-sm text-muted-foreground", className),
		...props
	});
}
function ReportDialog({ open, onOpenChange, targetType, targetUserId, conversationId, messages = [] }) {
	const [reason, setReason] = (0, import_react.useState)("harassment");
	const [details, setDetails] = (0, import_react.useState)("");
	const [selected, setSelected] = (0, import_react.useState)([]);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const title = targetType === "user" ? "Report user" : targetType === "conversation" ? "Report conversation" : "Report messages";
	async function submit() {
		if (targetType === "message" && selected.length === 0) {
			toast.error("Select at least one message as evidence.");
			return;
		}
		setBusy(true);
		try {
			await createReport({ data: {
				targetType,
				reason,
				details: details.trim() || void 0,
				targetUserId,
				conversationId,
				messageIds: selected.length ? selected : void 0
			} });
			toast.success("Report submitted. A moderator will review it.");
			onOpenChange(false);
			setDetails("");
			setSelected([]);
		} catch (err) {
			toast.error(errorMessage(err));
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: title }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Moderators only see the reason, your note, and any messages you attach. They cannot open the rest of the private conversation." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Reason" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-1 gap-1.5",
						children: REPORT_REASONS.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setReason(r),
							className: cn("rounded-lg border px-3 py-2 text-left text-sm", reason === r ? "border-primary bg-secondary text-foreground" : "border-border text-muted-foreground hover:bg-accent"),
							children: REPORT_REASON_LABELS[r]
						}, r))
					})]
				}),
				(targetType === "message" || targetType === "conversation" && messages.length > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: targetType === "message" ? "Evidence (required)" : "Optional evidence" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "max-h-40 space-y-1 overflow-y-auto rounded-lg border border-border p-2",
						children: messages.slice(-20).map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								className: "mt-1",
								checked: selected.includes(m.id),
								onChange: (e) => {
									setSelected((cur) => e.target.checked ? [...cur, m.id].slice(0, 5) : cur.filter((id) => id !== m.id));
								}
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "line-clamp-2 text-muted-foreground",
								children: m.deleted ? "Deleted message" : m.body
							})]
						}, m.id))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "report-details",
						children: "Additional details"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						id: "report-details",
						value: details,
						onChange: (e) => setDetails(e.target.value),
						maxLength: 2e3,
						placeholder: "Anything a moderator should know"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "w-full",
					onClick: () => void submit(),
					disabled: busy,
					children: busy ? "Submitting…" : "Submit report"
				})
			]
		})] })
	});
}
var DropdownMenu = Root2;
var DropdownMenuTrigger = Trigger;
function DropdownMenuContent({ className, sideOffset = 6, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
		sideOffset,
		className: cn("z-50 min-w-44 rounded-xl border border-border bg-popover p-1 shadow-[var(--shadow-lift)]", className),
		...props
	}) });
}
function DropdownMenuItem({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item2, {
		className: cn("flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none select-none", "focus:bg-accent data-[disabled]:pointer-events-none data-[disabled]:opacity-40", className),
		...props
	});
}
function DropdownMenuSeparator({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator2, {
		className: cn("my-1 h-px bg-border", className),
		...props
	});
}
function Thread({ conversationId, myId }) {
	const messages = useMessages(conversationId);
	const inbox = useInbox();
	const client = useQueryClient();
	const online = useOnline();
	const [other, setOther] = (0, import_react.useState)(inbox.data?.find((c) => c.id === conversationId)?.other ?? null);
	const [draft, setDraft] = (0, import_react.useState)("");
	const [report, setReport] = (0, import_react.useState)(null);
	const [loadError, setLoadError] = (0, import_react.useState)(null);
	const scroller = (0, import_react.useRef)(null);
	const typingTimer = (0, import_react.useRef)(void 0);
	const typingOn = (0, import_react.useRef)(false);
	const preview = inbox.data?.find((c) => c.id === conversationId);
	(0, import_react.useEffect)(() => {
		let alive = true;
		setLoadError(null);
		getConversation({ data: { conversationId } }).then((res) => {
			if (alive) setOther(res.other);
		}).catch((err) => {
			if (alive) setLoadError(errorMessage(err));
		});
		return () => {
			alive = false;
		};
	}, [conversationId]);
	(0, import_react.useEffect)(() => {
		const el = scroller.current;
		if (!el) return;
		el.scrollTop = el.scrollHeight;
	}, [messages.data?.length, preview?.typing]);
	(0, import_react.useEffect)(() => {
		if (!messages.data?.length) return;
		const last = messages.data[messages.data.length - 1];
		if (last && last.senderId !== myId) {
			markRead({ data: {
				conversationId,
				messageId: last.id
			} });
			client.setQueryData(inboxKey, (prev) => (prev ?? []).map((c) => c.id === conversationId ? {
				...c,
				unreadCount: 0
			} : c));
		}
	}, [
		client,
		conversationId,
		messages.data,
		myId
	]);
	(0, import_react.useEffect)(() => {
		return () => {
			if (typingOn.current) setTyping({ data: {
				conversationId,
				typing: false
			} });
			if (typingTimer.current) window.clearTimeout(typingTimer.current);
		};
	}, [conversationId]);
	function bumpTyping() {
		if (!typingOn.current) {
			typingOn.current = true;
			setTyping({ data: {
				conversationId,
				typing: true
			} });
		}
		if (typingTimer.current) window.clearTimeout(typingTimer.current);
		typingTimer.current = window.setTimeout(() => {
			typingOn.current = false;
			setTyping({ data: {
				conversationId,
				typing: false
			} });
		}, 2500);
	}
	async function onSend() {
		const body = draft.trim();
		if (!body || !online) return;
		const clientId = crypto.randomUUID();
		const optimistic = {
			id: clientId,
			conversationId,
			senderId: myId,
			body,
			createdAt: (/* @__PURE__ */ new Date()).toISOString(),
			deleted: false,
			deliveredAt: null,
			readAt: null
		};
		client.setQueryData(messagesKey(conversationId), (prev) => [...prev ?? [], optimistic]);
		setDraft("");
		if (typingOn.current) {
			typingOn.current = false;
			setTyping({ data: {
				conversationId,
				typing: false
			} });
		}
		try {
			const saved = await sendMessage({ data: {
				conversationId,
				body,
				clientId
			} });
			client.setQueryData(messagesKey(conversationId), (prev) => (prev ?? []).map((m) => m.id === clientId ? saved : m));
			client.setQueryData(inboxKey, (prev) => mergeInbox(prev ?? [], [{
				id: conversationId,
				other: other ?? preview?.other ?? {
					userId: "",
					displayName: "",
					handle: "",
					avatarHue: 200,
					online: false,
					lastSeenAt: null
				},
				lastMessage: {
					id: saved.id,
					body: saved.body,
					senderId: saved.senderId,
					createdAt: saved.createdAt
				},
				lastMessageAt: saved.createdAt,
				unreadCount: 0,
				typing: false
			}]));
		} catch (err) {
			client.setQueryData(messagesKey(conversationId), (prev) => (prev ?? []).filter((m) => m.id !== clientId));
			setDraft(body);
			toast.error(errorMessage(err));
		}
	}
	const grouped = (0, import_react.useMemo)(() => messages.data ?? [], [messages.data]);
	if (loadError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid h-full place-items-center px-6 text-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-lg",
					children: "Conversation unavailable"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: loadError
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "secondary",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/app",
						children: "Back to inbox"
					})
				})
			]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-0 flex-col bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center gap-1 border-b border-border px-1 py-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "ghost",
						size: "icon",
						className: "md:hidden",
						"aria-label": "Back",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/app",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, {})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-w-0 flex-1 items-center gap-3 px-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "relative",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserAvatar, {
								name: other?.displayName ?? "…",
								hue: other?.avatarHue ?? 200,
								size: "sm"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PresenceDot, {
								online: Boolean(other?.online),
								className: "ring-background"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate font-medium",
								children: other?.displayName ?? "Loading"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-xs text-muted-foreground",
								children: other ? formatLastSeen(other.lastSeenAt, other.online) : " "
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							"aria-label": "Conversation menu",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, {})
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
						align: "end",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
								onSelect: () => setReport("user"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flag, { className: "size-4" }), " Report user"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
								onSelect: () => setReport("conversation"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flag, { className: "size-4" }), " Report conversation"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
								onSelect: () => setReport("message"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flag, { className: "size-4" }), " Report messages"]
							})
						]
					})] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				ref: scroller,
				className: "flex-1 space-y-2 overflow-y-auto px-3 py-4",
				children: [
					messages.isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "py-10 text-center text-sm text-muted-foreground",
						children: "Loading messages…"
					}),
					messages.isError && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "py-10 text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "Could not load messages."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							className: "mt-3",
							onClick: () => void messages.refetch(),
							children: "Try again"
						})]
					}),
					!messages.isLoading && grouped.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "py-16 text-center text-sm text-muted-foreground",
						children: [
							"This is the start of your conversation with ",
							other?.displayName ?? "them",
							"."
						]
					}),
					grouped.map((m) => {
						const mine = m.senderId === myId;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: cn("flex", mine ? "justify-end" : "justify-start"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: cn("max-w-[min(100%,20rem)] rounded-2xl px-3.5 py-2 text-sm leading-relaxed", mine ? "rounded-br-md bg-bubble-mine text-foreground" : "rounded-bl-md bg-bubble-theirs text-foreground"),
								title: formatExactTime(m.createdAt),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "whitespace-pre-wrap break-words",
									children: m.deleted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "italic text-muted-foreground",
										children: "Message deleted"
									}) : m.body
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: cn("mt-1 flex items-center justify-end gap-1 text-[10px] text-muted-foreground tabular-nums"),
									children: [formatMessageTime(m.createdAt), mine && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReceiptIcon, {
										deliveredAt: m.deliveredAt,
										readAt: m.readAt
									})]
								})]
							})
						}, m.id);
					}),
					preview?.typing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "px-1 text-xs text-muted-foreground",
						children: [other?.displayName, " is typing…"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("form", {
				className: "border-t border-border p-3",
				onSubmit: (e) => {
					e.preventDefault();
					onSend();
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-end gap-2 rounded-2xl bg-secondary p-1.5 pl-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						value: draft,
						onChange: (e) => {
							setDraft(e.target.value);
							if (e.target.value.trim()) bumpTyping();
						},
						onKeyDown: (e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								onSend();
							}
						},
						rows: 1,
						maxLength: 4e3,
						placeholder: online ? "Message" : "Waiting for connection…",
						disabled: !online,
						className: "max-h-32 min-h-11 flex-1 resize-none bg-transparent py-2.5 text-sm outline-none placeholder:text-muted-foreground"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						size: "icon",
						className: "rounded-xl",
						disabled: !draft.trim() || !online,
						"aria-label": "Send",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, {})
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportDialog, {
				open: report !== null,
				onOpenChange: (open) => {
					if (!open) setReport(null);
				},
				targetType: report === "user" ? "user" : report === "conversation" ? "conversation" : "message",
				targetUserId: other?.userId,
				conversationId,
				messages: grouped
			})
		]
	});
}
function ReceiptIcon({ deliveredAt, readAt }) {
	if (readAt) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckCheck, {
		className: "size-3.5 text-online",
		"aria-label": "Read"
	});
	if (deliveredAt) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckCheck, {
		className: "size-3.5",
		"aria-label": "Delivered"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
		className: "size-3.5",
		"aria-label": "Sent"
	});
}
function ConversationPage() {
	const { conversationId } = Route$3.useParams();
	const me = useMe();
	if (!me.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid h-full place-items-center text-sm text-muted-foreground",
		children: "Loading…"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Thread, {
		conversationId,
		myId: me.data.userId
	});
}
//#endregion
export { ConversationPage as component };
