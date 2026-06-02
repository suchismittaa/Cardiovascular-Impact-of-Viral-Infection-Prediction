# 🫀 Precise Prediction of Cardiovascular Impact in Patients with Viral Infections Using Intelligent Analytics

[![Published](https://img.shields.io/badge/Published-Springer_Nature-00629B?style=for-the-badge)](https://trebuchet.public.springernature.app/get_content/29153459-c753-4b6a-b0a7-b1f61a02fe4e)
[![Conference](https://img.shields.io/badge/Conference-ICCCNet--2025-orange?style=for-the-badge)](https://trebuchet.public.springernature.app/get_content/29153459-c753-4b6a-b0a7-b1f61a02fe4e)
[![University](https://img.shields.io/badge/KIIT-Bhubaneswar-green?style=for-the-badge)](https://kiit.ac.in)
[![Python](https://img.shields.io/badge/Python-3.x-blue?style=for-the-badge&logo=python)](https://python.org)
[![Accuracy](https://img.shields.io/badge/Model_Accuracy-86.9%25-brightgreen?style=for-the-badge)](#results)

> 📄 **Published in Springer Nature** — Proceedings of the Fifth International Conference on Computing and Communication Networks (ICCCNet-2025), Manchester Metropolitan University, UK

---

## 📌 About This Project

Cardiovascular diseases (CVDs) are among the leading causes of mortality worldwide. While traditional risk factors like smoking, diabetes, and hypertension are well-studied, the **long-term cardiovascular impact of viral infections** is often overlooked by conventional clinical tools.

This research bridges that gap by developing a **machine learning-based predictive model** using the **Random Forest algorithm** to assess cardiovascular risk in patients with a history of viral infections — enabling **early diagnosis** and **timely medical intervention**.

---

## 👩‍💻 Authors

| Name | Roll No. |
|---|---|
| **Suchismita Sarkar** | 2206222 |


**Institution:** School of Computer Engineering, KIIT Deemed to be University, Bhubaneswar, Odisha — April 2025

---

## 📁 Repository Structure

```
Cardiovascular-Impact-of-Viral-Infection-Prediction/
├── Research_Paper.ipynb                          # Jupyter Notebook — full ML pipeline
├── heart.csv                                     # Dataset used for training & evaluation
├── Final_Project_Report.pdf                      # Complete B.Tech project report
├── Suchismita Sarkar_120.pdf                     # Individual contribution & certificate
└── README.md                                     # You are here
```

> ⚠️ **Note:** `Report-format.doc` is a formatting template only and is **not part of the research content**.

---

## 🧠 Problem Statement

Traditional clinical diagnostic methods — blood tests, ECGs, and serological tests — focus on well-known CVD risk factors but **fail to account for the lasting cardiovascular effects of past viral infections**. This leaves a critical diagnostic gap where high-risk patients go undetected until serious complications arise.

**This project addresses that gap** by building a data-driven predictive model that incorporates viral infection history alongside clinical indicators to identify at-risk individuals early.

---

## ⚙️ Methodology

### 1. Data Collection & Preprocessing
- Dataset: `heart.csv` — patient records including viral infection history and cardiovascular health indicators
- Features: Age, blood pressure, cholesterol level, heart rate, prior infection history
- Steps: Data cleaning, normalization, feature scaling, handling missing values

### 2. Models Evaluated

| Algorithm | Accuracy | Recall | F1-Score |
|---|---|---|---|
| **Random Forest** ⭐ | **0.906** | **0.844** | **0.879** |
| Logistic Regression | 0.852 | 0.844 | 0.857 |
| Naive Bayes | 0.869 | 0.844 | 0.871 |
| Support Vector Machine | 0.869 | 0.844 | 0.871 |
| Decision Tree | 0.754 | 0.656 | 0.737 |

### 3. Model Selection
**Random Forest** was selected as the best model due to:
- Highest accuracy among all tested algorithms
- Strong ability to handle high-dimensional, complex datasets
- Reduced overfitting through ensemble of multiple decision trees
- Optimal performance on AUC-ROC curve for distinguishing high-risk vs low-risk patients

### 4. Hyperparameter Tuning
Grid search was applied to optimize the number of trees, tree depth, and split criteria.

### 5. Evaluation Metrics
Accuracy · Precision · Recall · F1-Score · AUC-ROC · Confusion Matrix

---

## 📊 Results

The **Random Forest model achieved 86.9% accuracy** (90.6% F1-score), outperforming all other algorithms. The model demonstrated strong capability in:
- Detecting high-risk cardiovascular patients from viral infection history
- Generalizing across diverse patient populations
- Minimizing false negatives — critical in a healthcare context

---

## 🛠️ Tech Stack

![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)
![Scikit-learn](https://img.shields.io/badge/Scikit--learn-F7931E?style=flat-square&logo=scikit-learn&logoColor=white)
![Pandas](https://img.shields.io/badge/Pandas-150458?style=flat-square&logo=pandas&logoColor=white)
![NumPy](https://img.shields.io/badge/NumPy-013243?style=flat-square&logo=numpy&logoColor=white)
![Matplotlib](https://img.shields.io/badge/Matplotlib-11557C?style=flat-square)
![Seaborn](https://img.shields.io/badge/Seaborn-4C9BE8?style=flat-square)
![Jupyter](https://img.shields.io/badge/Jupyter-F37626?style=flat-square&logo=jupyter&logoColor=white)

---

## 🚀 Getting Started

### Prerequisites
```bash
pip install pandas numpy scikit-learn matplotlib seaborn jupyter
```

### Run the Notebook
```bash
# Clone the repository
git clone https://github.com/suchismittaa/Cardiovascular-Impact-of-Viral-Infection-Prediction.git

# Navigate to project folder
cd Cardiovascular-Impact-of-Viral-Infection-Prediction

# Launch Jupyter Notebook
jupyter notebook Research_Paper.ipynb
```

---

## 📜 Publication

> **Precise Prediction of Cardiovascular Impact in Patients with Viral Infections Using Intelligent Analytics**
>
> Suchismita Sarkar, Simran Kumari, Srishti Sawarna
>
> *Proceedings of the Fifth International Conference on Computing and Communication Networks (ICCCNet-2025)*
> Published by **Springer Nature** | Manchester Metropolitan University, UK | 2025

[![Read the Paper](https://img.shields.io/badge/📄_Read_Full_Paper-Springer_Nature-00629B?style=for-the-badge)](https://trebuchet.public.springernature.app/get_content/29153459-c753-4b6a-b0a7-b1f61a02fe4e)

---

## 🔮 Future Scope

- Expand dataset to cover more diverse patient demographics
- Incorporate genetic risk factors and lifestyle data for richer predictions
- Explore deep learning (neural networks) for improved pattern recognition
- Deploy as a real-time clinical risk scoring tool for healthcare providers
- Build an interpretable model interface for use by medical professionals

---

## 📄 Standards Followed

- **Design:** IEEE 1012 (Verification & Validation), IEEE 1471 (System Architecture)
- **Coding:** PEP 8 Python standards, modular programming, GitHub version control
- **Testing:** ISO 25010 software quality standards, cross-validation, edge case testing

---

## 📬 Contact

**Suchismita Sarkar**
📧 ssarkar4483@gmail.com |
🌍 West Bengal, India | [LinkedIn](#) | [GitHub](https://github.com/suchismittaa)

---

<p align="center">
  Made with ❤️ for better healthcare — KIIT Bhubaneswar, 2025
</p>
