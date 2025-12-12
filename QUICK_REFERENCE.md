# Quick Reference: Updated API Structure

## Summary of Changes

✅ **Fixed**: Auth refresh token endpoint (query parameter instead of body)  
✅ **Fixed**: Workspace member deletion route parameter names  
✅ **Updated**: Task interface with 6 new fields  
✅ **Added**: 3 new task API routes (assigned, export, import)  
✅ **Added**: 3 new API client methods in `lib/api.ts`

## New Task Fields Available

```typescript
interface Task {
  // ... existing fields ...
  user_id?: number;           // NEW: Task creator/owner
  assigned_to_id?: number;    // NEW: User assigned to task
  recurrence_rule?: string;   // NEW: Recurrence pattern
  last_reminded_at?: string;  // NEW: Last reminder timestamp
  created_at?: string;        // NEW: Creation timestamp
  updated_at?: string;        // NEW: Last update timestamp
}
```

## New API Methods

```typescript
// Get tasks assigned to current user
const assignedTasks = await api.getAssignedTasks();

// Export all user's tasks
const { tasks } = await api.exportTasks();

// Import tasks from array
await api.importTasks([
  { title: 'Task 1', priority: 'High', status: 'Pending' },
  // ... more tasks
]);
```

## Testing the Updates

1. **Start the backend API**:
   ```bash
   cd TaskJarvis
   uvicorn api.main:app --reload
   ```

2. **Start the Next.js dev server**:
   ```bash
   cd web-ui
   npm run dev
   ```

3. **Test the following flows**:
   - ✅ Login/Register
   - ✅ Create/Update/Delete tasks
   - ✅ Create workspace
   - ✅ Invite members to workspace
   - ✅ Join workspace with invitation token
   - ✅ View workspace members
   - ✅ Remove workspace member
   - ✅ Get assigned tasks
   - ✅ Export/Import tasks

## Files Modified

1. `web-ui/app/api/auth/refresh/route.ts` - Fixed refresh token endpoint
2. `web-ui/app/api/workspaces/[id]/members/[userId]/route.ts` - Fixed params
3. `web-ui/lib/api.ts` - Updated Task interface + added 3 new methods
4. `web-ui/app/api/tasks/assigned/route.ts` - NEW
5. `web-ui/app/api/tasks/export/route.ts` - NEW
6. `web-ui/app/api/tasks/import/route.ts` - NEW

## Next Steps for Development

1. **Update UI Components** to use new task fields:
   - Show task creator (user_id)
   - Show assigned user (assigned_to_id)
   - Display creation/update timestamps
   
2. **Implement Task Assignment UI**:
   - Add dropdown to assign tasks to workspace members
   - Show "Assigned to me" filter/view
   
3. **Implement Import/Export UI**:
   - Add buttons for exporting tasks to JSON
   - Add file upload for importing tasks
   
4. **Add WebSocket Support** (backend already supports it):
   - Real-time task updates in workspaces
   - Live notifications for task assignments

## Verification

✅ Dev server starts successfully  
✅ All API routes properly proxy to backend  
✅ Session-based authentication working  
✅ TypeScript types updated  
✅ All endpoints aligned with backend API

The Next.js project is now fully compatible with the new backend API structure!
