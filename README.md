# Cape Pulse Insights

Bolt.new Prompt – PulseAI: Western Cape News Sentiment Intelligence Platform

Build a production-ready, full-stack AI web application called PulseAI.

PulseAI is an AI-powered sentiment intelligence platform that continuously monitors real news related to the Western Cape, South Africa, analyzes the sentiment of each article using Natural Language Processing (NLP), and presents meaningful insights through a modern interactive dashboard.

The application must be fully responsive, visually polished, scalable, and suitable for an AI Bootcamp portfolio project. Follow clean architecture principles and write maintainable, well-documented code.

________________________________________

Project Objective

Develop an AI-powered dashboard that:

•	Automatically collects real Western Cape news articles from trusted news sources.

•	Uses AI to analyze the sentiment of every article.

•	Classifies each article as:

o	😊 Positive

o	😐 Neutral

o	☹️ Negative

•	Calculates confidence scores.

•	Identifies trending topics and keywords.

•	Generates AI-powered insights.

•	Stores historical data for trend analysis.

•	Automatically refreshes with new articles every 24 hours (minimum requirement: every 72 hours).

•	Never uses placeholder, fake, or generated news content.

________________________________________

News Collection

Geographic Scope

The application should focus only on news relevant to the Western Cape.

Filter articles mentioning locations such as:

•	Western Cape

•	Cape Town

•	Gugulethu

•	Khayelitsha

•	Mitchells Plain

•	Bellville

•	Stellenbosch

•	Paarl

•	George

•	Worcester

•	Knysna

•	Mossel Bay

•	Hermanus

•	Somerset West

•	Saldanha Bay

•	Beaufort West

Articles outside this scope should be ignored unless they have a significant impact on the Western Cape.

________________________________________

News Sources

Use reputable news APIs.

Preferred APIs (in order):

•	NewsAPI

•	GNews

•	NewsData.io

•	Mediastack

Filter articles from reputable sources where possible, including:

•	News24

•	IOL

•	Cape Argus

•	Cape Times

•	Daily Voice

•	TygerBurger

•	Cape Business News

•	The South African

•	Western Cape Government News

•	City of Cape Town News

If API filtering by source is limited, filter by keywords related to the Western Cape after fetching the data.

________________________________________

Automatic Updates

Implement an automatic news collection service.

Requirements:

•	Fetch new articles every 24 hours.

•	If daily scheduling is unavailable, default to every 72 hours.

•	Detect duplicate articles.

•	Only analyze newly fetched articles.

•	Preserve historical articles.

•	Record the last successful update.

•	Display the "Last Updated" timestamp on the dashboard.

________________________________________

Dataset

Create a local data folder.

/data

Store a CSV file named:

western_cape_news.csv

The CSV must contain real news articles collected from the configured API.

Columns:

•	Headline

•	Article

•	Source

•	Category

•	Published Date

•	Municipality/City

•	URL

•	Author

•	Sentiment

•	Confidence Score

The CSV should automatically grow as new articles are added.

________________________________________

AI Model

Use a Hugging Face Transformer model for sentiment analysis.

Recommended:

•	DistilBERT

•	RoBERTa

•	CardiffNLP Twitter RoBERTa Sentiment

For every article determine:

•	Sentiment

•	Confidence Score

•	Keywords

•	Topic

•	Summary

Store the AI analysis results in the database.

________________________________________

Technology Stack

Frontend

•	React

•	Vite

•	TypeScript

•	Tailwind CSS

•	React Router

•	Recharts

Backend

•	Python

•	FastAPI

Database

•	SQLite

AI

•	Hugging Face Transformers

•	Pandas

•	NumPy

Charts

•	Recharts

________________________________________

Dashboard

Create a clean, modern dashboard.

________________________________________

Header

Display:

PulseAI

Subtitle:

"AI-powered sentiment intelligence for Western Cape news."

Display:

•	Current Date

•	Last Updated

•	Total Articles

________________________________________

Summary Cards

Display:

•	Total Articles

•	Positive %

•	Neutral %

•	Negative %

•	Average Confidence Score

________________________________________

Sentiment Distribution

Display:

•	Pie Chart

•	Bar Chart

________________________________________

Sentiment Trend

Display a line chart showing sentiment over time.

Allow filtering by:

•	Last 7 Days

•	Last 30 Days

•	Last 90 Days

•	All Time

________________________________________

Municipality Analysis

Analyze sentiment by municipality.

Examples:

•	Cape Town

•	Stellenbosch

•	Paarl

•	George

•	Worcester

•	Knysna

•	Hermanus

Display:

•	Average sentiment

•	Number of articles

•	Most common topic

•	Positive %

•	Negative %

________________________________________

Category Analysis

Automatically categorize articles into:

•	Politics

•	Crime

•	Economy

•	Business

•	Energy

•	Health

•	Education

•	Technology

•	Tourism

•	Sports

•	Entertainment

•	Environment

•	Transport

•	Community

•	Other

Display:

•	Total Articles

•	Positive %

•	Neutral %

•	Negative %

•	Average Confidence

________________________________________

News Table

Columns:

•	Headline

•	Source

•	Municipality

•	Category

•	Published Date

•	Sentiment

•	Confidence

•	Original Article URL

The headline should open the original article in a new browser tab.

________________________________________

Search

Allow searching by:

•	Headline

•	Keyword

•	Municipality

•	Category

•	Source

________________________________________

Filters

Allow filtering by:

•	Sentiment

•	Municipality

•	Category

•	Source

•	Date Range

________________________________________

AI Insights Panel

