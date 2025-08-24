# 🌾 Farm Data Management System (Dehqan)

A **role-based farm data collection and management system** designed to streamline agricultural record-keeping and analytics.  
Developed as an **internship project**, this system allows administrators and field facilitators to manage farmers, crops, livestock, land usage, and farming activities efficiently.  

---


## 📘 Abstract
The **Farm Data Management System (Dehqan)** provides a structured way to collect, manage, and analyze farming data.  
It includes dashboards, analytics, and CRUD functionalities to help improve decision-making in the agricultural sector.  

**Roles Supported:**
- 👨‍💼 **Admin** – User management, analytics, and monitoring.  
- 👨‍🌾 **Field Facilitator** – Farmer data entry, livestock, crops, and farm activities.  

---

## 🌱 Introduction
Agriculture requires efficient record-keeping and data management.  
This project delivers a **web-based platform** where:
- Admins manage users and system-level analytics.  
- Field Facilitators manage farmer-level records such as land, crops, seeds, fertilizers, pesticides, irrigation, livestock, and cotton picking.  

---

## 🏗 System Overview
- **Admin Dashboard**: User CRUD, analytics overview.  
- **Facilitator Dashboard**: Farmer CRUD, farm operations, livestock, assets.  
- **Backend**: Node.js + Express.js with JWT authentication.  
- **Frontend**: HTML, CSS, Tailwind.  
- **Database**: MySQL with relational schema.  

---
## 🖥 System Architecture
The system follows a **client-server model**:
- REST API backend  
- Responsive frontend  
- Authentication/Authorization via JWT tokens & middleware  
- Role-based dashboards for admins and facilitators  

---

## ⚙️ Functional Requirements
- **User Management (Admin)**: CRUD operations, assign roles.  
- **Farmer Management**: CRUD operations on farmer profiles.  
- **Assets Management**: Combined handling of farm data + livestock.  
- **Farm Operations**: Land prep, seeds, pesticides, fertilizers, irrigation.  
- **Cotton Picking Records**: Yields, buyers, costs, and earnings.  
- **Analytics**: Role-specific dashboards with charts & statistics.  

---

## 🔑 Role-Based Access Control
- **Admin**:  
  - Full user management  
  - System-wide analytics  
  - Cannot modify farmer data  

- **Field Facilitator**:  
  - Manages all farmer-related data  
  - No access to system-level user management  

- **Authentication**: JWT tokens for secure login/session management  

---

## 🚀 Conclusion & Future Scope
The Farm Data Management System simplifies record-keeping, enhances data-driven agricultural decisions, and provides role-based dashboards.  

**Future Enhancements**:
- IoT integration (sensors for real-time farm monitoring)  
- Mobile application for field use  
- Real-time weather API integration  

---

## 🛠 Tech Stack
- **Frontend**: HTML, CSS, Tailwind CSS  
- **Backend**: Node.js, Express.js  
- **Database**: MySQL  
- **Authentication**: JWT  

---

## ⚡ Installation & Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/Zoiba-Tabassum/Farm-data-manager.git
   cd Farm-data-manager
