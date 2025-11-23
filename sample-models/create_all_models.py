#!/usr/bin/env python3
"""
Create 4 working ML models for testing
"""
import os
import pickle

import numpy as np
from sklearn.datasets import (load_breast_cancer, load_iris, load_wine,
                              make_classification)
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier

# Create models directory if it doesn't exist
os.makedirs("/app/models_ready", exist_ok=True)

print("=" * 60)
print("Creating 4 ML Models for Testing")
print("=" * 60)

# ============================================================
# MODEL 1: Iris Classification (Random Forest)
# ============================================================
print("\n1️⃣  Creating Iris Classifier (Random Forest)...")
iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(
    iris.data, iris.target, test_size=0.2, random_state=42
)

iris_model = RandomForestClassifier(n_estimators=100, random_state=42)
iris_model.fit(X_train, y_train)
iris_accuracy = iris_model.score(X_test, y_test)

model_path = "/app/models_ready/iris_random_forest.pkl"
with open(model_path, "wb") as f:
    pickle.dump(iris_model, f)

print(f"   ✅ Accuracy: {iris_accuracy:.2%}")
print(f"   📁 Saved to: {model_path}")
print(f"   📝 Features: 4 (sepal length, sepal width, petal length, petal width)")
print(f"   🎯 Classes: 3 (Setosa, Versicolor, Virginica)")
print(f"   📊 Sample input: [[5.1, 3.5, 1.4, 0.2]]")

# ============================================================
# MODEL 2: Wine Classification (Logistic Regression)
# ============================================================
print("\n2️⃣  Creating Wine Classifier (Logistic Regression)...")
wine = load_wine()
X_train, X_test, y_train, y_test = train_test_split(
    wine.data, wine.target, test_size=0.2, random_state=42
)

wine_model = LogisticRegression(max_iter=10000, random_state=42)
wine_model.fit(X_train, y_train)
wine_accuracy = wine_model.score(X_test, y_test)

model_path = "/app/models_ready/wine_logistic_regression.pkl"
with open(model_path, "wb") as f:
    pickle.dump(wine_model, f)

print(f"   ✅ Accuracy: {wine_accuracy:.2%}")
print(f"   📁 Saved to: {model_path}")
print(f"   📝 Features: 13 (alcohol, malic_acid, ash, etc.)")
print(f"   🎯 Classes: 3 (Class 0, 1, 2)")
print(
    f"   📊 Sample input: [[13.2, 2.8, 2.2, 18, 103, 2.5, 2.2, 0.3, 1.5, 5.8, 0.9, 2.5, 450]]"
)

# ============================================================
# MODEL 3: Breast Cancer Classification (Decision Tree)
# ============================================================
print("\n3️⃣  Creating Breast Cancer Classifier (Decision Tree)...")
cancer = load_breast_cancer()
X_train, X_test, y_train, y_test = train_test_split(
    cancer.data, cancer.target, test_size=0.2, random_state=42
)

cancer_model = DecisionTreeClassifier(max_depth=10, random_state=42)
cancer_model.fit(X_train, y_train)
cancer_accuracy = cancer_model.score(X_test, y_test)

model_path = "/app/models_ready/breast_cancer_decision_tree.pkl"
with open(model_path, "wb") as f:
    pickle.dump(cancer_model, f)

print(f"   ✅ Accuracy: {cancer_accuracy:.2%}")
print(f"   📁 Saved to: {model_path}")
print(f"   📝 Features: 30 (mean radius, mean texture, mean perimeter, etc.)")
print(f"   🎯 Classes: 2 (Malignant=0, Benign=1)")
print(
    f"   📊 Sample input: [[17.99, 10.38, 122.8, 1001, 0.1184, 0.2776, 0.3001, 0.1471, 0.2419, 0.07871, ...]]"
)

# ============================================================
# MODEL 4: Custom Binary Classification (SVM)
# ============================================================
print("\n4️⃣  Creating Custom Binary Classifier (SVM)...")
X, y = make_classification(
    n_samples=1000,
    n_features=20,
    n_informative=15,
    n_redundant=5,
    n_classes=2,
    random_state=42,
)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

svm_model = SVC(kernel="rbf", probability=True, random_state=42)
svm_model.fit(X_train, y_train)
svm_accuracy = svm_model.score(X_test, y_test)

model_path = "/app/models_ready/binary_svm_classifier.pkl"
with open(model_path, "wb") as f:
    pickle.dump(svm_model, f)

print(f"   ✅ Accuracy: {svm_accuracy:.2%}")
print(f"   📁 Saved to: {model_path}")
print(f"   📝 Features: 20 (synthetic features)")
print(f"   🎯 Classes: 2 (Class 0, Class 1)")
print(f"   📊 Sample input: [[0.5, -0.3, 1.2, -0.8, 0.1, ...]] (20 values)")

print("\n" + "=" * 60)
print("✅ All 4 models created successfully!")
print("=" * 60)
print("\n📂 Models are located in: /app/models_ready/")
print("\n📋 To upload via frontend:")
print("   1. Go to Models → Upload Model")
print("   2. Select the .pkl file from container")
print("\n📋 To upload via curl:")
print("   curl -X POST http://localhost:8000/api/v1/models/upload \\")
print('     -H "Authorization: Bearer YOUR_TOKEN" \\')
print('     -F "model_file=@models_ready/iris_random_forest.pkl" \\')
print('     -F "name=Iris Classifier" \\')
print('     -F "description=Random Forest for Iris classification" \\')
print('     -F "model_type=sklearn"')
print("\n" + "=" * 60)

# Test each model
print("\n🧪 Testing Models:")
print("-" * 60)

# Test Iris
sample_iris = np.array([[5.1, 3.5, 1.4, 0.2]])
pred_iris = iris_model.predict(sample_iris)
prob_iris = iris_model.predict_proba(sample_iris)
print(f"\n🌸 Iris Model Test:")
print(f"   Input: {sample_iris[0].tolist()}")
print(f"   Prediction: Class {pred_iris[0]} (Confidence: {max(prob_iris[0]):.2%})")

# Test Wine
sample_wine = np.array(
    [[13.2, 2.8, 2.2, 18, 103, 2.5, 2.2, 0.3, 1.5, 5.8, 0.9, 2.5, 450]]
)
pred_wine = wine_model.predict(sample_wine)
prob_wine = wine_model.predict_proba(sample_wine)
print(f"\n🍷 Wine Model Test:")
print(f"   Input: {sample_wine[0][:5].tolist()}... (13 features)")
print(f"   Prediction: Class {pred_wine[0]} (Confidence: {max(prob_wine[0]):.2%})")

# Test Cancer
sample_cancer = cancer.data[0:1]
pred_cancer = cancer_model.predict(sample_cancer)
prob_cancer = cancer_model.predict_proba(sample_cancer)
print(f"\n🏥 Breast Cancer Model Test:")
print(f"   Input: {sample_cancer[0][:5].tolist()}... (30 features)")
print(
    f"   Prediction: {'Benign' if pred_cancer[0] == 1 else 'Malignant'} (Confidence: {max(prob_cancer[0]):.2%})"
)

# Test SVM
sample_svm = X_test[0:1]
pred_svm = svm_model.predict(sample_svm)
prob_svm = svm_model.predict_proba(sample_svm)
print(f"\n🔬 Binary SVM Model Test:")
print(f"   Input: {sample_svm[0][:5].tolist()}... (20 features)")
print(f"   Prediction: Class {pred_svm[0]} (Confidence: {max(prob_svm[0]):.2%})")

print("\n" + "=" * 60)
print("✅ All models tested and working!")
print("=" * 60)
