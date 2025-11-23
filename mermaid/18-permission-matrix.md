# Permission Matrix - Who Can Do What

```mermaid
graph TB
    subgraph "User Types"
        OWNER["🔐 Model Owner<br/>(User who uploaded)"]
        SHARED_EDIT["📝 Shared with Edit"]
        SHARED_USE["🔍 Shared with Use"]
        SHARED_VIEW["👁️ Shared with View"]
        ADMIN["⚙️ Platform Admin"]
    end

    subgraph "Model Operations"
        OWN_MODEL["Own Model"]
        VIEW_META[Read Metadata]
        EDIT_META[Edit Metadata]
        DOWNLOAD[Download Model File]
        DELETE[Delete Model]
        DEPRECATE[Deprecate Version]
        UPLOAD_NEW[Upload New Version]
    end

    subgraph "Prediction Operations"
        MAKE_PRED[Make Prediction]
        VIEW_PRED_HIST[View Prediction History]
        VIEW_ANALYTICS[View Analytics]
    end

    subgraph "Sharing Operations"
        SHARE_MODEL[Share Model]
        VIEW_SHARES[View Shared Models]
        REVOKE_SHARE[Revoke Share]
    end

    subgraph "API & Webhook"
        CREATE_KEY[Create API Key]
        MANAGE_KEY[Manage API Keys]
        CREATE_WEBHOOK[Create Webhook]
        VIEW_WEBHOOK[View Webhooks]
    end

    subgraph "Permission Matrix"
        OWN_MODEL -->|✅| OWNER
        OWN_MODEL -->|✅| ADMIN
        OWN_MODEL -->|❌| SHARED_EDIT
        OWN_MODEL -->|❌| SHARED_USE
        OWN_MODEL -->|❌| SHARED_VIEW

        VIEW_META -->|✅| OWNER
        VIEW_META -->|✅| SHARED_EDIT
        VIEW_META -->|✅| SHARED_USE
        VIEW_META -->|✅| SHARED_VIEW
        VIEW_META -->|✅| ADMIN

        EDIT_META -->|✅| OWNER
        EDIT_META -->|✅ (if granted)| SHARED_EDIT
        EDIT_META -->|❌| SHARED_USE
        EDIT_META -->|❌| SHARED_VIEW
        EDIT_META -->|✅| ADMIN

        DOWNLOAD -->|✅| OWNER
        DOWNLOAD -->|✅ (if granted)| SHARED_EDIT
        DOWNLOAD -->|❌| SHARED_USE
        DOWNLOAD -->|❌| SHARED_VIEW
        DOWNLOAD -->|✅| ADMIN

        DELETE -->|✅| OWNER
        DELETE -->|❌| SHARED_EDIT
        DELETE -->|❌| SHARED_USE
        DELETE -->|❌| SHARED_VIEW
        DELETE -->|✅| ADMIN

        MAKE_PRED -->|✅| OWNER
        MAKE_PRED -->|✅ (if granted)| SHARED_EDIT
        MAKE_PRED -->|✅ (if granted)| SHARED_USE
        MAKE_PRED -->|❌| SHARED_VIEW
        MAKE_PRED -->|✅| ADMIN

        SHARE_MODEL -->|✅| OWNER
        SHARE_MODEL -->|❌| SHARED_EDIT
        SHARE_MODEL -->|❌| SHARED_USE
        SHARE_MODEL -->|❌| SHARED_VIEW
        SHARE_MODEL -->|✅| ADMIN

        CREATE_KEY -->|✅| OWNER
        CREATE_KEY -->|✅| SHARED_EDIT
        CREATE_KEY -->|✅| SHARED_USE
        CREATE_KEY -->|✅| SHARED_VIEW
        CREATE_KEY -->|✅| ADMIN

        CREATE_WEBHOOK -->|✅| OWNER
        CREATE_WEBHOOK -->|✅| SHARED_EDIT
        CREATE_WEBHOOK -->|❌| SHARED_USE
        CREATE_WEBHOOK -->|❌| SHARED_VIEW
        CREATE_WEBHOOK -->|✅| ADMIN
    end

    style OWNER fill:#4CAF50,stroke:#333,stroke-width:2px,color:#fff
    style SHARED_EDIT fill:#2196F3,stroke:#333,stroke-width:2px,color:#fff
    style SHARED_USE fill:#FF9800,stroke:#333,stroke-width:2px,color:#fff
    style SHARED_VIEW fill:#9C27B0,stroke:#333,stroke-width:2px,color:#fff
    style ADMIN fill:#f44336,stroke:#333,stroke-width:2px,color:#fff
```
