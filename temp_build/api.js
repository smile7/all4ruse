"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEvents = getEvents;
exports.getEventBySlug = getEventBySlug;
exports.createEvent = createEvent;
exports.updateEvent = updateEvent;
exports.deleteEvent = deleteEvent;
exports.getTags = getTags;
exports.getProfileById = getProfileById;
exports.getCurrentUserProfile = getCurrentUserProfile;
exports.updateCurrentUserProfile = updateCurrentUserProfile;
function getEvents(client, options) {
    return __awaiter(this, void 0, void 0, function* () {
        let query = client
            .from("events")
            .select("*")
            .order("startDate", { ascending: true });
        if (!(options === null || options === void 0 ? void 0 : options.all)) {
            query = query.eq("isEventActive", true);
        }
        if (typeof (options === null || options === void 0 ? void 0 : options.limit) === "number") {
            if (typeof options.offset === "number") {
                const from = options.offset;
                const to = from + options.limit - 1;
                query = query.range(from, to);
            }
            else {
                query = query.limit(options.limit);
            }
        }
        const { data, error } = yield query;
        return { data: data !== null && data !== void 0 ? data : [], error };
    });
}
function getEventBySlug(client, slug, options) {
    return __awaiter(this, void 0, void 0, function* () {
        let query = client.from("events").select("*").eq("slug", slug);
        if (!(options === null || options === void 0 ? void 0 : options.all)) {
            query = query.eq("isEventActive", true);
        }
        const { data, error } = yield query.maybeSingle();
        return { data: data !== null && data !== void 0 ? data : null, error };
    });
}
function createEvent(client, payload) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data, error } = yield client
            .from("events")
            .insert(payload)
            .select("*")
            .maybeSingle();
        if (data && Array.isArray(data.organizers)) {
            return {
                data: Object.assign(Object.assign({}, data), { organizers: data.organizers }),
                error,
            };
        }
        return { data: data, error };
    });
}
function updateEvent(client, id, patch) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data, error } = yield client
            .from("events")
            .update(patch)
            .eq("id", id)
            .select("*")
            .maybeSingle();
        return { data: data !== null && data !== void 0 ? data : null, error };
    });
}
function deleteEvent(client, id) {
    return __awaiter(this, void 0, void 0, function* () {
        const { error } = yield client.from("events").delete().eq("id", id);
        return { data: !error, error };
    });
}
function getTags(client) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data, error } = yield client
            .from("tags")
            .select("*")
            .order("title", { ascending: true });
        return { data: data !== null && data !== void 0 ? data : [], error };
    });
}
function getProfileById(client, id) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data, error } = yield client
            .from("profiles")
            .select("*")
            .eq("id", id)
            .maybeSingle();
        return { data: data !== null && data !== void 0 ? data : null, error };
    });
}
function getCurrentUserProfile(client) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const { data: { user }, error: userError, } = yield client.auth.getUser();
        if (userError || !user) {
            return { data: null, error: userError };
        }
        const { data: profile, error: profileError } = yield client
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();
        if (profileError || !profile) {
            const fallbackProfile = {
                id: user.id,
                avatar_url: null,
                email: (_a = user.email) !== null && _a !== void 0 ? _a : null,
                fb: null,
                full_name: null,
                instagram: null,
                is_confirmed: null,
                tiktok: null,
                updated_at: null,
                username: null,
                website: null,
            };
            return {
                data: fallbackProfile,
                error: profileError,
            };
        }
        return {
            data: Object.assign(Object.assign({}, profile), { email: (_b = user.email) !== null && _b !== void 0 ? _b : null }),
            error: null,
        };
    });
}
function updateCurrentUserProfile(client, payload) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data: { user }, error: userError, } = yield client.auth.getUser();
        if (userError || !user) {
            return { data: null, error: userError };
        }
        const { data, error } = yield client
            .from("profiles")
            .update(payload)
            .eq("id", user.id)
            .select("*")
            .maybeSingle();
        return { data: data !== null && data !== void 0 ? data : null, error };
    });
}
