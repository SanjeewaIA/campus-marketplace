# Campus Marketplace - Mobile App Development

> **Course Unit:** Emerging Trends in Computer Science (CSC2023)  
> **Institution:** Department of Computer Science, Faculty of Science, University of Jaffna  
> **Project Type:** Group Assignment  

---

## 📖 Project Overview
**Campus Marketplace** is a mobile application built using **React Native (Expo SDK 57)** and **TypeScript**. It is designed specifically for university students to buy, sell, and exchange items safely within their campus community. 

Our team took the core baseline project and extended it by implementing **5 major, distinct features** covering analytics, inventory state handling, real-time messaging, form validations, and listing CRUD management.

---

## 👥 Group Members & Contributions

| Member Name | Student Reg No | GitHub Username | Role & Implemented Feature |
| :--- | :--- | :--- | :--- |
| **Sanjeewa I.A.** | 2023/CSC/067 | [@SanjeewaIA](https://github.com/SanjeewaIA) | **Team Leader & Seller Dashboard** |
| **Kavindi Heshara** | 2023/CSC/XXX | [@Kavindi-hesh](https://github.com/Kavindi-hesh) | **Mark as Sold Feature** |
| **Sahan Dasanayaka** | 2023/CSC/XXX | [@Sahan-Dasanayaka](https://github.com/Sahan-Dasanayaka) | **Buyer/Seller Messaging System** |
| **Anuththara Kulathunga** | 2023/CSC/XXX | [@AnnKulathunga](https://github.com/AnnKulathunga) | **Form Validation & Image Preview** |
| **Yasitha Rukshan** | 2023/CSC/XXX | [@YasithaRukshan55](https://github.com/YasithaRukshan55) | **Listing CRUD & Explore Sorting** |

---

## ✨ Features Implemented

### 1. Seller Dashboard & Performance Analytics (Sanjeewa)
- **Revenue & Value Metrics:** Displays live calculations for Total Revenue Earned (in LKR) and Total Inventory Value.
- **Inventory Breakdown:** Real-time metrics for Active Listings vs. Sold items, along with category-wise item distribution.
- **Quick Navigation:** Instant action shortcuts to create listings, manage user items, or browse the marketplace.

### 2. "Mark as Sold" Status Management (Heshara)
- **Listing Status Toggle:** Allows sellers to toggle their items between Available and Sold.
- **Visual Feedback:** Displays prominent `SOLD` badges on listing cards and modal detail pages.
- **Transaction Safety:** Automatically disables the "Contact Seller" button when an item is marked as Sold.

### 3. Buyer/Seller Messaging & Meetup Coordination (Sahan)
- **Interactive Chat Interface:** Real-time messaging thread between prospective buyers and sellers.
- **Campus Quick Replies:** One-tap message chips tailored for campus safety (e.g., *"Can we meet at the Main Library?"*).
- **Listing Context Banner:** Keeps the item photo, price, and pickup location pinned at the top of active chats.

### 4. Form Validation & Image Preview (Anuththara)
- **Real-Time Input Validation:** Prevents submission of incomplete listings with red alerts for title length, price, and campus location.
- **Device Image Picker:** Integrated `expo-image-picker` to select listing photos directly from the phone gallery with immediate preview.

### 5. Listing CRUD Management & Explore Sorting (Yasith)
- **Edit & Delete Listings:** Full management capability inside "My Listings" allowing sellers to update prices/titles or remove items.
- **Interactive Sort Filters:** Explore page filter bar supporting sorting by Price (Low to High, High to Low) and Date Posted (Newest First).

---

## 🛠️ Technology Stack

- **Mobile Framework:** React Native (Expo SDK 57)
- **Language:** TypeScript
- **Backend / Cloud Services:** Google Cloud Firestore & Firebase Auth
- **Native Hardware APIs:** `expo-image-picker` (Camera & Photo Library Access)
- **State Management & UI:** React Hooks (`useState`, `useEffect`, `useMemo`) & Native StyleSheet
- **Collaboration & Version Control:** Git & GitHub (Feature branch workflow, Pull Requests, Code Reviews)

---

## 🚀 How to Run the Application

### 1. Clone the Repository
git clone https://github.com/SanjeewaIA/campus-marketplace.git
cd campus-marketplace

### 2. Install Dependencies
npm install

### 3. Start Development Server
npm run web

*(Or run `npx expo start` to test on a physical mobile device using the Expo Go app).*

---

## 📹 Video Demonstration
- **Video Link:** [Insert your YouTube or Google Drive link here]
- **Duration:** 5 - 8 minutes
- **Content:** Team introduction, feature overview, live roleplay demonstration, technical architecture, and GitHub branch review.