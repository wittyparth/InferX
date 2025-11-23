#!/usr/bin/env python3
"""
Script to create and upload a simple Iris classifier for testing inference
"""
import pickle

from sklearn.datasets import load_iris
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

# Load iris dataset
print("Loading Iris dataset...")
iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(
    iris.data, iris.target, test_size=0.2, random_state=42
)

# Train a simple Random Forest classifier
print("Training Random Forest classifier...")
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Test accuracy
accuracy = model.score(X_test, y_test)
print(f"Model accuracy: {accuracy:.2%}")

# Save the model
model_path = "/app/models/iris_classifier.pkl"
print(f"Saving model to {model_path}...")
with open(model_path, "wb") as f:
    pickle.dump(model, f)

print("✅ Model created and saved successfully!")
print("\nSample prediction test:")
sample = [[5.1, 3.5, 1.4, 0.2]]  # setosa
prediction = model.predict(sample)
print(f"  Input: {sample}")
print(f"  Predicted class: {prediction[0]} ({iris.target_names[prediction[0]]})")
print(f"  Probabilities: {model.predict_proba(sample)[0]}")
