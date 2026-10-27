# Student Records Management System - User Guide

## 🎓 Welcome

This system helps you manage student information, enrollment records, and student ID assignments efficiently.

## 🚀 Quick Start

### Accessing the System
1. Open your browser and navigate to the application URL
2. Log in with your credentials
3. You'll land on the **Student Records** page by default

### User Roles & Permissions

#### Admin & Staff
- ✅ View all student records
- ✅ Add new students
- ✅ Edit student information
- ✅ Delete student records
- ✅ Search and filter records

#### Other Users
- ✅ View student records (read-only)
- ❌ Cannot add, edit, or delete students

## 📋 Main Features

### 1. Dashboard Overview

When you open the Student Records page, you'll see:

**Summary Cards** (at the top):
- **Total Students**: Total number of registered students
- **Verified Students**: Students with verified status
- **Pending Verification**: Students awaiting verification
- **Active ID Records**: Students with assigned ID numbers

### 2. Search & Filter Students

**Search Bar**
- Type student number or name
- Searches across: Student Number, First Name, Middle Name, Last Name
- Results update automatically as you type

**Filter Options**
- **Course/Program**: Filter by academic program (e.g., Computer Science)
- **Department**: Filter by college/department
- **Year Level**: Filter by year (1st, 2nd, 3rd, 4th Year)
- **Status**: Filter by verification status (Verified, Pending, Unverified)

**Tips**:
- You can use multiple filters together
- Click "Clear all filters" to reset
- Filters work with search simultaneously

### 3. Student List Table

The table shows:
- **Student Info**: Avatar initials, full name, student number
- **ID Number**: Auto-assigned unique identifier (e.g., STUD-2026-000001)
- **Academic Info**: Program, department, year, section
- **Contact**: Email and phone number
- **Status**: Verification status badge
- **Actions**: View, Edit, Delete buttons

**Understanding Status Badges**:
- 🟢 **Verified**: Student has been verified
- 🟡 **Pending**: Awaiting verification
- ⚪ **Unverified**: Not yet verified

### 4. Adding a New Student

**Steps**:
1. Click the **"Add Student"** button (top right)
2. Fill in the form:

   **Personal Information** (Blue section):
   - Student Number * (required, must be unique)
   - First Name * (required)
   - Middle Name (optional)
   - Last Name * (required)
   - Email Address (optional)
   - Contact Number (optional)

   **Academic Information** (Green section):
   - Course/Program * (required)
   - Department * (required)
   - Year Level * (required)
   - Section * (required)
   - Verification Status * (required: Pending/Verified/Unverified)

3. Click **"Create Student"**
4. Student ID Number is **automatically generated** (e.g., STUD-2026-000001)

**Important**:
- Fields marked with * are required
- Student Number must be unique
- Student ID Number is auto-assigned (you cannot edit it)

### 5. Viewing Student Details

**Steps**:
1. Find the student in the table
2. Click the blue **"View"** button
3. A modal opens showing:
   - Personal Information card (name, numbers, contact)
   - Academic Information card (program, department, year, section, status)

**Actions from View Modal**:
- Click **"Edit Student"** to modify details
- Click **"Delete Record"** to remove the student
- Click **"Close"** to return to the list

### 6. Editing Student Information

**Steps**:
1. Click the green **"Edit"** button on any student row
   - OR click **"Edit Student"** from the View modal
2. The form opens with pre-filled information
3. Modify any fields you need to change
4. Click **"Save Changes"**

**Notes**:
- All fields can be edited except the Student ID Number
- The system validates your changes before saving
- Validation errors appear below the relevant field

### 7. Deleting a Student Record

**Steps**:
1. Click the red **"Delete"** button on any student row
2. A confirmation dialog appears with a warning
3. Review the student name and number
4. Click **"Delete Record"** to confirm
   - OR click **"Cancel"** to abort

**Important Information**:
- Records are **soft deleted** (not permanently removed)
- Deleted records are hidden from the list but retained in the database
- This protects data integrity and related information
- Student ID Numbers remain unique even after deletion

### 8. Pagination

**Navigating Pages**:
- View 15 students per page
- See current page and total pages at the bottom
- Click **"Previous"** or **"Next"** to navigate
- Page status shows: "Page X of Y • Z total students"

## 🆔 Student ID Numbers

