The Simple Budget Tracker is a personal finance application that allows users track their income and expenses
With features like adding transactions, category filtering, chart display and CSV data export
It is constructed with Node.js, MongoDB and Express. While providing a clear and easy to use user interface
The project seeks to improve the user's understanding of financial tracking.

FEATURES:

Transaction Tracking: Allows users to add and manage their income and expenses
Category Filters: Filter transactions by categories (e.g., income, expense)
Charts: Visual representation of income vs expenses using Chart.js
CSV Export: Export transaction data to a CSV file
Responsive Design: Works well on both desktop and mobile devices
Dark Mode: Toggle between light and dark themes
User Authentication: Log in and sign up functionality (for advanced version)

INSTALLATION

Prequisites

Make sure you have the following installed:
Node.js
MongoDB

STEPS:

Clone the repository:
git clone https://github.com/aaravvvs/simple-budget-tracker.git

Navigate to the project directory:
cd simple-budget-tracker

Install dependencies:
npm install

Set up .env file for environment variables:
PORT: Port where the app will run
MONGODB_URI: MongoDB connection string (e.g., mongodb://localhost:27017/simple-budget-tracker)

Start the server:
npm start

Visit the application in your browser at:
http://localhost:3000

USAGE:

Add Transaction: Input the type of transaction (Income or Expense), the amount, category and date
Filters: Filter transactions by category or date
Export Data: Export transaction data to a CSV file
Charts: View a comparison of income vs expenses over time

Technical Details:

Frontend: HTML, CSS, JavaScript and Chart.js for rendering charts
Backend: Node.js with Express, MongoDB for database management

Future Improvements

Implement user authentication and authorization with session management
Improve UI/UX design with more interactive elements


