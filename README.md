# StudentMart

A React-based student marketplace app that lets students browse, search, and favorite items for sale.

## 🎯 About:

StudentMart is a fourth-semester BCA project built to give students a simple platform to buy and sell items within their college community.
within the collage phriphery

## ✅ Current Features

- Product browsing
- Search
- Product detail view
- Add product
- Remove Product


## 🚧 In Progress / Upcoming

- Filters (category, price, etc.)
- Profile page
- Backend integration

## 🛠️ Technologies Used

- React
- JavaScript (JSX)
- PHP

## 🚀 Getting Started

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open the local URL shown in the terminal to view the app in your browser.

## Email and password recovery

Registration sends a welcome email, and the login page includes a one-hour password reset link. The backend uses PHP's `mail()` function, so XAMPP must be connected to an SMTP relay before messages can be delivered.

1. In `php.ini`, enable the mail settings and set the SMTP host and port for your provider.
2. Configure XAMPP's `sendmail.ini` with the provider's SMTP username, password, host, and port. Gmail requires an App Password, not your normal password.
3. Restart Apache after changing these files.
4. Set `STUDENT_MART_MAIL_FROM` to an address accepted by your SMTP provider.
5. Set `STUDENT_MART_APP_URL` to the frontend URL. For local Vite development, use `http://localhost:5173`.

The `password_resets` table is included in `backend/databse/db.sql`. The auth endpoint also creates it automatically for existing installations.

## 📌 Notes

This project is under active development — backend and remaining pages will be added in upcoming stages.

## 👩‍💻 Author

Sarishma
