# Building RESTful APIs in Go

REST APIs are the backbone of modern web applications. Go's standard library makes it easy to build high-performance APIs.

## Setting Up

```go
package main

import (
    "encoding/json"
    "net/http"
)

type User struct {
    ID   int    `json:"id"`
    Name string `json:"name"`
}

func main() {
    http.HandleFunc("/users", handleUsers)
    http.ListenAndServe(":8080", nil)
}

func handleUsers(w http.ResponseWriter, r *http.Request) {
    users := []User{
        {ID: 1, Name: "Alice"},
        {ID: 2, Name: "Bob"},
    }
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(users)
}
```

## Best Practices

1. **Use proper HTTP methods**: GET, POST, PUT, DELETE
2. **Return appropriate status codes**: 200, 201, 400, 404, 500
3. **Version your API**: `/api/v1/users`
4. **Handle errors gracefully**: Return meaningful error messages
5. **Add middleware**: Logging, authentication, rate limiting

## Conclusion

Go's simplicity and performance make it ideal for building production-ready REST APIs.
