"""
Create a dummy scikit-learn model for testing
Trains a simple RandomForestClassifier on iris dataset
"""
import pickle
from sklearn.datasets import load_iris
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

# Load iris dataset
print("Loading iris dataset...")
iris = load_iris()
X, y = iris.data, iris.target

# Split the data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train a RandomForestClassifier
print("Training RandomForestClassifier...")
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Check accuracy
accuracy = model.score(X_test, y_test)
print(f"Model accuracy on test set: {accuracy:.2%}")

# Save the model
output_file = "dummy_iris_model.pkl"
with open(output_file, 'wb') as f:
    pickle.dump(model, f)

print(f"\n✅ Model saved as '{output_file}'")
print(f"Model type: {type(model).__name__}")
print(f"Input features: {X_train.shape[1]} (sepal length, sepal width, petal length, petal width)")
print(f"Output classes: {len(iris.target_names)} ({', '.join(iris.target_names)})")
print("\nExample prediction:")
print(f"Input: {X_test[0]}")
print(f"Predicted class: {iris.target_names[model.predict([X_test[0]])[0]]}")
print(f"Actual class: {iris.target_names[y_test[0]]}")
