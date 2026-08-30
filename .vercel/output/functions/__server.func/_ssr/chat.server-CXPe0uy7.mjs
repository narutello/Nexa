import { t as NexaError } from "./errors-qjtEjvj0.mjs";
import { a as assertConversationAccess, o as assertNotSelfTarget, r as assertCanUseChat, u as toActor } from "./authz-BLpDbWRQ.mjs";
import { c as TYPING_TTL_MS, n as MESSAGE_MAX_LENGTH } from "./middleware-CR0SyJR2.mjs";
import { r as getSql } from "./db-BfNPo7P6.mjs";
import { a as isUuid, ensureProfile, i as consumeRateLimit, n as toIsoOrNull, presenceForPeers, r as LIMITS, s as sanitizeBody, t as toIso, toPublic, touchPresence } from "./profile.server-tfTO6SXK.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/chat.server-CXPe0uy7.js
function pairKey(a, b) {
	return a < b ? `${a}:${b}` : `${b}:${a}`;
}
async function requireMember(sql, conversationId, userId) {
	const rows = await sql.query("select user_id from conversation_members where conversation_id = $1 and user_id = $2", [conversationId, userId]);
	assertConversationAccess({ isMember: Boolean(rows[0]) });
}
async function otherMemberId(sql, conversationId, userId) {
	const rows = await sql.query("select user_id from conversation_members where conversation_id = $1 and user_id <> $2", [conversationId, userId]);
	if (!rows[0]) throw new NexaError("Conversation not found.", 404, "NOT_FOUND");
	return rows[0].user_id;
}
async function loadInbox(sql, userId, after, limit = 30) {
	const params = [userId];
	let afterClause = "";
	if (after) {
		params.push(after);
		afterClause = `and c.last_message_at > $${params.length}::timestamptz`;
	}
	params.push(limit);
	const rows = await sql.query(`select c.id, c.last_message_at,
            p.user_id as other_id, p.display_name, p.handle, p.avatar_hue, p.last_seen_at, p.status,
            cm.last_read_at
     from conversation_members cm
     join conversations c on c.id = cm.conversation_id
     join conversation_members om on om.conversation_id = c.id and om.user_id <> $1
     join profiles p on p.user_id = om.user_id
     where cm.user_id = $1 ${afterClause}
     order by c.last_message_at desc
     limit $${params.length}`, params);
	if (rows.length === 0) return [];
	const ids = rows.map((r) => r.id);
	const idPlaceholders = ids.map((_, i) => `$${i + 1}`).join(", ");
	const lastMsgs = await sql.query(`select distinct on (conversation_id)
        conversation_id, id, body, sender_id, created_at, deleted_at
     from messages
     where conversation_id in (${idPlaceholders})
     order by conversation_id, created_at desc`, ids);
	const lastByConvo = new Map(lastMsgs.map((m) => [m.conversation_id, m]));
	const unread = await sql.query(`select msg.conversation_id, count(*)::int as unread
     from messages msg
     join conversation_members cm
       on cm.conversation_id = msg.conversation_id and cm.user_id = $${ids.length + 1}
     where msg.conversation_id in (${idPlaceholders})
       and msg.sender_id <> $${ids.length + 1}
       and msg.deleted_at is null
       and (cm.last_read_at is null or msg.created_at > cm.last_read_at)
     group by msg.conversation_id`, [...ids, userId]);
	const unreadBy = new Map(unread.map((u) => [u.conversation_id, u.unread]));
	const typing = await sql.query(`select conversation_id from typing_indicators
     where conversation_id in (${idPlaceholders})
       and user_id <> $${ids.length + 1}
       and expires_at > now()`, [...ids, userId]);
	const typingSet = new Set(typing.map((t) => t.conversation_id));
	const now = Date.now();
	return rows.map((r) => {
		const last = lastByConvo.get(r.id);
		const other = toPublic({
			user_id: r.other_id,
			display_name: r.display_name,
			handle: r.handle,
			avatar_hue: r.avatar_hue,
			role: "USER",
			status: r.status ?? "active",
			status_reason: null,
			last_seen_at: r.last_seen_at
		}, now);
		return {
			id: r.id,
			other,
			lastMessage: last ? {
				id: last.id,
				body: last.deleted_at ? "Message deleted" : last.body,
				senderId: last.sender_id,
				createdAt: toIso(last.created_at)
			} : null,
			lastMessageAt: toIso(r.last_message_at),
			unreadCount: unreadBy.get(r.id) ?? 0,
			typing: typingSet.has(r.id)
		};
	});
}
function mapMessage(row) {
	const deleted = Boolean(row.deleted_at);
	return {
		id: row.id,
		conversationId: row.conversation_id,
		senderId: row.sender_id,
		body: deleted ? "" : row.body,
		createdAt: toIso(row.created_at),
		deleted,
		deliveredAt: toIsoOrNull(row.delivered_at),
		readAt: toIsoOrNull(row.read_at)
	};
}
async function listConversationsImpl(userId, cursor) {
	const sql = await getSql();
	const me = await ensureProfile(sql, userId);
	assertCanUseChat(toActor(me));
	await touchPresence(sql, userId);
	const items = await loadInbox(sql, userId, null, 30);
	if (cursor) {
		const mapped = await loadInboxFromRows(sql, userId, await sql.query(`select c.id, c.last_message_at,
              p.user_id as other_id, p.display_name, p.handle, p.avatar_hue, p.last_seen_at, p.status,
              cm.last_read_at
       from conversation_members cm
       join conversations c on c.id = cm.conversation_id
       join conversation_members om on om.conversation_id = c.id and om.user_id <> $1
       join profiles p on p.user_id = om.user_id
       where cm.user_id = $1 and c.last_message_at < $2::timestamptz
       order by c.last_message_at desc
       limit $3`, [
			userId,
			cursor,
			30
		]));
		return {
			items: mapped,
			nextCursor: mapped.length === 30 ? mapped[mapped.length - 1]?.lastMessageAt ?? null : null
		};
	}
	return {
		items,
		nextCursor: items.length === 30 ? items[items.length - 1]?.lastMessageAt ?? null : null
	};
}
async function loadInboxFromRows(sql, userId, rows) {
	if (rows.length === 0) return [];
	const ids = rows.map((r) => r.id);
	const idPlaceholders = ids.map((_, i) => `$${i + 1}`).join(", ");
	const lastMsgs = await sql.query(`select distinct on (conversation_id)
        conversation_id, id, body, sender_id, created_at, deleted_at
     from messages
     where conversation_id in (${idPlaceholders})
     order by conversation_id, created_at desc`, ids);
	const lastByConvo = new Map(lastMsgs.map((m) => [m.conversation_id, m]));
	const unread = await sql.query(`select msg.conversation_id, count(*)::int as unread
     from messages msg
     join conversation_members cm
       on cm.conversation_id = msg.conversation_id and cm.user_id = $${ids.length + 1}
     where msg.conversation_id in (${idPlaceholders})
       and msg.sender_id <> $${ids.length + 1}
       and msg.deleted_at is null
       and (cm.last_read_at is null or msg.created_at > cm.last_read_at)
     group by msg.conversation_id`, [...ids, userId]);
	const unreadBy = new Map(unread.map((u) => [u.conversation_id, u.unread]));
	const now = Date.now();
	return rows.map((r) => {
		const last = lastByConvo.get(r.id);
		return {
			id: r.id,
			other: toPublic({
				user_id: r.other_id,
				display_name: r.display_name,
				handle: r.handle,
				avatar_hue: r.avatar_hue,
				role: "USER",
				status: "active",
				status_reason: null,
				last_seen_at: r.last_seen_at
			}, now),
			lastMessage: last ? {
				id: last.id,
				body: last.deleted_at ? "Message deleted" : last.body,
				senderId: last.sender_id,
				createdAt: toIso(last.created_at)
			} : null,
			lastMessageAt: toIso(r.last_message_at),
			unreadCount: unreadBy.get(r.id) ?? 0,
			typing: false
		};
	});
}
async function startConversationImpl(userId, otherUserId) {
	const sql = await getSql();
	await consumeRateLimit(sql, `start:${userId}`, LIMITS.start.limit, LIMITS.start.windowMs);
	const me = await ensureProfile(sql, userId);
	assertCanUseChat(toActor(me));
	assertNotSelfTarget(userId, otherUserId, "message");
	const other = await sql.query(`select user_id, display_name, handle, avatar_hue, role, status, status_reason, last_seen_at
     from profiles where user_id = $1`, [otherUserId]);
	if (!other[0] || other[0].status === "banned") throw new NexaError("User not found.", 404, "NOT_FOUND");
	const key = pairKey(userId, otherUserId);
	let id = (await sql.query("select id from conversations where pair_key = $1", [key]))[0]?.id;
	if (!id) {
		id = crypto.randomUUID();
		await sql.query("insert into conversations (id, pair_key) values ($1, $2) on conflict (pair_key) do nothing", [id, key]);
		id = (await sql.query("select id from conversations where pair_key = $1", [key]))[0]?.id ?? id;
		await sql.query(`insert into conversation_members (conversation_id, user_id)
       values ($1, $2) on conflict do nothing`, [id, userId]);
		await sql.query(`insert into conversation_members (conversation_id, user_id)
       values ($1, $2) on conflict do nothing`, [id, otherUserId]);
	}
	return {
		id,
		other: toPublic(other[0])
	};
}
async function getConversationImpl(userId, conversationId) {
	const sql = await getSql();
	const me = await ensureProfile(sql, userId);
	assertCanUseChat(toActor(me));
	await requireMember(sql, conversationId, userId);
	const otherId = await otherMemberId(sql, conversationId, userId);
	const other = await sql.query(`select user_id, display_name, handle, avatar_hue, role, status, status_reason, last_seen_at
     from profiles where user_id = $1`, [otherId]);
	if (!other[0]) throw new NexaError("Conversation not found.", 404, "NOT_FOUND");
	return {
		id: conversationId,
		other: toPublic(other[0])
	};
}
async function listMessagesImpl(userId, conversationId, before) {
	const sql = await getSql();
	const me = await ensureProfile(sql, userId);
	assertCanUseChat(toActor(me));
	await requireMember(sql, conversationId, userId);
	const params = [conversationId, userId];
	let beforeClause = "";
	if (before) {
		params.push(before);
		beforeClause = `and m.created_at < $${params.length}::timestamptz`;
	}
	params.push(31);
	const rows = await sql.query(`select m.id, m.conversation_id, m.sender_id, m.body, m.created_at, m.deleted_at,
            r.delivered_at, r.read_at
     from messages m
     left join message_receipts r
       on r.message_id = m.id and r.user_id <> m.sender_id
     where m.conversation_id = $1 ${beforeClause}
     order by m.created_at desc
     limit $${params.length}`, params);
	await sql.query(`update message_receipts r
     set delivered_at = now()
     from messages m
     where r.message_id = m.id
       and m.conversation_id = $1
       and r.user_id = $2
       and r.delivered_at is null`, [conversationId, userId]);
	const hasMore = rows.length > 30;
	const slice = hasMore ? rows.slice(0, 30) : rows;
	return {
		items: slice.map(mapMessage).reverse(),
		nextCursor: hasMore ? toIso(slice[slice.length - 1]?.created_at) : null
	};
}
async function sendMessageImpl(userId, data) {
	const sql = await getSql();
	await consumeRateLimit(sql, `send:${userId}`, LIMITS.send.limit, LIMITS.send.windowMs);
	const me = await ensureProfile(sql, userId);
	assertCanUseChat(toActor(me));
	await requireMember(sql, data.conversationId, userId);
	const body = sanitizeBody(data.body, MESSAGE_MAX_LENGTH);
	if (!body) throw new NexaError("Message cannot be empty.");
	const id = data.clientId && isUuid(data.clientId) ? data.clientId : crypto.randomUUID();
	const otherId = await otherMemberId(sql, data.conversationId, userId);
	const existing = await sql.query("select id, conversation_id, sender_id, body, created_at, deleted_at from messages where id = $1", [id]);
	if (existing[0]) {
		if (existing[0].sender_id !== userId) throw new NexaError("Invalid message id.", 400);
		return mapMessage({
			...existing[0],
			delivered_at: null,
			read_at: null
		});
	}
	await sql.query(`insert into messages (id, conversation_id, sender_id, body)
     values ($1, $2, $3, $4)`, [
		id,
		data.conversationId,
		userId,
		body
	]);
	await sql.query(`insert into message_receipts (message_id, user_id) values ($1, $2)
     on conflict do nothing`, [id, otherId]);
	await sql.query("update conversations set last_message_at = now() where id = $1", [data.conversationId]);
	await sql.query("delete from typing_indicators where conversation_id = $1 and user_id = $2", [data.conversationId, userId]);
	return mapMessage({
		...(await sql.query("select id, conversation_id, sender_id, body, created_at, deleted_at from messages where id = $1", [id]))[0],
		delivered_at: null,
		read_at: null
	});
}
async function markReadImpl(userId, conversationId, messageId) {
	const sql = await getSql();
	const me = await ensureProfile(sql, userId);
	assertCanUseChat(toActor(me));
	await requireMember(sql, conversationId, userId);
	let targetId = messageId;
	if (!targetId) targetId = (await sql.query("select id from messages where conversation_id = $1 order by created_at desc limit 1", [conversationId]))[0]?.id ?? null;
	if (!targetId) return;
	const owned = await sql.query("select id, created_at from messages where id = $1 and conversation_id = $2", [targetId, conversationId]);
	if (!owned[0]) return;
	await sql.query(`update conversation_members
     set last_read_at = $3, last_read_message_id = $4
     where conversation_id = $1 and user_id = $2`, [
		conversationId,
		userId,
		owned[0].created_at,
		targetId
	]);
	await sql.query(`update message_receipts r
     set read_at = coalesce(r.read_at, now()),
         delivered_at = coalesce(r.delivered_at, now())
     from messages m
     where r.message_id = m.id
       and m.conversation_id = $1
       and m.sender_id <> $2
       and r.user_id = $2
       and r.read_at is null`, [conversationId, userId]);
}
async function setTypingImpl(userId, conversationId, typing) {
	const sql = await getSql();
	const me = await ensureProfile(sql, userId);
	assertCanUseChat(toActor(me));
	await requireMember(sql, conversationId, userId);
	if (!typing) {
		await sql.query("delete from typing_indicators where conversation_id = $1 and user_id = $2", [conversationId, userId]);
		return;
	}
	const expires = new Date(Date.now() + TYPING_TTL_MS).toISOString();
	await sql.query(`insert into typing_indicators (conversation_id, user_id, expires_at)
     values ($1, $2, $3::timestamptz)
     on conflict (conversation_id, user_id)
     do update set expires_at = excluded.expires_at`, [
		conversationId,
		userId,
		expires
	]);
}
async function syncImpl(userId, data) {
	const sql = await getSql();
	await consumeRateLimit(sql, `sync:${userId}`, LIMITS.sync.limit, LIMITS.sync.windowMs);
	const me = await ensureProfile(sql, userId);
	await touchPresence(sql, userId);
	const payload = {
		serverTime: (/* @__PURE__ */ new Date()).toISOString(),
		me: {
			role: me.role,
			status: me.status,
			statusReason: me.status_reason
		},
		inbox: [],
		messages: [],
		receipts: [],
		presence: [],
		typingUserIds: []
	};
	if (!assertCanUseChatSafe(me.status)) return payload;
	payload.inbox = await loadInbox(sql, userId, data.inboxAfter, 30);
	if (data.conversationId) {
		if ((await sql.query("select user_id from conversation_members where conversation_id = $1 and user_id = $2", [data.conversationId, userId]))[0]) {
			const params = [data.conversationId];
			let afterClause = "";
			if (data.afterCreatedAt) {
				params.push(data.afterCreatedAt);
				afterClause = `and m.created_at > $${params.length}::timestamptz`;
			}
			payload.messages = (await sql.query(`select m.id, m.conversation_id, m.sender_id, m.body, m.created_at, m.deleted_at,
                r.delivered_at, r.read_at
         from messages m
         left join message_receipts r
           on r.message_id = m.id and r.user_id <> m.sender_id
         where m.conversation_id = $1 ${afterClause}
         order by m.created_at asc
         limit 50`, params)).map(mapMessage);
			await sql.query(`update message_receipts r
         set delivered_at = now()
         from messages m
         where r.message_id = m.id
           and m.conversation_id = $1
           and r.user_id = $2
           and r.delivered_at is null`, [data.conversationId, userId]);
			payload.receipts = (await sql.query(`select r.message_id, r.delivered_at, r.read_at
         from message_receipts r
         join messages m on m.id = r.message_id
         where m.conversation_id = $1
           and m.sender_id = $2
           and (r.delivered_at is not null or r.read_at is not null)`, [data.conversationId, userId])).map((r) => ({
				messageId: r.message_id,
				deliveredAt: toIsoOrNull(r.delivered_at),
				readAt: toIsoOrNull(r.read_at)
			}));
			payload.typingUserIds = (await sql.query(`select user_id from typing_indicators
         where conversation_id = $1 and user_id <> $2 and expires_at > now()`, [data.conversationId, userId])).map((t) => t.user_id);
		}
	}
	const peerIds = [...data.peerIds, ...payload.inbox.map((c) => c.other.userId)];
	payload.presence = await presenceForPeers(sql, userId, peerIds);
	return payload;
}
function assertCanUseChatSafe(status) {
	return status === "active" || status === "warned";
}
async function loadMessagesForEvidence(sql, conversationId, userId) {
	await requireMember(sql, conversationId, userId);
	return sql.query(`select id, sender_id, body, created_at
     from messages
     where conversation_id = $1 and deleted_at is null
     order by created_at asc
     limit 500`, [conversationId]);
}
//#endregion
export { getConversationImpl, listConversationsImpl, listMessagesImpl, loadMessagesForEvidence, markReadImpl, sendMessageImpl, setTypingImpl, startConversationImpl, syncImpl };
