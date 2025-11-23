# Rate Limiting Implementation

```mermaid
graph TB
    REQUEST[Incoming API Request]
    
    REQUEST --> EXTRACT[Extract User ID<br/>or API Key]
    EXTRACT --> REDIS_KEY[Generate Redis Key:<br/>rate_limit:user_id]
    
    REDIS_KEY --> CHECK_BUCKET[Check Token Bucket<br/>in Redis]
    
    CHECK_BUCKET --> GET_TOKENS[Get Current Tokens<br/>& Last Refill Time]
    
    GET_TOKENS --> CALC[Calculate Refill:<br/>tokens = min(max,<br/>current + elapsed * rate)]
    
    CALC --> CHECK_AVAIL{Tokens >= 1?}
    
    CHECK_AVAIL -->|Yes| CONSUME[Consume 1 Token<br/>Update Redis]
    CHECK_AVAIL -->|No| REJECT[Return 429<br/>Too Many Requests]
    
    CONSUME --> SET_TTL[Set TTL:<br/>Auto-expire in 1 hour]
    SET_TTL --> ALLOW[Allow Request<br/>Add Rate Headers]
    
    ALLOW --> PROCESS[Process Request]
    
    REJECT --> RETRY_AFTER[Add Retry-After Header:<br/>Seconds until refill]
    
    style CHECK_BUCKET fill:#dc382d,stroke:#333,stroke-width:2px,color:#fff
    style CONSUME fill:#90EE90,stroke:#333,stroke-width:2px
    style REJECT fill:#ff6b6b,stroke:#333,stroke-width:2px,color:#fff
    style ALLOW fill:#90EE90,stroke:#333,stroke-width:2px
```
