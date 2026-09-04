import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// If real Supabase credentials are configured, use the official client.
let supabaseClient = null;

if (url && key && url.startsWith("http")) {
  supabaseClient = createClient(url, key);
} else {
  console.warn(
    "[AI Studio] Supabase credentials not found in environment variables. " +
    "Running with local in-memory/localStorage mock client."
  );

  // Helper storage keys
  const STORAGE_PKGS = "parcel_tracking_pkgs";
  const STORAGE_GROUPS = "parcel_tracking_groups";
  const STORAGE_MEMBERS = "parcel_tracking_members";
  const STORAGE_SHARED = "parcel_tracking_shared";
  const STORAGE_SESSION = "parcel_tracking_session";

  const defaultUser = {
    id: "demo-user-001",
    email: "demo@example.com",
    user_metadata: { name: "Demo User" },
  };

  const initialPkgs = [
    {
      id: "pkg-1",
      user_id: "demo-user-001",
      name: "Căști wireless Sony WH-1000XM5",
      awb: "1234567890",
      courier: "FAN Courier",
      status: "In livrare",
      type: "in",
      date: new Date().toISOString().split("T")[0],
      shop: "eMAG",
      client_name: "",
      amount: "1499.99",
      order_number: "2026-94812",
      notes: "Livrare la adresa de birou",
      products: [{ name: "Căști wireless Sony WH-1000XM5", qty: 1 }],
      estimated_delivery: new Date(Date.now() + 86400000).toISOString().split("T")[0],
      status_history: [
        { status: "Comandat", at: new Date(Date.now() - 172800000).toISOString() },
        { status: "In livrare", at: new Date(Date.now() - 86400000).toISOString() },
      ],
      archived: false,
      group_id: null,
      created_at: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: "pkg-2",
      user_id: "demo-user-001",
      name: "Tastatură mecanică Keychron Q1",
      awb: "9876543210",
      courier: "Sameday",
      status: "Comandat",
      type: "in",
      date: new Date().toISOString().split("T")[0],
      shop: "Altex",
      client_name: "",
      amount: "899.00",
      order_number: "ALT-7841",
      notes: "Ridicare easybox",
      products: [{ name: "Tastatură mecanică Keychron Q1", qty: 1 }],
      estimated_delivery: "",
      status_history: [
        { status: "Comandat", at: new Date().toISOString() },
      ],
      archived: false,
      group_id: null,
      created_at: new Date().toISOString(),
    },
  ];

  function getStorage(key, fallback) {
    try {
      const data = localStorage.getItem(key);
      if (data) return JSON.parse(data);
    } catch (e) {}
    return fallback;
  }

  function setStorage(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {}
  }

  // Initialize storage if empty
  if (!localStorage.getItem(STORAGE_PKGS)) {
    setStorage(STORAGE_PKGS, initialPkgs);
  }
  if (!localStorage.getItem(STORAGE_GROUPS)) {
    setStorage(STORAGE_GROUPS, []);
  }
  if (!localStorage.getItem(STORAGE_MEMBERS)) {
    setStorage(STORAGE_MEMBERS, []);
  }
  if (!localStorage.getItem(STORAGE_SHARED)) {
    setStorage(STORAGE_SHARED, []);
  }

  // Realtime listeners
  const channelListeners = new Set();

  function broadcast(table, eventType, newRow, oldRow) {
    channelListeners.forEach((cb) => {
      try {
        cb({
          eventType,
          new: newRow || {},
          old: oldRow || {},
          table,
        });
      } catch (e) {
        console.error("Error in mock realtime listener", e);
      }
    });
  }

  // Auth state
  const authListeners = new Set();
  let currentSession = getStorage(STORAGE_SESSION, {
    user: defaultUser,
    access_token: "mock-access-token",
  });

  function notifyAuth(event, session) {
    authListeners.forEach((cb) => {
      try {
        cb(event, session);
      } catch (e) {}
    });
  }

  class MockQueryBuilder {
    constructor(tableName) {
      this.tableName = tableName;
      this.filters = [];
      this.sortFn = null;
      this.isSingle = false;
      this.action = "select";
      this.actionData = null;
    }

    select(fields) {
      this.fields = fields;
      return this;
    }

    eq(column, value) {
      this.filters.push((row) => row[column] === value);
      return this;
    }

    in(column, values) {
      const set = new Set(values);
      this.filters.push((row) => set.has(row[column]));
      return this;
    }

    order(column, { ascending = true } = {}) {
      this.sortFn = (a, b) => {
        const valA = a[column] ?? "";
        const valB = b[column] ?? "";
        if (valA < valB) return ascending ? -1 : 1;
        if (valA > valB) return ascending ? 1 : -1;
        return 0;
      };
      return this;
    }

    single() {
      this.isSingle = true;
      return this;
    }

    insert(data) {
      this.action = "insert";
      this.actionData = data;
      return this;
    }

    update(data) {
      this.action = "update";
      this.actionData = data;
      return this;
    }

    delete() {
      this.action = "delete";
      return this;
    }

    async execute() {
      const storageKey =
        this.tableName === "packages"
          ? STORAGE_PKGS
          : this.tableName === "groups"
          ? STORAGE_GROUPS
          : this.tableName === "group_members"
          ? STORAGE_MEMBERS
          : STORAGE_SHARED;

      let rows = getStorage(storageKey, []);

      if (this.action === "insert") {
        const toInsert = Array.isArray(this.actionData)
          ? this.actionData
          : [this.actionData];

        const inserted = toInsert.map((item) => {
          const row = {
            id: item.id || `id-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            created_at: new Date().toISOString(),
            ...item,
          };
          return row;
        });

        rows = [...inserted, ...rows];
        setStorage(storageKey, rows);

        inserted.forEach((r) => broadcast(this.tableName, "INSERT", r, null));

        const resultData = this.isSingle
          ? inserted[0]
          : Array.isArray(this.actionData)
          ? inserted
          : inserted[0];
        return { data: resultData, error: null };
      }

      if (this.action === "update") {
        let updatedRow = null;
        rows = rows.map((row) => {
          const matches = this.filters.every((f) => f(row));
          if (matches) {
            const old = { ...row };
            const next = { ...row, ...this.actionData };
            updatedRow = next;
            broadcast(this.tableName, "UPDATE", next, old);
            return next;
          }
          return row;
        });
        setStorage(storageKey, rows);
        return { data: updatedRow, error: null };
      }

      if (this.action === "delete") {
        const toDelete = rows.filter((row) => this.filters.every((f) => f(row)));
        rows = rows.filter((row) => !this.filters.every((f) => f(row)));
        setStorage(storageKey, rows);
        toDelete.forEach((r) => broadcast(this.tableName, "DELETE", null, r));
        return { data: null, error: null };
      }

      // SELECT
      let result = rows.filter((row) => this.filters.every((f) => f(row)));

      // Specialized join mock for group_members with groups
      if (this.tableName === "group_members" && this.fields?.includes("groups")) {
        const groups = getStorage(STORAGE_GROUPS, []);
        result = result.map((m) => {
          const group = groups.find((g) => g.id === m.group_id);
          return {
            ...m,
            groups: group || null,
          };
        });
      }

      if (this.sortFn) {
        result.sort(this.sortFn);
      }

      return {
        data: this.isSingle ? (result[0] || null) : result,
        error: null,
      };
    }

    then(resolve, reject) {
      return this.execute().then(resolve, reject);
    }

    catch(reject) {
      return this.execute().catch(reject);
    }
  }

  supabaseClient = {
    auth: {
      getSession: async () => ({
        data: { session: currentSession },
        error: null,
      }),
      onAuthStateChange: (callback) => {
        authListeners.add(callback);
        // Async initial trigger
        setTimeout(() => {
          callback("SIGNED_IN", currentSession);
        }, 0);
        return {
          data: {
            subscription: {
              unsubscribe: () => {
                authListeners.delete(callback);
              },
            },
          },
        };
      },
      signInWithOAuth: async () => {
        currentSession = {
          user: defaultUser,
          access_token: "mock-access-token",
        };
        setStorage(STORAGE_SESSION, currentSession);
        notifyAuth("SIGNED_IN", currentSession);
        return { data: { session: currentSession, user: defaultUser }, error: null };
      },
      signOut: async () => {
        currentSession = null;
        setStorage(STORAGE_SESSION, null);
        notifyAuth("SIGNED_OUT", null);
        return { error: null };
      },
    },

    from: (tableName) => new MockQueryBuilder(tableName),

    rpc: async (funcName, params = {}) => {
      if (funcName === "get_shared_package") {
        const links = getStorage(STORAGE_SHARED, []);
        const link = links.find((l) => l.id === params.p_token || l.token === params.p_token);
        const pkgs = getStorage(STORAGE_PKGS, []);
        const pkg = pkgs.find((p) => p.id === (link ? link.package_id : params.p_token));
        return { data: pkg || null, error: pkg ? null : { message: "Package not found" } };
      }

      if (funcName === "create_group_with_owner") {
        const groups = getStorage(STORAGE_GROUPS, []);
        const members = getStorage(STORAGE_MEMBERS, []);
        const newGroup = {
          id: `grp-${Date.now()}`,
          name: params.p_name,
          invite_code: `inv-${Math.random().toString(36).slice(2, 8)}`,
          created_by: currentSession?.user?.id || defaultUser.id,
        };
        const newMember = {
          group_id: newGroup.id,
          user_id: currentSession?.user?.id || defaultUser.id,
          role: "owner",
          email: currentSession?.user?.email || defaultUser.email,
        };
        setStorage(STORAGE_GROUPS, [...groups, newGroup]);
        setStorage(STORAGE_MEMBERS, [...members, newMember]);
        return { data: newGroup, error: null };
      }

      if (funcName === "get_group_by_invite") {
        const groups = getStorage(STORAGE_GROUPS, []);
        const group = groups.find((g) => g.invite_code === params.p_code);
        return { data: group || null, error: null };
      }

      if (funcName === "join_group") {
        const groups = getStorage(STORAGE_GROUPS, []);
        const group = groups.find((g) => g.invite_code === params.p_invite_code);
        if (!group) return { data: null, error: { message: "Grup inexistent" } };

        const members = getStorage(STORAGE_MEMBERS, []);
        const userId = currentSession?.user?.id || defaultUser.id;
        const exists = members.find((m) => m.group_id === group.id && m.user_id === userId);
        if (!exists) {
          members.push({
            group_id: group.id,
            user_id: userId,
            role: "member",
            email: currentSession?.user?.email || defaultUser.email,
          });
          setStorage(STORAGE_MEMBERS, members);
        }
        return { data: true, error: null };
      }

      if (funcName === "get_group_members") {
        const members = getStorage(STORAGE_MEMBERS, []);
        const groupMembers = members.filter((m) => m.group_id === params.p_group_id);
        return { data: groupMembers, error: null };
      }

      if (funcName === "remove_group_member") {
        let members = getStorage(STORAGE_MEMBERS, []);
        members = members.filter(
          (m) => !(m.group_id === params.p_group_id && m.user_id === params.p_user_id)
        );
        setStorage(STORAGE_MEMBERS, members);
        return { data: true, error: null };
      }

      return { data: null, error: null };
    },

    channel: () => {
      const channelObj = {
        on: (event, filter, callback) => {
          channelListeners.add(callback);
          return channelObj;
        },
        subscribe: () => channelObj,
      };
      return channelObj;
    },

    removeChannel: (channel) => {
      // Clean up
      channelListeners.clear();
    },
  };
}

export const supabase = supabaseClient;

