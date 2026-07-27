import { useDashboardStore } from "../store";

describe("Dashboard Store", () => {
  beforeEach(() => {
    // Reset state before each test
    useDashboardStore.getState().logout();
    useDashboardStore.getState().selectMultisig(null);
    useDashboardStore.getState().setSidebarOpen(true);
  });

  it("should have correct initial state", () => {
    const state = useDashboardStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.selectedMultisigId).toBeNull();
    expect(state.sidebarOpen).toBe(true);
    expect(state.identityCommitment).toBeNull();
  });

  it("should support login and logout flows", () => {
    const store = useDashboardStore.getState();
    
    // Login
    store.login("commit-123", "priv-123", "pub-123");
    
    let updatedState = useDashboardStore.getState();
    expect(updatedState.isAuthenticated).toBe(true);
    expect(updatedState.identityCommitment).toBe("commit-123");
    expect(updatedState.identityPrivateKey).toBe("priv-123");
    expect(updatedState.identityPublicKey).toBe("pub-123");

    // Logout
    updatedState.logout();
    
    const loggedOutState = useDashboardStore.getState();
    expect(loggedOutState.isAuthenticated).toBe(false);
    expect(loggedOutState.identityCommitment).toBeNull();
  });

  it("should support selecting multisig", () => {
    const store = useDashboardStore.getState();
    store.selectMultisig("multisig-abc");
    
    const updatedState = useDashboardStore.getState();
    expect(updatedState.selectedMultisigId).toBe("multisig-abc");
  });

  it("should toggle sidebar state", () => {
    const store = useDashboardStore.getState();
    store.toggleSidebar();
    
    let updatedState = useDashboardStore.getState();
    expect(updatedState.sidebarOpen).toBe(false);

    updatedState.toggleSidebar();
    updatedState = useDashboardStore.getState();
    expect(updatedState.sidebarOpen).toBe(true);
  });
});
