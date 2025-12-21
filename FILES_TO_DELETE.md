# Files to Delete (Old/Deprecated)

## Old Chat Implementation
- [ ] `/client/pages/Chat.tsx` - Old chat component (replaced by ChatPage.tsx + components/chat/)

## Potentially Deprecated Files (Review Before Deleting)
- [ ] `/client/pages/Checkout.tsx` - May be replaced by storefront checkout
- [ ] `/client/pages/BuyerInfo.tsx` - Old buyer info page
- [ ] `/client/pages/Cart.tsx` - May be replaced by context/component

## To Keep (Important Core Files)
✅ `/client/pages/ChatPage.tsx` - NEW main chat page
✅ `/client/components/chat/` - NEW chat components (all 5 files)
✅ `/client/pages/CodesStorePage.tsx` - NEW codes store page
✅ `/client/pages/Billing.tsx` - UPDATED with new flow
✅ `/server/routes/chat.ts` - Chat API
✅ `/server/services/chat.ts` - Chat business logic
✅ `/server/types/chat.ts` - Chat types
✅ `/server/migrations/20251221_chat_system.sql` - Database schema

## Build Status
✅ Build Passing (0 errors)
✅ All routes registered
✅ Header updated with Codes Store link
✅ Billing page updated with chat integration
✅ 1901 modules compiled successfully

## Next Steps
1. Delete old Chat.tsx
2. Test codes store page in browser
3. Test chat functionality
4. Test billing page integration
