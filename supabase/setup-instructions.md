# Supabase Storage Setup Instructions

## 🔐 **User Folder Structure**

Scarlet Drives now uses a **UUID-based folder structure** for complete user data isolation:

```
scarlet-drives/
├── {user-uuid-1}/
│   ├── file1.pdf
│   ├── folder1/
│   │   └── file2.jpg
│   └── subfolder/
│       └── document.docx
├── {user-uuid-2}/
│   ├── image.png
│   └── documents/
│       └── report.xlsx
```

## 📋 **Setup Steps**

### **1. Create Storage Bucket**

1. Go to **Storage** in your Supabase dashboard
2. Click **New bucket**
3. Name: `scarlet-drives`
4. Set as **Public bucket** (for file sharing functionality)
5. Click **Create bucket**

### **2. Run Database Migrations**

Execute the migration files in order:

1. **First Migration** - Add soft delete columns:
   ```sql
   -- Run: supabase/migrations/20250613062120_mute_pebble.sql
   ```

2. **Second Migration** - Set up storage policies:
   ```sql
   -- Run: supabase/migrations/20250613063415_autumn_rain.sql
   ```

3. **Third Migration** - Enforce user folder structure:
   ```sql
   -- Run: supabase/migrations/20250613064500_user_folder_structure.sql
   ```

### **3. Verify Setup**

After running migrations, verify in your Supabase dashboard:

1. **Storage Policies**: Check that policies are applied to `storage.objects`
2. **Database Tables**: Verify `files` and `folders` tables have `is_deleted` columns
3. **Bucket**: Confirm `scarlet-drives` bucket exists

## 🛡️ **Security Features**

### **Complete User Isolation**
- Each user gets their own UUID folder
- No cross-user data access possible
- Path validation prevents directory traversal

### **Storage Policies**
- **Upload**: Users can only upload to `{their-uuid}/...`
- **Read**: Users can only read from `{their-uuid}/...`
- **Update**: Users can only modify files in `{their-uuid}/...`
- **Delete**: Users can only delete from `{their-uuid}/...`

### **Soft Delete System**
- Files marked as `is_deleted = true` instead of permanent deletion
- `deleted_at` timestamp for cleanup scheduling
- Easy restoration from trash

## 📁 **File Organization**

### **Automatic Structure**
When users upload files, they're automatically organized:

```
{user-uuid}/
├── filename.ext (root files)
├── Documents/
│   ├── report.pdf
│   └── presentation.pptx
├── Images/
│   ├── photo1.jpg
│   └── photo2.png
└── Projects/
    └── project-files/
        └── code.js
```

### **Path Examples**
- Root file: `550e8400-e29b-41d4-a716-446655440000/document.pdf`
- Folder file: `550e8400-e29b-41d4-a716-446655440000/Documents/report.pdf`
- Nested file: `550e8400-e29b-41d4-a716-446655440000/Projects/Web/index.html`

## 🔧 **Environment Variables**

Ensure your `.env` file contains:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## ✅ **Testing the Setup**

### **1. User Registration**
1. Sign up with a new account
2. Check that user folder is created automatically
3. Upload a test file

### **2. File Operations**
1. **Upload**: Should work in user's folder
2. **View**: Should only show user's files
3. **Delete**: Should move to trash (soft delete)
4. **Restore**: Should restore from trash

### **3. Security Testing**
1. Try accessing another user's files (should fail)
2. Attempt path traversal attacks (should be blocked)
3. Verify file isolation between users

## 🚨 **Troubleshooting**

### **Common Issues**

**❌ "new row violates row-level security policy"**
- Check user is authenticated
- Verify file path starts with user UUID
- Ensure policies are applied correctly

**❌ "permission denied for table objects"**
- Run: `ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;`
- Verify all policies are created

**❌ Files not appearing**
- Check bucket name is exactly `scarlet-drives`
- Verify file path includes user UUID
- Check `is_deleted = false` in database

### **Policy Verification**

Check policies are active:
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';
```

### **Path Validation**

Test path validation function:
```sql
SELECT validate_user_path('550e8400-e29b-41d4-a716-446655440000/test.pdf', '550e8400-e29b-41d4-a716-446655440000'::uuid);
-- Should return: true

SELECT validate_user_path('other-user-id/test.pdf', '550e8400-e29b-41d4-a716-446655440000'::uuid);
-- Should return: false
```

## 🎯 **Benefits**

### **Data Security**
- **Zero Cross-User Access**: Impossible for users to access each other's data
- **Path Validation**: Prevents directory traversal and unauthorized access
- **UUID Isolation**: Each user has a unique, unguessable folder

### **Scalability**
- **Clean Organization**: Files organized by user automatically
- **Easy Backup**: User data is contained in single folder
- **Simple Migration**: User folders can be moved independently

### **Compliance**
- **GDPR Ready**: Easy user data deletion (delete entire folder)
- **Audit Trail**: Soft deletes maintain history
- **Data Portability**: User data is clearly separated

This structure ensures your Scarlet Drives application provides enterprise-level security and data isolation while maintaining excellent performance and user experience!