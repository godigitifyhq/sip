# Code Snippets Reference

## Universal Array Safety Pattern

Apply this pattern to ANY API call that should return an array:

```typescript
const response = await apiClient.get('/your-endpoint');
const data = response.data;
const resultData = Array.isArray(data) ? data : (data?.data || data?.items || []);
setYourState(resultData);
```

### Handles These Backend Response Formats:

1. **Direct Array**:
```json
[
  { "id": 1, "name": "Item 1" },
  { "id": 2, "name": "Item 2" }
]
```

2. **Paginated Object**:
```json
{
  "data": [
    { "id": 1, "name": "Item 1" }
  ],
  "total": 100,
  "page": 1
}
```

3. **Items Object**:
```json
{
  "items": [
    { "id": 1, "name": "Item 1" }
  ],
  "count": 100
}
```

---

## Profile Update - Student

```typescript
// ❌ OLD (WRONG)
await apiClient.patch('/users/me', { 
  studentProfile: {
    fullName: 'John Doe',
    phone: '1234567890'
  }
});

// ✅ NEW (CORRECT)
await apiClient.put('/users/profile/student', {
  fullName: 'John Doe',
  phone: '1234567890'
});
```

---

## Profile Update - Employer

```typescript
// ❌ OLD (WRONG)
await apiClient.patch('/users/me', { 
  companyProfile: {
    companyName: 'Tech Corp',
    industry: 'Technology'
  }
});

// ✅ NEW (CORRECT)
await apiClient.put('/users/profile/employer', {
  companyName: 'Tech Corp',
  industry: 'Technology'
});
```

---

## Message Fetching

```typescript
// ❌ OLD (WRONG)
const { data } = await apiClient.get(`/messages/${userId}`);

// ✅ NEW (CORRECT)
const { data } = await apiClient.get(`/messages/conversation/${userId}`);
const messages = Array.isArray(data) ? data : (data?.data || data?.items || []);
```

---

## Message Sending

```typescript
// ❌ OLD (WRONG)
await apiClient.post('/messages', {
  receiverId: userId,
  content: messageText
});

// ✅ NEW (CORRECT)
await apiClient.post('/messages/send', {
  receiverId: userId,
  content: messageText
});
```

---

## React Hook Pattern

```typescript
export function useYourData() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/your-endpoint');
      
      // ✅ Array safety check
      const responseData = response.data;
      const resultData = Array.isArray(responseData) 
        ? responseData 
        : (responseData?.data || responseData?.items || []);
      
      setData(resultData);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch data');
      setData([]); // ✅ Ensure empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
}
```

---

## Navigation Patterns

### Link Navigation
```tsx
import Link from 'next/link';

<Link href="/employer/internships/new">
  <Button>Post Internship</Button>
</Link>
```

### Programmatic Navigation
```tsx
import { useRouter } from 'next/navigation';

const router = useRouter();

// Navigate
router.push('/employer/internships/new');

// With parameters
router.push(`/employer/internships/${id}/edit`);
```

---

## RouteGuard Usage

```tsx
import { RouteGuard } from '@/components/RouteGuard';

export default function YourPage() {
  return (
    <RouteGuard allowedRoles={['STUDENT']}>
      <YourContent />
    </RouteGuard>
  );
}
```

**Available Roles**:
- `STUDENT`
- `EMPLOYER`
- `ADMIN`

---

## Error Handling Pattern

```typescript
try {
  const response = await apiClient.post('/endpoint', data);
  // Success
  alert('Success!');
} catch (error: any) {
  // ✅ Proper error extraction
  const errorMessage = error.response?.data?.message || 'An error occurred';
  alert(errorMessage);
  console.error('Detailed error:', error);
}
```

---

## Kanban Status Update

```typescript
// ✅ CORRECT - Uses PATCH
await applicationsApi.updateStatus(applicationId, 'SHORTLISTED');

// Backend endpoint: PATCH /api/v1/applications/:id/status
// Body: { status: 'SHORTLISTED' }
```

**Valid Statuses**:
- `SUBMITTED`
- `UNDER_REVIEW`
- `SHORTLISTED`
- `INTERVIEW_SCHEDULED`
- `ACCEPTED` (terminal)
- `REJECTED` (terminal)
- `WITHDRAWN` (terminal)

---

## Brand Colors Usage