### How It Works
- **Automatic Generation**: Every new student gets a unique ID
- **Format**: STUD-YYYY-XXXXXX
  - STUD = Prefix
  - YYYY = Current year (e.g., 2026)
  - XXXXXX = Sequential number (e.g., 000001, 000002)
- **Example**: STUD-2026-000001, STUD-2026-000002

### Key Features
- Cannot be edited or changed
- Unique across all students
- Resets sequence each year
- Visible in student list and profile
- Generated instantly when student is created

## 🔍 Search Tips

### Effective Searching
- **Single Word**: Type a name or partial student number
- **Multiple Words**: Type full name (e.g., "John Doe")
- **Student Number**: Type exact or partial number

### Examples
- Search `"2026"` → Shows all students with 2026 in their number
- Search `"John"` → Shows all Johns (first, middle, or last name)
- Search `"Computer Science"` → Use Program filter instead for better results

## 📱 Responsive Design

The system works on:
- 💻 **Desktop**: Full table view with all columns
- 📱 **Tablet**: Optimized 2-column layouts
- 📱 **Mobile**: Single-column, stacked cards

## ⚠️ Important Notes

### Data Entry
- Always double-check student numbers before saving
- Student numbers cannot be changed after creation (must be unique)
- Email addresses must be valid format
- Required fields are marked with red asterisk (*)

### Permissions
- If you see "View-Only Access", you cannot make changes
- Contact your administrator for elevated permissions
- Disabled buttons indicate restricted actions

### Best Practices
1. **Before Adding**: Check if student already exists using search
2. **Before Deleting**: Verify you're deleting the correct student
3. **Data Quality**: Use consistent formatting (e.g., "1st Year" not "First Year")
4. **Verification**: Update status to "Verified" after confirming information

## 🆘 Troubleshooting

### Common Issues

**"Student number already exists"**
- The student number must be unique
- Check if the student is already in the system
- Use search to find existing records

**Cannot edit/delete students**
- Check your user role (must be Admin or Staff)
- Look for "View-Only Access" notice
- Contact administrator for permissions

**Search not working**
- Wait a moment (250ms delay for performance)
- Try different keywords
- Use filters instead of search for specific criteria

**Changes not saving**
- Check for validation error messages (red text)
- Ensure all required fields are filled
- Verify internet connection

### Getting Help
- Check field error messages for specific issues
- Green success messages confirm actions worked
- Red error messages indicate what went wrong

## 📊 Reports & Statistics

### Available Metrics
- Total student count
- Verification status breakdown
- Students per program (via filtering)
- Students per year level (via filtering)
- Students per department (via filtering)

### Viewing Statistics
1. Use the summary cards for overall numbers
2. Apply filters to see specific subsets
3. Check pagination info for filtered results

## 🎯 Workflow Examples

### Example 1: Enrolling a New Student
1. Click "Add Student"
2. Enter student number (e.g., 2026-12345)
3. Fill in name: John, M., Doe
4. Enter email: john.doe@university.edu
5. Select program: Computer Science
6. Select department: College of Computer Studies
7. Select year: 1st Year
8. Enter section: A
9. Set status: Pending
10. Click "Create Student"
11. ✅ Student created with auto-assigned ID: STUD-2026-000051

### Example 2: Verifying a Student
1. Search for the student by name or number
2. Click "Edit" on their row
3. Change "Verification Status" to "Verified"
4. Click "Save Changes"
5. ✅ Status badge turns green

### Example 3: Finding All CS Students in 3rd Year
1. Clear any existing filters
2. Select "Computer Science" from Program dropdown
3. Select "3rd Year" from Year Level dropdown
4. View filtered results
5. Navigate pages if needed

## 💡 Pro Tips

1. **Use Keyboard**: Tab through form fields for faster data entry
2. **Bookmark Filters**: URLs update with filters - bookmark common searches
3. **Bulk Operations**: Use filters to identify groups, then process individually
4. **Data Accuracy**: Verify student information before marking as "Verified"
5. **Regular Reviews**: Periodically check "Pending" students to update their status

## 🔒 Data Security

- All data is stored securely in the database
- Role-based access controls protect sensitive information
- Soft deletes preserve data integrity
- Session-based authentication ensures secure access

## 📞 Support

For technical assistance or feature requests:
- Contact your system administrator
- Refer to the technical documentation: `STUDENT_RECORDS_FEATURE.md`

---

**Version**: 1.0  
**Last Updated**: October 2026  
**System**: Student Records Management Module
