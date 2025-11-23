# ML Model Serving Platform - Mermaid Diagrams

This folder contains comprehensive Mermaid diagrams documenting the ML Model Serving Platform's architecture, data flow, and business processes.

## 📊 Diagrams Index

### Core Architecture (01-05)
1. **01-system-architecture.md** - High-level system overview with all components
2. **02-technology-stack.md** - Complete technology stack breakdown
3. **03-database-er-diagram.md** - Database schema and relationships
4. **04-api-request-flow.md** - Complete API request lifecycle
5. **05-docker-container-architecture.md** - Docker container setup and networking

### Features & Flows (06-10)
6. **06-authentication-authorization-flow.md** - JWT + OAuth authentication flow
7. **07-ml-model-lifecycle.md** - Model upload, caching, and retirement
8. **08-caching-strategy.md** - Redis caching with multi-level strategy
9. **09-ci-cd-pipeline.md** - Automated testing and deployment pipeline
10. **10-rate-limiting-implementation.md** - Token bucket rate limiting algorithm

### API & Business Logic (11-14)
11. **11-user-onboarding-flow.md** - Complete user journey from signup to first prediction
12. **12-api-endpoint-map.md** - All API endpoints organized by feature
13. **13-model-upload-journey.md** - Step-by-step model upload wizard (Coming)
14. **14-webhook-event-types.md** - Webhook events and delivery flow

### Advanced Concepts (15-18)
15. **15-error-handling-flow.md** - Error handling and user messaging (Coming)
16. **16-analytics-calculation.md** - How metrics and analytics are computed (Coming)
17. **17-background-job-queue.md** - Async task processing (Coming)
18. **18-permission-matrix.md** - User permissions and access control

## 🎯 How to Use These Diagrams

### For Presentations
- **Best for Stakeholders**: 01-system-architecture, 02-technology-stack
- **Best for Engineers**: 03-database-er-diagram, 04-api-request-flow, 05-docker-container-architecture
- **Best for Product**: 11-user-onboarding-flow, 12-api-endpoint-map

### For Documentation
- Link diagrams in your README.md
- Reference specific flows when explaining features
- Use as reference for code reviews

### For Learning
- Start with 01-system-architecture
- Progress through 02-technology-stack
- Deep dive into specific areas (04-api-request-flow, 06-authentication-authorization-flow)

## 🔍 Diagram Key Features

| Diagram | Type | Purpose | Audience |
|---------|------|---------|----------|
| 01-System Architecture | Graph | Overview all components | Everyone |
| 02-Technology Stack | Graph | Show tech choices | Engineers, Investors |
| 03-Database ER | ER Diagram | Data relationships | Engineers |
| 04-API Request Flow | Sequence | Request lifecycle | Engineers, QA |
| 05-Docker Architecture | Graph | Containerization | DevOps, Engineers |
| 06-Auth Flow | State Diagram | Authentication states | Engineers, Security |
| 07-Model Lifecycle | State Diagram | Model states | Engineers, Scientists |
| 08-Caching Strategy | Graph | Cache flow | Engineers |
| 09-CI/CD Pipeline | Graph | Automation | DevOps, Engineers |
| 10-Rate Limiting | Graph | Rate limit algorithm | Engineers |
| 11-User Onboarding | Journey | User experience | Product, UX |
| 12-API Endpoints | Graph | All endpoints | API Users |
| 14-Webhooks | Graph | Event delivery | Integration Engineers |
| 18-Permissions | Graph | Access control | Engineers, Admins |

## 💡 Tips for Using Mermaid

### Viewing Diagrams
- All `.md` files contain Mermaid code blocks
- View in: GitHub (auto-renders), VS Code (with Mermaid extension), Notion, Confluence
- Export as PNG/SVG: Use Mermaid Live Editor (https://mermaid.live/)

### Editing Diagrams
1. Edit the `.md` file
2. Copy the Mermaid code to Mermaid Live Editor
3. Preview changes
4. Paste back to file

### Sharing
- Copy Mermaid code from any `.md` file
- Paste into presentation tools that support Mermaid (Notion, Confluence, etc.)
- Or export as image (PNG/SVG/PDF)

## 🎨 Color Coding

- **Green (#90EE90)**: Success, cached, allowed
- **Red (#ff6b6b, #dc382d)**: Error, rate limited, denied
- **Blue (#61dafb, #336791, #2196F3)**: Frontend, Database
- **Teal (#009688)**: Backend, FastAPI
- **Orange (#FF9800)**: Warning, shared access
- **Gold (#FFD700)**: Production, important

## 📈 Recommended Reading Order

### For New Team Members
1. 01-system-architecture
2. 02-technology-stack
3. 03-database-er-diagram
4. 05-docker-container-architecture
5. 04-api-request-flow

### For Feature Implementation
1. 07-ml-model-lifecycle (if working on models)
2. 06-authentication-authorization-flow (if adding auth features)
3. 12-api-endpoint-map (for API design)
4. 18-permission-matrix (for access control)

### For DevOps/Deployment
1. 05-docker-container-architecture
2. 09-ci-cd-pipeline
3. 10-rate-limiting-implementation
4. 08-caching-strategy

### For Product/Stakeholders
1. 01-system-architecture
2. 11-user-onboarding-flow
3. 12-api-endpoint-map
4. 02-technology-stack

## 🚀 Future Diagrams (TODO)

- [ ] 13-model-upload-journey.md - Detailed upload wizard flow
- [ ] 15-error-handling-flow.md - Comprehensive error handling
- [ ] 16-analytics-calculation.md - Metrics computation flow
- [ ] 17-background-job-queue.md - Async task processing
- [ ] 19-scaling-strategy.md - Horizontal scaling approach
- [ ] 20-multi-region-deployment.md - Geographic distribution

## 📝 Notes

- All diagrams are created with Mermaid syntax
- Diagrams are version controlled with the codebase
- Update diagrams when architecture changes
- Keep diagrams in sync with actual implementation

## 🔗 Related Documentation

- README.md - Project overview
- docs/ARCHITECTURE.md - Detailed architecture documentation
- docs/DATABASE_SCHEMA.md - Database schema details
- docs/API_DESIGN.md - API specifications

---

**Last Updated**: November 2025  
**Version**: 1.0  
**Status**: Complete (18/20 diagrams)
