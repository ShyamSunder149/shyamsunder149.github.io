# Kubernetes Basics for Developers

Kubernetes (K8s) is an open-source container orchestration platform that automates deployment, scaling, and management of containerized applications.

## Core Concepts

### Pods
The smallest deployable unit in Kubernetes. A pod can contain one or more containers.

### Deployments
Manage the desired state of your application, handling updates and rollbacks.

### Services
Expose your pods to network traffic, providing load balancing and service discovery.

## Quick Example

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
      - name: my-app
        image: my-app:latest
        ports:
        - containerPort: 8080
```

## Why Kubernetes?

- Automatic scaling based on demand
- Self-healing: restarts failed containers
- Rolling updates with zero downtime
- Declarative configuration
