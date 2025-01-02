package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	_ "github.com/lib/pq" // PostgreSQL driver
	"net/http"
	"strconv"
	"strings"
)

// Video represents a single video's information
type Video struct {
	ID           string `json:"id"`
	ChannelTitle string
	Title        string
	Description  string
	PublishedAt  string
	ViewCount    int
	LikeCount    int
	DislikeCount int
	CommentCount int
	Topics       []string
	Tags         []string
}

// YouTubeVideoDetails represents the JSON structure of the YouTube Data API video details response
type YouTubeVideoDetails struct {
	Items []struct {
		VideoID string `json:"id"`

		Snippet struct {
			Title        string   `json:"title"`
			Description  string   `json:"description"`
			PublishedAt  string   `json:"publishedAt"`
			ChannelTitle string   `json:"channelTitle"`
			Tags         []string `json:"tags"`
		} `json:"snippet"`
		Statistics struct {
			ViewCount    string `json:"viewCount"`
			LikeCount    string `json:"likeCount"`
			DislikeCount string `json:"dislikeCount"`
			CommentCount string `json:"commentCount"`
		} `json:"statistics"`
		TopicDetails struct {
			TopicCategories []string `json:"topicCategories"`
		} `json:"topicDetails"`
	} `json:"items"`
}

func fetchChannelVideos(apiKey, channelID string, maxVideoCount int) ([]string, error) {
	videoIDs := []string{}
	pageToken := ""
	batchSize := 50

	if maxVideoCount < batchSize {
		batchSize = maxVideoCount
	}
	countSoFar := 0

	for {

		if countSoFar+batchSize > maxVideoCount {
			batchSize = maxVideoCount - countSoFar
		}

		url := fmt.Sprintf("https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=%s&key=%s&type=video&maxResults=%d&pageToken=%s", channelID, apiKey, batchSize, pageToken)
		response, err := http.Get(url)
		if err != nil {
			return nil, err
		}
		defer response.Body.Close()

		if response.StatusCode != http.StatusOK {
			return nil, fmt.Errorf("failed to fetch channel videos: %s", response.Status)
		}

		var ytResponse struct {
			Items []struct {
				ID struct {
					VideoID string `json:"videoId"`
				} `json:"id"`
			} `json:"items"`
			NextPageToken string `json:"nextPageToken"`
		}

		if err := json.NewDecoder(response.Body).Decode(&ytResponse); err != nil {
			return nil, err
		}

		for _, item := range ytResponse.Items {
			videoIDs = append(videoIDs, item.ID.VideoID)
		}

		if ytResponse.NextPageToken == "" || countSoFar >= maxVideoCount {
			break
		}
		pageToken = ytResponse.NextPageToken
		countSoFar = countSoFar + len(ytResponse.Items)
	}

	return videoIDs, nil
}

func fetchVideoDetails(apiKey string, videoIDs []string) ([]Video, error) {
	videos := []Video{}
	batchSize := 50

	for i := 0; i < len(videoIDs); i += batchSize {
		end := i + batchSize
		if end > len(videoIDs) {
			end = len(videoIDs)
		}

		url := fmt.Sprintf("https://www.googleapis.com/youtube/v3/videos?part=id,snippet,statistics,topicDetails&id=%s&key=%s", join(videoIDs[i:end], ","), apiKey)
		response, err := http.Get(url)
		if err != nil {
			return nil, err
		}
		defer response.Body.Close()

		if response.StatusCode != http.StatusOK {
			return nil, fmt.Errorf("failed to fetch video details: %s", response.Status)
		}

		var ytResponse YouTubeVideoDetails
		if err := json.NewDecoder(response.Body).Decode(&ytResponse); err != nil {
			return nil, err
		}

		for _, item := range ytResponse.Items {
			video := Video{
				ID:           item.VideoID,
				Title:        item.Snippet.Title,
				Description:  item.Snippet.Description,
				PublishedAt:  item.Snippet.PublishedAt,
				ChannelTitle: item.Snippet.ChannelTitle,
				ViewCount:    StringToInt(item.Statistics.ViewCount),
				LikeCount:    StringToInt(item.Statistics.LikeCount),
				DislikeCount: StringToInt(item.Statistics.DislikeCount),
				CommentCount: StringToInt(item.Statistics.CommentCount),
				Topics:       extractTopics(item.TopicDetails.TopicCategories),
				Tags:         item.Snippet.Tags,
			}
			videos = append(videos, video)
		}
	}

	return videos, nil
}

func extractTopics(input []string) []string {
	result := []string{}
	for _, in := range input {
		// Split the string by "/"
		parts := strings.Split(in, "/")
		// Get the last part
		if len(parts) > 0 {
			result = append(result, parts[len(parts)-1])
		}
	}
	return result
}

func join(elements []string, delimiter string) string {
	result := ""
	for i, element := range elements {
		if i > 0 {
			result += delimiter
		}
		result += element
	}
	return result
}

func StringToInt(s string) int {
	num, err := strconv.Atoi(s)
	if err != nil {
		return 0
	}
	return num
}

// writeToPostgres inserts video data into the PostgreSQL database
func writeToPostgres(videos []Video, db *sql.DB) error {
	// Prepare the SQL statement for inserting data
	query := `
		INSERT INTO videos (id, channel, title, description, published_at, views, likes, dislikes, comment_count, topics, tags)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) ON CONFLICT (id) DO UPDATE SET
			views = EXCLUDED.views,
			likes = EXCLUDED.likes,
			dislikes = EXCLUDED.dislikes,
			comment_count = EXCLUDED.comment_count,
			topics = EXCLUDED.topics,
			tags = EXCLUDED.tags
	`

	for _, video := range videos {
		// Execute the SQL statement for each video
		_, err := db.Exec(
			query,
			video.ID,
			video.ChannelTitle,
			video.Title,
			video.Description,
			video.PublishedAt,
			video.ViewCount,
			video.LikeCount,
			video.DislikeCount,
			video.CommentCount,
			join(video.Topics, ";"), // Join the topics into a single string
			join(video.Tags, ";"),   // Join the tags into a single string
		)
		if err != nil {
			return fmt.Errorf("failed to insert video: %v", err)
		}
	}

	fmt.Println("Data successfully written to PostgreSQL")
	return nil
}

func main() {
	apiKey := "AIzaSyDCWvHutEsM88gjKUSa6j6_DmeuA1tFs04" // Replace with your YouTube Data API key
	//apiKey := "AIzaSyBRW0_OJUEpFeZxd7jcGJPTJ8h6fbx8HRY" // Replace with your YouTube Data API key
	channelID := "UCUU-gEwkU8wo8n2ihweWpkw" // Replace with the channel ID

	videoIDs, err := fetchChannelVideos(apiKey, channelID, 500)
	if err != nil {
		fmt.Printf("Error fetching channel videos: %v\n", err)
		return
	}

	videos, err := fetchVideoDetails(apiKey, videoIDs)
	if err != nil {
		fmt.Printf("Error fetching video details: %v\n", err)
		return
	}

	// PostgreSQL connection details
	connStr := "user=wisdom password=warriors dbname=wisdom sslmode=disable"
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		fmt.Printf("Error connecting to the database: %v\n", err)
		return
	}
	defer db.Close()

	// Write to the PostgreSQL database
	err = writeToPostgres(videos, db)
	if err != nil {
		fmt.Printf("Error writing to PostgreSQL: %v\n", err)
	}

}
