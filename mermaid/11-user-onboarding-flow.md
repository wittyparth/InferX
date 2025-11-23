# User Onboarding Flow - Registration to First Prediction

```mermaid
journey
    title User Onboarding Journey
    section Registration
      User visits website: 5: Registration Page
      Clicks "Sign Up": 5: Sign Up Button
      Enters email & password: 4: Form Entry
      Reads terms & privacy: 3: Legal
      Clicks register button: 5: Submit Button
      Receives confirmation email: 4: Email Delivery
      Clicks email verification link: 5: Email Verification

    section Profile Setup
      Redirected to onboarding: 5: Onboarding Page
      Fills in full name: 5: Form
      Uploads profile picture (optional): 4: Form
      Completes profile setup: 5: Submission

    section Dashboard Intro
      Lands on dashboard: 5: Dashboard
      Views welcome message: 4: UI Element
      Explores sidebar navigation: 4: Navigation
      Sees empty models section: 3: Empty State
      Reads helpful tutorial: 4: Tutorial

    section Model Upload
      Navigates to "Upload Model": 5: Navigation
      Reads upload requirements: 4: Documentation
      Selects model file (.pkl/.joblib): 5: File Selection
      Enters model name: 5: Form
      Selects model type (sklearn): 5: Form
      Clicks upload button: 5: Submit
      Waits for processing: 3: Loading

    section Model Ready
      Upload completes successfully: 5: Success Message
      Sees model in list: 5: Dashboard Update
      Views model details: 5: Details Page
      Finds API endpoint URL: 5: Documentation
      Copies example code: 5: Code Snippet

    section First Prediction
      Navigates to "Test Prediction": 5: Navigation
      Enters sample input data: 5: Form
      Submits prediction request: 5: Submit
      Sees prediction result: 5: Result Display
      Checks inference time: 5: Metrics
      Views success message: 5: Notification

    section API Integration
      Reads API documentation: 4: Docs
      Copies cURL example: 4: Code
      Tests API locally: 5: Testing
      Creates first API key: 5: Security
      Stores API key securely: 5: Best Practice
      Makes programmatic prediction: 5: Integration
```
