import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Plus, Edit, Trash2, Eye, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { StaffMember, PERMISSION_CATEGORIES, PERMISSIONS, PERMISSION_LABELS, getCategoryPermissions } from '@shared/staff';
import { PermissionEditor } from '@/components/staff/PermissionEditor';
import { ActivityLog } from '@/components/staff/ActivityLog';
import { CredentialsDialog } from '@/components/staff/CredentialsDialog';

interface ApiResponse<T> {
  message?: string;
  error?: string;
  data?: T;
}

export default function StaffManagement() {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('staff');
  
  // Create staff form state
  const [staffUsername, setStaffUsername] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffRole, setStaffRole] = useState<'manager' | 'staff'>('manager');
  const [selectedPermissions, setSelectedPermissions] = useState<Record<string, boolean>>({});
  const [creating, setCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  // Edit state
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editPermissions, setEditPermissions] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  
  // Activity log state
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);

  // Show created staff state
  const [showCreatedDialog, setShowCreatedDialog] = useState(false);
  const [createdStaff, setCreatedStaff] = useState<{ username: string; password: string } | null>(null);

  // Load staff list
  useEffect(() => {
    loadStaffList();
  }, []);

  const loadStaffList = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/client/staff');

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to load staff');
      }
      
      setStaffList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading staff:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load staff members',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStaff = async () => {
    if (!staffUsername || !staffPassword) {
      toast({ variant: 'destructive', title: 'Error', description: 'Username and password are required' });
      return;
    }

    if (staffPassword.length < 6) {
      toast({ variant: 'destructive', title: 'Error', description: 'Password must be at least 6 characters' });
      return;
    }

    try {
      setCreating(true);
      const response = await fetch('/api/client/staff/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: staffUsername,
          password: staffPassword,
          role: staffRole,
          permissions: selectedPermissions,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create staff');
      }

      const result = await response.json();
      
      // Show created staff credentials
      setCreatedStaff({
        username: staffUsername,
        password: staffPassword,
      });
      setShowCreatedDialog(true);
      
      toast({
        title: 'Success',
        description: 'Staff member created successfully!',
      });

      // Reset form
      setStaffUsername('');
      setStaffPassword('');
      setStaffRole('manager');
      setSelectedPermissions({});
      setShowCreateDialog(false);
      
      // Reload staff list
      loadStaffList();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create staff',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleEditOpen = (staff: StaffMember) => {
    setEditingStaff(staff);
    setEditPermissions(staff.permissions);
    setShowEditDialog(true);
  };

  const handlePermissionChange = (permission: string, value: boolean) => {
    setEditPermissions(prev => ({
      ...prev,
      [permission]: value,
    }));
  };

  const handleSavePermissions = async () => {
    if (!editingStaff) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/client/staff/${editingStaff.id}/permissions`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ permissions: editPermissions }),
      });

      if (!response.ok) throw new Error('Failed to update permissions');

      toast({
        title: 'Success',
        description: 'Permissions updated successfully',
      });

      setShowEditDialog(false);
      setEditingStaff(null);
      loadStaffList();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update permissions',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveStaff = async (staffId: number, staffEmail: string) => {
    if (!confirm(`Are you sure you want to remove ${staffEmail}? They will lose access immediately.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/client/staff/${staffId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to remove staff');

      toast({
        title: 'Success',
        description: 'Staff member removed successfully',
      });

      loadStaffList();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to remove staff',
      });
    }
  };

  const handleViewActivityLog = (staffId: number) => {
    setSelectedStaffId(staffId);
    setShowActivityLog(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
        <p className="text-muted-foreground mt-2">Manage your store staff and their permissions</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="staff">Staff Members</TabsTrigger>
          <TabsTrigger value="activity">Activity Logs</TabsTrigger>
        </TabsList>

        {/* Staff Members Tab */}
        <TabsContent value="staff" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Staff</h2>
              <p className="text-sm text-muted-foreground">Invite and manage store staff</p>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white"><Plus className="w-4 h-4 mr-2" /> Create Staff Account</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
                <DialogHeader className="border-b border-gray-200 dark:border-slate-700 pb-4">
                  <DialogTitle className="text-gray-900 dark:text-white text-xl">Create New Staff Account</DialogTitle>
                  <DialogDescription className="text-gray-600 dark:text-slate-400">
                    Set up a new staff member with login credentials and permissions
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-4">
                  {/* Basic Info Section */}
                  <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <div className="w-1 h-4 bg-blue-500 rounded"></div>
                      Account Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-700 dark:text-slate-300 mb-1 block">Username</label>
                        <Input
                          type="text"
                          placeholder="john_staff"
                          value={staffUsername}
                          onChange={(e) => setStaffUsername(e.target.value)}
                          className="h-8 bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 text-sm"
                        />
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Used for login</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700 dark:text-slate-300 mb-1 block">Password</label>
                        <Input
                          type="password"
                          placeholder="Min 6 characters"
                          value={staffPassword}
                          onChange={(e) => setStaffPassword(e.target.value)}
                          className="h-8 bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 text-sm"
                        />
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Must be at least 6 characters</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700 dark:text-slate-300 mb-1 block">Role</label>
                        <select
                          className="w-full h-8 px-2 text-sm border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                          value={staffRole}
                          onChange={(e) => setStaffRole(e.target.value as 'manager' | 'staff')}
                        >
                          <option value="manager">Manager</option>
                          <option value="staff">Staff</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Permissions Section */}
                  <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <div className="w-1 h-4 bg-green-500 rounded"></div>
                      Permissions
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-slate-400 mb-3">
                      Select what this staff member can access
                    </p>
                    <div className="bg-white dark:bg-slate-900 rounded p-3 border border-gray-200 dark:border-slate-700">
                      <PermissionEditor
                        permissions={selectedPermissions}
                        onPermissionChange={(permission, value) => {
                          setSelectedPermissions(prev => ({
                            ...prev,
                            [permission]: value,
                          }));
                        }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-slate-700">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowCreateDialog(false)}
                      className="h-8 text-sm bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateStaff}
                      disabled={creating || !staffUsername || !staffPassword}
                      className="h-8 text-sm bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                    >
                      {creating && <Loader2 className="w-3 h-3 mr-2 animate-spin" />}
                      Create Account
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Staff List */}
          {loading ? (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </CardContent>
            </Card>
          ) : staffList.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No staff members yet. Invite someone to get started!</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {staffList.map((staff) => (
                <Card key={staff.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{staff.email}</h3>
                          <Badge variant={staff.status === 'active' ? 'default' : 'secondary'}>
                            {staff.status === 'active' ? <CheckCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                            {staff.status}
                          </Badge>
                          <Badge variant="outline">{staff.role}</Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Invited</p>
                            <p className="font-medium">
                              {new Date(staff.invited_at).toLocaleDateString()}
                            </p>
                          </div>
                          {staff.activated_at && (
                            <div>
                              <p className="text-muted-foreground">Activated</p>
                              <p className="font-medium">
                                {new Date(staff.activated_at).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                          {staff.last_login && (
                            <div>
                              <p className="text-muted-foreground">Last Login</p>
                              <p className="font-medium">
                                {new Date(staff.last_login).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                          <div>
                            <p className="text-muted-foreground">Permissions</p>
                            <p className="font-medium">
                              {Object.values(staff.permissions).filter(Boolean).length} enabled
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewActivityLog(staff.id)}
                          title="View Activity Log"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditOpen(staff)}
                          title="Edit Permissions"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveStaff(staff.id, staff.email)}
                          title="Remove Staff"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Activity Logs Tab */}
        <TabsContent value="activity">
          <ActivityLog storeId={0} staffId={null} />
        </TabsContent>
      </Tabs>

      {/* Edit Permissions Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Permissions - {editingStaff?.email}</DialogTitle>
            <DialogDescription>
              Permissions apply instantly when changed
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <PermissionEditor
              permissions={editPermissions}
              onPermissionChange={handlePermissionChange}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Close
            </Button>
            <Button
              onClick={handleSavePermissions}
              disabled={saving}
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Created Staff Credentials Dialog */}
      {createdStaff && (
        <CredentialsDialog
          open={showCreatedDialog}
          email={createdStaff.username}
          tempPassword={createdStaff.password}
          onClose={() => {
            setShowCreatedDialog(false);
            setCreatedStaff(null);
          }}
        />
      )}
    </div>
  );
}
