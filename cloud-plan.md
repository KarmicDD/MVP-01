### **1. API Gateway: The Front Door**

This service will manage all incoming API requests and route them to the correct backend service.

*   **Where it fits:** Acts as the single entry point for your frontend application.
*   **Configuration (Nominal):**
    *   **Type:** HTTP API. It's cheaper and has lower latency than REST API for simple proxying.
    *   **Routes & Integrations:**
        *   `POST /auth/login`, `POST /auth/register` -> Integrate with the "Authentication" Lambda function.
        *   `GET /users`, `GET /users/{id}` -> Integrate with the "User Management" Lambda function.
        *   `GET /profiles/{id}`, `PUT /profiles/{id}` -> Integrate with the "Profile Management" Lambda function.
        *   `POST /documents/upload` -> Integrate with the "Document Upload" Lambda function.
    *   **CORS:** Enable CORS for your frontend domain.

*   **Configuration (Optimized):**
    *   **Security:** Implement a **Lambda Authorizer** (or JWT Authorizer if using Cognito) to validate the JWT token on protected routes before they reach your backend functions.
    *   **Throttling:** Configure **Usage Plans and API Keys** to set rate limits (e.g., 10 requests/second) and burst limits to prevent abuse.
    *   **Custom Domain:** Configure a custom domain name (e.g., `api.karmicdd.com`).
    *   **Protection:** Attach **AWS WAF** to protect against common exploits like SQL injection and XSS.

### **2. AWS Lambda: Serverless Business Logic**

Your core services (Auth, Users, Profiles) will be deployed as individual, stateless functions.

*   **Where it fits:** Replaces the corresponding service logic from your monolith.
*   **Configuration (Nominal):**
    *   **Runtime:** Node.js (matching your project).
    *   **Memory:** Start with **256 MB**. This is a good balance for simple I/O-bound tasks.
    *   **Timeout:** Set to **15 seconds**. This is more than enough for a typical API request and prevents runaway functions.
    *   **IAM Role:** Each function gets its own IAM Role with least-privilege access (e.g., the "User Management" function can only read from the `users` table in RDS).
    *   **Environment Variables:** Store non-sensitive configuration. For secrets, use **AWS Secrets Manager**.

*   **Configuration (Optimized):**
    *   **VPC:** Place the Lambda functions inside your VPC to give them secure, private access to your RDS and DocumentDB databases.
    *   **Provisioned Concurrency:** If you experience cold starts causing latency spikes under high load, set a provisioned concurrency of 5-10 to keep a set number of functions "warm."
    *   **Monitoring:** Use **AWS X-Ray** for active tracing to debug performance bottlenecks across services.

### **3. Amazon S3: Document Storage**

Replaces the local filesystem for storing all user-uploaded documents.

*   **Where it fits:** All files uploaded by users.
*   **Configuration (Nominal):**
    *   **Bucket Policy:** Create one private S3 bucket. Block all public access at the account and bucket level.
    *   **Security:** Your "Document Upload" Lambda will use an IAM role to get temporary credentials to write to the bucket.
    *   **Access:** Generate **S3 Pre-signed URLs** for secure, time-limited uploads and downloads directly from the client's browser. This offloads bandwidth from your backend.

*   **Configuration (Optimized):**
    *   **Lifecycle Policies:** Automatically transition documents older than 90 days to a cheaper storage class like **S3 Infrequent Access (S3-IA)**.
    *   **Event Notifications:** Configure S3 to automatically send a message to the SQS queue when a new document is successfully uploaded (`s3:ObjectCreated:*` event). This is more reliable than having your Lambda function do it.
    *   **CDN:** Use **Amazon CloudFront** in front of S3 to cache documents closer to your users for faster downloads.

### **4. Amazon SQS & EC2: Decoupled AI Processing**

This combination handles the heavy, long-running AI tasks without blocking your API.

*   **Where it fits:** The SQS queue decouples the API from the AI worker. The EC2 instance runs the AI processing logic.

*   **SQS Queue Configuration:**
    *   **Type:** Standard Queue.
    *   **Visibility Timeout:** Set to **10 minutes**. This should be longer than your average AI processing time to prevent another worker from picking up the same job while it's in progress.
    *   **Dead-Letter Queue (DLQ):** Configure a DLQ to automatically capture messages that fail processing multiple times. This is critical for debugging failed jobs.

*   **EC2 Instance Configuration (Nominal):**
    *   **Instance Type:** Start with a general-purpose `t3.medium` or `t4g.medium` (if your code runs on ARM).
    *   **AMI:** Use the latest Amazon Linux 2 AMI.
    *   **IAM Role:** Attach an IAM Role to the instance that grants permission to:
        *   Read messages from the SQS queue.
        *   Delete messages from the SQS queue (after successful processing).
        *   Read the source document from S3.
        *   Write the AI results to DocumentDB/ElastiCache.
    *   **Logic:** Run a script on the instance that continuously polls the SQS queue for new messages.

*   **EC2 Instance Configuration (Optimized):**
    *   **Auto Scaling Group (ASG):**
        *   **Min/Max Size:** Configure an ASG with a minimum of **0** instances (to save costs when idle) and a maximum of **5** instances.
        *   **Scaling Policy:** Use **Target Tracking** based on the SQS queue depth (`ApproximateNumberOfMessagesVisible`). For example, set a target of 10 messages per instance. If the queue depth grows to 20, the ASG will automatically launch a second EC2 instance. It will scale back down to 0 when the queue is empty.
    *   **Instance Type:** If your AI workload is CPU-intensive, switch to a **Compute Optimized** instance (e.g., `c5.large`).

### **5. Databases & Cache: Data Persistence**

*   **Amazon RDS for PostgreSQL (User & Auth Data):**
    *   **Nominal:** Use a `db.t3.micro` or `db.t3.small` instance. Enable automated backups.
    *   **Optimized:** For high read traffic, enable a **Read Replica**. For high availability, enable **Multi-AZ deployment**.

*   **Amazon DocumentDB (Profile & AI Results):**
    *   **Nominal:** Start with a single `db.t3.medium` instance.
    *   **Optimized:** Add more instances to the cluster to create a replica set for high availability and read scaling.

*   **Amazon ElastiCache for Redis (Caching):**
    *   **Nominal:** A single `cache.t2.micro` or `cache.t3.small` node is sufficient for initial caching needs (e.g., user profiles).
    *   **Optimized:** Increase the node size or create a cluster with read replicas for high-throughput caching. Set an appropriate TTL (Time To Live) on cached items (e.g., 5-10 minutes).