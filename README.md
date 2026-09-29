# Diabetes Clinical Decision Support System

## AI-Assisted Diabetes Risk Prediction for Clinical Decision Support in Ghana

This project presents the development of an Artificial Intelligence-based Clinical Decision Support System (CDSS) for diabetes risk prediction in Ghana.

The system combines a web-based clinical application, a machine learning model, explainable artificial intelligence (XAI), and a PostgreSQL database. The purpose of the system is to provide healthcare professionals with AI-assisted information that can support diabetes risk assessment and clinical decision-making.

The system is designed to support, not replace, the judgement of healthcare professionals.

---

## Live System

### Clinical Application

https://diabetes-cdss-ghana-thesis-worl-3.onrender.com/login

### Backend API

https://diabetes-cdss-ghana-thesis-worl-2.onrender.com

### API Documentation

https://diabetes-cdss-ghana-thesis-worl-2.onrender.com/docs

---

## Project Objective

The objective of this project is to develop an AI-assisted clinical decision support system that can generate diabetes risk-support information from patient characteristics, clinical measurements, lifestyle factors, dietary information, and physical activity.

The system also incorporates Explainable Artificial Intelligence (XAI) to provide information about the contribution of individual features to the model output.

---

## Research Question

**How can an Artificial Intelligence model improve the accuracy and transparency of diabetes risk prediction in Clinical Decision Support Systems in Ghana?**

---

## Main Features

The system provides the following functionality:

- Healthcare user registration and authentication
- Secure login using JWT-based authentication
- Patient registration and management
- Patient profiles
- Clinical assessment creation
- Automatic Body Mass Index (BMI) calculation
- Automatic mean blood pressure calculation
- Lifestyle and dietary assessment
- Physical activity assessment
- AI-based diabetes risk prediction
- Model output score
- Classification based on the model threshold
- Explainable AI using SHAP
- Individual feature contribution explanations
- Assessment history
- PostgreSQL database storage
- RESTful FastAPI backend
- React-based clinical frontend

---

## System Architecture

The system consists of three main components:

```text
                    USER
                     |
                     v
          +----------------------+
          |    React Frontend    |
          |      Render          |
          +----------+-----------+
                     |
                     | HTTPS / REST API
                     v
          +----------------------+
          |    FastAPI Backend   |
          |       Render         |
          +----------+-----------+
                     |
          +----------+-----------+
          |                      |
          v                      v
+------------------+    +----------------------+
| Machine Learning|    | PostgreSQL Database  |
|     Model       |    |      Supabase        |
+------------------+    +----------------------+
          |
          v
+----------------------+
| Explainable AI / SHAP|
+----------------------+
