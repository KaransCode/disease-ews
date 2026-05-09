# 🏥 Disease Outbreak Early Warning System (CodeVista v1.0)

## 📌 Project Overview
An AI-powered, full-stack web platform designed to predict and track disease outbreaks (Dengue, Malaria, Cholera, etc.) across 22 districts in Punjab. By analyzing historical health data and real-time environmental factors, the system generates a 0-100 risk score to provide health officials with a critical **48-72 hour early warning** before outbreaks peak.

## 🚀 Key Selling Points (For Portfolios & External Showcasing)

*   **Predictive ML Engine:** Implemented a robust Machine Learning pipeline using a Voting Classifier (combining Random Forest and XGBoost) to achieve **~85.6% accuracy** in predicting outbreak probabilities based on 7-day rolling averages and weather anomalies.
*   **End-to-End System Integration:** Built a fully integrated architecture where 12 React components communicate seamlessly with 11 Flask RESTful API endpoints. Real-time data flows directly from the SQLite database and ML prediction engine to the frontend, eliminating the need for hardcoded mock data.
*   **Interactive Dual Dashboards:**
    *   **Analytics Dashboard:** Features real-time statistics cards, live ML model performance metrics, disease breakdown charts, and a side-by-side district comparison tool.
    *   **Map Dashboard:** Integrates an interactive Leaflet map providing a color-coded, geographical visualization of risk levels across districts.
*   **Automated Alerting System:** Engineered a proactive notification system using the Twilio API to automatically trigger SMS and SMTP email alerts when a district crosses the "High Risk" threshold.
*   **Robust Data Engineering:** Built pipelines to ingest data from OpenWeatherMap, perform feature engineering on the fly, and store aggregated metrics using an automated scheduler.

## 🛠️ Extracted Technical Terms & Keywords (For Resume/ATS)

**Frontend Engineering:**
*   React.js
*   Component-Based Architecture
*   Interactive UI/UX
*   Axios (API Integration)
*   Leaflet Maps (Geospatial Visualization)
*   Graceful Degradation (Fallback states)

**Backend & Architecture:**
*   Python (Flask)
*   RESTful API Development
*   SQLite Database Architecture
*   APScheduler (Automated Jobs/Batch Processing)
*   Modular System Architecture

**Data Science & Machine Learning:**
*   Predictive Modeling & Analytics
*   Ensemble Methods (Voting Classifier)
*   XGBoost & Scikit-Learn (Random Forest)
*   Feature Engineering (Rolling Averages, Anomalies)
*   Pandas & NumPy
*   Model Serialization (Joblib)
*   Model Evaluation (Accuracy, Precision, Recall, F1 Score)

**DevOps & Third-Party Integrations:**
*   Twilio API (Automated SMS)
*   OpenWeatherMap API (Data Ingestion)
*   Git Version Control

## 💡 Suggested "STAR" Bullets for Resumes
*(Situation, Task, Action, Result format)*

*   **ML Integration:** *Spearheaded the development of a predictive machine learning pipeline using Python and XGBoost/Random Forest to analyze weather anomalies and health data, achieving 85.6% prediction accuracy and enabling a 48-72 hour early warning system for disease outbreaks.*
*   **Full-Stack Development:** *Architected and deployed a full-stack web application integrating a Flask RESTful API with a React.js frontend, managing real-time data flows for 22 districts and resulting in a seamless, interactive dual-dashboard experience.*
*   **Automated Alerting:** *Designed and integrated an automated alerting mechanism leveraging the Twilio API to instantly notify health officials via SMS and email when dynamic risk thresholds were breached, improving emergency response times.*
*   **Data Visualization:** *Developed an interactive geospatial map using React and Leaflet to visualize real-time predictive risk scores, empowering users with intuitive, district-by-district health surveillance.*
