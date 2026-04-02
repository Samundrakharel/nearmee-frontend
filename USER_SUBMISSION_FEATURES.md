# User Submission Features Integration Guide

## Overview
This document describes the user-submission features integrated into the NearMe frontend, allowing authenticated users to contribute content by:
1. Writing reviews for businesses
2. Uploading menu photos
3. Submitting new business listings

## Authentication Requirements

All user submission features require authentication. If a user is not logged in:
- They will see a login prompt
- After the prompt, they'll be redirected to the login page
- Non-authenticated users can only **view** content, not submit

---

## 1. Write a Review

### API Endpoint
```http
POST /api/user-reviews/
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "business": 1,
  "rating": 5,
  "title": "Amazing experience!",
  "content": "The food was incredible.",
  "is_verified_visit": true,
  "visit_date": "2026-03-28"
}
```

### Frontend Implementation
- **Component**: `AddReviewButton.js`
- **Location**: Business detail page → Overview tab
- **Features**:
  - Star rating selection (1-5 stars)
  - Review title and content fields
  - Verified visit checkbox
  - Visit date picker
  - Login validation before submission

### Usage
```jsx
<AddReviewButton 
  businessId={business.id} 
  businessSlug={business.slug}
  onReviewAdded={() => refreshReviews()}
/>
```

---

## 2. Upload Menu Photo

### API Endpoint
```http
POST /api/user-menu-photos/
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: multipart/form-data

FormData:
- business: 1
- photo: [image file]
- caption: "Delicious pasta!"
```

### Frontend Implementation
- **Component**: `AddPhotoButton.js`
- **Location**: Business detail page → Overview tab
- **Features**:
  - File upload with image/* support
  - Optional caption field
  - Login validation before upload
  - Loading state during upload

### Usage
```jsx
<AddPhotoButton 
  businessId={business.id} 
  businessSlug={business.slug}
  onPhotoAdded={() => refreshPhotos()}
/>
```

---

## 3. Submit New Business

### API Endpoint
```http
POST /api/user-business-submissions/
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: multipart/form-data

FormData:
- business_name: "My Coffee Shop"
- business_type: "cafe"
- description: "Artisan coffee and fresh pastries"
- address: "123 Main Street"
- phone: "+1-555-123-4567"
- email: "hello@mycoffee.com"
- city: "Los Angeles"
- state: "CA"
- country: "United States"
- logo: [upload file]
- cover_photo: [upload file]
```

### Frontend Implementation
- **Page**: `/submit-business/page.js`
- **Access**: Via header button or business detail page button
- **Features**:
  - Complete business information form
  - Logo and cover photo uploads
  - Success confirmation page
  - Redirect to homepage after successful submission

### Access Points
1. **Header Button**: Logged-in users see "Submit Business" in the header
2. **Business Detail Page**: "Submit a Business" button in the Overview tab

---

## Component Architecture

### Modal System
- **Component**: `Modal.js`
- **Purpose**: Reusable modal dialog for all submission forms
- **Features**:
  - Overlay with click-outside-to-close
  - Customizable title and content
  - Responsive design

### User Actions Container
- **Component**: `UserSubmissionActions.js`
- **Purpose**: Groups all user submission buttons
- **Location**: Business detail page Overview tab
- **Features**:
  - Authentication checking
  - Login prompts with redirect
  - Coordinated button layout

---

## API Integration

### Updated API Functions (`lib/api.js`)

```javascript
// Upload menu photo
export async function uploadMenuPhoto(formData)

// Submit review
export async function submitReview(reviewData)

// Submit business
export async function submitBusiness(formData)
```

### Authentication Handling
All submission functions automatically:
1. Check for stored JWT token in localStorage
2. Attach `Authorization: Bearer {token}` header
3. Handle authentication errors gracefully

---

## User Flow

### Authenticated User
1. Click "Write a Review" / "Add Photo" / "Submit Business"
2. Fill out the form
3. Submit
4. See success message
5. Content is submitted for review/approval

### Non-Authenticated User
1. Click any submission button
2. See login prompt modal
3. After 2 seconds, redirected to `/login`
4. Can return to view content but not submit

---

## Styling

All components use inline styles matching the existing design system:
- Primary color: `var(--color-primary)`
- Border radius: `8px` (consistent with app)
- Font weights and sizes aligned with existing components
- Responsive layouts for mobile/desktop

---

## Error Handling

Each component includes:
- Form validation (required fields, file uploads)
- API error display
- Loading states during submission
- User-friendly error messages

Example error display:
```jsx
{error && (
  <div style={{
    padding: '12px',
    background: '#fee2e2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    color: '#dc2626',
    marginBottom: '16px',
  }}>
    {error}
  </div>
)}
```

---

## Testing Checklist

### Before Testing
- [ ] Backend API endpoints are running
- [ ] User registration/login is functional
- [ ] JWT tokens are being stored correctly

### Review Submission
- [ ] Login required prompt appears for non-authenticated users
- [ ] Form validation works (required fields)
- [ ] Star rating selection works
- [ ] Review submits successfully with valid data
- [ ] Success message displays
- [ ] Error handling for invalid data

### Photo Upload
- [ ] Login required prompt appears for non-authenticated users
- [ ] File picker accepts images only
- [ ] Caption field is optional
- [ ] Photo uploads successfully
- [ ] Success message displays
- [ ] Loading state shows during upload

### Business Submission
- [ ] Login required prompt appears for non-authenticated users
- [ ] All required fields validated
- [ ] File uploads work (logo, cover photo)
- [ ] Success page displays after submission
- [ ] Redirect to homepage works
- [ ] Header button visible for logged-in users

---

## Future Enhancements

Potential improvements:
1. **Real-time preview** of uploaded photos
2. **Draft saving** for long forms
3. **Submission history** for users to track their contributions
4. **Admin approval workflow** integration
5. **Email notifications** when submissions are approved/rejected
6. **Image compression** before upload
7. **Multiple photo upload** in single request
8. **Rich text editor** for review content
9. **Rating analytics** dashboard for business owners

---

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify API endpoint responses in Network tab
3. Ensure JWT token is valid and not expired
4. Check backend logs for server-side errors
