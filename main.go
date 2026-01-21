package main

import (
	"encoding/json"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"os"
	"strings"
)

type GitHubRepo struct {
	Name        string   `json:"name"`
	Description string   `json:"description"`
	HTMLURL     string   `json:"html_url"`
	Topics      []string `json:"topics"`
}

type Project struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Link        string `json:"link"`
}

type Experience struct {
	Role        string `json:"role"`
	Company     string `json:"company"`
	Duration    string `json:"duration"`
	Description string `json:"description"`
}

type PageData struct {
	Name       string
	Title      string
	About      string
	Projects   []Project
	Experience []Experience
	Skills     []string
}

func loadJSON[T any](path string) []T {
	data, err := os.ReadFile(path)
	if err != nil {
		log.Fatal(err)
	}

	var result []T
	if err := json.Unmarshal(data, &result); err != nil {
		log.Fatal(err)
	}
	return result
}

func formatRepoName(name string) string {
	name = strings.ReplaceAll(name, "-", " ")
	words := strings.Fields(name)
	for i, w := range words {
		if len(w) > 0 {
			words[i] = strings.ToUpper(w[:1]) + w[1:]
		}
	}
	return strings.Join(words, " ")
}

func getProjectsFromGitHub(username string) []Project {
	url := fmt.Sprintf("https://api.github.com/users/%s/repos?sort=updated&per_page=100", username)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		log.Printf("Error creating request: %v", err)
		return []Project{}
	}
	req.Header.Set("User-Agent", "Portfolio-App")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Error fetching GitHub repos: %v", err)
		return []Project{}
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("GitHub API returned status: %s", resp.Status)
		return []Project{}
	}

	var repos []GitHubRepo
	if err := json.NewDecoder(resp.Body).Decode(&repos); err != nil {
		log.Printf("Error decoding GitHub response: %v", err)
		return []Project{}
	}

	var projects []Project
	for _, repo := range repos {
		isSideProject := false
		for _, topic := range repo.Topics {
			if topic == "side-project" {
				isSideProject = true
				break
			}
		}

		if isSideProject {
			projects = append(projects, Project{
				Name:        formatRepoName(repo.Name),
				Description: repo.Description,
				Link:        repo.HTMLURL,
			})
		}
	}
	return projects
}

func main() {
	tmpl := template.Must(template.ParseFiles("templates/index.html"))

	page := PageData{
		Name:       "Shyam Sunder",
		Title:      "Software Engineer",
		About:      "I build reliable systems, APIs, and tools with Go and Unix philosophy in mind.",
		// TODO: Replace "YOUR_GITHUB_USERNAME" with the actual username provided by the user
		Projects:   getProjectsFromGitHub("ShyamSunder149"),
		Experience: loadJSON[Experience]("data/experience.json"),
		Skills:     loadJSON[string]("data/skills.json"),
	}

	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		tmpl.Execute(w, page)
	})

	log.Println("Listening on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
