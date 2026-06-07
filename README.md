# 🏥 Medical Record Management System (MRMS)

A complete **Medical Record Management System (MRMS)** developed for **CareTrack Clinic** using **Node.js, Express.js, Vanilla JavaScript, HTML5, and CSS3**.

The system allows administrators and clinic staff to manage doctors, patients, medical diagnoses, and departments through a secure role-based interface.

---

# 📌 Features

* 🔐 User Authentication
* 👥 Role-Based Access Control (RBAC)
* 👨‍⚕️ Doctor Management
* 🧑‍🦱 Patient Management
* 🩺 Disease / Diagnosis Management
* 🏢 Department Management
* 📊 Dashboard Statistics
* 🔍 Search & Filter
* 📱 Responsive User Interface
* ⚡ RESTful API
* 📂 JSON File Database

---

# 🛠 Tech Stack

## Backend

* Node.js
* Express.js
* Express Router
* Middleware
* JSON File Storage
* Swagger API Documentation

## Frontend

* HTML5
* CSS3
* Vanilla JavaScript
* Fetch API
* localStorage Authentication

No external frameworks are used.

* ❌ React
* ❌ Vue
* ❌ Angular
* ❌ Bootstrap
* ❌ Tailwind CSS

---

# 📁 Project Structure

```text
MRMS/
│
├── frontend/
│   ├── login.html
│   ├── dashboard.html
│   ├── doctors.html
│   ├── patients.html
│   ├── diseases.html
│   ├── css/
│   ├── js/
│   └── assets/
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── config/
│   ├── utils/
│   └── app.js
│
├── data/
│   ├── users.json
│   ├── doctors.json
│   ├── patients.json
│   ├── diseases.json
│   └── departments.json
│
├── docs/
│   └── swagger.js
│
├── package.json
└── README.md
```

---

# 🚀 Installation

Clone the repository

```bash
git clone https://github.com/yourusername/mrms.git
```

Move into the project directory

```bash
cd mrms
```

Install dependencies

```bash
npm install
```

---

# ▶ Running the Project

Development mode

```bash
npm run dev
```

Production mode

```bash
npm start
```

Server URL

```text
http://localhost:3000
```

Swagger Documentation

```text
http://localhost:3000/api-docs
```

---

# 🔐 Authentication API

Base URL

```text
http://localhost:3000/api
```

## Login

```http
POST /api/auth/login
```

Request Body

```json
{
  "username": "admin",
  "password": "admin123"
}
```

Response

```json
{
  "token": "jwt-token",
  "role": "admin"
}
```

---

## Logout

```http
POST /api/auth/logout
```

---

# 👨‍⚕️ Doctors API

## Get all doctors

```http
GET /api/doctors
```

---

## Get doctor by ID

```http
GET /api/doctors/:id
```

---

## Create doctor

```http
POST /api/doctors
```

```json
{
  "name": "John Smith",
  "specialization": "Cardiology",
  "department": "Cardiology",
  "contact": "+998901234567"
}
```

---

## Update doctor

```http
PUT /api/doctors/:id
```

---

## Delete doctor

```http
DELETE /api/doctors/:id
```

---

# 🧑‍⚕️ Patients API

## Get all patients

```http
GET /api/patients
```

---

## Get patient by ID

```http
GET /api/patients/:id
```

Returns patient information together with assigned doctor.

---

## Create patient

```http
POST /api/patients
```

```json
{
  "name": "Ali Valiyev",
  "dob": "2001-05-15",
  "gender": "Male",
  "doctorId": 1,
  "contact": "+998991234567"
}
```

---

## Update patient

```http
PUT /api/patients/:id
```

---

## Delete patient

```http
DELETE /api/patients/:id
```

---

# 🩺 Diseases API

## Get all diseases

```http
GET /api/diseases
```

---

## Get disease by ID

```http
GET /api/diseases/:id
```

---

## Create disease record

```http
POST /api/diseases
```

```json
{
  "icdCode": "I10",
  "description": "Essential Hypertension",
  "severity": "Moderate",
  "patientId": 1
}
```

---

## Update disease

```http
PUT /api/diseases/:id
```

---

## Delete disease

```http
DELETE /api/diseases/:id
```

---

# 📊 Dashboard API

Returns overall statistics.

```http
GET /api/dashboard
```

Example Response

```json
{
  "totalDoctors": 15,
  "totalPatients": 126,
  "totalDiseases": 340
}
```

---

# 🏢 Departments API

## Get all departments

```http
GET /api/departments
```

---

# 👤 Role-Based Access Control

## Administrator

* Full Dashboard Access
* Doctor CRUD
* Patient CRUD
* Disease CRUD
* Department Management

---

## Clinician

* View Patients
* Update Patients
* View Diseases
* Update Diseases

Cannot create or delete doctors.

---

## Receptionist

* View Doctors
* View Patients
* Register New Patients

Cannot manage diseases or doctors.

---

# 🖥 Frontend Pages

| Page           | Description          |
| -------------- | -------------------- |
| login.html     | User authentication  |
| dashboard.html | Statistics dashboard |
| doctors.html   | Doctor management    |
| patients.html  | Patient management   |
| diseases.html  | Disease management   |

---

# 🎨 UI Design System

## Colors

| Element        | Color   |
| -------------- | ------- |
| Sidebar        | #0f172a |
| Background     | #f1f5f9 |
| Primary        | #2563eb |
| Success        | #10b981 |
| Danger         | #ef4444 |
| Warning        | #f59e0b |
| Card           | #ffffff |
| Text Primary   | #1e293b |
| Text Secondary | #64748b |

---

## Typography

* Font Family: **Inter**
* Heading Weight: **600**
* Body Weight: **400**

---

## Components

* Fixed Sidebar
* Top Navigation
* Dashboard Cards
* Search Bar
* Sortable Tables
* Modal Forms
* Toast Notifications
* Delete Confirmation Dialog
* Loading Spinner

---

# 🔒 Authorization

All protected endpoints require:

```http
Authorization: Bearer <token>
```

The authentication token is stored inside **localStorage** after successful login.

---

# 🧪 Testing

The system has been tested for:

* Authentication
* Authorization
* CRUD Operations
* API Responses
* Form Validation
* Responsive Design
* Role-Based Access Control
* User Experience
* Compatibility
* Functionality

---

# 📈 Future Improvements

* SQL Database Integration
* JWT Refresh Tokens
* File Upload Support
* Medical Reports Export (PDF)
* Appointment Scheduling
* Audit Logs
* Email Notifications
* Advanced Analytics Dashboard
* Mobile Application
* Docker Deployment

---

# 📄 License

This project was developed for educational purposes as part of a **Medical Record Management System (MRMS)** project for **CareTrack Clinic**.

---

# 👨‍💻 Author

**Davron Normamatov**

Medical Record Management System (MRMS)

Built with ❤️ using Node.js, Express.js, HTML5, CSS3, and Vanilla JavaScript.
