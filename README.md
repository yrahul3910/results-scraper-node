# VTU Results Scraper
A website to scrape CBCS results from VTU, and cache in a database, with support for updating the database with revaluation results. Built with the MERN stack, and uses React-Router v4 and Cheerio.  

# Features
* **Cache results**: Results once scraped are stored in a database, and can be fetched later.
* **Batch results**: Results for multiple students can be scraped at once, with multiple insights for the whole batch result.
* **Printable report generation**: For batch results, a printable report with each student's results is generated.
* **Multiple charts in batch results**: In batch mode, pie charts are shown for each subject, showing how many students got each grade. Bar charts are also shown, showing which subject got how many of what grade.
* **Updating revaluation results**: Once revaluation results are out, they can be scraped in batch, and the database is updated.

# Setup
To setup this project in your local machine, read this section.

## Prerequisites
You must have the following installed and set up.
* MongoDB 3.x
* Node.js
* yarn

## Setting Up
1. Make sure MongoDB daemon is running and set to run on startup.
2. Run `yarn`.
3. Run either `npm run server` or `npm start`.

# Project Structure
## React Components
* `App`: Contains the routes for React-Router.
* `BarChartCard`: A card component rendering each bar chart in the batch results mode.
* `Batch`: The component rendered for retrieving results in a batch.
* `ChartCard`: A card component which holds a chart and a table. This is used in the `Batch` component.
* `Individual`: The component rendered for retrieving an individual result.
* `IndividualTable`: The table displaying the results in the `Individual` component.
* `MainPage`: The home page.
* `Report`: The printable report generated for batch results. Used in the `Batch` component.
* `SideMenu`: The side menu with navigation links.
* `UpdateReval`: The component rendered for updating the revaluation results in the database.

## MongoDB Structure
The project uses a single MongoDB database, `results`, with a single collection, `results`. It is assumed that MongoDB is running on port `27017`, the default.
