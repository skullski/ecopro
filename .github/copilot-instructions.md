# GitHub Copilot Instructions for EcoPro Platform
1 you read every file inside docks file before you start working 

**IMPORTANT: Before starting ANY coding task, read these files first:**

1. `/docs/AGENTS.md` - Contains project rules, architecture, and coding guidelines
2. `/docs/PLATFORM_OVERVIEW.md` - Platform architecture overview
3. `/docs/TEMPLATE_EDITS_REFERENCE.md` - **MANDATORY for any template work** (settings, ThemeColors, edit paths)

## Critical Rules

1. **NEVER create a local database** - Only use the Render database
2. **NEVER ask the user to do anything** - You are the one who does everything
3. **Read AGENTS.md before coding** - It contains all platform specifics
4. **Read TEMPLATE_EDITS_REFERENCE.md before any template work** - Contains all editable features & setting keys

## Quick Reference

- **Database**: PostgreSQL on Render (never local)
- **Backend**: Node.js + Express on port 8080
- **Frontend**: Vite + React on port 5173
- **Auth**: JWT with role/user_type fields (admin, client , staff("staff is the client agent or you can say manager"))


- Server routes: `/server/routes/`
- Server services: `/server/services/`
- Frontend pages: `/client/pages/`
- Frontend components: `/client/components/`
- Documentation: `/docs/`

## Before Making Changes

1. Read `/docs/AGENTS.md` for project guidelines
2. Check existing code patterns
3. Test changes thoroughly
4. Never break existing functionality

## Admin Chat System

- Admin chat page: `/platform-admin/chat`
- Chat API: `/api/chat/*`
- Admin can access all chats
- Messages use `metadata.fileUrl` and `metadata.isImage` for attachments
