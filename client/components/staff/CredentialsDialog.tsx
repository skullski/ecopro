import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Copy, Eye, EyeOff } from 'lucide-react';

interface CredentialsDialogProps {
  open: boolean;
  email: string;
  tempPassword: string;
  onClose: () => void;
}

export function CredentialsDialog({ open, email, tempPassword, onClose }: CredentialsDialogProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState<'email' | 'password' | null>(null);

  const copyToClipboard = (text: string, type: 'email' | 'password') => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const staffLoginUrl = `${window.location.origin}/staff/login`;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-slate-800 dark:bg-slate-900 border-slate-700 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-white">Staff Credentials Created</DialogTitle>
          <DialogDescription className="text-slate-400">
            Share these credentials with your staff member. They'll need them to log in.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Login URL */}
          <div className="bg-slate-700 dark:bg-slate-800 p-4 rounded-lg border border-slate-600 dark:border-slate-700">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2 block">
              Login URL
            </label>
            <div className="flex items-center gap-2">
              <code className="text-sm text-blue-400 dark:text-blue-300 break-all">{staffLoginUrl}</code>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(staffLoginUrl, 'email')}
                className="text-slate-400 hover:text-slate-200 hover:bg-slate-600 dark:hover:bg-slate-700 flex-shrink-0"
              >
                {copied === 'email' ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Email/Username */}
          <div className="bg-slate-700 dark:bg-slate-800 p-4 rounded-lg border border-slate-600 dark:border-slate-700">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2 block">
              Username
            </label>
            <div className="flex items-center gap-2">
              <code className="text-sm text-slate-200 dark:text-slate-100 break-all">{email}</code>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(email, 'email')}
                className="text-slate-400 hover:text-slate-200 hover:bg-slate-600 dark:hover:bg-slate-700 flex-shrink-0"
              >
                {copied === 'email' ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Temporary Password */}
          <div className="bg-slate-700 dark:bg-slate-800 p-4 rounded-lg border border-slate-600 dark:border-slate-700">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2 block">
              Temporary Password
            </label>
            <div className="flex items-center gap-2">
              <code className={`text-sm font-mono ${showPassword ? 'text-slate-200 dark:text-slate-100' : 'text-slate-400'} break-all`}>
                {showPassword ? tempPassword : '•'.repeat(tempPassword.length)}
              </code>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-200 hover:bg-slate-600 dark:hover:bg-slate-700 flex-shrink-0"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(tempPassword, 'password')}
                className="text-slate-400 hover:text-slate-200 hover:bg-slate-600 dark:hover:bg-slate-700 flex-shrink-0"
              >
                {copied === 'password' ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Info Message */}
          <div className="bg-yellow-900/20 dark:bg-yellow-950/30 border border-yellow-700/50 dark:border-yellow-800/50 p-3 rounded-lg">
            <p className="text-xs text-yellow-300 dark:text-yellow-200">
              <strong>Important:</strong> This is the only time you'll see this password. Make sure to save or share it with your staff member immediately. They can change it after logging in for the first time.
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-blue-900/20 dark:bg-blue-950/30 border border-blue-700/50 dark:border-blue-800/50 p-3 rounded-lg space-y-2">
            <p className="text-xs font-semibold text-blue-300 dark:text-blue-200">How to share with staff:</p>
            <ol className="text-xs text-blue-300 dark:text-blue-200 space-y-1 list-decimal list-inside">
              <li>Copy the login URL above</li>
              <li>Send them the email (username)</li>
              <li>Send them the temporary password</li>
              <li>They can now log in at the provided URL</li>
            </ol>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            onClick={onClose}
            className="flex-1 bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white"
          >
            I've Saved the Credentials
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