Generate AI-powered insights such as:

•	"Today's news is predominantly positive."

•	"Crime is the leading contributor to negative sentiment."

•	"Cape Town generated the highest number of positive stories."

•	"Tourism sentiment has improved by 18% compared to last week."

•	"George recorded the highest positive sentiment."

•	"The economy remains the most discussed topic."

•	"Average confidence score is 94%."

The insights should update automatically whenever new articles are analyzed.

________________________________________

Trending Topics

Automatically detect trending keywords.

Examples:

•	Load Shedding

•	Tourism

•	Housing

•	Crime

•	Education

•	Infrastructure

•	Economy

•	Elections

•	Water

•	Healthcare

Display:

•	Trending keywords

•	Frequency

•	Trend direction (up/down)

________________________________________

Top Stories

Display:

Top Positive Stories

Show the five highest-confidence positive articles.

Top Negative Stories

Show the five highest-confidence negative articles.

Each card should include:

•	Headline

•	Source

•	Confidence

•	Summary

•	Read More button

________________________________________

Word Clouds

Generate:

•	Positive Word Cloud

•	Negative Word Cloud

Ignore common stop words.

________________________________________

Report Generator

Include a Generate Report button.

Generate a professional PDF containing:

•	Executive Summary

•	Dataset Overview

•	Total Articles

•	Positive %

•	Neutral %

•	Negative %

•	Municipality Breakdown

•	Category Breakdown

•	Trend Analysis

•	Top Positive Stories

•	Top Negative Stories

•	Charts

•	AI Insights

•	Conclusion

Allow users to download the report.

________________________________________

CSV Upload

Allow users to upload their own CSV.

Requirements:

•	Validate the structure.

•	Analyze all uploaded articles.

•	Merge with the existing database.

•	Prevent duplicates.

•	Recalculate dashboard statistics.

________________________________________

Export Features

Allow exporting:

•	Analyzed CSV

•	PDF Report

•	Dashboard Charts as PNG

________________________________________

User Interface

The interface should feel like a professional business intelligence platform.

Style:

•	Modern

•	Clean

•	Elegant

•	Responsive

•	Fast

•	Accessible

Features:

•	Dark Mode

•	Light Mode

•	Smooth animations

•	Rounded cards

•	Soft shadows

•	Loading skeletons

•	Toast notifications

•	Mobile responsive

________________________________________

Color Palette

Use a warm, modern, and elegant color palette inspired by soft earth tones. The interface should feel clean, welcoming, and professional while maintaining excellent readability.

Primary Colors

•	Light Red: #dbc8c5

o	Use for primary buttons, highlights, selected states, and important UI elements.

•	Light Orange: #faf2e8

o	Use as the main background color for pages and sections.

•	Grey Crimson: #a2878d

o	Use for headings, icons, navigation, and secondary accents.

•	Pastel Grey Orange: #e1c3a0

o	Use for cards, containers, charts, hover states, and subtle backgrounds.

•	Grey: #7d817a

o	Use for body text, labels, borders, and secondary information.

UI Guidelines

•	Use Light Orange (#faf2e8) as the primary application background.

•	Use white sparingly for cards that require stronger contrast.

•	Use Light Red (#dbc8c5) for primary actions, active buttons, selected filters, and interactive highlights.

•	Use Grey Crimson (#a2878d) for navigation, section titles, and chart accents.

•	Use Pastel Grey Orange (#e1c3a0) for cards, statistics panels, tables, and subtle backgrounds.

•	Use Grey (#7d817a) for paragraph text, secondary labels, and borders.

•	Charts should use only shades derived from this palette to maintain a consistent visual identity.

•	The overall design should be soft, modern, elegant, and minimalistic, with rounded corners, gentle shadows, and smooth transitions.

Dark Mode

Create a matching dark mode by using darker variations of the same palette while preserving the warm aesthetic and maintaining accessibility and readability.

Project Structure

pulse-ai/

frontend/

    components/

    pages/

    charts/

    hooks/

    services/

backend/

    api/

    ai/

    models/

    scheduler/

    database/

    services/

data/

reports/

uploads/

README.md

requirements.txt

package.json

________________________________________

Performance Requirements

Implement:

•	Lazy loading

•	Pagination

•	Caching

•	Error handling

•	Retry failed API requests

•	Loading indicators

•	Optimized database queries

•	Responsive layout

•	Accessibility best practices

________________________________________

Code Quality

•	Use reusable React components.

•	Separate frontend and backend.

•	Use TypeScript throughout the frontend.

•	Follow clean architecture principles.

•	Document major functions.

•	Keep code modular and maintainable.

•	Avoid duplicated logic.

________________________________________

Deliverables

The completed application must include:

•	Real Western Cape news articles from live APIs

•	Automatic data refresh every 24 hours (fallback every 72 hours)

•	AI-powered sentiment analysis using Hugging Face Transformers

•	SQLite database for historical storage

•	Automatic trend analysis

•	Municipality-level insights

•	Interactive dashboard

•	Search and advanced filtering

•	Trending topics

•	Word clouds

•	PDF report generation

•	CSV import/export

•	Dark and Light Mode

•	Responsive design

•	Clean, production-ready code

Do not generate placeholder data, fake news articles, lorem ipsum, or synthetic datasets. All displayed news must originate from live APIs or previously stored real articles. Use environment variables for API keys and provide clear setup instructions. The application should be ready for local development and deployment with minimal configuration.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://pulseai-thimnabooi.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/65a75b1a-43cd-4f31-a62e-4662bcc077ae).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
