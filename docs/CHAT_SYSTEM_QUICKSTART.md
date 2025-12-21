# Chat System - Quick Start Guide

## For Clients (Store Owners)

### Accessing Chat

1. **Login** to your EcoPro account
2. **Navigate** to `/chat` or click "Chat" in navigation
3. You'll see the **Support Chat** interface

### Requesting a Code

1. **Open Chat Window** - Click on support chat or it opens automatically
2. **Click Package Icon** (📦) - Bottom left of message input
3. **Select Code Type** - Choose from:
   - General Code
   - Discount Code
   - Voucher
   - License Key
   - Activation Code
4. **Set Expiry** - How long code should work (default: 24 hours)
5. **Click "Request Code"** - Request is sent
6. **Check History Tab** - View request status

### Receiving a Code

1. **Watch Message Area** - Seller's response appears as new message
2. **Code Display** - Code shown in special blue box
3. **Copy Code** - Click copy icon to copy to clipboard
4. **Check Expiry** - See when code expires

### Chat Tips

- **Search** - (not applicable for clients)
- **Mark Read** - Messages auto-mark as read when you view them
- **History** - All code requests visible in Code Request UI

---

## For Sellers

### Accessing Chat

1. **Login** as seller
2. **Navigate** to `/chat` or click "Chat" in navigation
3. You'll see **Customer Chats** with all active conversations

### Managing Chats

1. **Search Customers** - Type customer name/email to filter
2. **View Unread** - Red badge shows unread message count
3. **Select Chat** - Click customer to open conversation

### Responding to Messages

1. **Type Message** - In input field at bottom
2. **Send** - Click send button or press Enter
3. **Mark Read** - Messages auto-mark as read when viewed

### Issuing Codes

1. **Check for Code Request** - "📋 Code Request" message in chat
2. **Open Code Request UI** - Click package icon or scroll down
3. **History Tab** - See "Pending" code requests
4. **Enter Code** - Type the code value you want to issue
5. **Click Issue** - Send code to client
6. **Confirmation** - Response message appears in chat with code

### Code Management

- **Expiry Hours** - Auto-set from client's request
- **Copy Code** - Use copy button to verify
- **Track History** - All issued codes visible in history tab

### Archive Chats

1. **Click Chat Settings** - Top right of chat window
2. **Update Status** - Change to "archived" or "closed"
3. **Confirmation** - Chat moved from active list

---

## Common Workflows

### Workflow 1: Client Requests Code

```
1. Client opens chat
2. Client clicks package icon
3. Client selects code type (e.g., "Discount Code")
4. Client sets expiry (e.g., 48 hours)
5. Client clicks "Request Code"
6. System message: "Code request created"
7. Seller gets notification/sees in chat
8. Seller opens Code Request UI
9. Seller enters code (e.g., "WELCOME20")
10. Seller clicks "Issue"
11. Code response appears in chat
12. Client sees code and copies it
13. Client uses code to claim offer
```

### Workflow 2: Seller Handles Multiple Requests

```
1. Seller opens /chat
2. Seller sees multiple customers with unread badges
3. Seller clicks customer 1
4. Seller responds to messages
5. Seller issues codes to pending requests
6. Seller marks chat status as completed
7. Seller clicks customer 2
8. Repeat for each customer
```

### Workflow 3: Code Integration with Codes Store

```
1. Client on codes store page
2. Client clicks "Request Code" button
3. Chat opens with code request pre-populated
4. Seller receives request
5. Seller issues code
6. Client returns to codes store
7. Client applies code
8. Success
```

---

## Message Types Reference

| Type | Icon | Used When | Example |
|------|------|-----------|---------|
| **text** | 💬 | Regular messages | "Can I get a discount?" |
| **code_request** | 📋 | Client requests code | Type: "Discount Code", Expiry: 24h |
| **code_response** | ✅ | Seller issues code | Code: "WELCOME20", Expires: 2024-12-23 |
| **system** | ⚙️ | Automatic messages | "Chat created", "Chat archived" |

---

## Status Reference

### Chat Status

| Status | Meaning | Allow Messages |
|--------|---------|---|
| **active** | Chat is open | ✅ Yes |
| **archived** | Chat closed but visible | ❌ No |
| **closed** | Chat finished | ❌ No |

### Code Request Status

| Status | Meaning | Action |
|--------|---------|--------|
| **pending** | Waiting for seller | ⏳ Wait for issue |
| **issued** | Code sent to client | 📋 See code |
| **used** | Client claimed code | ✔️ Done |
| **expired** | Time limit passed | 🔄 Request new |

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + K` | Search chats |
| `Enter` | Send message (if input focused) |
| `Shift + Enter` | New line in message |

---

## Troubleshooting

### "Can't see chat"
- ✅ Are you logged in?
- ✅ Is the chat active (not archived)?
- ✅ Do you have access (client to own chat, seller to assigned)?

### "Message not sending"
- ✅ Is chat status "active"?
- ✅ Is your message not empty?
- ✅ Check internet connection
- ✅ Look for error message below input

### "Can't see code"
- ✅ Did seller already issue code?
- ✅ Check Code Request UI History tab
- ✅ Look for "Code Issued" message

### "Code expired"
- ✅ Time limit has passed
- ✅ Request a new code
- ✅ Seller can issue with longer expiry

### "Copy button not working"
- ✅ Try again (may take 2 seconds)
- ✅ Manual copy: Cmd/Ctrl + C on code
- ✅ Try different browser

---

## Tips & Best Practices

### For Clients
1. **Be Clear** - Describe what code you need
2. **Check Expiry** - Make sure to use code before expiry
3. **Copy Immediately** - Save the code somewhere safe
4. **Ask Questions** - Message seller if unsure

### For Sellers
1. **Respond Quickly** - Clients appreciate fast responses
2. **Use Clear Codes** - Make codes easy to understand
3. **Set Appropriate Expiry** - Don't make codes expire too fast
4. **Archive Old Chats** - Keep active chats list clean
5. **Note Issues** - If client can't redeem, document in message

---

## Performance Notes

- **Message Loading** - Latest 50 messages loaded by default
- **Refresh Rate** - Messages update every 5 seconds
- **Unread Count** - Updates in real-time
- **Search** - Instant filtering (client names only)

## Mobile Support

✅ **Fully Responsive**
- Side-by-side on desktop (list + chat)
- Stacked on tablet (select chat from list)
- Full-screen on mobile (single view)

---

## Contact & Support

For technical issues:
1. Check this guide
2. Review error messages in browser console
3. Contact system administrator
4. Check server logs for backend errors

---

**Last Updated:** December 21, 2024
**System Status:** ✅ Production Ready
**Current Version:** 1.0
