"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, Workspace } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

interface WorkspaceContextType {
    workspaces: Workspace[];
    currentWorkspace: Workspace | null;
    isLoading: boolean;
    error: string | null;
    setCurrentWorkspace: (workspace: Workspace | null) => void;
    refreshWorkspaces: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [currentWorkspace, setCurrentWorkspaceState] = useState<Workspace | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load workspaces only when authenticated
    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            loadWorkspaces();
        } else if (!authLoading && !isAuthenticated) {
            // Reset state when not authenticated
            setWorkspaces([]);
            setCurrentWorkspaceState(null);
            setIsLoading(false);
        }
    }, [isAuthenticated, authLoading]);

    // Load saved workspace from localStorage
    useEffect(() => {
        if (workspaces.length > 0) {
            const savedWorkspaceId = localStorage.getItem('currentWorkspaceId');
            if (savedWorkspaceId) {
                const workspace = workspaces.find(w => w.id === parseInt(savedWorkspaceId));
                if (workspace) {
                    setCurrentWorkspaceState(workspace);
                }
            }
        }
    }, [workspaces]);

    const loadWorkspaces = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await api.listWorkspaces();
            setWorkspaces(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load workspaces');
            console.error('Error loading workspaces:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const setCurrentWorkspace = (workspace: Workspace | null) => {
        setCurrentWorkspaceState(workspace);
        if (workspace) {
            localStorage.setItem('currentWorkspaceId', workspace.id.toString());
        } else {
            localStorage.removeItem('currentWorkspaceId');
        }
    };

    const refreshWorkspaces = async () => {
        await loadWorkspaces();
    };

    return (
        <WorkspaceContext.Provider
            value={{
                workspaces,
                currentWorkspace,
                isLoading,
                error,
                setCurrentWorkspace,
                refreshWorkspaces,
            }}
        >
            {children}
        </WorkspaceContext.Provider>
    );
}

export function useWorkspace() {
    const context = useContext(WorkspaceContext);
    if (context === undefined) {
        throw new Error('useWorkspace must be used within a WorkspaceProvider');
    }
    return context;
}