```tsx
// Using CSS variables
<div className="bg-[var(--primary)] text-white">
  Content
</div>

// Using Tailwind with CSS variables
<Button className="bg-[var(--accent)] hover:bg-[var(--accent-hover)]">
  Click me
</Button>
```

**Available Variables**:
```css
--primary: #243447
--primary-light: #2e4053
--accent: #E1A337
--accent-hover: #d49629
--background: #F3EEE6
--card-bg: #ffffff
--text-primary: #1a1a1a
--text-secondary: #666666
--border: #e0e0e0
```

---

## Loading States

```tsx
{loading ? (
  <div className="flex items-center justify-center py-8">
    <LoadingSpinner />
  </div>
) : data.length > 0 ? (
  <div>
    {data.map(item => <Item key={item.id} {...item} />)}
  </div>
) : (
  <EmptyState 
    title="No data found"
    description="Try adjusting your filters"
  />
)}
```

---

## Form Submission Pattern

```tsx
const [formData, setFormData] = useState({ /* initial values */ });
const [submitting, setSubmitting] = useState(false);
const [error, setError] = useState('');

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitting(true);
  setError('');

  try {
    await apiClient.post('/endpoint', formData);
    // Success - redirect or show message
    router.push('/success-page');
  } catch (err: any) {
    setError(err.response?.data?.message || 'Submission failed');
  } finally {
    setSubmitting(false);
  }
};

return (
  <form onSubmit={handleSubmit}>
    {error && <Alert variant="error">{error}</Alert>}
    {/* form fields */}
    <Button type="submit" loading={submitting} disabled={submitting}>
      Submit
    </Button>
  </form>
);
```

---

## WebSocket Integration

```typescript
import { wsService } from '@/lib/websocket';

// In useEffect
useEffect(() => {
  // Subscribe to events
  const handleUpdate = (data: any) => {
    // Update your state
    setData(prev => prev.map(item => 
      item.id === data.id ? { ...item, ...data } : item
    ));
  };

  wsService.onApplicationUpdate(handleUpdate);

  // Cleanup
  return () => {
    wsService.off('application:update', handleUpdate);
  };
}, []);
```

---

## Admin Stats Fetching

```typescript
const [stats, setStats] = useState<any>(null);

const loadStats = async () => {
  try {
    const [usersRes, internshipsRes, applicationsRes] = await Promise.all([
      apiClient.get('/admin/users'),
      apiClient.get('/admin/internships'),
      apiClient.get('/admin/applications'),
    ]);

    // ✅ Array safety for each response
    const users = Array.isArray(usersRes.data) 
      ? usersRes.data 
      : (usersRes.data?.data || []);
    
    const internships = Array.isArray(internshipsRes.data) 
      ? internshipsRes.data 
      : (internshipsRes.data?.data || []);
    
    const applications = Array.isArray(applicationsRes.data) 
      ? applicationsRes.data 
      : (applicationsRes.data?.data || []);

    // Calculate stats
    setStats({
      totalUsers: users.length,
      totalInternships: internships.length,
      totalApplications: applications.length,
      // ... more stats
    });
  } catch (error) {
    console.error('Failed to load stats:', error);
  }
};
```

---

## Debugging Tips

### 1. Check API Response Format
```typescript
const response = await apiClient.get('/endpoint');
console.log('Response structure:', response.data);
console.log('Is array?', Array.isArray(response.data));
```

### 2. Check Auth Token
```javascript
// In browser console
localStorage.getItem('accessToken')
```

### 3. Check WebSocket Connection
```javascript
// In browser console
// Should see connection logs in network tab (WS)
```

### 4. Verify Environment Variables
```typescript
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
console.log('WS URL:', process.env.NEXT_PUBLIC_WS_URL);
```

---

## Common Errors & Solutions

### Error: "Cannot read property 'map' of undefined"
**Solution**: Add array safety check
```typescript
const data = response.data;
const items = Array.isArray(data) ? data : (data?.data || []);
```

### Error: "Network Error" or CORS
**Solution**: Check backend CORS configuration
```typescript
// Backend should allow:
origin: 'http://localhost:3000'
credentials: true
```

### Error: "401 Unauthorized"
**Solution**: Check token and auto-refresh
```typescript
// Already implemented in apiClient interceptor
// Token should auto-refresh on 401
```

### Error: Profile update fails
**Solution**: Use correct endpoint
```typescript
// Student: PUT /users/profile/student
// Employer: PUT /users/profile/employer
```

---

**Last Updated**: January 29, 2026  
**Status**: All patterns tested and verified ✅
